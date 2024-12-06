const { ethers } = require("ethers");
const XLSX = require("xlsx");

// Load the addresses from the Excel file
const workbook = XLSX.readFile("address.xlsx");
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];
const addresses = XLSX.utils.sheet_to_json(sheet);

// Ethereum provider (you can replace with your own RPC URL)
const provider = new ethers.providers.JsonRpcProvider("https://eth.llamarpc.com/");

async function getWalletData() {
    const results = [];

    for (let i = 0; i < addresses.length; i++) {
        const address = addresses[i].address;

        console.log(`Processing index ${i}: Address ${address}`);

        try {
            // Fetch balance in wei
            const balanceWei = await provider.getBalance(address);
            const balanceEth = ethers.utils.formatEther(balanceWei);

            console.log(`Balance of address ${address}: $${parseFloat(balanceEth) * 3908}`);

            // Check if balance is greater than 60 USD (assuming 1 ETH = 3908 USD)
            if (parseFloat(balanceEth) * 3908 > 60) {
                // Fetch transaction count
                const transactionCount = await provider.getTransactionCount(address);

                console.log(`Transaction count for address ${address}: ${transactionCount}`);

                // Check if the transaction count is greater than or equal to 6
                if (transactionCount >= 6) {
                    results.push({ address, balance: balanceEth });
                    console.log(`Address ${address} pushed to results with balance: $${parseFloat(balanceEth) * 3908}`);
                }
            }
        } catch (error) {
            console.error(`Error fetching data for ${address}:`, error);
        }
    }

    return results;
}

async function saveResults(results) {
    const newWorkbook = XLSX.utils.book_new();
    const newWorksheet = XLSX.utils.json_to_sheet(results);
    XLSX.utils.book_append_sheet(newWorkbook, newWorksheet, "Filtered Results");

    XLSX.writeFile(newWorkbook, "filtered_addresses.xlsx");
}

async function main() {
    const results = await getWalletData();
    await saveResults(results);
}

main().catch(console.error);