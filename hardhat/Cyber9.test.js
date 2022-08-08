const { expect } = require('chai');
const { ethers } = require('hardhat');

let Artifact, artifact;
let Cyber9Token, cyber9token;

let Cyber9TokenV2, cyber9tokenV2;

let Cyber9Items, cyber9items;
let Cyber9, cyber9;
let owner, addr1, addr2;

describe('Artifact contract', () => {
    beforeEach(async () => {
        Artifact = await ethers.getContractFactory('Artifact');
        provider = ethers.provider;
    });

    describe('Deployment', () => {
        it('Should deploy artifact', async () => {
            artifact = await Artifact.deploy('baseUri', 'depletedUri');
            [owner, addr1, addr2, _] = await ethers.getSigners();

            // balance = await provider.getBalance(owner.address); //check balance
            // console.log(ad.toString());
        });
        it('Should mint 5 tokens', async () => {
            await artifact.mint(5);
        })

        it('Should have 5 tokens', async () => {
            expect(await artifact.amountMinted()).to.be.equal(5);
        });

        it('Should return the right owner addr', async () => {
            expect(await artifact.owner()).to.be.equal(owner.address);
        })
    });

    describe('Contract pausing', () =>{
        it('Should pause a contract', async () => {
            await artifact.pause(true);
            expect(await artifact.paused()).to.be.equal(true);
        });

        it('Should not be able to mint because contract paused', async () => {
            await expect(artifact.connect(addr1).mint(1, { value: ethers.utils.parseEther("0.05") }))
            .to.be.revertedWith('Contract is paused');
        });

        it('Should un-pause the contract', async () => {
            await artifact.pause(false);
            expect(await artifact.paused()).to.be.equal(false);
        })
    });

    describe('Minting', () => {
        it('Should mint one artifact to addr1', async () => {
            await artifact.connect(addr1).mint(1, { value: ethers.utils.parseEther("0.05") });
            const addr1Balance =  await artifact.balanceOf(addr1.address);
            expect(addr1Balance).to.be.equal(1);
        });
        it('Should mint one artifact to addr1', async () => {
            await artifact.connect(addr1).mint(1, { value: ethers.utils.parseEther("0.05") });
            const addr1Balance =  await artifact.balanceOf(addr1.address);
            expect(addr1Balance).to.be.equal(2);
        });

        it('Should revert if already minted two', async () => {
            await expect(artifact.connect(addr1).mint(1, { value: ethers.utils.parseEther("0.05") }))
            .to.be.revertedWith('Exceeded max amount');  
        });

        it('Should revert if address has minted two already', async () => {
            await expect(artifact.connect(addr1).mint(1, { value: ethers.utils.parseEther("0.05") }))
            .to.be.revertedWith('Exceeded max amount');
        })

        it('Should revert if minting 0', async () => {
            await expect(artifact.connect(addr2).mint(0, { value: ethers.utils.parseEther("0.00") }))
            .to.be.revertedWith('Required to mint at least 1 NFT');
        });

        it('Should revert if minting more than two', async () => {
            await expect(artifact.connect(addr2).mint(3, { value: ethers.utils.parseEther("0.15") }))
            .to.be.revertedWith('Exceeded max amount');  
        });

        it('Should not be able to use free mints', async () => {
            await expect(artifact.useFreeMint(1, owner.address)).to.be.revertedWith('Calling from invalid address');
        })

    });

    describe('URI/Reveal check', () => {
        it('Should return the base Uri', async () => {
            const uri = await artifact.tokenURI(1);
            await expect(uri).to.be.equal('baseUri1.json');
        });
        it('Should revert if token URI doesnt exist', async () => {
            await expect(artifact.tokenURI(10))
            .to.be.revertedWith('ERC721Metadata: URI query for nonexistent token');
        });
        it('Should not be revealed', async () => {
            expect(await artifact.revealed()).to.equal(false);
        });
    })
    
    describe('Withdrawals', () => {
        it('Should prevent non owners from withdrawing', async () => {
            await expect(artifact.connect(addr1).withdraw())
            .to.be.revertedWith('Ownable: caller is not the owner');
        });
        it('Should have funds inside contract from mints', async () => {
            expect(await provider.getBalance(artifact.address)).to.be.above(0);
        });
        it('Should withdraw all the funds from the contract', async () => {
            await artifact.withdraw();
            expect(await provider.getBalance(artifact.address)).to.be.equal(0);
        });
    })

})

//check reveal functions!

