# Basic Sample Hardhat Project

This project demonstrates a basic Hardhat use case. It comes with a sample contract, a test for that contract, a sample script that deploys that contract, and an example of a task implementation, which simply lists the available accounts.

Try running some of the following tasks:

```shell
npx hardhat accounts
npx hardhat compile
npx hardhat clean
npx hardhat test
npx hardhat node
node scripts/sample-script.js
npx hardhat help
```
# TO UPGRADE THE CONTRACT

YOU WILL NEED TO EXTEND THE FIRST VERSION. 
(I.E. contract Cyber9TokenV2 is Cyber9Token) 

Simply modifiy the "validCaller" modifier. To do so, override it as such:
    <!-- declare the new contract address here -->
  modifier validCaller override{
    require(msg.sender == cyber9_addr, "Invalid caller");
    <!-- add a new require here for a different contract perhaps (?) -->
    _;
  }

<!-- ALWAYS DEPLOY WITH THE first version since the address for the proxy never changes -->