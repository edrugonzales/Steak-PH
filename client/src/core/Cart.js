import React, { useState, useEffect } from "react";
import { getCart } from "./cartHelpers";
import Card from "./Card";
import Checkout from './Checkout';
import {Close} from '@material-ui/icons';
const Cart = ({toggleCart}) => {
    const [items, setItems] = useState([]);
    const [location, setLocation] = useState([]);
    const [run, setRun] = useState(false);

    useEffect(() => {
        getLocation();
        setItems(getCart());
    }, [run,location]);

    const showItems = items => {
        return (
            <div>
                <div className="mb-2">
                    <b >Cart has {`${items.length}`} items</b>
                </div>
                {items.map((product, i) => (
                    <Card
                        key={i}
                        product={product}
                        showAddToCartButton={false}
                        cartUpdate={true}
                        showRemoveProductButton={true}
                        setRun={setRun}
                        run={run}
                    />
                ))}
            </div>
        );
    };

    const getLocation = () =>{
        if(localStorage.getItem("location") == null){
            navigator.geolocation.getCurrentPosition(function(position) {
                const userLoc = {lat:position.coords.latitude, long: position.coords.longitude};
                setLocation(userLoc);
                localStorage.setItem("location", JSON.stringify(userLoc));
              });
        }else{
            setLocation(localStorage.getItem("location"));
        }
    }


    const noItemsMessage = () => (
        <div className="bg-light rounded p-5 text-center my-2">
            <h5> Your cart is empty.</h5>
        </div>
    );

    return (
        <div className="cart__container">
            <button onClick={toggleCart} className="btn btn-outline-primary btn__cart-close"><Close /></button>

            <div className="row">
                <div className="col-12 cart__cards">
                    <h4 className="mb-2">
                        Your Cart Summary
                    </h4>
                    {items.length > 0 ? showItems(items) : noItemsMessage()}
                </div>
                <div className="col-12">

                    <hr />
                    <Checkout products={items} setRun={setRun} run={run} />
                </div>
            </div>
        </div>
    );
};

export default Cart;
