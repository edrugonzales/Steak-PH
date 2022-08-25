import React, { useState, useRef, useCallback } from "react";
import {
  Autocomplete,
  Button,
  Dialog,
  DialogContent,
  FormControlLabel,
  MenuItem,
  Select,
  Slide,
  Stack,
  Switch,
  TextField,
} from "@mui/material";
import CustomTextField from "../../../../core/CustomTextField";
import { Form, Formik } from "formik";
import ImageCard from "../ImageCard";
import { DialogTitle } from "@material-ui/core";
import { isAuthenticated } from "../../../../auth";
import { createNewGeneralBroadcast, searchUsers } from "../../data/api";
import useSparkleSnackbar from "../../../../core/useSparkleSnackbar";
import debounce from "lodash.debounce";

// import { io } from "socket.io-client";

// const socket = io(process.env.REACT_APP_API_SOCKET_URL);

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction='up' ref={ref} {...props} />;
});

export default function useNewBroadcast() {
  const [show, setShow] = useState(false);

  const handleShow = () => {
    setShow(true);
  };

  const handleClose = () => {
    setShow(false);
  };

  const NewBroadcastDialog = () => {
    const inputFile = useRef(null);

    const { showSnackbar, SparkleSnackBar } = useSparkleSnackbar();

    const [published, setPublished] = useState(false);

    const { user, token } = isAuthenticated();

    const [type, setType] = useState("Notification");

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

    function handleUserSearch(user = "") {
      searchUsers(user).then((response) => {
        if (response.status === 200) {
          response.json().then((result) => {
            setSearchUsers(result);
          });
        }
      });
    }

    const searchUseCallback = useCallback(
      debounce((user) => {
        handleUserSearch(user);
      }, 500),
      []
    );

    const debouncedUserSearch = (event) => {
      const { value: user } = event?.target;
      searchUseCallback(user);
    };

    function resetState() {
      setSelectedUsers([]);
      setselectedImagesList([]);
      setselectedImageFiles([]);
      setPublished(false);
    }

    return (
      <Dialog open={show} TransitionComponent={Transition} fullWidth>
        <DialogTitle>New broadcast</DialogTitle>
        <Formik
          initialValues={{}}
          onSubmit={(data, { setSubmitting, resetForm }) => {
            setSubmitting(true);

            if (type === "Selected" && selectedUsers.length <= 0) {
              return;
            }

            let selectedUsersId = selectedUsers.flatMap((user) => user._id);

            let broadcastData = {
              ...data,
              images: selectedImageFiles,
              type: type,
              target: target,
              targetUsers: [...selectedUsersId],
              createdBy: user._id,
              published: published,
            };

            createNewGeneralBroadcast(broadcastData).then((response) => {
              if (response.status === 200) {
                response.json().then((result) => {
                  console.log(result);
                  setSubmitting(false);
                  showSnackbar(`Broadcast created`, "success");
                  resetForm({
                    values: {
                      title: "",
                      body: "",
                      link: "",
                    },
                  });
                  resetState();
                  // if (result.published) {
                  //   if (target === "General") {
                  //     socket.emit("emit-general-broadcasts", {
                  //       ...result,
                  //       isRead: false,
                  //     });
                  //   } else {
                  //     socket.emit("emit-selected-broadcasts", selectedUsersId, {
                  //       ...result,
                  //       isRead: false,
                  //     });
                  //   }
                  // }
                });
              } else {
                response.json().then((result) => {
                  console.log(result);
                  setSubmitting(false);
                  showSnackbar(`${result}`, "error");
                });
              }
            });
          }}>
          {({ isSubmitting }) => (
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
                  <Select
                    name='target'
                    labelId='demo-simple-select-label'
                    id='demo-simple-select'
                    value={target}
                    label='Type'
                    onChange={handleTargetChange}>
                    <MenuItem value={"General"}>General</MenuItem>
                    <MenuItem value={"Selected"}>Selected</MenuItem>
                  </Select>
                  <div
                    style={{
                      display: target === "General" ? "none" : "block",
                    }}>
                    <Autocomplete
                      multiple
                      id='free-solo-demo'
                      freeSolo
                      isOptionEqualToValue={(option, value) =>
                        option.name === value.name
                      }
                      getOptionLabel={(option) => option.name}
                      options={searchedUsers}
                      onChange={(event, value) => {
                        setSelectedUsers(value);
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          name='usersearch'
                          label='Search Users'
                          variant='outlined'
                          onChange={(event) => debouncedUserSearch(event)}
                        />
                      )}
                    />
                  </div>
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
                      flexWrap: "wrap",
                    }}>
                    {selectedImagesList.map((image) => {
                      return (
                        <ImageCard
                          image={image}
                          onDelete={() => {
                            console.log(image);
                            let newList = selectedImagesList.filter(
                              (item) => item !== image
                            );
                            setselectedImagesList([...newList]);

                            let newFileList = selectedImageFiles.filter(
                              (item) => item !== image
                            );
                            setselectedImageFiles([...newFileList]);
                          }}
                        />
                      );
                    })}
                  </div>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={published}
                        onChange={() => {
                          setPublished(!published);
                        }}
                        name='published'
                      />
                    }
                    label={published ? "Published" : "Unpublished"}
                  />
                  <div
                    style={{
                      display: "flex",
                    }}>
                    <Button
                      style={{ margin: "0.3em" }}
                      variant='contained'
                      disabled={isSubmitting}
                      onClick={handleClose}>
                      {"close"}
                    </Button>
                    <Button
                      style={{ margin: "0.3em" }}
                      type='submit'
                      variant='contained'
                      disabled={isSubmitting}>
                      {isSubmitting ? "loading" : "save"}
                    </Button>
                  </div>
                </Stack>
              </DialogContent>
            </Form>
          )}
        </Formik>
        <SparkleSnackBar />
      </Dialog>
    );
  };

  return { handleShow, handleClose, NewBroadcastDialog };
}
