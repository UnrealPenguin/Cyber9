const fs = require('fs');
const { ethers, upgrades } = require('hardhat');

main = async () => {
    const [deployer] = await ethers.getSigners();
    console.log(`Deploying contracts with the account : ${deployer.address}`);

    const balance = await deployer.getBalance();
    console.log(`Account balance: ${balance.toString()}`);

    const TOKEN_CONTRACT = "0x1f3b97f60e9B773aA8799d32ed5f9c73A416D85D";
    Cyber9Token = await ethers.getContractFactory('Cyber9Token');
    const cyber9token = await Cyber9Token.attach(TOKEN_CONTRACT);

    const Cyber9TokenV2 = await ethers.getContractFactory('Cyber9TokenV2');
    const cyber9TokenV2 = await upgrades.upgradeProxy(cyber9token, Cyber9TokenV2);

    const txHash = cyber9TokenV2.deployTransaction.hash;
    console.log(`Tx hash: ${txHash}\nWaiting for transaction to be mined...`);
    const txReceipt = await ethers.provider.waitForTransaction(txHash);
    console.log("Contract address:", txReceipt.contractAddress);
    //0x1f3b97f60e9B773aA8799d32ed5f9c73A416D85D

    //VERIFY IMPL ADDRESS
    
    //REMEMBER TO ADD DEPENDENCIES

    //CHECK TESTS FOR UPGRADES
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.log(error);
        process.exit(1);
    })