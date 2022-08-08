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

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract Cyber9Badge is ERC721Enumerable, Ownable, ReentrancyGuard {
    using Strings for uint256;
    string baseURI;
    string depletedURI;
    string specialURI;
    address private enhancementContract;
    address private cyber9Contract; 
    bool public canMint = true;
    bool public paused = false;
    bool public revealed = false;
    uint256 public maxSupply = 2000;
    uint256 public amountMinted;
    uint256 public cost = 20 ether;
    uint256 constant NFTPERADDRESS = 5;
    mapping(address => uint256) public totalMintedByAddress;
    mapping(uint256 => uint256) private freeMintsPerArtifact;
    mapping(uint256 => string) private artifactURI;
        
    constructor(
        string memory _initBaseURI,
        string memory _initDepletedURI
        ) 
        ERC721("Cyber9 Badge", "C9B") 
    {
        setBaseURI(_initBaseURI);
        setDepletedURI(_initDepletedURI);
    }
    
    //@notice Each address can only mint 2 NFTs 
    modifier maxMintPerAddress(uint256 _amount) {
        if(msg.sender != owner()){
            require(totalMintedByAddress[msg.sender]<NFTPERADDRESS && _amount<NFTPERADDRESS+1, "Exceeded max amount");
        }
        _;
    }
    
    function mint(uint256 _amount) external payable maxMintPerAddress(_amount) {
        require(canMint==true, "The sale period is over."); 
        require(paused==false, "Contract is paused");
        require(_amount > 0, "Required to mint at least 1 NFT");
        require(amountMinted + _amount < maxSupply+1, "Exceeded max supply");
        
        if(msg.sender != owner()){
            require(msg.value >= cost * _amount, "Insufficient funds");
        }

        for(uint256 i=1; i<_amount+1;i++) {        
            totalMintedByAddress[msg.sender]++;
            _safeMint(msg.sender, amountMinted + 1);
            freeMintsPerArtifact[amountMinted + 1] = 1;
            artifactURI[amountMinted + 1] = baseURI;
            amountMinted++;
        }
    }

    function walletOfOwner(address _owner) external view returns (uint256[] memory)
    {
        uint256 ownerTokenCount = balanceOf(_owner);
        uint256[] memory tokenIds = new uint256[](ownerTokenCount);
        for (uint256 i; i < ownerTokenCount; i++) {
          tokenIds[i] = tokenOfOwnerByIndex(_owner, i);
        }
        return tokenIds;
    }
    
    function tokenURI(uint256 _tokenId) public view virtual override 
    returns (string memory) {
        require(_exists(_tokenId),
        "ERC721Metadata: URI query for nonexistent token"
        );
        return bytes(artifactURI[_tokenId]).length >0 ? string(abi.encodePacked(artifactURI[_tokenId], "1.json")) : "";
    }
    
    function freeMintsLeft(uint256 _tokenId) external view returns (uint256){
        require(_exists(_tokenId),"ERC721Metadata: URI query for nonexistent token");
        return freeMintsPerArtifact[_tokenId];
    }
    
    //@dev allows users with an artifact to mint for free
    function useFreeMint(uint256 tokenId, address _from) external nonReentrant {
        require(msg.sender == cyber9Contract, "Calling from invalid address");      
        require(ownerOf(tokenId) == _from,"You are not the owner of this token");
        require(freeMintsPerArtifact[tokenId]>0,"This token has used all the free mints available");
            
        freeMintsPerArtifact[tokenId]--;
        
        if(freeMintsPerArtifact[tokenId] == 0 && revealed==true) {
            switchUsedURI(tokenId);
        }else if(freeMintsPerArtifact[tokenId] == 0){
            switchBaseURI(tokenId);
        }
    }
    
    //@dev burns the badge after it is used
    function burnBadge(uint256 _tokenId, address _from) external {
        require(msg.sender == enhancementContract, "Calling from invalid address");       
        require(ownerOf(_tokenId) == _from,"You are not the owner of this token");
        _burn(_tokenId);
    }
    
    //@dev If cyber9 is sold out. Remove free mints from all artifacts
    function wipeFreeMints() external {
        require(msg.sender == cyber9Contract, "Calling from invalid address");
        for(uint256 i=1;i<amountMinted+1;i++) { 
            freeMintsPerArtifact[i] = 0;
            switchUsedURI(i);
        }
    }
    
    //Only Owner 
    function reveal() external onlyOwner {
        revealed = true;
        for(uint256 i=1;i<amountMinted+1;i++) {
            if(freeMintsPerArtifact[i]==0) {
                switchUsedURI(i);
            }
        }
    }

    //@dev Calling this function will effectively prevent minting from this contract forever.
    function endMint() external onlyOwner {
        canMint = false;
    }
    
    function pause(bool _state) external onlyOwner {
        paused = _state;
    }

    //set contracts
    function setEnhancementContract(address _enhancementContract) external onlyOwner {
        enhancementContract = _enhancementContract;
    }
    
    function setCyber9Contract(address _contractAddress) external onlyOwner {
        cyber9Contract = _contractAddress;
    }

    //set URIs
    function setCost(uint256 _newCost) external onlyOwner {
        cost = _newCost;
    }

    function setBaseURI(string memory _newBaseURI) public onlyOwner {
        baseURI = _newBaseURI;
        //changes URI for already minted tokens if needed
        for(uint256 i=1;i<amountMinted+1;i++) {
            if(freeMintsPerArtifact[i]>0) {
                artifactURI[i] = _newBaseURI;
            }
        }
    }
    
   function setDepletedURI(string memory _newDepletedURI) public onlyOwner {
        depletedURI = _newDepletedURI;
        for(uint256 i=1;i<amountMinted+1;i++) {
            if(freeMintsPerArtifact[i]==0) {
                artifactURI[i] = _newDepletedURI;
            }
        }
    }
    
    function setSpecialURI(string memory _newSpecialURI) external onlyOwner {
        specialURI = _newSpecialURI;
        for(uint256 i=1;i<amountMinted+1;i++) {
            if(freeMintsPerArtifact[i]==0 && revealed==true) {
                artifactURI[i] = _newSpecialURI;
            }
        }
    }
    
    function switchBaseURI(uint256 tokenId) private {
        artifactURI[tokenId] = depletedURI;
    }
    
    function switchUsedURI(uint256 tokenId) private {
        artifactURI[tokenId] = specialURI;
    }
    
    function withdraw() external payable onlyOwner {
        (bool success, ) = payable(owner()).call{value: address(this).balance}("");
        require(success);
    }
    
}