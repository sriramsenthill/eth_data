const axios = require('axios');
const XLSX = require('xlsx');
const fs = require('fs');

// Load the addresses from the Excel file
const workbook = XLSX.readFile('address.xlsx');
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];
const addresses = XLSX.utils.sheet_to_json(sheet).map(row => row.address);

// Function to fetch balance for a wallet address
async function fetchBalance(address) {
    try {
        const response = await axios.get(`https://balances.garden.finance/address/${address}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching balance for ${address}:`, error.message);
        return null;
    }
}

// Main function to process addresses and filter by balance
async function processAddresses() {
    const results = [];

    for (const address of addresses) {
        const data = await fetchBalance(address);
        if (data) {
            const totalBalanceUsd = parseFloat(data.totalBalanceUsd);
            if (totalBalanceUsd > 60) {
                const resultObject = {
                    address: address,
                    totalBalanceUsd: totalBalanceUsd,
                    totalCount: data.totalCount
                };
                results.push(resultObject);
                console.log(`Added to results:`, resultObject); // Log the object on successful push
            }
        }
    }

    // Save results to a new Excel file
    const newWorkbook = XLSX.utils.book_new();
    const newSheet = XLSX.utils.json_to_sheet(results);
    XLSX.utils.book_append_sheet(newWorkbook, newSheet, 'Filtered Balances');
    XLSX.writeFile(newWorkbook, 'filtered_balances.xlsx');

    console.log(`Processed ${addresses.length} addresses. Found ${results.length} with balances over $60.`);
}

// Run the process
processAddresses();