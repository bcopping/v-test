import React, { useEffect, Fragment } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchTrades,
  filterTrades,
  setTotals,
  tradesSelector,
  toggleTradeSide,
  setFilter,
} from "../slices/trades";

import moment from "moment";
import { currencyGBP } from "../utils/formatter";
import Filter from "../components/filter";

const App = () => {
  const dispatch = useDispatch();
  const {
    trades,
    loading,
    hasErrors,
    availableFilters,
    filteredTrades,
    filtersApplied,
    filteredTotal,
    filteredAverage,
    side,
  } = useSelector(tradesSelector);

  useEffect(() => {
    dispatch(fetchTrades());
  }, [dispatch]);
  useEffect(() => {
    trades.length >= 1 ? dispatch(setTotals()) : null;
  }, [trades, filteredTrades]);
  useEffect(() => {
    dispatch(filterTrades());
  }, [availableFilters, side]);

  const filterAction = (filterObj) => {
    dispatch(setFilter(filterObj));
  };

  const renderTotalsAverages = () => {
    return (
      <div className="totals bg-success fixed-top">
        <div className="d-flex">
          <div className="p-3">
            <h2 className="h5 pb-0 mb-0">
              Total: <b>£{filteredTotal}</b>
            </h2>
          </div>
          <div className="p-3">
            <h2 className="h5 pb-0 mb-0">
              Average: <b>£{filteredAverage}</b>
            </h2>
          </div>
          <div className="ml-auto p-2 ">
            <div className="btn-group btn-group-toggle" data-toggle="buttons">
              <label
                className={`btn btn-secondary ${
                  side === "sell" ? "active" : null
                }`}
              >
                <input
                  onChange={(e) => dispatch(toggleTradeSide(e.target.id))}
                  type="radio"
                  name="side"
                  id="sell"
                />
                Sell
              </label>
              <label
                className={`btn btn-secondary ${
                  side === "both" ? "active" : null
                }`}
              >
                <input
                  onChange={(e) => dispatch(toggleTradeSide(e.target.id))}
                  type="radio"
                  name="side"
                  id="both"
                />
                Both
              </label>
              <label
                className={`btn btn-secondary ${
                  side === "buy" ? "active" : null
                }`}
              >
                <input
                  onChange={(e) => dispatch(toggleTradeSide(e.target.id))}
                  type="radio"
                  name="side"
                  id="buy"
                />{" "}
                Buy
              </label>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderFilters = () => {
    return (
      <div className="container-fluid">
        <div className="row bg-light text-dark p-3">
          <Filter
            title="Filter broker name"
            availableFilters={availableFilters.broker_names}
            type="broker_names"
            handleFilter={(filterObj) => filterAction(filterObj)}
          />

          <Filter
            title="Filter product name"
            availableFilters={availableFilters.product_names}
            type="product_names"
            handleFilter={(filterObj) => filterAction(filterObj)}
          />

          <Filter
            title="Filter trade prices"
            availableFilters={availableFilters.trade_prices}
            type="trade_prices"
            handleFilter={(filterObj) => filterAction(filterObj)}
          />
        </div>
      </div>
    );
  };

  const renderTrades = () => {
    if (loading) return <div>Loading...</div>;
    if (hasErrors) return <div>There was an error</div>;
    let tableData;
    if (filteredTrades.length >= 0 && filtersApplied === true) {
      tableData = filteredTrades;
    } else {
      tableData = trades;
    }

    return tableData && tableData.length ? (
      <div>
        <table className="table table-sm table-dark table-striped">
          <tbody>
            <tr>
              <th>Broker</th>
              <th>Book</th>
              <th>Cancelled</th>
              <th>End</th>
              <th>Matched</th>
              <th>Product</th>
              <th>Side</th>
              <th>Start</th>
              <th>Time</th>
              <th>Trade</th>
              <th>Volume</th>
              <th>Price</th>
            </tr>
            {tableData.map((trade) => (
              <tr key={trade.id}>
                <td>{trade.broker_name}</td>
                <td>{trade.book_name}</td>
                <td>{trade.cancelled ? "Yes" : "No"}</td>
                <td>{trade.end_date}</td>
                <td>{trade.matched ? "Yes" : "No"}</td>
                <td>{trade.product_name}</td>
                <td>{trade.side}</td>
                <td>{trade.start_date}</td>
                <td>{moment.utc(trade.time_created).format("LT")}</td>
                <td>{trade.trade_date}</td>
                <td>{Math.round(trade.trade_display_volume)}</td>
                <td>{currencyGBP.format(trade.trade_price)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ) : (
      <div className="p-3">
        <h2 className="h4">No results</h2>
      </div>
    );
  };
  return (
    <Fragment>
      {renderTotalsAverages()}
      {renderFilters()}
      {renderTrades()}
    </Fragment>
  );
};

export default App;
