import { combineReducers } from "redux";
import tradesReducer from "./trades.js";

const rootReducer = combineReducers({
  trades: tradesReducer,
});

export default rootReducer;
