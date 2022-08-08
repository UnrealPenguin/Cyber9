import store from "../store";
import Web3EthContract from "web3-eth-contract";

const fetchDataRequest = () => {
    return {
        type: "CHECK_DATA_REQUEST",
    }
};

const fetchDataSuccess = (payload) => {
    return {
        type: "CHECK_DATA_SUCCESS",
        payload: payload,
    }
};

const fetchDataFailed = (payload) => {
    return {
        type: "CHECK_DATA_FAILED",
        payload: payload,
    }
};

export const fetchBadgeData = (account) => {
    return async (dispatch) => {
        dispatch(fetchDataRequest());  
        const abiResponse = await fetch("/config/badge_abi.json", {
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
          });
        const badge_abi = await abiResponse.json();
        const configResponse = await fetch("/config/config.json", {
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
          });
        const CONFIG = await configResponse.json();

        const isConnected = store.getState().blockchain.connected;

        if (isConnected) {
            const { ethereum } = window;
            Web3EthContract.setProvider(ethereum);

            try {
                const Badge = new Web3EthContract(
                    badge_abi,
                    CONFIG.CYBER9_BADGE
                );  

                let totalSupply = await Badge.methods.totalSupply().call();
                let cost = await Badge.methods.cost().call();
                let revealed = await Badge.methods.revealed().call();
                let ownerTokens = await Badge.methods.walletOfOwner(account).call();
                let paused = await Badge.methods.paused().call();
                let freeMintCount = [];
                
                let badgeUri = await fetch('https://cyber9.mypinata.cloud/ipfs/QmYs78biqBmeSevEcC7RncvD1DVPnjyGKr5wXiQoVK1eqT/1.png');
                let usedBadgeUri = await fetch('https://cyber9.mypinata.cloud/ipfs/QmSmxKFtvA2mX774Aj6FH4ospoJRhs9XZPgq9eDUbJhyV8/1.png');
                // let specialUri = await fetch(`https://cyber9.mypinata.cloud/ipfs/QmUQGpKbhSJhVkqXKid17D1bTLNt2Uvo7Gb8R4qAuJ4sxn/1.png`); //CHANGE WHEN HAVE REAL URI
                
                for(let i = 0;i<ownerTokens.length;i++){
                    let MintCount = await Badge.methods.freeMintsLeft(ownerTokens[i]).call();
                    freeMintCount.push(MintCount);
                }
                
                dispatch(fetchDataSuccess({
                    smartContract: Badge,
                    totalSupply: totalSupply,
                    cost: cost,
                    ownerTokens: ownerTokens,
                    freeMintCount: freeMintCount,
                    badgeUri: badgeUri.url,
                    usedBadgeUri: usedBadgeUri.url,
                    // specialUri: specialUri.url,
                    paused: paused,
                    revealed: revealed
                }));           

            }catch (err) {
                dispatch(fetchDataFailed("Couldn't fetch contract data"));
            }

        }else{
            dispatch(fetchDataFailed("Please connect to Metamask"));
        }
    }
}
