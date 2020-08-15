import { createSlice } from "@reduxjs/toolkit";
import { uniq, uniqBy } from "lodash";

const initialState = {
  loading: false,
  hasErrors: false,
  trades: [],
  filteredTrades: [],
  filteredTotal: 0,
  filteredAverage: 0,
  filtersApplied: false,
  availableFilters: {
    product_names: [],
    broker_names: [],
    trade_prices: [],
  },
  error: "",
  side: "both",
};

const setAvailableFilters = (payload) => {
  let productNames = [];
  let brokerNames = [];
  let tradePrices = [];

  payload.map((item) => {
    productNames.push({ name: item.product_name, checked: false });
    brokerNames.push({ name: item.broker_name, checked: false });
    tradePrices.push({ name: item.trade_price, checked: false });
  });

  return {
    product_names: uniqBy(productNames, "name"),
    broker_names: uniqBy(brokerNames, "name"),
    trade_prices: uniqBy(tradePrices, "name"),
  };
};

const checkSide = (arr, side) => {
  const sideFilter = arr.filter((item) => (item.side === side ? true : false));
  if (side === "both") {
    return arr;
  } else {
    return sideFilter;
  }
};

const getFilteredTrades = (products, trades, side) => {
  const filteredTrades = [];
  products.forEach((item) => {
    trades.map((trade) => {
      if (
        item.name === trade.product_name ||
        item.name === trade.broker_name ||
        item.name === trade.trade_price
      ) {
        filteredTrades.push(trade);
      }
    });
  });

  return uniqBy(checkSide(filteredTrades, side), "id");
};

const tradesSlice = createSlice({
  name: "trades",
  initialState,
  reducers: {
    setTotals: (state, { payload }) => {
      let totalFilterdTrades;
      state.filteredTrades.length >= 1
        ? (totalFilterdTrades = state.filteredTrades)
        : (totalFilterdTrades = state.trades);

      let total = totalFilterdTrades.reduce(
        (prev, cur) => Number(prev) + Number(cur.trade_price),
        0
      );
      state.filteredTotal = total.toFixed(3);
      state.filteredAverage = (total / totalFilterdTrades.length).toFixed(3);
    },

    getTrades: (state) => {
      state.loading = true;
    },
    getTradesSuccess: (state, { payload }) => {
      state.trades = payload;
      state.availableFilters = setAvailableFilters(payload);
      state.loading = false;
      state.hasErrors = false;
    },
    setFilter: (state, { payload }) => {
      const { type, value, checked } = payload;

      const elementsIndex = state.availableFilters[type].findIndex(
        (element) => element.name === value
      );

      let updateAvailableFilters = state.availableFilters[type];
      updateAvailableFilters[elementsIndex] = {
        ...updateAvailableFilters[elementsIndex],
        checked: !updateAvailableFilters[elementsIndex].checked,
      };

      state.availableFilters[type] = updateAvailableFilters;
    },
    filterTrades: (state, { payload }) => {
      const availableFilters = state.availableFilters;
      const trades = state.trades;
      let checkedFilters = [];

      for (let key in availableFilters) {
        availableFilters[key].map((item) => {
          item.checked ? checkedFilters.push(item) : false;
        });
      }

      if (checkedFilters.length >= 1) {
        state.filteredTrades = getFilteredTrades(
          checkedFilters,
          trades,
          state.side
        );
        state.filtersApplied = true;
      }
      if (checkedFilters.length === 0 && state.filtersApplied == true) {
        state.filteredTrades = checkSide(trades, state.side);
      }
    },
    toggleTradeSide: (state, { payload }) => {
      state.side = payload;
      state.filtersApplied = true;
    },

    getTradesFailure: {
      reducer(state, action) {
        const { errorMessage } = action.payload;
        state.loading = false;
        state.hasErrors = true;
        state.error = errorMessage;
      },
      prepare() {
        return { payload: { errorMessage: "error" } };
      },
    },
  },
});

const { actions, reducer } = tradesSlice;

export const {
  filterTrades,
  setTotals,
  filteredAverage,
  filteredTotal,
  getTrades,
  getTradesSuccess,
  getTradesFailure,
  resetFilters,
  toggleTradeSide,
  setFilter,
} = actions;

export const tradesSelector = (state) => state.trades;

export default reducer;

export function fetchTrades() {
  return async (dispatch) => {
    dispatch(getTrades());

    try {
      const response = await fetch("http://localhost:3000/trades");

      const data = await response.json();

      dispatch(getTradesSuccess(data));
    } catch (error) {
      dispatch(getTradesFailure());
    }
  };
}
