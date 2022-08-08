import { applyMiddleware, compose, createStore, combineReducers } from "redux";
import thunk from "redux-thunk";
import blockchainReducer from "./blockchain/blockchainReducer";
import badgeDataReducer from "./badgeData/badgeDataReducer";
import itemsDataReducer from "./itemsData/itemsDataReducer";
import cyber9DataReducer from "./cyber9Data/cyber9DataReducer";

const rootReducer = combineReducers({
    blockchain: blockchainReducer,
    badgeData: badgeDataReducer,
    itemsData: itemsDataReducer,
    cyber9Data: cyber9DataReducer,
});

const middleware = [thunk];
const composeEnhancers = compose(applyMiddleware(...middleware));

const configureStore = () => {
    return createStore(rootReducer, composeEnhancers);
}

const store = configureStore();

export default store;