const initialState = {
    loading: false,
    smartContract: null,
    orbBalance: 0,
    hpBalance: 0,
    cdBalance: 0,
    statResetBalance: 0,
    orbPrice: 0,
    hpKitPrice: 0,
    cdKitPrice: 0,
    statResetPrice: 0,
    orbUri: "",
    hpUri: "",
    cdUri: "",
    statResetUri: "",
    error: false,
    errorMsg: "",
}

const itemsReducer = (state = initialState, action) => {
    switch (action.type) {
        case "CHECK_ITEMS_REQUEST":
            return {
                ...state,
                loading: true,
                error: false,
                errorMsg: "",
            }
        case "CHECK_ITEMS_SUCCESS":
            return {
                ...state,
                loading: false,
                smartContract: action.payload.smartContract,
                orbBalance: action.payload.orbBalance,
                hpBalance: action.payload.hpBalance,
                cdBalance: action.payload.cdBalance,
                statResetBalance: action.payload.statResetBalance,
                orbPrice: action.payload.orbPrice,
                hpKitPrice: action.payload.hpKitPrice,
                cdKitPrice: action.payload.cdKitPrice,
                statResetPrice: action.payload.statResetPrice,
                orbUri: action.payload.orbUri,
                hpUri: action.payload.hpUri,
                cdUri: action.payload.cdUri,
                statResetUri: action.payload.statResetUri,
                error: false,
                errorMsg: "",
            }
        case "CHECK_ITEMS_FAILED":
            return {
                ...initialState,
                error: true,
                errorMsg: action.payload,
            }
        default:
             return {...state};
    }
}

export default itemsReducer;