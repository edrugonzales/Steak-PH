import React, { useState } from "react";

import {
  Button,
  Dialog,
  Divider,
  IconButton,
  Slide,
  Typography,
} from "@mui/material";

import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";

import EditIcon from "@mui/icons-material/Edit";
import TargetUserList from "./components/TargetUserList";
import { updateBroadcast } from "../../data/api";
import useSparkleSnackbar from "../../../../core/useSparkleSnackbar";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction='up' ref={ref} {...props} />;
});

export default function useBroadcastDetails() {
  const [show, setShow] = useState(false);

  const [broadcastData, setBroadcastData] = useState({});

  const handleShowBroadcastDetails = (data) => {
    setShow(true);
    setBroadcastData(data);
    console.log(data);
  };

  const handleCloseBroadcastDetails = () => {
    setShow(false);
  };

  const BroadcastDetails = ({ onClickPublished = () => {} }) => {
    const { showSnackbar, SparkleSnackBar } = useSparkleSnackbar();

    const [isSubmitting, setIsSubmitting] = useState(false);
    return (
      <Dialog
        fullWidth
        maxWidth='sm'
        open={show}
        onClose={handleCloseBroadcastDetails}
        TransitionComponent={Transition}>
        {/* HEADER */}
        <div
          style={{
            position: "relative",
          }}>
          <LazyLoadImage
            src={
              broadcastData?.images?.length > 0
                ? broadcastData?.images[0]?.url
                : "https://via.placeholder.com/150"
            }
            alt='broadcast-image'
            width='100%'
            height='300px'
            effect={"blur"}
            style={{
              borderRadius: "0.2em",
              objectFit: "cover",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: "5%",
              left: "5%",
            }}>
            <Typography variant='h4'>{broadcastData?.title}</Typography>
          </div>
          <div
            style={{
              position: "absolute",
              top: "2%",
              right: "2%",
            }}>
            <IconButton>
              <EditIcon />
            </IconButton>
          </div>
        </div>
        {/* BODY */}
        <div
          style={{
            margin: "20px",
          }}>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "space-between",
              marginBottom: "1em",
            }}>
            <div
              style={{
                maxWidth: "300px",
              }}>
              <Typography marginRight='10px'>{broadcastData?.body}</Typography>
            </div>
            <div
              style={{
                maxWidth: "300px",
                textAlign: "start",
              }}>
              <Typography
                sx={{ color: broadcastData?.published ? "green" : "red" }}>
                {broadcastData?.published ? "PUBLISHED" : "UNPUBLISHED"}
              </Typography>
              <div style={{ display: "flex", flexWrap: "wrap" }}>
                <Typography marginRight='1em'>{"Type: "}</Typography>
                <Typography>{broadcastData?.type}</Typography>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap" }}>
                <Typography marginRight='1em'>{"Target: "}</Typography>
                <Typography>{broadcastData?.target}</Typography>
              </div>
            </div>
          </div>
          <Divider />
          <div
            style={{
              margin: "1em",
              display: broadcastData?.target === "Selected" ? "block" : "none",
            }}>
            <Typography>{"Target Users: "}</Typography>
            <TargetUserList users={broadcastData?.targetUsers} />
          </div>
          <Divider />
          {/* ACTIONS */}
          <div
            style={{
              margin: "1em",
            }}>
            <Button
              variant='contained'
              onClick={() => {
                setIsSubmitting(true);
                updateBroadcast(broadcastData._id, {
                  published: !broadcastData?.published,
                }).then((response) => {
                  if (response.status === 200) {
                    response.json().then((result) => {
                      console.log(result);
                      setIsSubmitting(false);
                      onClickPublished();
                      handleCloseBroadcastDetails();
                    });
                  } else {
                    response.json().then((result) => {
                      console.log(result);
                      showSnackbar("Something went wrong", "error");
                      setIsSubmitting(false);
                    });
                  }
                });
              }}>
              {isSubmitting
                ? "Loading"
                : broadcastData?.published
                ? "Unpublished"
                : "Published"}
            </Button>
          </div>
        </div>
        <SparkleSnackBar />
      </Dialog>
    );
  };

  return {
    handleShowBroadcastDetails,
    handleCloseBroadcastDetails,
    BroadcastDetails,
  };
}
