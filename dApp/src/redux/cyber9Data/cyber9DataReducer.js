const initialState = {
    loading: false,
    smartContract: null,
    currentSupply: 0,
    totalSupply: 0,
    cost: 0,
    ownerTokens: [],
    tokenBalanace: 0, //the balance of our proprietery token
    stakeArray: [], //array to check if token is staked or not
    characterStats: [], //stats of the character
    storedBalance: 0, 
    totalYield: [],
    expRequired: [],
    enemyStats: 0,
    isSpawned: false,
    characterMaxHp: [],
    CD: [],
    storedExp: [],
    imgArray: [],
    pastEvents: null,
    usable: false,
    error: false,
    errorMsg: "",
}

const cyber9DataReducer = (state = initialState, action) => {
    switch (action.type) {
        case "CHECK_COLLECTION_REQUEST":
            return {
                ...state,
                loading: true,
                error: false,
                errorMsg: "",
            }
        case "CHECK_USER_COLLECTION_SUCCESS":
            return {
                ...state,
                loading: false,
                smartContract: action.payload.smartContract,
                currentSupply: action.payload.currentSupply,
                totalSupply: action.payload.totalSupply,
                cost: action.payload.cost,
                ownerTokens: action.payload.ownerTokens,
                tokenBalance: action.payload.tokenBalance,
                stakeArray: action.payload.stakeArray,
                characterStats: action.payload.characterStats,
                storedBalance: action.payload.storedBalance,
                totalYield: action.payload.totalYield,
                expRequired: action.payload.expRequired,
                enemyStats: action.payload.enemyStats,
                isSpawned: action.payload.isSpawned,
                characterMaxHp: action.payload.characterMaxHp,
                CD: action.payload.CD,
                pastEvents: action.payload.pastEvents,
                usable: action.payload.usable,
                storedExp: action.payload.storedExp,
                imgArray: action.payload.imgArray,
                error: false,
                errorMsg: "",
            }
        case "CHECK_COLLECTION_FAILED":
            return {
                ...initialState,
                error: true,
                errorMsg: action.payload,
            }
        default:
             return state;
    }
}

export default cyber9DataReducer;