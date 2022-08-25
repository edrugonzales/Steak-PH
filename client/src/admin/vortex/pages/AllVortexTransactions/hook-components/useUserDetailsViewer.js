import React, { useState } from 'react'

import { Button, Dialog, DialogContent, Slide, Stack, TextField } from '@mui/material';

import ReactJson from 'react-json-view'
import { Box } from '@mui/system';



const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction='up' ref={ref} {...props} />;
});


export default function useUserDetailsViewer() {
  const [show, setshow] = useState(false)

  const [data, setdata] = useState(JSON.stringify({ data: "empty" }))

  const showUserDetailsViewer = (inputJSON) => {
    setshow(true)
    console.log(inputJSON)
    if (inputJSON) {
      setdata(JSON.stringify(inputJSON))
    }
  }


  const closeUserDetailsViewerer = () => {
    setshow(false)
  }

  const UserDetailsViewer = () => {
    const [copied, setcopied] = useState(false)


    return (
      <Dialog open={show} onClose={closeUserDetailsViewerer} TransitionComponent={Transition} fullWidth>
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


  return { showUserDetailsViewer, closeUserDetailsViewerer, UserDetailsViewer }
}