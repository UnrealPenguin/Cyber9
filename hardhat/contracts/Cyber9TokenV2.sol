// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";

contract Cyber9TokenV3 is Initializable, ERC20Upgradeable, UUPSUpgradeable, OwnableUpgradeable, ReentrancyGuardUpgradeable{
    
  address cyber9Contract;
  address cyber9Items;

  function initialize() initializer public{
    __ERC20_init("Bei", "BEI");
    __Ownable_init();
    __UUPSUpgradeable_init();
    __ReentrancyGuard_init();
  }

  function _authorizeUpgrade(address) internal override onlyOwner {}

  modifier validCaller virtual {
    require(
      msg.sender == cyber9Items ||
      msg.sender == cyber9Contract, "Invalid caller");
      _mint(msg.sender, 1); //this is the upgrade OOPS gave the bei to contrat...
    _;
  }

  function mintBei(address _to, uint256 _amount) external validCaller nonReentrant{
    _mint(_to, _amount);
  }

  function burnBei(address _from, uint256 _amount) external validCaller nonReentrant {
    _burn(_from, _amount);
  }

  function airdropBei(address[] memory _addresses, uint256 _amount) external onlyOwner {
    for(uint256 i; i<_addresses.length;i++) {
      _mint(_addresses[i], _amount);
    }
  }

  //Setting dependencies
  function setItemsContract(address _itemsContract) external onlyOwner {
    cyber9Items = _itemsContract;
  }
  function setCyber9Contract(address _cyber9Contract) external onlyOwner {
    cyber9Contract = _cyber9Contract;
  }
  
}