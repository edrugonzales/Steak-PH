import React, { useState, useEffect } from 'react'

import { Button, CircularProgress, Dialog, DialogContent, Slide, Stack } from '@mui/material';

import ReactJson from 'react-json-view'
import { handleVortexGetByRef } from '../functions/vortexRequestHandlers';



const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction='up' ref={ref} {...props} />;
});


export default function useVortexTransactionViewer() {
  const [show, setshow] = useState(false)

  const [docData, setdocData] = useState(null)



  const showVortexTransactionViewer = (docData) => {
    setshow(true)
    setdocData(docData)
  }


  const closeVortexTransactionViewer = () => {
    setshow(false)
  }


  // COMPONENT
  const VortexTransactionViewerDialog = () => {
    const [copied, setcopied] = useState(false)

    const [data, setdata] = useState(JSON.stringify({ data: "empty" }))

    const [isLoading, setIsLoading] = useState(true)


    const handleVortexRequest = async () => {

      let response = await handleVortexGetByRef({ referenceNUmber: docData?.referenceNumber, type: docData?.type })

      if (response.status === 200) {
        let result = await response.json()
        setdata(JSON.stringify(result))
      }

      setIsLoading(false)
    }

    useEffect(() => {
      handleVortexRequest()
    }, [])


    return (
      <Dialog open={show} onClose={closeVortexTransactionViewer} TransitionComponent={Transition} fullWidth>
        <DialogContent>
          <Stack spacing={2}>
            {!isLoading ? <ReactJson src={JSON.parse(data)} /> : <CircularProgress />}
            <Button
              variant={"contained"}
              color={copied ? "success" : "primary"}
              onClick={() => {
                navigator.clipboard.writeText(data)
                setcopied(true)
              }}>{copied ? "COPIED" : "COPY"}</Button>
          </Stack>

        </DialogContent>
      </Dialog>
    )
  }


  return { showVortexTransactionViewer, closeVortexTransactionViewer, VortexTransactionViewerDialog }
}