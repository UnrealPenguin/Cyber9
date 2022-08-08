import Web3EthContract from "web3-eth-contract";
import Web3 from "web3";

const fetchCollectionRequest = () => {
    return{
        type: "CHECK_COLLECTION_REQUEST",
    }
};

const fecthUserCollectionSuccess = (payload) => {
    return{
        type: "CHECK_USER_COLLECTION_SUCCESS",
        payload: payload,
    }
}

const fetchCollectionFailed = (payload) => {
    return {
        type: "CHECK_COLLECTION_FAILED",
        payload: payload,
    }
}

export const fetchCollectionData = (account, sortType) => {
    return async (dispatch) => {
        dispatch(fetchCollectionRequest());
    
        const abiResponse = await fetch("/config/cyber9_abi.json", {
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
          });
          
        const collection_abi = await abiResponse.json();
        const configResponse = await fetch("/config/config.json", {
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
          });
          
        const CONFIG = await configResponse.json();

        const { ethereum } = window;
        Web3EthContract.setProvider(ethereum);

        const provider = CONFIG.WEBSOCKET; //CHANGE WHEN LIVE
        const options = {
            // Enable auto reconnection
            reconnect: {
                auto: true,
                delay: 5000, // ms
                maxAttempts: 5,
                onTimeout: false
            }
        };
        
        //for events
        let web3 = new Web3(new Web3.providers.WebsocketProvider(provider, options));
        let contract = new web3.eth.Contract(collection_abi, CONFIG.CYBER9);
                    
        try{   
            const Collection = new Web3EthContract(
                collection_abi,
                CONFIG.CYBER9
            );

            let pastEvents = [];
            await contract.getPastEvents('allEvents',
                {
                    filter: {_from: account}, // doesnt work with allEvents for now...have to add if statement
                    fromBlock: 0,  
                    toBlock: 'latest'
                },
                (error, logs) => {
                if (error) console.error(error);
                logs.forEach(log => {
                    let addr;
                    if(log.returnValues._from !== undefined) {
                        addr = log.returnValues._from.toLowerCase();
                    }
                    if(addr === account) {
                        switch(log.event) {                         
                            case "Attack": 
                                pastEvents.push({
                                    "Event": log.event,
                                    "TokenId": log.returnValues._tokenId, 
                                    "DD": log.returnValues._dmg,
                                    "DR": log.returnValues._enemyDmg,
                                    "Crit": log.returnValues._isCrit,
                                    "Exp": log.returnValues._experience
                                });
                                break;
                            case "CharacterDefeated":
                                pastEvents.push({
                                    "Event": log.event,
                                    "TokenId": log.returnValues._tokenId,   
                                });
                                break;
                            case "EnemyDefeated":
                                pastEvents.push({
                                    "Event": log.event,
                                    "TokenId": log.returnValues._tokenId,   
                                    "BeiAmount": log.returnValues._beiReward,
                                });
                                break;
                            case "Staked":
                                pastEvents.push({
                                    "Event": log.event,
                                    "TokenId": log.returnValues._tokenIds,   
                                });
                                break;
                            case "Unstaked":
                                pastEvents.push({
                                    "Event": log.event,
                                    "TokenId": log.returnValues._tokenIds,   
                                });
                                break;
                            case "Withdraw":
                                pastEvents.push({
                                    "Event": log.event,
                                    "TokenId": log.returnValues._tokenIds, 
                                    "TokenExp": log.returnValues._tokensExp,
                                    "BeiAmount" : log.returnValues._beiAmount,  
                                });
                                break;
                            default:; 
                        }
                    }
                    
                })
            });

            let ownerTokens = await Collection.methods.walletOfOwner(account).call();
            let balance = await Collection.methods.getBeiBalance(account).call();
            let storedBalance = await Collection.methods.storedBei(account).call();
            let totalSupply = await Collection.methods.maxSupply().call();
            let cost = await Collection.methods.cost().call();
            let currentSupply = await Collection.methods.amountMinted().call();
            let isSpawned = await Collection.methods.isSpawned(account).call();
            let enemyStats = await Collection.methods.getEnemyStats(account).call();
            let usable = await Collection.methods.usable().call();

            const data = async (_array) => {
                let stakeArray = [];
                let characterStats = [];
                let totalYield = [];
                let expRequired = [];
                let CD = [];
                let characterMaxHp = [];
                let storedExp = [];
                let imgArray = [];
 
                for(let i = 0; i<_array.length;i++) {
                    let isStaked = await Collection.methods.isStaked(_array[i]).call();
                    let stats = await Collection.methods.getCharacterStats(_array[i]).call();
                    let getTotalYield = await Collection.methods.calculateYieldTotal(_array[i]).call();
                    let expReq = await Collection.methods.expRequired(_array[i]).call();
                    let charactersCD = await Collection.methods.timeLeft(_array[i]).call();
                    let maxHp = await Collection.methods.characterMaxHp(_array[i]).call();
                    let expStored = await Collection.methods.storedExp(_array[i]).call();
                    let img = await fetch(`https://cyber9.mypinata.cloud/ipfs/QmYs78biqBmeSevEcC7RncvD1DVPnjyGKr5wXiQoVK1eqT/1.png`);
                    
                    stakeArray.push(isStaked);
                    characterStats.push(stats);
                    totalYield.push(getTotalYield);
                    expRequired.push(expReq);
                    characterMaxHp.push(maxHp);
                    CD.push(charactersCD);
                    storedExp.push(expStored);
                    imgArray.push(img.url);
                }

                dispatch(fecthUserCollectionSuccess({
                    smartContract: Collection,
                    totalSupply: totalSupply,
                    cost: cost,
                    currentSupply: currentSupply,
                    ownerTokens: _array,
                    stakeArray: stakeArray,
                    tokenBalance: balance,
                    characterStats: characterStats,
                    storedBalance: storedBalance,
                    totalYield: totalYield,
                    expRequired: expRequired,
                    enemyStats: enemyStats,
                    isSpawned: isSpawned,
                    characterMaxHp: characterMaxHp,
                    CD: CD,
                    usable: usable,
                    storedExp: storedExp,
                    imgArray: imgArray,
                    pastEvents: pastEvents
                }));
            }
            
            const sortArray = async (_sortType) => {
                let _staked = [];
                let _sortedArray = [];
                for(let i = 0; i<ownerTokens.length;i++) {
                    let _isStaked = await Collection.methods.isStaked(ownerTokens[i]).call();
                    _staked.push({'id': ownerTokens[i], 'staked':_isStaked});
                }
                switch (_sortType){
                    case 'staked':
                        const zipStaked = _staked.sort((a,b) =>  b.staked - a.staked);
                        for(let i = 0; i<zipStaked.length;i++){
                            _sortedArray.push(zipStaked[i].id);
                        }
                        break;
                    default:
                        const zipAvailable = _staked.sort((a,b) =>  a.staked - b.staked);
                        for(let i = 0; i<zipAvailable.length;i++){
                            _sortedArray.push(zipAvailable[i].id);
                        }
                }              
                return _sortedArray;
            }

            switch(sortType) {
                case 'ascending': 
                    const ASCENDING = [...ownerTokens].sort((a, b) => a - b);                         
                    data(ASCENDING);
                break;

                case 'descending': 
                    const DESCENDING = [...ownerTokens].sort((a, b) => b - a); 
                    data(DESCENDING);
                break;
                case 'staked':
                    sortArray(sortType).then(_array => {
                        data(_array);
                    })
                break;
                case 'available':
                    sortArray(sortType).then(_array => {
                        data(_array);
                    })
                break;
                default:
                    data(ownerTokens);
            }
            
        } catch(err) {
            dispatch(fetchCollectionFailed("Couldn't retrieve contract data"));
        }
    }
}


