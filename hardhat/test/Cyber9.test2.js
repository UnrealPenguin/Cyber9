const { expect } = require('chai');
const { ethers } = require('hardhat');

let CharLib, charLib;
let EnemyLib, enemyLib;
let ClanLib, clanLib;

let Artifact, artifact;
let Cyber9Items, cyber9items;
let Cyber9Token, cyber9token;
let Cyber9, cyber9;
let Cyber9Enhance, cyber9enhance;

describe('Cyber9 Project', async () => {
    beforeEach(async () => {
        Artifact = await ethers.getContractFactory('Cyber9Badge');
        provider = ethers.provider;
    });

    describe('Artifact Deployment', async () => {
        it('Should deploy artifact', async () => {
            artifact = await Artifact.deploy('baseUri', 'depletedUri');
            [owner, addr1, addr2, _] = await ethers.getSigners();
        });
        it('Should mint 10 tokens', async () => {
            await artifact.mint(10);
        })

        it('Should have 10 tokens', async () => {
            expect(await artifact.amountMinted()).to.be.equal(10);
        });

        it("Should mint 1 token to addr1", async () => {
            await artifact.connect(addr1).mint(1, { value: ethers.utils.parseEther("25") });
        })

        it('Should have 11 tokens', async () => {
            expect(await artifact.amountMinted()).to.be.equal(11);
        });

        it('Should return the right owner addr', async () => {
            expect(await artifact.owner()).to.be.equal(owner.address);
        })

        it("Should mint 5 badges", async () => {
            await artifact.connect(addr1).mint(5, { value: ethers.utils.parseEther("125") });
        })

        it("Should revert since addr1 already has minted 5", async () => {
            await expect(artifact.connect(addr1).mint(5, { value: ethers.utils.parseEther("125") })).to.be.revertedWith("Exceeded max amount");
        })
    });

    describe("Cyber9 token Deployment", async () => {
        beforeEach(async () => {
            Cyber9Token = await ethers.getContractFactory('Cyber9Token');
        })
        it("Should deploy token contract", async () => {
            cyber9token = await upgrades.deployProxy(Cyber9Token, {kind: 'uups'});
        });
        // it("Should have a balance of 10k", async () => {
        //     expect(await cyber9token.balanceOf(owner.address)).to.be.equal(10000);
        // });
    })

    describe("Cyber9 items deployment", async () => {
        beforeEach(async () => {
            Cyber9Items = await ethers.getContractFactory('Cyber9Items')
        })
        it("Should deploy items contract", async () => {
            cyber9items = await Cyber9Items.deploy("Cyber9 Items", "C9I", 'baseURI');
        });
        it("Should set items contract on token contract", async () => {
            await cyber9token.setItemsContract(cyber9items.address);
        });
        it("Should set token contract on items contact", async () => {
            await cyber9items.setTokenContract(cyber9token.address);
        })
    })

    describe("Deploy libraries", async () => {
        beforeEach(async () => {
            CharLib = await ethers.getContractFactory("CharacterLib");
            EnemyLib = await ethers.getContractFactory("EnemyLib");
            ClanLib = await ethers.getContractFactory("ClanLib");
        })
        it("Should deploy all libraries", async () => {
            charLib = await CharLib.deploy();
            enemyLib = await EnemyLib.deploy();
            clanLib = await ClanLib.deploy();
        })
    })

    describe("Cyber9 Deployment", async () => {
        beforeEach(async () => {
            Cyber9 = await ethers.getContractFactory("Cyber9nonvrf", {
                libraries: {
                    CharacterLib: charLib.address,
                    EnemyLib: enemyLib.address,
                    ClanLib: clanLib.address
                }
            });
        })
        it("Should deploy cyber9", async () =>{
            cyber9 = await Cyber9.deploy(artifact.address, cyber9token.address, cyber9items.address);
        })
        it('Should set cyber9 contract for token dependency', async () =>{
            await cyber9token.setCyber9Contract(cyber9.address);
        })
        it('Should set cyber9 contract for items dependency', async () => {
            await cyber9items.setCyber9Contract(cyber9.address);
        })
        it("Should set cyber9 contract for artifact", async () => {
            await artifact.setCyber9Contract(cyber9.address);
        })
        it("Should have 9 in the owners address", async () => {
            expect(await cyber9.balanceOf(owner.address)).to.be.equal(9); 
            expect(await cyber9.ownerOf(9)).to.be.equal(owner.address);
        })
        // it("Try to get stats of non existing character", async () => {
        //     stats = await cyber9.getCharacterStats(10);
        //     console.log(stats);
        // })
        it('Should set pause to false', async () => {
            await cyber9.pause(false);
        })
        it('Should set usable to true', async () => {
            await cyber9.setUsable(true);
        })
        it("Should revert cause minting 11 and max is 10", async () => {
            await expect(cyber9.connect(addr1).mint(11, { value: ethers.utils.parseEther("550") })).to.be.revertedWith("M");
        })

        it('Should mint all cyber9', async () => {
            await cyber9.connect(addr1).mint(10, { value: ethers.utils.parseEther("500") });
            await cyber9.connect(addr1).mint(10, { value: ethers.utils.parseEther("500") });
            await cyber9.connect(addr1).mint(10, { value: ethers.utils.parseEther("500") });
            await cyber9.connect(addr1).mint(10, { value: ethers.utils.parseEther("500") });
            await cyber9.connect(addr1).mint(10, { value: ethers.utils.parseEther("500") });
            await cyber9.connect(addr1).mint(10, { value: ethers.utils.parseEther("500") });
            await cyber9.connect(addr1).mint(10, { value: ethers.utils.parseEther("500") });
            await cyber9.connect(addr1).mint(10, { value: ethers.utils.parseEther("500") });
            await cyber9.connect(addr1).mint(9, { value: ethers.utils.parseEther("500") });
            expect(await cyber9.balanceOf(addr1.address)).to.be.equal(89);
        });

        it("Should mint 1 and sold out collection", async () => {
            // await cyber9.mint(1, {value: ethers.utils.parseEther("0.50")});
            await cyber9.freeMint(1);
        })

        it('Amount minted should be 99', async () => {
            expect(await cyber9.amountMinted()).to.be.equal(99);
        })        
        
        // it("Should revert cause minted everything", async () => {
        //     await expect(cyber9.mint(1)).to.be.revertedWith("O");
        // })

        // it("no more free mint cause sold out", async () => {
        //     await expect(cyber9.freeMint(1)).to.be.revertedWith("O");
        // })

        it("Should airdrop 50k tokens to owner, address 1 and 2", async () => {
            await cyber9token.airdropBei([owner.address, addr1.address, addr2.address], 50000);
            expect(await cyber9.getBeiBalance(addr1.address)).to.be.equal(67800);
            expect(await cyber9.getBeiBalance(addr2.address)).to.be.equal(50000);
        })

        it("Should buy 15 orbs to owner", async () => {
            await cyber9items.purchaseOrbs(owner.address, 15);
        });

        it('Should level character to 50', async () => {
            for(let i =0; i<49;i++){
                await cyber9.levelUp(2);
            }
            console.log(await cyber9.getCharacterStats(2));
            console.log(await cyber9.characterMaxHp(2));
        })
        it("Should revert because character already max level", async () => {
            await expect(cyber9.levelUp(2)).to.be.reverted;
        }); 
        // works generates a random id everytime
        // it("Should return the right character id", async () => {
        //     id = await cyber9.CharacterIdByIndex(10);
        //     console.log(id);
        // })

        it("Should spawn and attack enemy", async () => {
            await cyber9.spawnEnemy();
            await cyber9.attackEnemy([2]);
            console.log(await cyber9.getCharacterStats(2));
            console.log(await cyber9.characterMaxHp(2));
        });
    })

    describe("Deploy enhancement contract", async () => {
        beforeEach(async () => {
            Cyber9Enhance = await ethers.getContractFactory("Cyber9Enhancement", {
                libraries: {
                    CharacterLib: charLib.address
                }
            });
        })
        it("Should deploy enhancement contract", async () => {
            cyber9enhance = await Cyber9Enhance.deploy(artifact.address, cyber9token.address, cyber9items.address, cyber9.address);
        });
        it("Should set dependencies", async () => {
            await artifact.setEnhancementContract(cyber9enhance.address);
            await cyber9.setEnhancementContract(cyber9enhance.address);
        });
        it("Should enhance a character", async () => {
            await cyber9enhance.enhance(1,2);     
        });
        // Works 
        it("Should get stats of enhanced character", async () => {
            stat = await cyber9enhance.getEnhancedCharacterStats(2);
            console.log(stat);
            console.log(await cyber9enhance.characterMaxHp(2));
        });

        it('Should revert because not owner', async () => {
            //tested both badge and cyber9 requires
            await expect(cyber9enhance.connect(addr1).enhance(11, 1)).to.be.revertedWith("Do not own this c9");
        })
        
        // it("Try to get stats of non existing character", async () => {
        //     stats = await cyber9.getCharacterStats(1);
        //     console.log(stats);
        //     stats2 = await cyber9.getCharacterStats(2);
        //     console.log(stats2);
        // })
    })

})