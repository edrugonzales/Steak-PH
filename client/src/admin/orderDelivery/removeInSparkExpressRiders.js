import React, { useEffect, useState } from "react";
import { cancelDelivery } from "../apiAdmin";
import database from "../../services/firebase";
const CancelDelivery = ({id}) => {
  let [status, setStatus] = useState(false);
  useEffect(() => {
    let mounted = true;

    if (mounted) {
      //
      checkForStatus();
    }
    return () => {
      mounted = false;
    };
  }, []);

  const checkForStatus = async () => {
    let status = await database.ref(`available_deliveries/${id}`).once("value");
    console.log(status.val())
    if (status.val()?.orderId) {
      setStatus(true);
    }
  };

  const stopBroadcastOrder = (id) => {
    cancelDelivery(id).then((response) => {
      console.log(response);
      if (response.ok) {
        alert("broadcast stopped");
        window.location.reload();
      } else alert("something happened, please try again");
    });
  };

  return (
    <li className="list-group-item">
      <button
        onClick={() => {
          stopBroadcastOrder(id);
        }}
        className="input-group-text"
      >
        {`${
          status
            ? "Delivery exists in app, click to remove."
            : "Delivery Removed"
        } `}
      </button>
    </li>
  );
};

export default CancelDelivery;
