import React, { useState, useContext } from "react";
import { Link, useHistory, useParams } from "react-router-dom";
import M from "materialize-css";
import { API } from "../config";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  IconButton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Form, Formik } from "formik";
import logo from "../assets/sparkles-logo.png";
import errorFace from "../assets/error_ghost.svg";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";
import * as yup from "yup";
import VisibilityOffIcon from "@material-ui/icons/VisibilityOff";
import VisibilityIcon from "@material-ui/icons/Visibility";

const validationSchema = yup.object({
  password: yup
    .string()
    .required()
    .min(8, "Password is too short - should be 8 chars minimum.")
    .matches(/[a-zA-Z]/, "Password can only contain Latin letters."),
});

const NewPassword = () => {
  const [data, setData] = useState({
    updated: false,
  });
  const [showPassword, setShowPassword] = useState(false);

  const [errorData, setErrorData] = useState({
    isError: false,
    message: "No Errors",
  });

  const { token } = useParams();
  const { updated } = data;
  console.log(token);

  const PostData = async ({ newPassword }) => {
    try {
      let response = await fetch(
        `${
          process.env.REACT_APP_API_URL ? `${API}` : "/api"
        }/auth/new-password`,
        {
          method: "post",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            password: newPassword,
            token,
          }),
        }
      );

      let result = await response.json();

      if (response.status === 200) {
        setData({ updated: true });
      } else {
        setErrorData({
          isError: true,
          message: result.error,
        });
      }
    } catch (error) {
      console.log(error);
      setErrorData({
        isError: true,
        message: `hmm.. Something went wrong, try requesting for password reset again`,
      });
    }
    //   .then((res) => {
    //     res.json();
    //   })
    //   .then((data) => {
    //     console.log(data);
    //     if (data.error) {
    //       M.toast({ html: data.error, classes: "#c62828 red darken-3" });
    //     } else {
    //       setData({ updated: true });
    //       M.toast({ html: data.message, classes: "#43a047 green darken-1" });
    //       M.toast({
    //         html: "Have a sparkling day! Sign in back on the app.",
    //         classes: "#43a047 green darken-1",
    //       });
    //     }
    //   })
    //   .catch((err) => {
    //     console.log(err);
    //     setErrorData({
    //       isError: true,
    //       message: `hmm.. Something went wrong, try requesting for password reset again`,
    //     });
    //   });
  };

  const isUpdated = (updated) => {
    if (updated) {
      return (
        <Alert severity='success'>
          Password is updated. Please sign in again using your new password.
        </Alert>
      );
    } else {
      return (
        <Box>
          <Formik
            initialValues={{}}
            onSubmit={(data) => {
              //console.log(data);
              PostData({ newPassword: data.password });
            }}
            validationSchema={validationSchema}>
            {({ errors, handleChange, isSubmitting }) => (
              <Form>
                <Stack spacing={2}>
                  <TextField
                    required
                    name='password'
                    type={showPassword ? "text" : "password"}
                    label='Enter a new password'
                    placeholder='Enter a new password'
                    variant='outlined'
                    helperText={errors.password}
                    error={errors.password?.length > 0 ? true : false}
                    disabled={isSubmitting}
                    onChange={handleChange}
                    InputProps={{
                      endAdornment: (
                        <IconButton
                          onClick={() => {
                            setShowPassword(!showPassword);
                          }}>
                          {showPassword ? (
                            <VisibilityIcon />
                          ) : (
                            <VisibilityOffIcon />
                          )}
                        </IconButton>
                      ),
                    }}
                  />
                  <Button
                    variant='contained'
                    type={"submit"}
                    disabled={isSubmitting}
                    sx={{ backgroundColor: "#FFCF10" }}>
                    {isSubmitting ? "Please wait..." : "Update password"}
                  </Button>
                </Stack>
              </Form>
            )}
          </Formik>
        </Box>
      );
    }
  };

  return (
    <Stack direction={"row"} justifyContent={"center"} sx={{ margin: 2 }}>
      {errorData.isError && (
        <Stack spacing={2}>
          <LazyLoadImage
            src={errorFace}
            alt={"error-logo"}
            effect='blur'
            width={"100px"}
          />
          <Typography variant='h3'>{errorData.message}</Typography>
        </Stack>
      )}
      <Box width={"300px"}>
        {!errorData.isError && (
          <Card margin={2}>
            <CardContent>
              <Stack spacing={3} textAlign={"center"}>
                <LazyLoadImage
                  src={logo}
                  alt={"logo"}
                  effect='blur'
                  width={"100%"}
                />
                <Typography variant='h5'>PASSWORD RESET</Typography>
                {isUpdated(updated)}
                <Divider />
                <Typography fontSize={10} fontWeight={"bold"}>
                  &copy; SPARKLE STAR INTERNATIONAL CORP.
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        )}
      </Box>
    </Stack>
  );
};

export default NewPassword;
