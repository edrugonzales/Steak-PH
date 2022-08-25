import React, { useState, useRef } from "react";

import {
  Button,
  Dialog,
  DialogContent,
  Divider,
  MenuItem,
  Select,
  Stack,
} from "@mui/material";
import { Form, Formik } from "formik";
import CustomTextField from "../../../../core/CustomTextField";
import ImageCard from "../ImageCard";
import useSparkleSnackbar from "../../../../core/useSparkleSnackbar";
import { searchUsers, updateBroadcast } from "../../data/api";
import { isAuthenticated } from "../../../../auth";

export default function useUpdateBroadcast() {
  const [show, setShow] = useState(false);

  const [broadcast, setBroadcast] = useState({});

  const showUpdateBroadcast = (data) => {
    setShow(true);
    setBroadcast(data);
  };

  const closeUpdateBroadcast = () => {
    setShow(false);
  };

  const UpdateBroadcast = ({ onUpdate = () => {} }) => {
    const inputFile = useRef(null);

    const { user, token } = isAuthenticated();

    const { showSnackbar, SparkleSnackBar } = useSparkleSnackbar();

    const [published, setPublished] = useState(false);

    const [type, setType] = useState(broadcast?.type);

    const handleTypeChange = (event) => {
      setType(event.target.value);
    };

    const [target, setTarget] = useState("General");

    const handleTargetChange = (event) => {
      setTarget(event.target.value);
    };

    const [selectedImagesList, setselectedImagesList] = useState([]);

    const [selectedImageFiles, setselectedImageFiles] = useState([]);

    const fileSelectedHandler = (event) => {
      event.persist();
      console.log(event.target.files[0]);
      if (event.target.files[0]) {
        setselectedImagesList((prevState) => [
          ...prevState,
          URL.createObjectURL(event.target.files[0]),
        ]);
        setselectedImageFiles((prevState) => [
          ...prevState,
          event.target.files[0],
        ]);
      }
    };

    const [selectedUsers, setSelectedUsers] = useState([]);

    const [searchedUsers, setSearchUsers] = useState([]);

    function handleUserSearch(name) {
      searchUsers(name).then((response) => {
        if (response.status === 200) {
          response.json().then((result) => {
            setSearchUsers(result);
          });
        }
      });
    }

    function resetState() {
      setSelectedUsers([]);
      setselectedImagesList([]);
      setselectedImageFiles([]);
      setPublished(false);
    }

    return (
      <Dialog open={show} onClose={closeUpdateBroadcast} fullWidth>
        <Formik
          initialValues={{
            title: broadcast?.title,
            body: broadcast?.body,
            link: broadcast?.link,
          }}
          onSubmit={(data, { setSubmitting, resetForm }) => {
            setSubmitting(true);

            let updateData = {
              ...data,
              type: type,
              createdBy: user._id,
              published: published,
            };

            updateBroadcast(broadcast?._id, updateData).then((response) => {
              if (response.status === 200) {
                response.json().then((result) => {
                  console.log(result);

                  resetForm({
                    values: {
                      title: "",
                      body: "",
                      link: "",
                    },
                  });

                  resetState();
                });
                onUpdate();
                closeUpdateBroadcast();
              } else {
                response.json().then((result) => {
                  console.log(result);
                  showSnackbar(`Something went wrong ${result}`, "error");
                });
                setSubmitting(false);
              }
            });
          }}>
          {({ isSubmitting }) => {
            return (
              <Form>
                <DialogContent>
                  <Stack spacing={2}>
                    <CustomTextField
                      name='title'
                      label='Title'
                      variant='outlined'
                    />
                    <CustomTextField
                      name='body'
                      label='Body'
                      variant='outlined'
                      multiline={true}
                      maxRows={4}
                    />
                    <CustomTextField
                      name='link'
                      label='Redirect Link'
                      variant='outlined'
                    />
                    <Select
                      name='type'
                      labelId='demo-simple-select-label'
                      id='demo-simple-select'
                      value={type}
                      label='Type'
                      onChange={handleTypeChange}>
                      <MenuItem value={"Notification"}>Notification</MenuItem>
                      <MenuItem value={"Promotion"}>Promotion</MenuItem>
                      <MenuItem value={"Advisory"}>Advisory</MenuItem>
                    </Select>

                    {/* <Divider />
                    <Button
                      variant='contained'
                      disabled={isSubmitting}
                      onClick={() => {
                        inputFile.current.click();
                      }}>
                      Upload Image
                    </Button>
                    <input
                      type='file'
                      id='file'
                      ref={inputFile}
                      onChange={(event) => {
                        fileSelectedHandler(event);
                      }}
                      style={{ display: "none" }}
                    />
                    <div
                      style={{
                        display: "flex",
                      }}>
                      <ImageCard />
                      <ImageCard />
                      <ImageCard />
                      <ImageCard />
                    </div> */}
                    <Divider />
                    <Button
                      style={{ marginTop: "1em" }}
                      type='submit'
                      variant='contained'
                      disabled={isSubmitting}>
                      {isSubmitting ? "loading" : "save and update"}
                    </Button>
                  </Stack>
                </DialogContent>
              </Form>
            );
          }}
        </Formik>
        <SparkleSnackBar />
      </Dialog>
    );
  };

  return { showUpdateBroadcast, closeUpdateBroadcast, UpdateBroadcast };
}
