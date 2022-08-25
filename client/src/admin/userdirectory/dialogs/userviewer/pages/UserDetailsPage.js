import React, { useEffect, useState } from 'react'

import { Avatar, Box, Button, Card, CardContent, CircularProgress, Grid, Stack, TextField, Typography } from '@mui/material'
import { getUserById } from '../../../data/users'
import { Form, Formik } from 'formik'
import moment from 'moment-timezone';

const UserDetailsPage = (props) => {

  let cardElevation = 10

  const [data, setData] = useState(null)

  const [isLoading, setIsLoading] = useState(true)

  async function getUserData() {

    try {

      let response = await getUserById(props?.user?._id)

      if (response.status !== 200) throw Error("Unable to get user data")

      let result = await response.json()

      setData(result)

      setIsLoading(false)

    } catch (error) {
      throw error
    }
  }

  useEffect(() => {
    getUserData()
  }, [])

  if (isLoading) {
    return (
      <CircularProgress />
    )
  }


  return (
    <Grid container spacing={2}>
      <Grid item>
        <Card elevation={cardElevation}>
          <CardContent>
            <Stack spacing={2}>
              <Avatar variant="square" src={data?.photo} alt={`userId${data?._id}`} sx={{ height: '300px', width: '300px' }}  >{data?.name.substring(0, 1)} </Avatar>
              <Button variant="contained" onClick={() => {
                alert('Under construction')
              }}>Upload new photo</Button>
              <Typography variant='h3' fontWeight={"bold"} maxWidth={'300px'} height={'113px'} overflow={"auto"}>{data?.name}</Typography>
              <Typography fontWeight={"bold"} fontSize={10} style={{ color: "grey" }}>{`ID: ${data?._id}`}</Typography>
              <Typography fontWeight={"bold"} fontSize={10} style={{ color: "grey" }}>{`Date joined: ${moment(data?.createdAt).tz('Asia/Manila').format("YYYY MMMM DD hh:mm:ss a")}`}</Typography>
              <Typography fontWeight={"bold"} fontSize={10} style={{ color: "grey" }}>{`Last update: ${moment(data?.updatedAt).tz('Asia/Manila').format("YYYY MMMM DD - hh:mm:ss a")}`}</Typography>
            </Stack>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xl>
        <Card elevation={cardElevation}>
          <CardContent>
            <Stack spacing={2}>
              <Typography variant="h3">{"Profile"}</Typography>
              <Formik
                initialValues={{
                  name: data?.name,
                  phone: data?.phone,
                  email: data?.email,

                }}
                onSubmit={(data) => {
                  console.log(data)
                  alert('Under construction')
                }}
              >
                {
                  ({ handleChange, values }) => {
                    return (
                      <Form>
                        <Grid container spacing={2} mb={1}>
                          <Grid item xl={6}>
                            <Stack spacing={2} minWidth={"300px"}>
                              <TextField name='name' value={values.name} label={'Name'} placeholder={'Enter user name'} onChange={handleChange} />
                              <TextField name='phone' value={values.phone} label={'Phone'} placeholder={'Enter mobile phone'} onChange={handleChange} />
                              <TextField name='email' value={values.email} label={'Email'} placeholder={'Enter email'} onChange={handleChange} />
                            </Stack>
                          </Grid>
                          <Grid item xl={6} >
                            <Stack spacing={2} minWidth={"300px"}>
                              <TextField value={data?.address} label={'Address'} placeholder={'Enter user name'} />
                              <Box sx={{ height: '24em', width: "100%", backgroundColor: "gray" }}></Box>
                            </Stack>
                          </Grid>
                        </Grid>
                        <Grid item xl>
                          <Stack spacing={2} alignItems="end" >
                            <Button variant="contained" type={"submit"}>UPDATE</Button>
                          </Stack>
                        </Grid>
                      </Form>
                    )
                  }
                }
              </Formik>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

    </Grid >
  )
}

export default UserDetailsPage