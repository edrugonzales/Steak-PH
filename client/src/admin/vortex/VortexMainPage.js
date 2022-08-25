import React from 'react'
import VortexContext from './context/VortexContext';

import Paperbase from './Paperbase';

const VortexMainPage = () => {



  return (
    <VortexContext>
      <Paperbase />
    </VortexContext>
  )
}

export default VortexMainPage