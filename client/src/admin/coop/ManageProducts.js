import React, { useState, useEffect } from "react";
import Layout from "../../core/Layout";
import { isAuthenticated } from "../../auth";
import { Link } from "react-router-dom";
import { getProductsByType, deleteProduct } from './../apiAdmin';
import Jumbotron from './../../core/Jumbotron'


const ManageProducts = () => {
    const [products, setProducts] = useState([]);

    const { user, token } = isAuthenticated();

    const loadProducts = () => {
        getProductsByType("shop").then(data => {
            if (data.error) {
                console.log(data.error);
            } else {
                setProducts(data);
            }
        });
    };

    const destroy = productId => {
        deleteProduct(productId, user._id, token).then(data => {
            if (data.error) {
                console.log(data.error);
            } else {
                loadProducts(); // update
            }
        });
    };

    useEffect(() => {
        loadProducts();
    }, []);


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
                <Jumbotron  title="Manage Products" description="Perform CRUD on products"
                />
            </div>
            <div className="container">
                <div className="mb-5">
                    {goBack()}
                </div>
                <div className="row">
                    <div className="col-12">
                        <ul className="list-group">
                            <h2 className="text-center">
                                Total {products.length} products
                            </h2>
                            {products.map((p, i) => (
                                <li
                                    key={i}
                                    className="list-group-item d-flex justify-content-between align-items-center"
                                >
                                    <strong>{p.name}</strong>
                                    {/* <Link to={`/admin/product/update/${p._id}`}> */}
                                        <span className="badge badge-warning badge-pill">
                                            Update
                                        </span>
                                    {/* </Link> */}
                                    <span
                                        onClick={() => destroy(p._id)}
                                        className="badge badge-danger badge-pill"
                                    >
                                        Delete
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default ManageProducts;
