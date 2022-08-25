import React, { useState, useEffect } from "react";
import Layout from "./Layout";
import { getProducts, getBraintreeClientToken, processPayment, createOrder } from "./apiCore";
import { emptyCart } from './cartHelpers';
import Card from "./Card";
import { isAuthenticated } from "../auth";
import { Link } from "react-router-dom";
// import DropIn from "braintree-web-drop-in-react";

const Checkout = ({ products, setRun = f => f, run = undefined  }) => {
    const [data, setData] = useState({
        success: false,
        clientToken: null,
        error: '',
        loading: false,
        instance: {},
        address: '',
    })
    const userId = isAuthenticated() && isAuthenticated().user._id;
    const token = isAuthenticated() && isAuthenticated().token;

    const getToken = (userId, token) => {
        getBraintreeClientToken(userId, token).then((data = []) => {
            if (data && data.error) {
                setData({ ...data, error: data.error });
            } else {
                setData({ clientToken: data.clientToken });
            }
        });
    };

    useEffect(() => {
        getToken(userId, token);
    }, [token, userId])

    const handleAddress = event => {
        setData({ ...data, address: event.target.value })
    }

    const getTotal = () => {
        return products.reduce((accumulatedValue, nextValue) => { // accumatedValue grabs all the sums of nextValue
            return accumulatedValue + nextValue.count * nextValue.price;
        }, 0);
    };

    const showCheckout = () => {
        // Check if the user is authenticated to show login or checkout btn
        return isAuthenticated() ? (
            <div>{showDropIn()}</div>
        ) : (
            <Link to="/signin">
                <button className="btn btn-primary w-100 rounded">Sign in to checkout</button>
            </Link>
        );
    };

    let deliveryAddress = data.address;
    const buy = () => {
        setData({ loading: true });
        // send the nonce to your server
        // nonce = data.instance.requestPaymentMethod()

        //  REMOVE payment wall
        // let nonce;
        // let getNonce = data.instance.requestPaymentMethod()
        // .then(data => {
        //     nonce = data.nonce;


            // once you have nonce (card type, card number) send nonce as 'paymentMethodNonce'
            // and also total to be charged
            // console.log("send nonce and total to process: ", nonce, getTotal(products))
        
        //remove payment wall
            // const paymentData = {
            //     paymentMethodNonce: nonce,
            //     amount: getTotal(products)
            // }

            
        // remove payment wall
            // processPayment(userId, token, paymentData)
            //     .then(response => {
            //         console.log(response);
                    // empty cart
                    // create order

                    const createOrderData = {
                        products: products,
                        transaction_id: 'transaction id',
                        amount: getTotal(products),
                        address: deliveryAddress
                    };

                    createOrder(userId, token, createOrderData)
                        .then(response => {
                            setRun(!run);
                            emptyCart(() => {
                                console.log(
                                    "payment success and empty cart"
                                );
                                setData({
                                    loading: false,
                                    success: true
                                });
                            });
                        })
                        .catch(error => {
                            console.log(error);
                            setData({ loading: false });
                        });
            //     })
            //     .catch(error => {
            //         console.log(error);
            //         setData({ loading: false });
            //     });
            // })
            // .catch(error => {
            //     // console.log("dropin error: ", error);
            //     setData({ ...data, error: error.message });
            // });
    }

    // test visa number: 4111 1111 1111 1111
    const showDropIn = () => (
        <div onBlur={() => setData({ ...data, error: ''})}>
            {products.length > 0 ? ( // data.clientToken !== null &&
                <div>
                    <div className="form-group mb-3">
                        <label className="text-muted">Delivery Address:</label>
                        <textarea
                            rows="5"
                            onChange={handleAddress}
                            className="form-control"
                            value={data.address}
                            placeholder="Type your delivery address here..."
                        >
                        </textarea>
                    </div>
                    {/* <DropIn
                        options={{
                            authorization: data.clientToken,
                            paypal: {
                                flow: "vault"
                            },
                            isSecure: false,
                            isSameSite: 'Lax'
                        }}
                        onInstance={instance => (data.instance = instance)}
                    /> */}
                    <button
                        onClick={() => buy()}
                        className="btn btn-success btn-block"
                    >
                    Pay
                    </button>
                </div>
            ) : null}
        </div>
    );

    const showError = error => (
        <div className="alert alert-danger my-3" style={{display: error ? '' : 'none'}}>
            {error}
        </div>
    );

    const showSuccess = success => (
        <div
            className="alert alert-info"
            style={{ display: success ? "" : "none" }}
        >
            Thanks! Your payment was successful!
        </div>
    );

    const showLoading = () => data.loading && <h3>Loading...</h3>

    return (
        <div>
            <h5 className="mb-2">Total: P {getTotal()}</h5>
            {showLoading(data.loading)}
            {showSuccess(data.success)}
            {showError(data.error)}
            {showCheckout()}
        </div>
    );
};

export default Checkout;
