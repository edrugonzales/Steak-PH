import React, { useState } from 'react'

export const CurrentSelectedSideMenuIndex = React.createContext(0)

const VortexContext = ({ children }) => {

  const [sideMenuIndex, setSideMenuIndex] = useState(0)

  return (
    <CurrentSelectedSideMenuIndex.Provider value={[sideMenuIndex, setSideMenuIndex]}>
      {children}
    </CurrentSelectedSideMenuIndex.Provider>
  )
}

export default VortexContext