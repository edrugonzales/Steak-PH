import React, { useEffect } from "react";
import Select from "react-select";

const ShopsSelector = ({ shops, onChange, value }) => {
  useEffect(() => {
    console.log(shops);
    let data = shops.map((data) => {
      return {
        value: data,
        label: data.name,
      };
    });

    console.log(data);
  }, [shops]);

  return (
    <Select
      options={shops.map((data) => {
        return {
          value: data._id,
          label: data.name,
        };
      })}
      onChange={onChange}
      value={value}
      isMulti={true}
    />
  );
};

export default ShopsSelector;
