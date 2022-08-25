import React from "react";

import { IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";

const ImageCard = ({
  image = "https://via.placeholder.com/150",
  onDelete = () => {},
}) => {
  return (
    <div
      style={{
        position: "relative",
        margin: "6px",
      }}>
      <IconButton
        sx={{
          backgroundColor: "#DB7575",
          position: "absolute",
          top: "-10px",
          right: "-10px",
          zIndex: "999",
        }}
        onClick={onDelete}>
        <CloseIcon />
      </IconButton>

      <LazyLoadImage
        src={image}
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
};

export default ImageCard;
