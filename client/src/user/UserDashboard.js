import React, { useState, useEffect } from "react";
import Layout from "../core/Layout";
import { isAuthenticated } from "../auth";
import { Link } from 'react-router-dom';
import { getListPurchaseHistory } from './apiUser';
import moment from 'moment';

import Jumbotron from './../core/Jumbotron'
const Dashboard = () => {
    const [history, setHistory] = useState([]);

    const {
        user: { _id, name, email, role }
    } = isAuthenticated();

    const { token } = isAuthenticated().token;

    const init = (userId, token) => {
        getListPurchaseHistory(userId, token).then(data => {
            if (data.error) {
                console.log(data.error);
            } else {
                setHistory(data);
            }
        });
    };

    useEffect(() => {
        init(_id, token);
    }, [_id, token])

    const userLinks = () => {
        return (
            <div className="card">
                <h4 className="card-header">User Links</h4>
                <ul className="list-group">
                    <li className="list-group-item">
                        <Link to="/cart" className="nav-link">My Cart</Link>
                    </li>
                    <li className="list-group-item">
                        <Link to={`/profile/${_id}`} className="nav-link">Update Profile</Link>
                    </li>
                </ul>
            </div>
        );
    }

    const userInfo = () => {
        return (
            <div className="card mb-5">
                <h3 className="card-header">User Information</h3>
                <ul className="list-group">
                    <li className="list-group-item">{name}</li>
                    <li className="list-group-item">{email}</li>
                    <li className="list-group-item">
                        {role === 1 ? "Admin" : "Registered User"}
                    </li>
                </ul>
            </div>
        );
    };

    const purchaseHistory = history => {
        return (
            <div className="card mb-5">
                <h3 className="card-header">Purchase history</h3>
                <ul className="list-group">
                    <li className="list-group-item">
                        {history.map((h, i) => {
                            return (
                                <div>
                                    <hr />
                                    <h6>
                                        Transaction Id: {h.transaction_id}
                                    </h6>
                                    <h6>
                                        Status: <strong><u>{h.status}</u></strong>
                                    </h6>
                                    {h.products.map((p, i) => {
                                        console.log(p);
                                        return (
                                            <div key={i}>
                                                <h6>Product name: {p.name}</h6>
                                                <h6>
                                                    Product price: Php{p.price}
                                                </h6>
                                            </div>
                                        );
                                    })}
                                     <h6>
                                        Updated date:{" "}
                                        {moment(
                                            h.updatedAt
                                        ).fromNow()}
                                    </h6>
                                    <h6>
                                        Purchased date:{" "}
                                        {moment(
                                            h.createdAt
                                        ).fromNow()}
                                    </h6>
                                </div>
                            );
                        })}
                    </li>
                </ul>
            </div>
        );
    };

    return (
        <Layout >
            <div className="">
                <Jumbotron title="Dashboard" description="User Dashboard" />
            </div>

            <div className="container">
                <div className="row">
                    <div className="mb-4 col-md-3">{userLinks()}</div>
                    <div className="col-md-9">
                        {userInfo()}
                        {purchaseHistory(history)}
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Dashboard;
