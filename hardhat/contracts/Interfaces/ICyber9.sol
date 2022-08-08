// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

interface ICyber9 {
    function getCharacterStats(uint256 _tokenId) external
    returns(uint256 level, int256 hp, uint256 strength, uint256 agility, uint256 intelligence, uint256 dexterity, uint256 luck, uint256 experience);
    function characterMaxHp(uint256 _tokenId) external returns(int256);
    function burnCyber9(uint256 _tokenId, address _from) external;
    function ownerOf(uint256 _tokenId) external view returns (address);
}