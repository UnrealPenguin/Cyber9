import Web3 from "web3";

const connectRequest = () => {
    return {
        type: "CONNECTION_REQUEST",
    };
};

const connectSuccess = (payload) => {
    return {
        type: "CONNECTION_SUCCESS",
        payload: payload,
    };
};

const connectFailed = (payload) => {
    return {
        type: "CONNECTION_FAILED",
        payload: payload,
    };
};

const updateAccountRequest = (payload) => {
    return {
        type: "UPDATE_ACCOUNT",
        payload: payload,
    };
};

export const connect = () => {
    return async (dispatch) => {
        dispatch(connectRequest());
        const { ethereum  } = window;
        const isMetamaskInstalled = ethereum  && ethereum.isMetaMask;

        const configResponse = await fetch("/config/config.json", {
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
          });
        const CONFIG = await configResponse.json();
        
        if(isMetamaskInstalled) {         
            let web3 = new Web3(ethereum);
            try{
                const accounts = await ethereum.request({
                    method: "eth_requestAccounts",
                });
                const networkId = await ethereum.request({
                    method: "net_version",
                });
               
                if (networkId === CONFIG.NETWORK.ID) {

                    dispatch(connectSuccess({
                        account: accounts[0],
                        connected: true,
                        web3: web3,
                    }));

                    //Listerners
                    ethereum.on("accountsChanged", (accounts) => {
                        dispatch(updateAccount(accounts[0]));
                    });

                    ethereum.on("chainChanged", () => {
                        window.location.reload();
                    });
                } else {
                    dispatch(connectFailed("Please change to the Polygon network"));
                }             


            }catch (err){
                dispatch(connectFailed("Something went wrong"));
            }
        }else{
            dispatch(connectFailed("Please install Metamask"));
        }

    }
};

export const updateAccount = (account) => {
    return async (dispatch) => {
        dispatch(updateAccountRequest({ account : account }));
    }
}