//CYBER9TOKEN CONTRACT
describe("Cyber9 Token contract", () => {

    beforeEach(async () =>{
        Cyber9Token = await ethers.getContractFactory('Cyber9Token');
        // Cyber9TokenV2 = await ethers.getContractFactory('Cyber9TokenV2');
    });

    describe('deployment', () => {
        it('Should deploy a proxy for Cyber9Token', async () => {
            cyber9token = await upgrades.deployProxy(Cyber9Token, {kind: 'uups'});
        });
        
        it('Should return the right owner addr', async () => {
            expect(await cyber9token.owner()).to.be.equal(owner.address);
        });

    });

    // describe('upgrade', () => {
    //     it('Should upgrade to a new contract', async () => {
    //         cyber9TokenV2 = await upgrades.upgradeProxy(cyber9token, Cyber9TokenV2);
    //     });
    //     it('Should still have the same test as V1', async () => {
    //         expect(await cyber9token.test()).to.be.equal(1);
    //     });
    //     it('should set test to 2', async () => {
    //         await cyber9TokenV2.setTest2(2);
    //     })
    //     it('should not be able to mint', async () => {
    //         await cyber9TokenV2.mintBei(owner.address, 1);
    //     })
    // })
});

//check minting and burning from cyber9Token also setting the right address for the contract

//CYBER9ITEMS CONTRACT 
describe('Cyber9 items contract', () => {
    beforeEach(async () => {
        Cyber9Items = await ethers.getContractFactory('Cyber9Items');
    });
    describe('deployment', () => {
        it('Should deploy Cyber9 items', async () =>{
            cyber9items = await Cyber9Items.deploy("c9itemsURI", cyber9token.address);
        });
    })
    
});

//CHECK IF YOU CAN BUY THE ITEMS IN THE FUTURE

