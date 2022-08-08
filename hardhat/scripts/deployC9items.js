const fs = require('fs');
const { ethers, upgrades } = require('hardhat');

main = async () => {
    const [deployer] = await ethers.getSigners();
    console.log(`Deploying contracts with the account : ${deployer.address}`);

    const balance = await deployer.getBalance();
    console.log(`Account balance: ${balance.toString()}`);

    Cyber9Items = await ethers.getContractFactory('Cyber9Items');
    //name, symbol, baseUri
    cyber9items = await Cyber9Items.deploy("Cyber9 Items", "C9I", "");

    const txHash = cyber9items.deployTransaction.hash;
    console.log(`Tx hash: ${txHash}\nWaiting for transaction to be mined...`);
    const txReceipt = await ethers.provider.waitForTransaction(txHash);
    console.log("Contract address:", txReceipt.contractAddress);
    //POLYGON MAINNET
    // 0x2E323DEF7e787aE443D59DBe13e369A92fdcD73b

    //MUMBAI
    //0xAd020674809058c2a378dB2262786874845843A8

    //REMEMBER TO SET DEPENDENCIES
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.log(error);
        process.exit(1);
    })