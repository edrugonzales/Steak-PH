import React from "react";
import { useField } from "formik";
import { TextField } from "@mui/material";

const CustomTextField = ({
  type,
  label,
  placeholder,
  InputProps,
  defaultValue,
  disabled,
  isRequired = true,
  multiline,
  maxRows,
  ...props
}) => {
  const [field, meta] = useField(props);
  const errorText = meta.error && meta.touched ? meta.error : "";
  return (
    <TextField
      label={label}
      variant='outlined'
      fullWidth
      type={type}
      required={isRequired}
      placeholder={placeholder}
      defaultValue={defaultValue}
      disabled={disabled}
      {...field}
      helperText={errorText}
      s
      error={!!errorText}
      InputProps={InputProps}
      multiline={true}
      maxRows={maxRows}
    />
  );
};

export default CustomTextField;
