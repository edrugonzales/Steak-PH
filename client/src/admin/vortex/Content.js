import * as React from 'react';
import { Box, Typography } from '@mui/material';
import VortexGcashTransactions from './pages/VortexGcashTransactions/VortexGcashTransactions';
import AllVortexTransactions from './pages/AllVortexTransactions/AllVortexTransactions';
import AllVortexProducts from './pages/AllVortexProducts/AllVortexProducts';
import AllVortexBillers from './pages/AllVortexBillers/AllVortexBillers';




export default function Content(props) {

  console.log('contentIndex', props.contentId)


  const RenderPage = ({ contentId = 0 }) => {



    switch (contentId) {
      case 0:
        return <AllVortexTransactions />
      case 1:
        return <AllVortexProducts />
      case 2:
        return <AllVortexBillers />


      default:
        return <Box>
          <Typography>No page setup</Typography>
        </Box>
    }
  }



  return (
    <RenderPage contentId={props.contentId} />
  );
}
