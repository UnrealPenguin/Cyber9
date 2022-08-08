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

pragma solidity ^0.8.7;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBase.sol";
import "./Interfaces/ICyber9Token.sol";
import "./Interfaces/ICyber9Items.sol";
import "./Interfaces/ICyber9Badge.sol";
import "./Libraries/RNG.sol";
import "./Libraries/EnemyLib.sol";
import "./Libraries/CharacterLib.sol";
import "./Libraries/ClanLib.sol";

contract Cyber9 is ERC721Enumerable, Ownable, RNG, VRFConsumerBase {
    using Strings for uint256;
    using CharacterLib for CharacterLib.Character;
    using EnemyLib for EnemyLib.Enemy;
    using ClanLib for uint256[];
    ICyber9Badge private immutable cyber9badge;
    ICyber9Items private immutable cyber9items;
    ICyber9Token private immutable cyber9token;
    address private enhancementContract;
    string private baseURI;
    bytes32 internal keyHash;
    uint256 private VRFfee;    
    uint256 public amountMinted;
    uint256 public maxSupply = 9000;
    uint256 public maxMintPerTx = 10;
    uint256 public cost = 40 ether;
    uint256 private attackCD = 1 days;
    uint256 private defeatedCD = 3 days; 
    uint256 private startFrom = 9; //Start the random mint from
    uint256 constant public MAX_LEVEL = 50;
    bool public usable = false;
    bool public paused = true;
    mapping(address => bool) public isSpawned;
    mapping(address => EnemyLib.Enemy) enemy;
    mapping(address => uint256) public randomResult;
    mapping(address => uint256) public storedBei; 
    mapping(uint256 => bool) public isStaked;
    mapping(uint256 => uint256) public storedExp;
    mapping(uint256 => uint256) public stakeStart;
    mapping(uint256 => uint256) public yieldPerToken;
    mapping(uint256 => uint256) private expPerToken;
    mapping(uint256 => int256) public characterMaxHp;
    mapping(uint256 => uint256) private breakthrough;
    mapping(uint256 => uint256) private cooldown;
    mapping(uint256 => CharacterLib.Character) private characters;
    mapping(bytes32 => address) public requestIdToAddress;

    //Events
    event Attack(address indexed _from, uint256 _tokenId, uint256 _dmg, bool _isCrit, uint256 _enemyDmg, uint256 _experience);
    event CharacterDefeated(address indexed _from, uint256 _tokenId);
    event EnemyDefeated(address indexed _from, uint256 _tokenId, uint256 _beiReward);
    event Staked(address indexed _from, uint256[] _tokenIds);
    event Unstaked(address indexed _from, uint256[] _tokenIds);
    event Withdraw(address indexed _from, uint256[] _tokenIds, uint256[] _tokensExp, uint256 _beiAmount);

    //VRFConsumerBase (VRF Coordinator, LINK TOKEN)

    //POLYGON (0x3d2341ADb2D31f1c5530cDC622016af293177AE0, 0xb0897686c545045aFc77CF20eC7A532E3120E0F1)
    //POLYGON KEYHASH 0xf86195cf7690c55907b2b611ebb7343a6f649bff128701cc542f0569e2c549da
    constructor(
        ICyber9Badge _badge,
        ICyber9Token _token,
        ICyber9Items _items
        ) 
        ERC721("Cyber9", "C9")
        VRFConsumerBase(
            0x3d2341ADb2D31f1c5530cDC622016af293177AE0, 
            0xb0897686c545045aFc77CF20eC7A532E3120E0F1
        )
        RNG(maxSupply-startFrom, startFrom+1)
    {        
        cyber9badge = _badge;
        cyber9token = _token;
        cyber9items = _items;
        reserveMint();
        keyHash = 0xf86195cf7690c55907b2b611ebb7343a6f649bff128701cc542f0569e2c549da;
        VRFfee = 0.0001 ether; 
    }

    modifier status(uint256 _tokenId) {
        require(isStaked[_tokenId] == false, "S");
        require(characters[_tokenId].hp > 0, "D");
        _;
    }

    //@notice First 9 are reserved 
    function reserveMint() internal {
        for(uint256 i = 1; i<startFrom+1; i++) { 
            if(i == 1) {
                characters[i].setStats(1, 200, 31, 16, 16, 21, 21, 0);  
                characterMaxHp[i] = 200;
            }else if(i == 2) {
                characters[i].setStats(1, 150, 21, 31, 16, 21, 21, 0);
                characterMaxHp[i] = 150;
            }else if(i == 3) {
                characters[i].setStats(1, 200, 16, 21, 21, 31, 16, 0);
                characterMaxHp[i] = 200;
            }else if(i == 4) {
                characters[i].setStats(1, 150, 21, 16, 21, 21, 31, 0);
                characterMaxHp[i] = 150;
            }else if(i == 5) {
                characters[i].setStats(1, 200, 16, 21, 31, 16, 21, 0);
                characterMaxHp[i] = 200;
            }else if(i == 6) {
                characters[i].setStats(1, 300, 21, 16, 16, 21, 21, 0);
                characterMaxHp[i] = 300;
            }else if(i == 7) {
                characters[i].setStats(1, 200, 21, 16, 26, 16, 26, 0);
                characterMaxHp[i] = 200;
            }else if(i == 8) {
                characters[i].setStats(1, 200, 26, 26, 16, 21, 16, 0);
                characterMaxHp[i] = 200;
            }else {
                characters[i].setStats(1, 150, 26, 21, 16, 21, 26, 0);
                characterMaxHp[i] = 150;
            }
            _safeMint(msg.sender, i);
            amountMinted++;
        }  
    }

    function mint(uint256 _amount) external payable {
        require(paused==false);
        require(_amount > 0);
        require(_amount < maxMintPerTx + 1, "M");
        require(amountMinted + _amount < maxSupply + 1, "O");
        require(msg.value >= cost * _amount, "C");
        mintLogic(_amount);
    }
    
    //@notice only available to badge holders
    function freeMint(uint256 _badgeId) external {
        require(amountMinted < maxSupply , "O");
        cyber9badge.useFreeMint(_badgeId, msg.sender);
        mintLogic(1);
    }

     function mintLogic(uint256 _amount) private {
        int256 _hp;
        uint256 _strength;
        uint256 _agility;
        uint256 _intelligence;
        uint256 _dexterity;
        uint256 _luck;
        getRandomNumber();

        for(uint256 i=0; i<_amount;i++) {
            uint256 _newId = nextToken();
            _safeMint(msg.sender, _newId);
            
            //@dev assign stats, generateStats takes in a ID and a random number
            (_hp, _strength,_agility,_intelligence,_dexterity,_luck) = generateStats(_newId, randomResult[msg.sender]);
            characters[_newId].setStats(1,_hp, _strength,_agility,_intelligence,_dexterity,_luck,0);
            characterMaxHp[_newId] = _hp;
            //@dev issues token to minter whenever they mint one
            cyber9token.mintBei(msg.sender, 200);
            amountMinted++;
        }
        //Checks if collection is sold out, if it is wipe all badges free mints
        if(amountMinted == maxSupply) {
            cyber9badge.wipeFreeMints();
        }
    }

    function burnCyber9(uint256 _tokenId, address _from) external { 
        require(msg.sender == enhancementContract, "A");
        require(_exists(_tokenId),"N");        
        require(ownerOf(_tokenId) == _from,"B");
        delete characters[_tokenId];
        _burn(_tokenId);
    }

    function CharacterIdByIndex(uint256 _index) external view returns(uint256) {
        return tokenByIndex(_index);
    }
    
    function walletOfOwner(address _owner) public view returns (uint256[] memory)
    {
        uint256 ownerTokenCount = balanceOf(_owner);
        uint256[] memory tokenIds = new uint256[](ownerTokenCount);
        for (uint256 i; i < ownerTokenCount; i++) {
          tokenIds[i] = tokenOfOwnerByIndex(_owner, i);
        }
        return tokenIds;
    }
    
    function tokenURI(uint256 _tokenId) public view virtual override returns (string memory) 
    {
        require(_exists(_tokenId),"N");
        return bytes(baseURI).length > 0
            ? string(abi.encodePacked(baseURI, _tokenId.toString(), '.json'))
            : "";
    }

    // ------------------------------------ VRF Chainlink ------------------------------------
    function getRandomNumber() private {
        require(LINK.balanceOf(address(this)) >= VRFfee, "L");
        bytes32 requestId = requestRandomness(keyHash, VRFfee);
        requestIdToAddress[requestId] = msg.sender;
    }
    
    function fulfillRandomness(bytes32 requestId, uint256 randomness) internal override {
        address requestAddress = requestIdToAddress[requestId];
        randomResult[requestAddress] = randomness;
    }

    //check LINK balance of current contract
    function getLinkBalance() external view returns(uint256) {
        return LINK.balanceOf(address(this));
    }

    //withdraw LINK
    function withdrawLink() external onlyOwner {
        require(LINK.transfer(owner(), LINK.balanceOf(address(this))));
    }

    // ------------------------------------- Character functions -------------------------------------
    function getCharacterStats(uint256 _tokenId) external view 
        returns(uint256 level,
        int256 hp,
        uint256 strength,
        uint256 agility,
        uint256 intelligence,
        uint256 dexterity,
        uint256 luck,
        uint256 experience)
    {
        return characters[_tokenId].getStats();
    }
    
    function levelUp(uint256 _tokenId) external status(_tokenId) {
        require(characters[_tokenId].level < MAX_LEVEL);
        require(msg.sender == ownerOf(_tokenId));
        uint256 _expRequired = expRequired(_tokenId);
        require(characters[_tokenId].experience >= _expRequired, "E");
        //Every 10 levels requires orbs to breakthrough
        if(characters[_tokenId].level % 10 == 9){
            breakthrough[_tokenId]++;
            //1 additional orb every 10 levels
            cyber9items.useOrbs(msg.sender, breakthrough[_tokenId]);
        }
        characterMaxHp[_tokenId] += 5;
        characters[_tokenId].levelUp(_expRequired); 
    }
    
    function expRequired(uint256 _tokenId) public view returns (uint256 experience) {
        return characters[_tokenId].lvlUpExp();
    }

    // ------------------------------------- Enemy functions -------------------------------------
    function spawnEnemy() external {
        require(usable == true);
        require(walletOfOwner(msg.sender).length > 0, "F");
        require(isSpawned[msg.sender] == false);

        uint256 total;
        uint256[] memory _character = walletOfOwner(msg.sender);
        for(uint256 i; i<_character.length;i++) {
            total += characters[_character[i]].level;
        }
        uint256 avg = total/walletOfOwner(msg.sender).length;
        int256 hp = int(avg * 400) - walletOfOwner(msg.sender).c7Bonus();
        uint256 enemyAttack = avg + 15;

        enemy[msg.sender].assignEnemyStats(hp, enemyAttack);
        isSpawned[msg.sender] = true;
    }

    function getEnemyStats(address _from) external view returns (int256 hp, uint256 atk) {
        return enemy[_from].getEnemyStats();
    }

    function attackEnemy(uint256[] memory _tokensId) external {
        require(isSpawned[msg.sender] == true);

        for(uint256 i = 0; i<_tokensId.length;i++) {
            require(characters[_tokensId[i]].hp > 0, "D");
            require(msg.sender == ownerOf(_tokensId[i]));
            require(isStaked[_tokensId[i]] == false, "S");
            require(block.timestamp > cooldown[_tokensId[i]], "H");
            
            //Cooldown for attack
            setCooldown(attackCD - (characters[_tokensId[i]].agility + walletOfOwner(msg.sender).c2Bonus()) * 300, _tokensId[i]);
            getRandomNumber();
            uint256 _dmg = roll(characters[_tokensId[i]].strength, 1, randomResult[msg.sender]) + walletOfOwner(msg.sender).c1Bonus();
            bool isCrit = false;

            if(crit(characters[_tokensId[i]].luck + walletOfOwner(msg.sender).c4Bonus(), characters[_tokensId[i]].dexterity + walletOfOwner(msg.sender).c3Bonus(), randomResult[msg.sender])) {
                _dmg = _dmg *2;
                isCrit = true;
            }
            enemy[msg.sender].attacked(_dmg);   

            uint256 _enemyAtk = enemy[msg.sender].attack;
            uint256 _enemyDmg = uint256(roll(_enemyAtk, 2, randomResult[msg.sender]));
            characters[_tokensId[i]].hp -= int256(_enemyDmg) - walletOfOwner(msg.sender).c6Bonus();
            uint256 _exp = ((characters[_tokensId[i]].level * 400) - expRequired(_tokensId[i])) + walletOfOwner(msg.sender).c9Bonus();
            characters[_tokensId[i]].experience += _exp;
            emit Attack(msg.sender, _tokensId[i], _dmg, isCrit, _enemyDmg, _exp);

            //Character defeated
            if(characters[_tokensId[i]].hp < 1) {
                characters[_tokensId[i]].hp = 0;
                setCooldown(defeatedCD, _tokensId[i]);
                emit CharacterDefeated(msg.sender, _tokensId[i]);
            }           
            //Enemy defeated
            if(enemy[msg.sender].health < 1 ) {    
                cyber9token.mintBei(msg.sender, _enemyAtk * 20);
                emit EnemyDefeated(msg.sender, _tokensId[i], _enemyAtk * 20);
                delete enemy[msg.sender];
                isSpawned[msg.sender] = false;                
                return;
            }
        }                     
    }

    function revive(uint256 _tokenId) external {
        require(characters[_tokenId].hp == 0, "J");
        require(timeLeft(_tokenId) == 0, "H");
        characters[_tokenId].hp = characterMaxHp[_tokenId];    
    }

    // ------------------------------------- ITEMS -------------------------------------
    function healCharacter(uint256 _tokenId) external {
        require(characters[_tokenId].hp > 0);
        characters[_tokenId].hp = characterMaxHp[_tokenId];
        cyber9items.useHpKit(msg.sender);
    }

    function resetCD(uint256 _tokenId) external {
        require(characters[_tokenId].hp > 0);
        cooldown[_tokenId] = 0;
        cyber9items.useCdKit(msg.sender);
    }

    function resetStats(uint256 _tokenId) external {
        require(_tokenId > 9);
        require(characters[_tokenId].hp > 0, "D");
        newStats(_tokenId);
        characters[_tokenId].setLevels(characters[_tokenId].level, characters[_tokenId].experience);
        cyber9items.useStatReset(msg.sender);
    }

    //Stack too deep need to split the function 
    function newStats(uint256 _tokenId) private {
        int256 _hp;
        uint256 _strength;
        uint256 _agility;
        uint256 _intelligence;
        uint256 _dexterity;
        uint256 _luck;
        getRandomNumber();
        (_hp, _strength, _agility, _intelligence, _dexterity, _luck) = rerollStats(characters[_tokenId].level, randomResult[msg.sender]);
        characters[_tokenId].setNewStats(_hp, _strength, _agility, _intelligence, _dexterity, _luck);
        characterMaxHp[_tokenId] = _hp;
    }

    // ------------------------------------- TIMER -------------------------------------
    function setCooldown(uint256 _time, uint256 tokenId) private {
        uint256 startTime = block.timestamp;
        cooldown[tokenId] = startTime+_time;
    }

    function timeLeft(uint256 tokenId) public view returns(uint256) {
        if(cooldown[tokenId] == 0 || cooldown[tokenId] < block.timestamp){
            return 0;
        }else{
            return cooldown[tokenId]-block.timestamp;
        }
    }

    // ------------------------------------- Staking functions START -------------------------------------
    function stake(uint256[] memory _tokenIds) external {
        require(usable == true);
        uint256[] memory _stakeArray = new uint256[](_tokenIds.length);

        for(uint256 i = 0; i<_tokenIds.length; i++) {
            require(characters[_tokenIds[i]].hp > 0, "D");
            require(block.timestamp> cooldown[_tokenIds[i]], "H");
            require(msg.sender == ownerOf(_tokenIds[i]));
            require(isStaked[_tokenIds[i]] == false, "S");
        
            uint256 _beiGain = characters[_tokenIds[i]].level + characters[_tokenIds[i]].intelligence + walletOfOwner(msg.sender).c5Bonus() + characters[_tokenIds[i]].luck + walletOfOwner(msg.sender).c4Bonus();
            isStaked[_tokenIds[i]] = true;
            yieldPerToken[_tokenIds[i]] = _beiGain + walletOfOwner(msg.sender).c8Bonus();
            expPerToken[_tokenIds[i]] = 150 * characters[_tokenIds[i]].level;
            stakeStart[_tokenIds[i]] = block.timestamp;
            _stakeArray[i] = _tokenIds[i];
        }
        emit Staked(msg.sender, _stakeArray);
    }

    function unstake(uint256[] memory _tokenIds) external {
        uint256 yieldTransfer;
        uint256[] memory _unstakeArray = new uint256[](_tokenIds.length);

        for(uint256 i =0; i<_tokenIds.length;i++) {
            require(msg.sender == ownerOf(_tokenIds[i]));
            require(isStaked[_tokenIds[i]] == true, "R");
            
            (uint256 totalYield, uint256 expYield) = calculateYieldTotal(_tokenIds[i]);
            yieldTransfer = yieldTransfer + totalYield;
            yieldPerToken[_tokenIds[i]] = 0 ;
            isStaked[_tokenIds[i]] = false;
            storedExp[_tokenIds[i]] = expYield;
            expPerToken[_tokenIds[i]] = 0;
            _unstakeArray[i] = _tokenIds[i];
        }
        storedBei[msg.sender] += yieldTransfer;
        emit Unstaked(msg.sender, _unstakeArray);
    }

    function withdrawYield() external {
        uint256 toTransfer;
        uint256[] memory _tokens = walletOfOwner(msg.sender);

        uint256[] memory _tokensArray = new uint256[](_tokens.length);
        uint256[] memory _expArray = new uint256[](_tokens.length);

        for(uint256 i = 0; i<_tokens.length; i++) {
            (uint256 totalYield,uint256 expYield) = calculateYieldTotal(_tokens[i]);
            toTransfer = toTransfer + totalYield;
            stakeStart[_tokens[i]] = block.timestamp;
            expYield += storedExp[_tokens[i]];

            if(expYield > 0) {
                characters[_tokens[i]].experience += expYield;
                storedExp[_tokens[i]] = 0;
                _tokensArray[i] = _tokens[i];
                _expArray[i] = expYield;
            }
        }
        require(toTransfer > 0 || storedBei[msg.sender] > 0 , "Q");
        toTransfer += storedBei[msg.sender];
        storedBei[msg.sender] = 0;
        cyber9token.mintBei(msg.sender, toTransfer);
        emit Withdraw(msg.sender, _tokensArray, _expArray, toTransfer);
    }

    function calculateYieldTime(uint256 _tokenId) internal view returns(uint256) {
        uint256 end = block.timestamp;
        uint256 totalTime = end - stakeStart[_tokenId];
        return totalTime;
    }

    function calculateYieldTotal(uint256 _tokenId) public view returns(uint256 balance, uint256 experience) {
        uint256 _time = calculateYieldTime(_tokenId) * 10**18;
        uint256 _rate = 86400;
        uint256 _timeRate = _time / _rate;
        uint256 _rawYield = (yieldPerToken[_tokenId] * _timeRate) / 10**18;
        uint256 _expYield = (expPerToken[_tokenId] * _timeRate) / 10**18;
        return (_rawYield, _expYield);
    }

    // ------------------------------------- Staking functions END -------------------------------------

    // Cyber9 token functions
    function getBeiBalance(address _from) external view returns (uint256 balance) {
        return cyber9token.balanceOf(_from);
    }

    //for enhancement
    function setEnhancementContract(address _enhancementContract) external onlyOwner {
        enhancementContract = _enhancementContract;
    }

    //@dev added modifier to safeTransferFrom functions - Cannot transfer if tokens are staked, defeated or on cooldown
    function safeTransferFrom(address from, address to, uint256 tokenId) public virtual override status(tokenId) {
        require(block.timestamp > cooldown[tokenId], "H");
        safeTransferFrom(from, to, tokenId, "");
    }

    function safeTransferFrom(address from,address to,uint256 tokenId,bytes memory _data) public virtual override status(tokenId) {
        require(_isApprovedOrOwner(_msgSender(), tokenId), "T");
        require(block.timestamp > cooldown[tokenId], "H");
        _safeTransfer(from, to, tokenId, _data);
    }
    
    function transferFrom(address from,address to,uint256 tokenId) public virtual override status(tokenId) {
        require(_isApprovedOrOwner(_msgSender(), tokenId), "T");
        require(block.timestamp > cooldown[tokenId], "H");
        _transfer(from, to, tokenId);
    }
        
    //onlyOwner
    function setUsable(bool _state) external onlyOwner {
        usable = _state;
    }
    
    function setCost(uint256 _newCost) external onlyOwner {
        cost = _newCost;
    }
    
    function pause(bool _state) external onlyOwner {
        paused = _state;
    }
  
    function setBaseURI(string memory _newBaseURI) public onlyOwner {
        baseURI = _newBaseURI;
    }
    
    function withdraw() external payable onlyOwner {
        (bool success, ) = payable(owner()).call{value: address(this).balance}("");
        require(success);
    }
}