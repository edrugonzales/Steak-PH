import React, { useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Slide,
} from "@mui/material";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction='up' ref={ref} {...props} />;
});

export default function useConfirmationDialog() {
  const [dialogState, setdialogState] = useState({
    open: false,
    title: "Title",
    message: "Your message here",
  });

  const showConfirmationDialog = ({
    message = "Your message here",
    title = "Title",
  }) => {
    setdialogState((prevState) => ({
      ...prevState,
      open: true,
      title: title,
      message: message,
    }));
  };

  const closeConfirmation = () => {
    setdialogState((prevState) => ({
      ...prevState,
      open: false,
    }));
  };

  const ConfirmationDialog = ({
    onConfirm = () => {},
    additionalActions = () => {},
  }) => {
    return (
      <Dialog
        open={dialogState.open}
        TransitionComponent={Transition}
        keepMounted
        onClose={closeConfirmation}
        aria-describedby='alert-dialog-slide-description'>
        <DialogTitle>{dialogState.title}</DialogTitle>
        <DialogContent>
          <DialogContentText id='alert-dialog-slide-description'>
            {dialogState.message}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeConfirmation}>back</Button>
          <Button
            onClick={() => {
              onConfirm();
              closeConfirmation();
              additionalActions();
            }}>
            Ok
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  return { showConfirmationDialog, ConfirmationDialog };
}
