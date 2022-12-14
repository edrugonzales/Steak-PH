import React, { useState, useEffect } from "react";
import Layout from "../core/Layout";
import { isAuthenticated } from "../auth";
import { Link } from "react-router-dom";
import { getOrderList, getStatusValues, updateOrderStatus } from "./apiAdmin";
import moment from 'moment';
import Jumbotron from './../core/Jumbotron'

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [statusValues, setStatusValues] = useState([]);

    const { user, token } = isAuthenticated();

    const loadOrders = () => {
        getOrderList(user._id, token).then((data = []) => {
            if (data && data.error) {
                console.log(data.error);
            } else {
                setOrders(data);
            }
        });
    };

    const loadStatusValues = () => {
        getStatusValues(user._id, token).then((data = []) => {
            if (data && data.error) {
                console.log(data.error);
            } else {
                setStatusValues(data);
            }
        });
    };

    useEffect(() => {
        loadOrders();
        loadStatusValues();
    }, [loadOrders, loadStatusValues]);

    const showOrdersLength = () => {
        if (orders.length > 0) {
            return (
                <h1 className="text-danger display-4">
                    The last {orders.length} orders 
                </h1>
            );
        } else {
            return <h1 className="text-danger">No orders</h1>;
        }
    };

    const showInput = (key, value) => (
        <div className="input-group mb-2 mr-sm-2">
            <div className="input-group-prepend">
                <div className="input-group-text">{key}</div>
            </div>
            <input
                type="text"
                value={value}
                className="form-control"
                readOnly
            />
        </div>
    );

    const handleStatusChange = (e, orderId) => {
        updateOrderStatus(user._id, token, orderId, e.target.value)
        .then( (data = []) => {
            if(data && data.error) {
                console.log("Status update failed");
            } else {
                loadOrders(); // this will update the status
            }
        })
    }

    const showStatus = o => (
        <div className="form-group">
            <h3 className="mark mb-4">Status: {o.status}</h3>
            <select
                className="form-control"
                onChange={e => handleStatusChange(e, o._id)}
            >
                <option>Update Status</option>
                {statusValues.map((status, index) => (
                    <option key={index} value={status}>
                        {status}
                    </option>
                ))}
            </select>
        </div>
    );

    const goBack = () => (
        <div className="mt-5">
            <Link to="/admin/dashboard" className="btn btn-outline-warning">
                Back to Dashboard
            </Link>
        </div>
    );

    return (
        <Layout>
            <div className="">
                <Jumbotron 
                    title="Orders"
                    description={`G'day ${
                        user.name
                    }, you can manage all the orders here`}
                />
            </div>
            <div className="container">
                <div className="mb-5">
                    {goBack()}
                </div>
                <div className="row">
                    <div className="col-md-8 mr-auto">
                        {showOrdersLength(orders)}
                        {orders.map(
                            o => {
                            return (
                                <div className="mt-5" key={o._id} style={{ borderBottom: "5px solid indigo"}}>
                                    {/* <h2 className="mb-5">
                                        <span className="bg-primary text-white">Order ID: {o._id}</span>
                                    </h2> */}
                                    <ul className="list-group mb-2">
                                        <li className="list-group-item">{showStatus(o)}</li>
                                        <li className="list-group-item">Transaction ID: {o.transaction_id}</li>
                                        <li className="list-group-item">Amount: {o.amount}+{o.deliveryFee} = {o.amount+o.deliveryFee}</li>
                                        <li className="list-group-item">Ordered by: {o.user.name} - {o.user.phone} - {o.user.email}</li>
                                        <li className="list-group-item">Time: {moment(o.createdAt).fromNow()} to {moment(o.updatedAt).fromNow()}</li>
                                        <li className="list-group-item">Delivery:{o.shop.address} to  {o.address}</li>
                                        
                                        <li className="list-group-item">Rider:{(o.assignedRider !== undefined)? o.assignedRider.name: 'no rider assigned on system'} for remittance of  {o.amount+ (o.deliveryFee*0.2)}</li>
                                    </ul>

                                    <h6 className="my-4 font-italic">
                                        Total products in the order:{" "}
                                        {o.products.length}
                                    </h6>

                                    {o.products.map(p => (
                                        <div
                                            className="mb-4"
                                            key={p._id}
                                            style={{
                                                padding: "20px",
                                                border: "1px solid indigo"
                                            }}
                                        >
                                            {showInput("Product name/price/count", p.name+"/"+p.price+"/"+p.count)}
                                            {/* {showInput("Product ", p.price)}
                                            {showInput("Product total", p.count)} */}
                                            {/* {showInput("Product Id", p._id)} */}
                                        </div>
                                    ))}
                                </div>
                            )
                        })}
                    </div>
                </div>
        
            </div> 
        </Layout>
    );
};

export default Orders;
