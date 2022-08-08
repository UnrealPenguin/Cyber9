const fs = require('fs');
const { ethers, upgrades } = require('hardhat');

main = async () => {
    const [deployer] = await ethers.getSigners();
    console.log(`Deploying contracts with the account : ${deployer.address}`);

    const balance = await deployer.getBalance();
    console.log(`Account balance: ${balance.toString()}`);

    CharLib = await ethers.getContractFactory("CharacterLib");
    charLib = await CharLib.deploy();

    const txHash1 = charLib.deployTransaction.hash;
    console.log(`Tx hash: ${txHash1}\nWaiting for transaction to be mined...`);
    const txReceipt1 = await ethers.provider.waitForTransaction(txHash1);
    console.log("Char Lib Contract address:", txReceipt1.contractAddress);

    //POLYGON CHAR LIB ADDRESS
    // 0x84FECd09b6B52d9D76BfDF52BEbdC143f131606B

    //CHAR LIB ADDRESS    
    //0x3b4f2a83A941F3B360df390aEf458fD4ec8D59e8

    EnemyLib = await ethers.getContractFactory("EnemyLib");
    enemyLib = await EnemyLib.deploy();

    const txHash2 = enemyLib.deployTransaction.hash;
    console.log(`Tx hash: ${txHash2}\nWaiting for transaction to be mined...`);
    const txReceipt2 = await ethers.provider.waitForTransaction(txHash2);
    console.log("Enemy Lib Contract address:", txReceipt2.contractAddress);
    //POLYGON ENEMY LIB 
    // 0xDFdD1299C288e205900F2Df1f6Fe2B7B7B040618

    //ENEMY LIB ADDRESS
    //0x8BC511Da269bD601d2C3c902FC1b39678C964b49

    ClanLib = await ethers.getContractFactory("ClanLib");
    clanLib = await ClanLib.deploy();

    const txHash3 = clanLib.deployTransaction.hash;
    console.log(`Tx hash: ${txHash3}\nWaiting for transaction to be mined...`);
    const txReceipt3 = await ethers.provider.waitForTransaction(txHash3);
    console.log("Clan Lib Contract address:", txReceipt3.contractAddress);

    //POLYGON CLAN LIB
    // 0x384A11e2cdB874d5A1A757Fe80F102995213A95a

    //CLAN LIB ADDRESS   
    //0x53F55839800D9f5dECB65c0f588a45c021Bb67cA

}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.log(error);
        process.exit(1);
    })