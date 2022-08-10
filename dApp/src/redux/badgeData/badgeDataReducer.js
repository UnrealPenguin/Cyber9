const initialState = {
    loading: false,
    smartContract: null,
    totalSupply: 0,
    cost: 0,
    badgeUri: "",
    usedBadgeUri: "",
    specialUri: "",
    revealed: false,
    paused: true,
    error: false,
    errorMsg: "",
    ownerTokens: [],
    freeMintCount: [],
    ownedTokens: 0,

}

const badgeDataReducer = (state = initialState, action) => {
    switch (action.type) {
        case "CHECK_DATA_REQUEST":
            return {
                ...state,
                loading: true,
                error: false,
                errorMsg: "",
            }
        case "CHECK_DATA_SUCCESS":
            return {
                ...state,
                loading: false,
                smartContract: action.payload.smartContract,
                totalSupply: action.payload.totalSupply,
                cost: action.payload.cost,
                ownerTokens: action.payload.ownerTokens,
                freeMintCount: action.payload.freeMintCount,
                badgeUri: action.payload.badgeUri,
                usedBadgeUri: action.payload.usedBadgeUri,
                specialUri: action.payload.specialUri,
                paused: action.payload.paused,
                revealed: action.payload.revealed,
                ownedTokens: action.payload.ownedTokens,
                error: false,
                errorMsg: "",
            }
        case "CHECK_DATA_FAILED":
            return {
                ...initialState,
                error: true,
                errorMsg: action.payload,
            }

        default:
             return state;
    }
}

export default badgeDataReducer;