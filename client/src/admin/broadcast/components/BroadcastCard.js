import React from "react";
import {
  Button,
  Card,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Typography,
} from "@mui/material";

import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";

import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import PublishIcon from "@mui/icons-material/Publish";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import EditIcon from "@mui/icons-material/Edit";
import ArchiveIcon from "@mui/icons-material/Archive";
import DeleteIcon from "@mui/icons-material/Delete";
import { deleteBroadcast, updateBroadcast } from "../data/api";
import useSparkleSnackbar from "../../../core/useSparkleSnackbar";
import useConfirmationDialog from "../../../core/useConfirmationDialog";

const BroadcastCard = ({
  id = "",
  images = [
    { url: "https://via.placeholder.com/150" },
    { url: "https://via.placeholder.com/150" },
    { url: "https://via.placeholder.com/150" },
  ],
  title = "Lorem ipsum dolor sit amet",
  body = "Pellentesque habitant morbi tristique senectus et netus et",
  target = "General",
  published = false,
  onClickMore = () => {},
  onClickUpdate = () => {},
  onClickPublished = () => {},
  onDelete = () => {},
}) => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const openMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const closeMenu = () => {
    setAnchorEl(null);
  };

  const { showSnackbar, SparkleSnackBar } = useSparkleSnackbar();

  const { showConfirmationDialog, ConfirmationDialog } =
    useConfirmationDialog();

  return (
    <Card sx={{ padding: "1em", margin: "1em" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "end",
          alignItems: "center",
        }}>
        <div
          style={{
            marginRight: "10px",
            color: published ? "green" : "red",
            fontWeight: "bold",
          }}>
          {published ? "Published" : "Unpublished"}
        </div>
        <Typography marginRight={"10px"}>{target}</Typography>
        <IconButton
          aria-controls='basic-menu'
          aria-haspopup='true'
          aria-expanded={open ? "true" : undefined}
          onClick={openMenu}>
          <MoreHorizIcon />
        </IconButton>
      </div>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
        }}>
        {images.map((image) => {
          return (
            <div
              style={{
                margin: "0.2em",
              }}>
              <LazyLoadImage
                src={image.url}
                alt='broadcast-image'
                width='100px'
                height='100px'
                effect={"blur"}
                style={{
                  borderRadius: "0.2em",
                  objectFit: "cover",
                }}
              />
            </div>
          );
        })}
      </div>
      <Typography style={{ fontWeight: "bold", fontSize: "20px" }}>
        {title}
      </Typography>
      <Typography style={{ color: "grey" }}>{body}</Typography>
      <Divider />
      <div style={{ marginTop: "10px" }}>
        <Button variant='contained' onClick={onClickMore}>
          More details
        </Button>
      </div>
      <Menu
        id='basic-menu'
        anchorEl={anchorEl}
        open={open}
        onClose={closeMenu}
        MenuListProps={{
          "aria-labelledby": "basic-button",
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}>
        <MenuItem
          sx={{ color: published ? "red" : "green" }}
          onClick={() => {
            showSnackbar(
              published
                ? "Unpublishing, please wait..."
                : "Publishing, please wait...",
              "warning"
            );
            updateBroadcast(id, {
              published: !published,
            }).then((response) => {
              if (response.status === 200) {
                response.json().then((result) => {
                  console.log(result);
                  showSnackbar("Broadcast is published", "success");
                  onClickPublished();
                });
              } else {
                response.json().then((result) => {
                  console.log(result);
                  showSnackbar("Something went wrong", "error");
                });
              }
            });
          }}>
          {published ? <FileDownloadIcon /> : <PublishIcon />}
          {published ? "Unpublish" : "Publish"}
        </MenuItem>
        <MenuItem
          onClick={() => {
            onClickUpdate();
          }}>
          <EditIcon /> Update
        </MenuItem>
        {/* <MenuItem onClick={closeMenu}>
          <ArchiveIcon /> Archive
        </MenuItem> */}
        <Divider />
        <MenuItem
          sx={{ color: "red" }}
          onClick={() => {
            showConfirmationDialog({
              title: "Are you sure?",
              message: "You are about to delete this broadcast",
            });
          }}>
          <DeleteIcon /> Delete
        </MenuItem>
      </Menu>
      <SparkleSnackBar />
      <ConfirmationDialog
        onConfirm={() => {
          deleteBroadcast(id).then((response) => {
            if (response.status === 200) {
              onDelete();
            } else {
              response.json().then((result) => {
                console.log(result);
              });
              showSnackbar(
                "Something went wrong while deleting the broadcast",
                "error"
              );
            }
          });
        }}
      />
    </Card>
  );
};

export default BroadcastCard;
