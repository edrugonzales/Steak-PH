import React, { useState } from 'react'

import { Button, Dialog, DialogContent, Slide, Stack, TextField, Typography } from '@mui/material';
import { Box } from '@mui/system';
import { getVortexTokenBase } from '../../../data/vortex';

import { handleVortexBillsPaymentRequest, handleVortexGiftRequest, handleVortexTopupRequest } from '../functions/vortexRequestHandlers';

import { Form, Formik } from "formik"



const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction='up' ref={ref} {...props} />;
});


export default function useRetryRequest() {
  const [show, setshow] = useState(false)

  const [docData, setDocData] = useState(null)



  const showRetryRequest = (doc) => {
    if (doc?.requestInputPayload) {
      setshow(true)
      setDocData(doc)
    } else {
      setshow(true)
      setDocData({ type: "unknown" })
    }
  }


  const closeRetryRequest = () => {
    setDocData(null)
    setshow(false)
  }



  const RetryDialog = ({ onSuccess = () => { } }) => {





    const FormRenderer = ({ type }) => {

      let inputData = JSON.parse(docData?.requestInputPayload ? docData?.requestInputPayload : "{}")




      switch (type) {
        case "topup":
          return (
            <Box>
              <Formik
                initialValues={{
                  mobileNumber: inputData?.mobileNumber,
                }}

                onSubmit={async (data) => {
                  try {
                    await handleVortexTopupRequest({
                      docId: docData._id,
                      mobileNumber: data?.mobileNumber,
                      paymentId: docData?.paymentId,
                      productCode: inputData?.productCode,
                      totalAmount: docData?.totalAmount,
                      userId: docData?.userId,
                      callbackUrl: "",
                    })

                    onSuccess()

                    closeRetryRequest()

                  } catch (error) {
                    alert(error)
                  }

                }}
              >{({ handleChange, isSubmitting, values }) => {
                return (
                  <Form>
                    <Stack spacing={2}>
                      <Typography>Top up</Typography>
                      <TextField
                        name={'mobileNumber'}
                        label={'Mobile / Account Number'}
                        value={values.mobileNumber}
                        onChange={handleChange}
                      />
                      <Button variant="contained" type={'submit'}>{isSubmitting ? "Loading..." : "SUBMIT"}</Button>
                    </Stack>
                  </Form>
                )
              }}</Formik>
            </Box>)
        case "gift":
          return (
            <Box>
              <Formik
                initialValues={{
                  quantity: inputData?.formData?.quantity,
                  senderName: inputData?.formData?.senderName,
                  senderEmail: inputData?.formData?.senderEmail,
                  senderMobile: inputData?.formData?.senderMobile,
                  recipientName: inputData?.formData?.recipientName,
                  recipientEmail: inputData?.formData?.recipientEmail,
                  recipientMobile: inputData?.formData?.recipientMobile,
                }}
                onSubmit={async (data) => {
                  try {
                    await handleVortexGiftRequest({
                      docId: docData._id,
                      quantity: data?.quantity,
                      senderName: data?.senderName,
                      senderEmail: data?.senderEmail,
                      senderMobile: data?.senderMobile,
                      recipientName: data?.recipientName,
                      recipientEmail: data?.recipientEmail,
                      recipientMobile: data?.recipientMobile,
                      message: inputData?.formData?.message,
                      productCode: inputData?.productCode,
                      totalAmount: docData?.totalAmount,
                      paymentId: docData?.paymentId,
                      userId: docData?.userId,
                    })

                    onSuccess()

                    closeRetryRequest()

                  } catch (error) {
                    alert(error)
                  }
                }}>{
                  ({ handleChange, isSubmitting, values }) => {
                    return (
                      <Form>
                        <Stack spacing={2}>
                          <Typography>Retry Gift</Typography>
                          <TextField
                            name={'quantity'}
                            label={'Quantity'}
                            value={values.quantity}
                            onChange={handleChange}
                            required
                          />
                          <TextField
                            name={'senderName'}
                            label={'Sender name'}
                            value={values.senderName}
                            onChange={handleChange}
                            required
                          />
                          <TextField
                            name={'senderEmail'}
                            label={'Sender Email'}
                            value={values.senderEmail}
                            onChange={handleChange}
                            required
                          />
                          <TextField
                            name={'senderMobile'}
                            label={'Sender Mobile'}
                            value={values.senderMobile}
                            onChange={handleChange}
                            required
                          />
                          <TextField
                            name={'recipientName'}
                            label={'Recipient name'}
                            value={values.recipientName}
                            onChange={handleChange}
                            required
                          />
                          <TextField
                            name={'recipientEmail'}
                            label={'Recipient Email'}
                            value={values.recipientEmail}
                            onChange={handleChange}
                            required
                          />
                          <TextField
                            name={'recipientMobile'}
                            label={'Recipient Mobile'}
                            value={values.recipientMobile}
                            onChange={handleChange}
                            required
                          />
                          <Button variant="contained" type={'submit'}>{isSubmitting ? "Loading..." : "SUBMIT"}</Button>
                        </Stack>
                      </Form>
                    )
                  }
                }
              </Formik>
            </Box>)
        case "billspayment":

          let billDetailsArray = Object.entries(inputData?.billDetails)


          return (
            <Box>
              <Formik
                initialValues={inputData?.billDetails}
                onSubmit={async (data) => {
                  try {

                    let billDetails = {
                      ...data
                    }

                    await handleVortexBillsPaymentRequest({
                      docId: docData._id,
                      billDetails: billDetails,
                      billerId: inputData?.billerId,
                      paymentId: docData?.paymentId,
                      totalAmount: docData?.totalAmount,
                      userId: docData?.userId,
                    })

                    onSuccess()

                    closeRetryRequest()

                  } catch (error) {
                    alert(error)
                  }
                }}
              >{({ handleChange, isSubmitting, values }) => {

                return (
                  <Form>
                    <Stack spacing={2}>
                      <Typography>Bills payment</Typography>

                      {
                        billDetailsArray.map((billDetail) => {
                          console.log(values[billDetail[0]])
                          return (
                            <TextField
                              name={billDetail[0]}
                              label={billDetail[0]}
                              value={values[billDetail[0]]}
                              onChange={handleChange}
                            />
                          )
                        })
                      }
                      <Button variant="contained" type={'submit'}>{isSubmitting ? "Loading..." : "SUBMIT"}</Button>
                    </Stack>
                  </Form>
                )
              }}</Formik>

            </Box>)
        default:
          return (
            <Box>
              <Typography>{!docData?.requestInputPayload ? "No user inputs found!" : "This type is not supported for retry"}</Typography>
            </Box>)
      }
    }

    return (
      <Dialog open={show} onClose={closeRetryRequest} TransitionComponent={Transition} fullWidth>
        <DialogContent>

          <FormRenderer type={docData?.type} />

        </DialogContent>
      </Dialog>
    )
  }


  return { showRetryRequest, closeRetryRequest, RetryDialog }
}