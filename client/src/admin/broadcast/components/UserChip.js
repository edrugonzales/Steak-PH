import React from "react";
import { Avatar, Chip } from "@mui/material";

const UserChip = ({ name = "Juan Dela Cruz" }) => {
  return (
    <>
      <Chip
        style={{
          margin: "2px",
        }}
        avatar={<Avatar>{name.substring(0, 1)}</Avatar>}
        label={name}
      />
    </>
  );
};

export default UserChip;
