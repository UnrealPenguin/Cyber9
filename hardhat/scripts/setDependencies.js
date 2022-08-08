const fs = require('fs');
const { ethers, upgrades } = require('hardhat');

main = async () => {
    const [deployer] = await ethers.getSigners();
    console.log(`Deploying contracts with the account : ${deployer.address}`);

    const balance = await deployer.getBalance();
    console.log(`Account balance: ${balance.toString()}`);

    const BADGE_CONTRACT = "0xA0bED2E79Eec0dd9AA3238D64541E59F134BE003";
    const TOKEN_CONTRACT = "0x757C41e04d749c622Dd18705914eB3b12b8cDe59";
    const ITEMS_CONTRACT = "0x2E323DEF7e787aE443D59DBe13e369A92fdcD73b";
    const C9_CONTRACT = "0x51566E70833487c0aDa5d30587f3f81efc8E8bf9";

    //BADGE
    const Cyber9Badge = await ethers.getContractFactory("Cyber9Badge");
    const cyber9badge = await Cyber9Badge.attach(BADGE_CONTRACT);

    await cyber9badge.setCyber9Contract(C9_CONTRACT);

    // //TOKEN
    const Cyber9Token = await ethers.getContractFactory('Cyber9Token');
    const cyber9token = await Cyber9Token.attach(TOKEN_CONTRACT); //SET THE TOKENS ADDRESS
    await cyber9token.setItemsContract(ITEMS_CONTRACT);
    await cyber9token.setCyber9Contract(C9_CONTRACT); //DO NOT SET YET

    // //ITEMS
    const Cyber9Items = await ethers.getContractFactory("Cyber9Items");
    const cyber9items = await Cyber9Items.attach(ITEMS_CONTRACT); 

    await cyber9items.setTokenContract(TOKEN_CONTRACT);
    await cyber9items.setCyber9Contract(C9_CONTRACT);
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.log(error);
        process.exit(1);
    })