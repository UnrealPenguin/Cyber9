const fs = require('fs');
const { ethers, upgrades } = require('hardhat');

main = async () => {
    const [deployer] = await ethers.getSigners();
    console.log(`Deploying contracts with the account : ${deployer.address}`);

    const balance = await deployer.getBalance();
    console.log(`Account balance: ${balance.toString()}`);

    const AIRDROP = 500; 
    const TOKEN_CONTRACT = "0x0740d3476891F61EE129d8f06ED95c647e51EEA9";

    const Cyber9Token = await ethers.getContractFactory('Cyber9Token');
    const cyber9token = Cyber9Token.attach(TOKEN_CONTRACT);
    await cyber9token.airdropBei(["0xf562aFC77Abae9F56BedBC9A01e88bA79E060b79", "0x86C483dddEA0f112B7b0f178Eb9d9c14466b210a"], AIRDROP);
}


main()
    .then(() => process.exit(0))
    .catch(error => {
        console.log(error);
        process.exit(1);
    })