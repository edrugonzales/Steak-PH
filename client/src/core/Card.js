import React, { useState } from "react";
import { Link, Redirect } from "react-router-dom";
import ShowImage from "./ShowImage";
import moment from "moment";
import { addItem, updateItem, removeItem } from './cartHelpers';
import DeleteForeverIcon from '@material-ui/icons/DeleteForever';
import AddIcon from '@material-ui/icons/Add';

const Card = ({
    product,
    showViewProductButton = true,
    showAddToCartButton=true,
    cartUpdate=false,
    showRemoveProductButton=false,
    setRun = f => f, // default value of function
    run = undefined, // default value of undefined
}) => {
    const [redirect, setRedirect] = useState(false)
    const [count, setCount] = useState(product.count); // product comes from localstorage
    const showViewButton = showViewProductButton => {
        return (
            showViewProductButton && (
                <Link to={`/product/${product._id}`} className="mr-2 btn_view-product">
                    <button className="btn btn-outline-primary mt-2 mb-2">
                        View Product
                    </button>
                </Link>
            )
        );
    };

    const addToCart = () => {
        addItem(product, () => {
            setRedirect(true);
        })
    }

    const shouldRedirect = redirect => {
        if(redirect) {
            return window.location.reload(); 
        }
    }

    const showAddToCart = (showAddToCartButton) => {
        return showAddToCartButton && (
            <button
                onClick={addToCart}
                className="btn btn-outline-warning mt-2 mb-2 btn_add-cart">
                Add to cart
            </button>
        );
    };

    const showRemoveButton = showRemoveProductButton => {
        return (
            showRemoveProductButton && (
                <button
                    onClick={() => {
                        removeItem(product._id);
                        setRun(!run); //n1
                    }}
                    className="btn btn-outline-danger mb-2 mr-2"
                >
                    <DeleteForeverIcon />
                </button>
            )
        );
    };

    const showStock = quantity => {
        return quantity > 0 ? (
            <span className="badge badge-warning badge-pill">In Stock</span>
        ) : (
            <span className="badge badge-danger badge-pill">Out of Stock</span>
        );
    };

    const handleChange = productId => event => {
        setRun(!run); // n1
        console.log("event.target.value", event.target.value)
        //condition to make sure we do not have negative values
        setCount(event.target.value < 1 ? 1 : event.target.value);
        if (event.target.value >= 1) {
            updateItem(productId, event.target.value);
        }
    };

    const showCartUpdateOptions = cartUpdate => {
        return cartUpdate &&
        <div>
            <div className="input-group">
                <div className="input-group-prepend">
                    <span className="input-group-text">
                        Qty
                    </span>
                    <input
                        type="number"
                        className="form-control"
                        value={count}
                        onChange={handleChange(product._id)}
                    />
                </div>
            </div>
        </div>
    }

    return (
        <div className="card card__sparkles">
            <div className="card-header ">
                 <div className="card__stock">
                    {showStock(product.quantity)}
                </div>
                <ShowImage item={product} url="product" />
     
            </div>
            <div className="card-body">
                {shouldRedirect(redirect)}
                <b className="card__title">{product.name}</b>
                <p className="lead mt-2 card__description">
                    {product && product.description.substring(0, 100)}
                </p>
                <p className="card__category">
                    {product.category && product.category.name}
                </p>
                <p className="card__price">P {product.price}</p>

                <p className="card_datecreated">
                    Added on {moment(product.createdAt).fromNow()}
                </p>

                <div className="card__actions">
                    {showViewButton(showViewProductButton)}

                    {showAddToCart(showAddToCartButton)}

                    {showRemoveButton(showRemoveProductButton)}

                    {showCartUpdateOptions(cartUpdate)}

                </div>

            </div>
        </div>
    );
};

export default Card;


// n1: run useEffect in parent Cart. whenever we increment/decrement or remove product... we use setRun so that we can run useEffect in parent component > Cart