import React from "react";
import { API } from "../config";

const ShowImage = ({ item, url }) => (
    <div className="product-img">
        <img
            src={item.imagePrimary}
            alt={item.name}
            style={{ maxHeight: "240px"}}
            className="img-fluid"
            draggable="false"
        />
    </div>
);

export default ShowImage;