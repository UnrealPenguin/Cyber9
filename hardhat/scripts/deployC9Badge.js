const fs = require('fs');
const { ethers, upgrades } = require('hardhat');

main = async () => {
    const [deployer] = await ethers.getSigners();
    console.log(`Deploying contracts with the account : ${deployer.address}`);

    const balance = await deployer.getBalance();
    console.log(`Account balance: ${balance.toString()}`);

    const Artifact = await ethers.getContractFactory('Cyber9Badge');
    const artifact = await Artifact.deploy('ipfs://QmeJ4Nao1WiKh2Cea2fHJdAwCmrn6v9HL3S1zPLKrXLJtW/', 'ipfs://QmYcrnDsgoDbjHmnWYQEUwB1HSBiVdFgbk2QJcocrEes1J/');
    await artifact.deployed();

    const txHash = artifact.deployTransaction.hash;
    console.log(`Tx hash: ${txHash}\nWaiting for transaction to be mined...`);
    const txReceipt = await ethers.provider.waitForTransaction(txHash);
    console.log("Contract address:", txReceipt.contractAddress);
    //POLYGON MAINNET
    //0xA0bED2E79Eec0dd9AA3238D64541E59F134BE003

    //MUMBAI
    //0x2f9Ac693267c33F77EA7F0Af8FEEE8815549b527

    //REMEMBER TO SET DEPENDENCIES
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.log(error);
        process.exit(1);
    })