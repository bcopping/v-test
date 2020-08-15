import React, { Fragment } from "react";
import { currencyGBP } from "../utils/formatter";

const Filter = (props) => {
  const { availableFilters, type, title, handleFilter } = props;

  return (
    <div className="col">
      <div className="overflow-auto filters px-3 border-bottom border-dark">
        <h3 className="h6">{title}</h3>
        {availableFilters.map(({ name, checked }) => {
          let id = name.replace(/\s/g, "");
          return (
            <div className="form-check" key={id}>
              <input
                className="form-check-input"
                onChange={(e) =>
                  handleFilter({
                    type: type,
                    value: name,
                    checked: e.target.checked,
                  })
                }
                type="checkbox"
                value={name}
                id={id}
                checked={checked}
              />
              <label className="form-check-label" htmlFor={id}>
                {type === "trade_prices" ? currencyGBP.format(name) : name}
              </label>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Filter;
