import { Avatar, Box, Button, Card, Chip, Divider, Stack, Typography } from '@mui/material'

import React from 'react'

const UserCard = ({ image = "", name = "Juan Dela Cruz", address = "9 Dr Sixto Antonio, Rosario, Pasig", phone = "639273342196", email = "juancruz@gmail.com", role = 0, onClick = () => { } }) => {

  const randomHeaderColor = () => {
    let randomNumber = Math.floor((Math.random() * 4));
    const colorList = ["#428efc", "#f79256", "#7dcfb6", "#00b2ca", "#1d4e89"]


    return colorList[randomNumber]
  }

  const roleIntrep = (roleNum) => {
    switch (roleNum) {
      case 0:
        return "Chomper"
      case 1:
        return "Merchant"
      case 99:
        return "Admin"
      default:
        return "Chomper"
    }
  }

  console.log(image.length)

  return (
    <Card sx={{ width: "250px", height: "300px", margin: "1em" }}>
      {/* Header */}
      <Box sx={{
        position: "absolute",
        height: "100px",
        width: "250px",
        backgroundColor: `${randomHeaderColor()}`,
        borderRadius: "5px 5px 0px 0px"
      }} >
        <Box sx={{
          position: "relative",
          left: "36%",
          bottom: "-62%"
        }}>
          {
            <Avatar sx={{ width: 70, height: 70 }} src={image} alt={name}>{name.substring(0, 1)}</Avatar>
          }
        </Box>
        <Box sx={{
          position: "relative",
          left: "3%",
          bottom: "61%"
        }}>
          <Chip label={`${roleIntrep(role)}`} />
        </Box>

      </Box>
      {/* Details */}

      <Box sx={{
        position: "relative",
        bottom: "-46%"
      }}>
        <Stack spacing={2}>
          <Stack direction={"row"} justifyContent="center">
            <Stack textAlign={"start"}>
              <Typography variant='h5' fontWeight={"bold"} noWrap textOverflow={'ellipsis'} maxWidth={"200px"}>{name}</Typography>
              <Typography fontSize={10} style={{ color: "grey" }}>{address}</Typography>
              <Typography fontSize={10} style={{ color: "grey" }}>{phone}</Typography>
              <Typography fontSize={10} style={{ color: "grey" }}>{email}</Typography>
            </Stack>
          </Stack>
          <Divider />
          <Stack direction={"row"} justifyContent="center">
            <Button variant='contained' sx={{ width: "100px" }} onClick={() => { onClick() }}>View</Button>
          </Stack>
        </Stack>
      </Box>
    </Card>
  )
}

export default UserCard