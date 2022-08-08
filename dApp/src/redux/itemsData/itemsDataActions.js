import Web3EthContract from "web3-eth-contract";

const fetchItemsRequest = () => {
    return{
        type: "CHECK_ITEMS_REQUEST",
    }
};

const fetchItemsSuccess = (payload) => {
    return {
        type: "CHECK_ITEMS_SUCCESS",
        payload: payload,
    }
};

const fetchItemsFailed = (payload) => {
    return {
        type: "CHECK_ITEMS_FAILED",
        payload: payload,
    }
}

export const fetchItemsData = (_account) => {
    return async (dispatch) => {
        dispatch(fetchItemsRequest);

        const abiResponse = await fetch("/config/items_abi.json", {
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
          });
        const items_abi = await abiResponse.json();
        const configResponse = await fetch("/config/config.json", {
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
          });
        const CONFIG = await configResponse.json();

        const { ethereum } = window;
        Web3EthContract.setProvider(ethereum);

        try{
            const Items = new Web3EthContract(
                items_abi,
                CONFIG.CYBER9_ITEMS
            );
            
            let orbBalance = await Items.methods.balanceOf(_account, 1).call();
            let hpBalance = await Items.methods.balanceOf(_account, 2).call();
            let cdBalance = await Items.methods.balanceOf(_account, 3).call();
            let statResetBalance = await Items.methods.balanceOf(_account, 4).call();
            let orbPrice = await Items.methods.ORB_PRICE().call();
            let hpKitPrice = await Items.methods.HP_PRICE().call();
            let cdKitPrice = await Items.methods.CD_PRICE().call();
            let statResetPrice = await Items.methods.STAT_RESET_PRICE().call();
            
            let imgArray = [];
            for(let i = 1; i<5;i++) {
                let uri = await fetch(`https://cyber9.mypinata.cloud/ipfs/QmUQGpKbhSJhVkqXKid17D1bTLNt2Uvo7Gb8R4qAuJ4sxn/${i}.png`); 
                imgArray.push(uri.url);
            }

            dispatch(fetchItemsSuccess({
                smartContract: Items,
                orbBalance: parseInt(orbBalance),
                hpBalance: parseInt(hpBalance),
                cdBalance: parseInt(cdBalance),
                statResetBalance: parseInt(statResetBalance),
                orbPrice: orbPrice,
                hpKitPrice: hpKitPrice,
                cdKitPrice: cdKitPrice,
                statResetPrice: statResetPrice,
                orbUri: imgArray[0],
                hpUri: imgArray[1],
                cdUri: imgArray[2],
                statResetUri: imgArray[3]
            }));
            
        } catch(err) {
            dispatch(fetchItemsFailed("Couldn't retrieve contract data"));
        }

    }
}