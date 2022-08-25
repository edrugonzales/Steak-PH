import React, { useState, useEffect } from 'react'

import { Button, Dialog, DialogContent, Slide, Stack } from '@mui/material';

import ReactJson from 'react-json-view'


import { handleVortexGetBillerByidRequest } from "../../../functions/vortexRequestHandlers"
import CustomLoader from '../../../components/CustomLoader';



const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction='up' ref={ref} {...props} />;
});


export default function useBillerViewer() {
  const [show, setshow] = useState(false)

  const [biller, setBiller] = useState(null)

  const showBillerViewer = (billerData) => {
    setshow(true)
    setBiller(billerData)
  }


  const closeBillerViewer = () => {
    setshow(false)
  }

  const BillerViewerDialog = () => {
    const [copied, setcopied] = useState(false)

    const [isLoading, setIsLoading] = useState(true)


    const [data, setdata] = useState(JSON.stringify({ data: "empty" }))


    useEffect(() => {
      handleVortexGetBillerByidRequest(biller?.id).then((result) => {
        setdata(JSON.stringify(result))
        setIsLoading(false)
      }).catch((error) => {
        setIsLoading(false)
        throw error
      })
    }, [])



    return (
      <Dialog open={show} onClose={closeBillerViewer} TransitionComponent={Transition} fullWidth>
        <DialogContent>
          <Stack spacing={2}>
            {!isLoading ? <ReactJson src={JSON.parse(data)} /> : <CustomLoader />}
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


  return { showBillerViewer, closeBillerViewer, BillerViewerDialog }
}