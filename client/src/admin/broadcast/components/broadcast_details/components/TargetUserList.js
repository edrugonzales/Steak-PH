import React from "react";
import UserChip from "../../UserChip";

const TargetUserList = ({ users = [] }) => {
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
      }}>
      {users.map((user) => {
        return <UserChip name={user?.name} />;
      })}
    </div>
  );
};

export default TargetUserList;
