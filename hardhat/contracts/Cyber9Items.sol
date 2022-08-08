// SPDX-License-Identifier: MIT

// ________/\\\\\\\\\__/\\\________/\\\__/\\\\\\\\\\\\\____/\\\\\\\\\\\\\\\____/\\\\\\\\\__________/\\\\\\\\\____        
//  _____/\\\////////__\///\\\____/\\\/__\/\\\/////////\\\_\/\\\///////////___/\\\///////\\\______/\\\///////\\\__       
//   ___/\\\/_____________\///\\\/\\\/____\/\\\_______\/\\\_\/\\\_____________\/\\\_____\/\\\_____/\\\______\//\\\_      
//    __/\\\_________________\///\\\/______\/\\\\\\\\\\\\\\__\/\\\\\\\\\\\_____\/\\\\\\\\\\\/_____\//\\\_____/\\\\\_     
//     _\/\\\___________________\/\\\_______\/\\\/////////\\\_\/\\\///////______\/\\\//////\\\______\///\\\\\\\\/\\\_    
//      _\//\\\__________________\/\\\_______\/\\\_______\/\\\_\/\\\_____________\/\\\____\//\\\_______\////////\/\\\_   
//       __\///\\\________________\/\\\_______\/\\\_______\/\\\_\/\\\_____________\/\\\_____\//\\\____/\\________/\\\__  
//        ____\////\\\\\\\\\_______\/\\\_______\/\\\\\\\\\\\\\/__\/\\\\\\\\\\\\\\\_\/\\\______\//\\\__\//\\\\\\\\\\\/___ 
//         _______\/////////________\///________\/////////////____\///////////////__\///________\///____\///////////_____

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./Interfaces/ICyber9Token.sol";

contract Cyber9Items is ERC1155, Ownable, ReentrancyGuard {
    using Strings for uint256;
    string public name;
    string public symbol;
    ICyber9Token private cyber9token;
    address cyber9Contract;
    address enhancementContract;
    string private baseURI;
    uint256 private constant ORB = 1;
    uint256 private constant HP_KIT = 2;
    uint256 private constant CD_KIT = 3;
    uint256 private constant STAT_RESET = 4;

    uint256 public constant ORB_PRICE = 500;
    uint256 public constant HP_PRICE = 250;
    uint256 public constant CD_PRICE = 250;
    uint256 public constant STAT_RESET_PRICE = 1000;

    constructor(string memory _name, string memory _symbol, string memory _baseURI) ERC1155(_baseURI){
        name = _name;
        symbol = _symbol;
        baseURI = _baseURI;
    }

    modifier validCaller {
    require(
        msg.sender == cyber9Contract ||
        msg.sender == enhancementContract, "Invalid caller");
        _;
    }

    //Orb item  
    function purchaseOrbs(address _to, uint256 _amount) external {
        require(_amount > 0, "Amount must be higher than 0");
        require(cyber9token.balanceOf(msg.sender) >= ORB_PRICE*_amount, "Insufficient Bei");
        _mint(_to, ORB, _amount, "");
        cyber9token.burnBei(msg.sender, ORB_PRICE);
    }
    
    function useOrbs(address _from,uint256 _amount) external nonReentrant validCaller {
        require(balanceOf(_from, ORB) >= _amount, "Insufficient Orbs" );
        _burn(_from, ORB, _amount);  
    }

    //HP kit item
    function purchaseHpKit(address _to, uint256 _amount) external {
        require(_amount > 0, "Amount must be higher than 0");
        require(cyber9token.balanceOf(msg.sender) >= HP_PRICE*_amount, "Insufficient Bei");
        _mint(_to, HP_KIT, _amount, "");
        cyber9token.burnBei(msg.sender, HP_PRICE);
    }

    function useHpKit(address _from) external nonReentrant validCaller {
        require(balanceOf(_from, HP_KIT) > 0, "Insufficient HP kit" );
        _burn(_from, HP_KIT, 1);
    }

    //Reset cooldown item
    function purchaseCdKit(address _to,uint256 _amount) external {
        require(_amount > 0, "Amount must be higher than 0");
        require(cyber9token.balanceOf(msg.sender) >= CD_PRICE*_amount, "Insufficient Bei");
        _mint(_to, CD_KIT, _amount, "");
        cyber9token.burnBei(msg.sender, CD_PRICE);
    }

    function useCdKit(address _from) external nonReentrant validCaller {
        require(balanceOf(_from, CD_KIT) > 0, "Insufficient CD kit" );
        _burn(_from, CD_KIT, 1);
    }

    //Stat reset item
    function purchaseStatReset(address _to, uint256 _amount) external {
        require(_amount > 0, "Amount must be higher than 0");
        require(cyber9token.balanceOf(msg.sender) >= STAT_RESET_PRICE*_amount, "Insufficient Bei");
        _mint(_to, STAT_RESET, _amount, "");
        cyber9token.burnBei(msg.sender, STAT_RESET_PRICE);
    }

    function useStatReset(address _from) external nonReentrant {
        require(msg.sender == cyber9Contract, "Invalid Caller");
        _burn(_from, STAT_RESET, 1);
    }

    function setBaseURI(string memory _newURI) external onlyOwner {
        baseURI = _newURI;
    }

    //Setting dependencies
    function setTokenContract(ICyber9Token _tokenContract) external onlyOwner {
       cyber9token = _tokenContract;
    }

    function setCyber9Contract(address _cyber9Contract) external onlyOwner{
        cyber9Contract = _cyber9Contract;
    }

    function setEnhancementContract(address _enhancementContract) external onlyOwner{
        enhancementContract = _enhancementContract;
    }

    function uri(uint256 _type) public view override returns (string memory)
    {
        require(_type > 0 && _type < 5);
        return
            bytes(baseURI).length > 0
                ? string(abi.encodePacked(baseURI, _type.toString(), ".json"))
                : "";
    }
}
