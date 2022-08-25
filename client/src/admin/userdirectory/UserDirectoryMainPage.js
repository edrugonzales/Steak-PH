import React, { useState, useEffect } from 'react'

import { AppBar, Avatar, Box, Button, Card, CardContent, Chip, CircularProgress, Divider, IconButton, InputBase, Stack, Switch, TextField, Toolbar, Typography } from '@mui/material'

import SearchIcon from '@mui/icons-material/Search';
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import EditIcon from '@mui/icons-material/Edit';
import LocationOnIcon from '@mui/icons-material/LocationOn';

import { useHistory } from "react-router-dom";

import { Form, Formik } from 'formik';
import { searchUsers } from './data/users';
import UserCard from './component/UserCard';
import Nothing from '../../assets/nothing.svg'
import UserViewer from './dialogs/userviewer/UserViewer'




const UserDirectoryMainPage = () => {

  const history = useHistory();

  const [searchedUsers, setSearchUsers] = useState([]);

  const { showUserViewerDialog, closeUserViewerDialog, UserViewerDialog } = UserViewer()

  const [isLoading, setIsLoading] = useState(true)


  async function handleUserSearch(user = "") {
    let response = await searchUsers(user)

    if (response.status === 200) {
      let result = await response.json()

      console.log(result)
      setSearchUsers(result);
    }
  }

  useEffect(() => {
    handleUserSearch('ab').then(() => {
      setIsLoading(false)
    })
  }, [])


  if (isLoading) {
    return <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50%" }}>
      <CircularProgress />
    </Box>
  }



  return (
    <Box>
      <AppBar>
        <Toolbar>
          <IconButton
            size='large'
            edge='start'
            color='inherit'
            aria-label='menu'
            sx={{ mr: 2 }}
            onClick={() => {
              history.goBack();
            }}>
            <ChevronLeftIcon />
          </IconButton>
          <Box >
            <Formik initialValues={{}} onSubmit={async (data) => { await handleUserSearch(data.searchvalue) }}>
              {({ handleChange, isSubmitting }) => {
                return <Form>
                  <Stack spacing={2} direction={"row"}>
                    <Box sx={{
                      marginLeft: 0,
                      width: '100%',
                      borderRadius: "0.2em",
                      backgroundColor: "#ffffff15",
                      '&:hover': {
                        backgroundColor: "#ffffff25",
                      },

                    }}>
                      <InputBase
                        sx={{
                          padding: "5px",
                          color: "white"
                        }}
                        disabled={isSubmitting}
                        name={"searchvalue"}
                        onChange={handleChange}
                        placeholder={"Search user name..."}
                        required
                      />
                      <IconButton type="submit" disabled={isSubmitting}>
                        {isSubmitting ? <CircularProgress size={30} /> : <SearchIcon sx={{ fill: "white" }} />}
                      </IconButton>

                    </Box>

                  </Stack>

                </Form>
              }}
            </Formik>
          </Box>
        </Toolbar>
      </AppBar>
      <Toolbar />
      {searchedUsers.length > 0 &&
        <Box sx={{ display: "flex", flexWrap: "wrap" }}>
          {searchedUsers.map(user => {
            return (
              <UserCard
                image={user.photo}
                name={user.name}
                address={user.address}
                phone={user.phone}
                email={user.email}
                role={user.role}
                onClick={() => {
                  showUserViewerDialog(user)
                }} />
            )
          })}
        </Box>}
      {searchedUsers.length <= 0 && <img src={Nothing} alt="No data found yet" height="500em" width="100%" />}
      <UserViewerDialog />
    </Box>
  )
}

export default UserDirectoryMainPage