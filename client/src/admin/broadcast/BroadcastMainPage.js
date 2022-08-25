import {
  Button,
  CssBaseline,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Tabs,
  Tab,
} from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import React from "react";
import { useHistory } from "react-router-dom";
import { Box } from "@mui/system";
import TabPanel from "./components/TabPanel";
import NotificationTabPanel from "./components/NotificationsTabPanel";
import PromotionsTabPanel from "./components/PromotionsTabPanel";
import AdvisoryTabPanel from "./components/AdvisoryTabPanel";
import useNewBroadcast from "./components/new_broadcast/useNewBroadcast";

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

const BroadcastMainPage = () => {
  const history = useHistory();

  const [value, setValue] = React.useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const { handleShow, NewBroadcastDialog } = useNewBroadcast();

  return (
    <CssBaseline>
      <AppBar>
        <Toolbar>
          <IconButton
            size='large'
            edge='start'
            color='inherit'
            aria-label='menu'
            sx={{ mr: 2 }}
            onClick={() => {
              history.goBack();
            }}>
            <ChevronLeftIcon />
          </IconButton>
          <Typography variant='h6' component='div' sx={{ flexGrow: 1 }}>
            BROADCAST TOOL
          </Typography>
          <Button
            color='inherit'
            onClick={() => {
              handleShow(true);
            }}>
            New broadcast
          </Button>
        </Toolbar>
      </AppBar>
      <Toolbar />
      <Box sx={{ width: "100%" }}>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs
            value={value}
            onChange={handleChange}
            aria-label='basic tabs example'>
            <Tab label='Notifications' {...a11yProps(0)} />
            <Tab label='Promotions' {...a11yProps(1)} />
            <Tab label='Advisory' {...a11yProps(2)} />
          </Tabs>
        </Box>
        <TabPanel value={value} index={0}>
          <NotificationTabPanel />
        </TabPanel>
        <TabPanel value={value} index={1}>
          <PromotionsTabPanel />
        </TabPanel>
        <TabPanel value={value} index={2}>
          <AdvisoryTabPanel />
        </TabPanel>
      </Box>
      <NewBroadcastDialog />
    </CssBaseline>
  );
};

export default BroadcastMainPage;
