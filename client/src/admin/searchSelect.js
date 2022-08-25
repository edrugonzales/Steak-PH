import React from "react";
import Select from "react-select";

const SearchSelect = () => {
  const options = [
    { value: "chocolate", label: "Chocolate" },
    { value: "strawberry", label: "Strawberry" },
    { value: "vanilla", label: "Vanilla" },
  ];

  const onChange = (change) => {
    console.log(change);
  };

  return (
    <Select
      value={[{ label: "Chocolate", value: "chocolate" }]}
      options={options}
      onChange={onChange}
      isMulti={true}
    />
  );
};

export default SearchSelect;