//CYBER9 CONTRACT
describe('Cyber9 contract', () => {
    beforeEach(async() =>{
        Cyber9 = await ethers.getContractFactory('Cyber9');
    });
    describe('deployment', () => {
        it('Should deploy Cyber9', async () => {
            cyber9 = await Cyber9.deploy('baseURI', 'hiddenURI', artifact.address, cyber9token.address, cyber9items.address);
        });
    });

    describe('Minting', () => {
        it('Should set dependencies for cyber9 token', async () => {
            cyber9token.setCyber9Dependencies(cyber9.address, cyber9items.address);
        })
        it('Should set cyber9s address to Artifact', async () => {
            await artifact.setCyber9Contract(cyber9.address);
        });
        it('Should set cyber9 items dependencies', async () => {
            await cyber9items.setCyber9Contract(cyber9.address);
        })
        //FOR ARTIFACTS FREE MINT
        it('Should use a free mint from Artifact', async () => {
            await cyber9.connect(addr1).freeMint(6);
            expect(await artifact.freeMintsLeft(6)).to.be.equal(0);
            expect(await cyber9.ownerOf(1)).to.be.equal(addr1.address);
        });
        it('Should revert if minting from same artifact', async () => {
            await expect(cyber9.connect(addr1).freeMint(6))
            .to.be.revertedWith('This token has used all the free mints available');
        });
        it('Should revert if minting from an artifact that isnt ours', async () =>{
            await expect(cyber9.connect(addr1).freeMint(5))
            .to.be.revertedWith('You are not the owner of this token');
        });
        it('Should revert if minting from an artifact that doesnt exist', async () =>{
            await expect(cyber9.connect(addr1).freeMint(9))
            .to.be.reverted;
        });
        it('Should give the minter cyber9 tokens', async () => {
            expect(await cyber9.getBeiBalance(addr1.address)).to.be.equal(200);
        });

        //FOR CHARACTERS - checked and worked
        // it('Should have created a character with random stats', async () => {
        //     const character = await cyber9.getCharacterStats(1);
        //     console.log(character);
        // })
        it('Should mint 3 additionnal cyber9 tokens to addr1', async () => {
            await cyber9.connect(addr1).mint(3, {value: ethers.utils.parseEther("0.15")});
            // console.log(await cyber9.walletOfOwner(addr1.address));
        });

        //MINT FROM CYBER9 ITEMS
        it('Should revert because of insufficient funds', async () => {
            await expect(cyber9items.connect(addr1).mintOrbs(1)).to.be.revertedWith('Insufficient funds');
        })
    })

    //TESTING WITH BOOSTED VALUES
    // describe('Character functions', () => {
    //     it('Should level up the character to 9', async () => {
    //         for(i = 1; i<9;i++){
    //             await cyber9.connect(addr1).levelUp(1);
    //         }
    //         const stat = await cyber9.getCharacterStats(1);
    //         expect(stat.level).to.be.equal(9);
    //     });
    //     it('Should level up to 10 with address 1 since it has an orb', async () => {
    //         await cyber9.connect(addr1).levelUp(1);
    //         const stat = await cyber9.getCharacterStats(1);
    //         expect(stat.level).to.be.equal(10);
    //     });
    //     it('Should remain 9 orbs in addr 1 wallet', async () =>{
    //         expect(await cyber9items.balanceOf(addr1.address, 1)).to.be.equal(9);
    //     })        
        // it('Should Level up to lv 20 / burn 2 orbs as well', async () => {
        //     for(i = 1; i<11;i++){
        //         await cyber9.connect(addr1).levelUp(1);
        //     }
        //     const stat = await cyber9.getCharacterStats(1);
        //     expect(stat.level).to.be.equal(20);
        //     expect(await cyber9items.balanceOf(addr1.address, 1)).to.be.equal(7);
        // });
        // it('Should revert because already max level', async () =>{
        //     await expect(cyber9.connect(addr1).levelUp(1))
        //     .to.be.revertedWith('Your character is already max level');
        // });
        // it('Should transfer cyber9 #2 to address 2' ,async () => {
        //     await cyber9.connect(addr1)['safeTransferFrom(address,address,uint256)'](addr1.address, addr2.address, 2);

        //     expect( await cyber9.balanceOf(addr2.address)).to.be.equal(1);
        // });
        // it('Should revert because address 2 doesnt have orbs', async () => {
        //     for(i = 1; i<10;i++){
        //         if(i==9) {
        //             await expect( cyber9.connect(addr2).levelUp(2)).to.be.revertedWith('Insufficient Orbs');
        //         }else{
        //             await cyber9.connect(addr2).levelUp(2);
        //         }                    
        //     }
        // });
    // })
    //END TESTING WITH BOOSTED VALUES

    describe('Staking functions', () => {
        it('Should open staking/attack functions', async () =>{
            await cyber9.setUsable(true);
        })
        it('Should stake token 1 and 2 from address 1', async () =>{
            await cyber9.connect(addr1).stake([1,2]);
            expect( await cyber9.isStaked(addr1.address,1)).to.be.equal(true);
            // console.log(await cyber9.yieldPerToken(1));
            // const yield = await cyber9.calculateYieldTotal(addr1.address, 1);
            // console.log(yield);
        });
        it('Should increase block time by 1 day', async () =>{
            await ethers.provider.send('evm_increaseTime', [86400]);
            await ethers.provider.send('evm_mine');
            // const stats = await cyber9.getCharacterStats(1);
            // const multi = stats.intelligence + stats.luck;
            // console.log(multi); 
            // console.log(await cyber9.yieldPerToken(1)); // working so far
        });
        it('should be able to withdraw the yield', async () => {
            await cyber9.connect(addr1).withdrawYield();
        });
        it('should unstake token 1', async () => {
            await cyber9.connect(addr1).unstake([1]);
            expect( await cyber9.isStaked(addr1.address,1)).to.be.equal(false);
        })
    });

    describe('Attacking the enemy', () => {
        it('Should spawn an enemy', async () => {
            await cyber9.connect(addr1).spawnEnemy();
            expect(await cyber9.isSpawned(addr1.address)).to.be.equal(true);
        });
        it('Should show enemy stats', async () => {
            const enemyStats = await cyber9.getEnemyStats(addr1.address);
            console.log(enemyStats);
            const noEnemy = await cyber9.getEnemyStats(addr2.address);
            console.log(noEnemy);
        })
        it('Should attack the enemy', async () => {
            await cyber9.connect(addr1).attackEnemy([1]);
        })
        it('Token 1 should be on CD', async () => {   
            await expect(cyber9.connect(addr1).attackEnemy([1])).to.be.revertedWith('On cooldown');
        });
    });

    // describe('Using hp and cd kits', () => {
    //     it('Should mint 10k bei', async () => {
    //         await cyber9.connect(addr1).beiTest();
    //     });
    //     it('Should mint an hp kit and cd kit', async () => {
    //         await cyber9items.connect(addr1).mintHpKit(1);
    //         await cyber9items.connect(addr1).mintCdKit(1);

    //         expect(await cyber9items.balanceOf(addr1.address, 2)).to.be.equal(1);
    //         expect(await cyber9items.balanceOf(addr1.address, 3)).to.be.equal(1);
    //     });
    //     it('should heal character 1', async () => {
    //         await cyber9.connect(addr1).healCharacter(1);
    //         const stats = await cyber9.getCharacterStats(1);
    //         expect(stats.hp).to.be.equal(await cyber9.characterMaxHp(1));
    //     });
    //     it('Should reset the cooldown', async () => {
    //         await cyber9.connect(addr1).resetCD(1);
    //         expect(await cyber9.timeLeft(1)).to.be.equal(0);
    //     });
    //     it('Should have a balance of 0 of cd and hp kit', async () => {
    //         expect(await cyber9items.balanceOf(addr1.address, 2)).to.be.equal(0);
    //         expect(await cyber9items.balanceOf(addr1.address, 3)).to.be.equal(0);
    //     });
    //     it('Should revert if trying to revive a character thats alive', async () => {
    //         await expect( cyber9.connect(addr1).revive(1)).to.be.revertedWith('This character is not defeated');
    //     })
    // });

})