import React from 'react'
import Spinner from 'react-spinkit'



import { Box } from '@mui/material'

const CustomLoader = () => {
  return (
    <Box margin={10}>
      <Spinner name="double-bounce" color="#081627" style={{ height: "100px", width: "100px" }} />
    </Box>)
}

export default CustomLoader