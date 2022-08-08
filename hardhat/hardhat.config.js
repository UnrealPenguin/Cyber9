require("@nomiclabs/hardhat-waffle");
//For UUPS ERC1967 contracts
require('@nomiclabs/hardhat-ethers');
require('@openzeppelin/hardhat-upgrades');
require("@nomiclabs/hardhat-etherscan");

const config = require("./config.json"); //get private key

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
 const RINKEBY_URL = "https://rinkeby.infura.io/v3/0cce37bd60c9442d9bbf515dc78da5e1";
 const KEY = config.privateKey;
 const CYBER9KEY = config.cyber9Key;
 
 module.exports = {
  defaultNetwork: 'hardhat',
  networks:{
    hardhat:{
    },
    rinkeby:{
      url: RINKEBY_URL,
      accounts: [KEY]
    },
    mumbai: {
      networkId: 80001,
      // url: "https://rpc-mumbai.maticvigil.com/",
      url: "https://matic-mumbai.chainstacklabs.com",
      accounts: [KEY]
    },
    polygon: {
      networkId: 137,
      url: "https://polygon-rpc.com/",
      accounts: [CYBER9KEY]
    }
  },
  etherscan: {
    apiKey: {
      polygon: "VN1RSA5DQP8TBJWM3AF2TDS9NTAFDC88EY",
      polygonMumbai: "5G676SVV9P7ISEWXGNTPNCFWZ6HESDUX8Y"
    }
  },
  solidity: {
    version: "0.8.10",
    settings: {
      optimizer: {
        enabled: true,
        runs:100 //100 for CYBER9
      }
    }
  
  }
}