import React, { useState } from "react";

import { Alert, Slide, Snackbar } from "@mui/material";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction='up' ref={ref} {...props} />;
});

export default function useSparkleSnackbar(
  vertical = "top",
  horizontal = "right"
) {
  const [snackBarState, setsnackBarState] = useState({
    open: false,
    message: "Hello there",
    status: "success",
  });

  const showSnackbar = (message, status) => {
    setsnackBarState((prevState) => ({
      ...prevState,
      open: true,
      message: message,
      status: status,
    }));
  };

  const closeSnackbar = () => {
    setsnackBarState((prevState) => ({
      ...prevState,
      open: false,
    }));
  };

  const SparkleSnackBar = () => {
    return (
      <Snackbar
        anchorOrigin={{ vertical, horizontal }}
        open={snackBarState.open}
        autoHideDuration={6000}
        onClose={closeSnackbar}
        TransitionComponent={Transition}
        key={vertical + horizontal}>
        <Alert
          onClose={closeSnackbar}
          severity={snackBarState.status}
          sx={{ width: "100%" }}>
          {snackBarState.message}
        </Alert>
      </Snackbar>
    );
  };

  return { showSnackbar, closeSnackbar, SparkleSnackBar };
}
