import React from "react";
import { Paper, Stack, Typography } from "@mui/material";
import SentimentVeryDissatisfiedIcon from "@mui/icons-material/SentimentVeryDissatisfied";

const ErrorCard = ({ errorMessage = "??" }) => {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        marginTop: "20%",
      }}>
      <Paper style={{ padding: "1em" }}>
        <Stack textAlign='center'>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <SentimentVeryDissatisfiedIcon />
          </div>
          <Typography>Uhm... something went wrong</Typography>
          <Typography>{errorMessage}</Typography>
        </Stack>
      </Paper>
    </div>
  );
};

export default ErrorCard;
