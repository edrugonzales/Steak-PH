import * as React from 'react';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import Box from '@mui/material/Box';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import HomeIcon from '@mui/icons-material/Home';
import PeopleIcon from '@mui/icons-material/People';
import DnsRoundedIcon from '@mui/icons-material/DnsRounded';
import PermMediaOutlinedIcon from '@mui/icons-material/PhotoSizeSelectActual';
import PublicIcon from '@mui/icons-material/Public';
import SettingsEthernetIcon from '@mui/icons-material/SettingsEthernet';
import SettingsInputComponentIcon from '@mui/icons-material/SettingsInputComponent';
import TimerIcon from '@mui/icons-material/Timer';
import SettingsIcon from '@mui/icons-material/Settings';
import PhonelinkSetupIcon from '@mui/icons-material/PhonelinkSetup';
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import { IconButton, Stack } from '@mui/material';

import { useHistory } from "react-router-dom";
import { CurrentSelectedSideMenuIndex } from './context/VortexContext';

const categories = [
  {
    titleText: 'Data tables',
    children: [
      {
        id: 0,
        itemText: 'All Transactions',
        icon: <DnsRoundedIcon />,
      },
      { id: 1, itemText: 'All Products', icon: <DnsRoundedIcon /> },
      { id: 2, itemText: 'All Billers', icon: <DnsRoundedIcon /> },
    ],
  },
];

const item = {
  py: '2px',
  px: 3,
  color: 'rgba(255, 255, 255, 0.7)',
  '&:hover, &:focus': {
    bgcolor: 'rgba(255, 255, 255, 0.08)',
  },
};

const itemCategory = {
  boxShadow: '0 -1px 0 rgb(255,255,255,0.1) inset',
  py: 1.5,
  px: 3,
};

export default function Navigator(props) {

  const { ...other } = props;

  const history = useHistory();

  const [sideMenuIndex, setSideMenuIndex] = React.useContext(CurrentSelectedSideMenuIndex)


  return (
    <Drawer variant="permanent" {...other}>
      <List disablePadding>
        <ListItem sx={{ ...item, ...itemCategory, fontSize: 22, color: '#fff' }}>
          <Stack direction={"row"} alignItems="center">
            <IconButton onClick={() => {
              history.goBack();
            }}>
              <ChevronLeftIcon sx={{ fill: "white" }} />
            </IconButton>
            Vortex Admin
          </Stack>
        </ListItem>
        <ListItem sx={{ ...item, ...itemCategory }}>
          <ListItemIcon>
            <HomeIcon />
          </ListItemIcon>
          <ListItemText>Service Overview</ListItemText>
        </ListItem>
        {categories.map(({ titleText, children }) => (
          <Box key={titleText} sx={{ bgcolor: '#101F33' }}>
            <ListItem sx={{ py: 2, px: 3 }}>
              <ListItemText sx={{ color: '#fff' }}>{titleText}</ListItemText>
            </ListItem>
            {children.map(({ id, itemText, icon, active }) => (
              <ListItem disablePadding key={id}>
                <ListItemButton selected={sideMenuIndex === id} sx={item} onClick={() => {
                  setSideMenuIndex(id)
                }}>
                  <ListItemIcon>{icon}</ListItemIcon>
                  <ListItemText>{itemText}</ListItemText>
                </ListItemButton>
              </ListItem>
            ))}

            <Divider sx={{ mt: 2 }} />
          </Box>
        ))}
      </List>
    </Drawer>
  );
}
