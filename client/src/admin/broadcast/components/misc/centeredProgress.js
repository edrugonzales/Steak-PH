import {
  CircularProgress,
  Container,
  Paper,
  Stack,
  Typography,
  Box,
  CssBaseline,
} from "@mui/material";
import React from "react";
import { styled } from "@mui/material/styles";

const Item = styled(Container)(({ theme }) => ({
  ...theme.typography.body2,
  textAlign: "center",
  color: theme.palette.text.secondary,
}));

const CenteredProgress = () => {
  return (
    <CssBaseline>
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          marginTop: "20%",
        }}>
        <Paper sx={{ padding: "1em" }}>
          <Stack textAlign={"center"}>
            <Item>
              <CircularProgress />
            </Item>
            <Typography>LOADING</Typography>
          </Stack>
        </Paper>
      </Box>
    </CssBaseline>
  );
};

export default CenteredProgress;
