import React, { useState } from 'react'

import { Dialog, DialogContent, Slide, Tab, Tabs, Box, AppBar, Toolbar, IconButton } from '@mui/material'
import TabPanel from "../../component/TabPanel"


import CloseIcon from '@mui/icons-material/Close';
import VortexTransactionPage from './pages/VortexTransactionPage';
import UserDetailsPage from './pages/UserDetailsPage';
import UserOrdersPage from './pages/UserOrdersPage';


const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction='up' ref={ref} {...props} />;
});

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}


export default function UserViewer() {

  const [show, setshow] = useState(false)

  const [selectedUser, setSelectedUser] = useState(null)

  const showUserViewerDialog = (user) => {
    setshow(true)
    setSelectedUser(user)
  }


  const closeUserViewerDialog = () => {
    setshow(false)
  }



  const UserViewerDialog = () => {


    const [tabIndex, setTabIndex] = useState(0)

    const handleTabChange = (event, newValue) => {
      setTabIndex(newValue);
    };


    return <Dialog
      open={show}
      TransitionComponent={Transition}
      fullScreen>
      <AppBar>
        <Toolbar>
          <IconButton
            size='large'
            edge='start'
            color='inherit'
            aria-label='menu'
            sx={{ mr: 2 }}
            onClick={() => {
              closeUserViewerDialog()
            }}>
            <CloseIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      <Toolbar />
      <DialogContent>
        <Box sx={{ width: '100%' }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabIndex} onChange={handleTabChange} aria-label="basic tabs example">
              <Tab label="Profile" {...a11yProps(0)} />
              {/* <Tab label="Orders" {...a11yProps(1)} /> */}
              <Tab label="Vortex transactions" {...a11yProps(1)} />
            </Tabs>
          </Box>
          <TabPanel value={tabIndex} index={0}>
            <UserDetailsPage user={selectedUser} />
          </TabPanel>
          {/* <TabPanel value={tabIndex} index={1}>
            <UserOrdersPage user={selectedUser} />
          </TabPanel> */}
          <TabPanel value={tabIndex} index={1}>
            <VortexTransactionPage user={selectedUser} />
          </TabPanel>
        </Box>

      </DialogContent>
    </Dialog>
  }


  return { showUserViewerDialog, closeUserViewerDialog, UserViewerDialog }
}