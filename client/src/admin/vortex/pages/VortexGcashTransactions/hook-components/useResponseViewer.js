import React, { useState } from 'react'

import { Box, Button, Dialog, DialogContent, Slide, Stack, TextField } from '@mui/material';

import ReactJson from 'react-json-view'

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction='up' ref={ref} {...props} />;
});


export default function useResponseViewer() {
  const [show, setshow] = useState(false)

  const [data, setdata] = useState(JSON.stringify({ data: "empty" }))

  const showResponseViewer = (responseJSON) => {
    setshow(true)
    if (responseJSON) {
      setdata(responseJSON)
    }

  }


  const closeResponseViewer = () => {
    setshow(false)
  }

  const ResponseDialog = () => {

    const [copied, setcopied] = useState(false)


    return (
      <Dialog open={show} onClose={closeResponseViewer} TransitionComponent={Transition} fullWidth>
        <DialogContent>
          <Stack spacing={2}>
            <ReactJson src={JSON.parse(data)} />
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


  return { showResponseViewer, closeResponseViewer, ResponseDialog }
}