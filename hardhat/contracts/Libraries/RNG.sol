// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Counters.sol";

abstract contract RNG{
    
    using Counters for Counters.Counter;
    Counters.Counter private _tokenCount;
    uint256 private _maxSupply;
    uint256 private _startFrom;
    mapping(uint256 => uint256) private tokenMatrix;

    constructor (uint256 maxSupply_, uint256 startFrom_) 
    {
        _maxSupply = maxSupply_;
        _startFrom = startFrom_;
    }
    
    //pseudo random mint
    function nextToken() public returns (uint256) {
        uint256 maxIndex = _maxSupply - tokenCount();

        uint256 random = uint256(keccak256(
            abi.encodePacked(
                msg.sender,
                block.coinbase,
                block.difficulty,
                block.gaslimit,
                block.timestamp
            )
        )) % maxIndex;

        uint256 value = 0;

        if(tokenMatrix[random] == 0) {
            value = random;
        } else {
            value = tokenMatrix[random];
        }

        if(tokenMatrix[maxIndex - 1] == 0) {
            tokenMatrix[random] = maxIndex - 1;
        }else{
            tokenMatrix[random] = tokenMatrix[maxIndex - 1];
        }

         _tokenCount.increment();
        return value + _startFrom;
    }

    function tokenCount() public view returns (uint256) {
        return _tokenCount.current();
    }

    function availableTokens() public view returns (uint256) {
        return _maxSupply - tokenCount();
    }

    //@dev generate random attributes, also takes in a second argument so every value is unique if minting more than one
    function generateStats(uint256 _id, uint256 _randomResult) public view returns (int256,uint256,uint256,uint256,uint256,uint256) {
        uint256[] memory stats = new uint256[](6);
        for(uint256 i =0; i<6;i++){
            uint256 random = uint256(keccak256(abi.encodePacked(i, block.timestamp, _id, _randomResult)));
            //random stat from 1~21
            stats[i] = (random % 21) + 1 ;
        }
        return (int256(stats[0]*10),stats[1],stats[2],stats[3],stats[4],stats[5]);
    }

    //@dev allows to reroll attributes, keeps current level and experience. Only the base changes
    function rerollStats(uint256 _currentLevel, uint256 _randomResult) public view returns(int256,uint256,uint256,uint256,uint256,uint256) {
        uint256[] memory stats = new uint256[](6);
        for(uint256 i =0; i<6;i++){
            uint256 random = uint256(keccak256(abi.encodePacked(i, block.timestamp, _currentLevel, _randomResult)));
            //random stat from 1~21
            stats[i] = (random % 21) + 1 ;
        }
        return (int256(stats[0]*10+(_currentLevel*5)),stats[1]+_currentLevel,stats[2]+_currentLevel,stats[3]+_currentLevel,stats[4]+_currentLevel,stats[5]+_currentLevel);
    }

    //1 = character, 2 = enemy
    function roll(uint256 _base, uint256 _type, uint256 _randomResult) public view returns (uint256) {
        uint256 range;
        if(_type == 1) {
            range = _base * 5;
            uint256 random = uint256(keccak256(abi.encodePacked(block.difficulty, block.gaslimit,block.timestamp, _base, _type, _randomResult)));
            range = range + (random % _base);
        }else{
            uint256 random = uint256(keccak256(abi.encodePacked(block.difficulty, block.gaslimit,block.timestamp, _base, _type, _randomResult)));
            range = _base + (random % _base);
        }
        return range;
    }

    function crit(uint256 _luck, uint256 _dex,  uint256 _randomResult) public view returns (bool) {
        bool critHit;
        uint256 random = uint256(keccak256(abi.encodePacked(block.gaslimit,block.timestamp, _luck, _dex, _randomResult))) % 10000 + 1;
        uint256 _multiplier = ((_luck + _dex) * 30) + 1000;
        if(_multiplier > random ){
            critHit = true;
        }
        return critHit;
    }


}