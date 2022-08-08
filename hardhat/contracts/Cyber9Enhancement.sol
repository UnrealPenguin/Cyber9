// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./Interfaces/ICyber9.sol";
import "./Interfaces/ICyber9Badge.sol";
import "./Interfaces/ICyber9Token.sol";
import "./Interfaces/ICyber9Items.sol";
import "./Libraries/CharacterLib.sol";

contract Cyber9Enhancement is ERC721, Ownable, ReentrancyGuard {
    using Strings for uint256;
    using CharacterLib for CharacterLib.Character;
    ICyber9Badge private immutable cyber9badge;
    ICyber9Token private immutable cyber9token;
    ICyber9Items private immutable cyber9items;
    ICyber9 private immutable cyber9;

    uint256 constant BONUS_STAT = 20;
    mapping(uint256 => int256) public characterMaxHp;
    mapping(uint256 => CharacterLib.Character) private enhancedChar;

    constructor(
        ICyber9Badge _badge,
        ICyber9Token _token,
        ICyber9Items _items,
        ICyber9 _collection
    ) ERC721("Cyber9 Enhancement", "C9E") {
        cyber9badge = _badge;
        cyber9token = _token;
        cyber9items = _items;
        cyber9 = _collection;

    }

    //@dev check if token exists
    modifier validToken(uint256 _tokenId) {
        require(_exists(_tokenId),"ERC721Metadata: URI query for nonexistent token");
        _;
    }

    //minting
    function enhance(uint256 _badgeId, uint256 _cyber9Id) external nonReentrant {
        require(cyber9badge.ownerOf(_badgeId) == msg.sender, "Do not own this badge");
        require(cyber9.ownerOf(_cyber9Id) == msg.sender, "Do not own this c9");

        assignStat(_cyber9Id);

        cyber9badge.burnBadge(_badgeId, msg.sender);
        cyber9.burnCyber9(_cyber9Id, msg.sender);
        _safeMint(msg.sender, _cyber9Id);
    }

    function assignStat(uint256 _cyber9Id) private {
        //Assign the stats 
        (uint256 _lvl, int256 _hp, uint256 _str,
        uint256 _agi, uint256 _int, uint256 _dex, 
        uint256 _luk, uint256 _exp) = cyber9.getCharacterStats(_cyber9Id);
        assignLevel(_cyber9Id, _lvl, _exp);
        assignAttributes(_cyber9Id, _hp, _str, _agi, _int, _dex, _luk);
    }

    //@dev stack too deep, splitting up the functions
    function assignLevel(uint256 _cyber9Id, uint256 _lvl, uint256 _exp) private {
        enhancedChar[_cyber9Id].setLevels(_lvl, _exp);
    }

    function assignAttributes(uint256 _cyber9Id, int256 _hp, uint256 _str, uint256 _agi, uint256 _int, uint256 _dex, uint256 _luk) private {
        enhancedChar[_cyber9Id].setNewStats(_hp+int256(BONUS_STAT*5), _str+BONUS_STAT, _agi+BONUS_STAT, _int+BONUS_STAT, _dex+BONUS_STAT, _luk+BONUS_STAT);
        characterMaxHp[_cyber9Id] = cyber9.characterMaxHp(_cyber9Id) + int256(BONUS_STAT*5);
    }

    function getEnhancedCharacterStats(uint256 _tokenId) external view validToken(_tokenId)
    returns(uint256 level,
        int256 hp,
        uint256 strength,
        uint256 agility,
        uint256 intelligence,
        uint256 dexterity,
        uint256 luck,
        uint256 experience)
    {
        return enhancedChar[_tokenId].getStats();
    }

    

    function tokenURI(uint256 _tokenId) public view virtual override validToken(_tokenId) returns (string memory) 
    {
        string memory currentBaseURI = _baseURI();
        return bytes(currentBaseURI).length > 0
            ? string(abi.encodePacked(currentBaseURI, _tokenId.toString(), '.json'))
            : "";
    }

}