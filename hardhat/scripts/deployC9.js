const fs = require('fs');
const { ethers, upgrades } = require('hardhat');

main = async () => {
    const [deployer] = await ethers.getSigners();
    console.log(`Deploying contracts with the account : ${deployer.address}`);

    const balance = await deployer.getBalance();
    console.log(`Account balance: ${balance.toString()}`);

    Cyber9 = await ethers.getContractFactory('Cyber9', {
        libraries: {
            CharacterLib: "0x84FECd09b6B52d9D76BfDF52BEbdC143f131606B",
            EnemyLib: "0xDFdD1299C288e205900F2Df1f6Fe2B7B7B040618",
            ClanLib: "0x384A11e2cdB874d5A1A757Fe80F102995213A95a"
        }
    });
    //badge / token / items
    cyber9 = await Cyber9.deploy("0xA0bED2E79Eec0dd9AA3238D64541E59F134BE003", "0x757C41e04d749c622Dd18705914eB3b12b8cDe59", "0x2E323DEF7e787aE443D59DBe13e369A92fdcD73b");

    const txHash = cyber9.deployTransaction.hash;
    console.log(`Tx hash: ${txHash}\nWaiting for transaction to be mined...`);
    const txReceipt = await ethers.provider.waitForTransaction(txHash);
    console.log("Contract address:", txReceipt.contractAddress);
    //POLYGON MAINNET
    // 0x51566E70833487c0aDa5d30587f3f81efc8E8bf9

    //MUMBAI
    //0x502219B3577a4E14959BE807C0eC86dC682ed293
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.log(error);
        process.exit(1);
    })