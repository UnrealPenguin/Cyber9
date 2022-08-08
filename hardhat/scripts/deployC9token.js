const fs = require('fs');
const { ethers, upgrades } = require('hardhat');

main = async () => {
    const [deployer] = await ethers.getSigners();
    console.log(`Deploying contracts with the account : ${deployer.address}`);

    const balance = await deployer.getBalance();
    console.log(`Account balance: ${balance.toString()}`);

    const Cyber9Token = await ethers.getContractFactory('Cyber9Token');
    const cyber9token = await upgrades.deployProxy(Cyber9Token, {kind: 'uups'});

    const txHash = cyber9token.deployTransaction.hash;
    console.log(`Tx hash: ${txHash}\nWaiting for transaction to be mined...`);
    const txReceipt = await ethers.provider.waitForTransaction(txHash);
    console.log("Contract address:", txReceipt.contractAddress);
    //POLYGON MAINNET
    //0x757C41e04d749c622Dd18705914eB3b12b8cDe59

    //VERIFY IMPL ADDRESS -- DONE
    //0xbdc5621B268E6Af3E07d138b8e35CbC67C3E633a


    //MUMBAI
    //0x0740d3476891F61EE129d8f06ED95c647e51EEA9
    
    //REMEMBER TO ADD DEPENDENCIES

    //CHECK TESTS FOR UPGRADES
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.log(error);
        process.exit(1);
    })