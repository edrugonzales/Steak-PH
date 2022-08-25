import React, { useState, useEffect } from "react";
import Layout from "../core/Layout";
import { isAuthenticated } from "../auth";
import { Link } from "react-router-dom";
import { createProduct, getCategories, storageUpload } from "./apiAdmin";
import Jumbotron from './../core/Jumbotron'

const AddProduct = () => {
    const [values, setValues] = useState({
        name: "",
        description: "",
        price: "",
        categories: [],
        category: "",
        shipping: "",
        quantity: "",
        files: [],
        loading: false,
        error: "",
        createdProduct: "",
        redirectToProfile: false,
        env: "",
        type: "",
        formData: "",
        storageData: ""
    });

    const { user, token } = isAuthenticated();
    const {
        name,
        description,
        price,
        categories,
        category,
        shipping,
        quantity,
        loading,
        error,
        createdProduct,
        redirectToProfile,
        env,
        type,
        id,
        formData,
        storageData
    } = values;

    // load categories and set form data
    const init = () => {
        getCategories()
        .then(data => {
            if (data.error) {
                setValues({ ...values, error: data.error });
            } else {
                // This is the form which is created and populated to send to the backend
                setValues({
                    ...values,
                    categories: data,
                    formData: new FormData(),
                    storageData: new FormData()
                });
            }
        });
    };

    useEffect(() => {
        init();
    }, []);

    const handleChange = name => event => {
        let value = event.target.value;
        if(name === "photo"){
            value = event.target.files;
            Object.keys(value).map(function(i,v){
                formData.append(`photo[]`,value[i]);
                storageData.append(`photo[${i}]`,value[i]);
            });
        }else{
            formData.set(name, value);
        }
        setValues({ ...values, [name]: value });
    };

    const clickSubmit = event => {
        event.preventDefault();
        setValues({ ...values, error: "", loading: true });

        createProduct(user._id, token, formData).then(data => {
            if (data.error) {
                setValues({ ...values, error: data.error });
                return false;
            } else {
                console.log(data.images);
                
                var arrayofId = data.images.map(function(obj, i){
                    return obj.id;
                });
                const status = storageUpload(JSON.stringify(arrayofId), storageData, 0);
                console.log(status);
                setValues({
                    ...values,
                    name: "",
                    description: "",
                    files: [],
                    price: "",
                    quantity: "",
                    loading: false,
                    createdProduct: values.name
                });
            }
        });
    };

    const newPostForm = () => (
        <form className="mb-3" onSubmit={clickSubmit} encType="multipart/form-data">
            <h4>Post Photo</h4>
            <div className="form-group">
                <label className="btn btn-secondary">
                    <input
                        onChange={handleChange("photo")}
                        type="file"
                        name="photo[]"
                        accept="image/*"
                        multiple
                    />
                </label>
            </div>

            <div className="form-group">
                <label className="text-muted">Name</label>
                <input
                    onChange={handleChange("name")}
                    type="text"
                    className="form-control"
                    value={name}
                />
            </div>

            <div className="form-group">
                <label className="text-muted">Description</label>
                <textarea
                    onChange={handleChange("description")}
                    className="form-control"
                    value={description}
                />
            </div>

            <div className="form-group">
                <label className="text-muted">Price</label>
                <input
                    onChange={handleChange("price")}
                    type="number"
                    className="form-control"
                    value={price}
                />
            </div>

            <div className="form-group">
                <label className="text-muted">Category</label>
                <select
                    onChange={handleChange("category")}
                    className="form-control"
                >
                    <option>Please select</option>
                    {categories && categories.map((c, ind) => (
                        <option key={ind} value={c._id}>{c.name}</option>
                    ))}
                </select>
            </div>

            <div className="form-group">
                <label className="text-muted">Shipping</label>
                <select
                    onChange={handleChange("shipping")}
                    className="form-control"
                >
                    <option>Please select</option>
                    <option value="0">No</option>
                    <option value="1">Yes</option>
                </select>
            </div>

            <div className="form-group">
                <label className="text-muted">Quantity</label>
                <input
                    onChange={handleChange("quantity")}
                    type="number"
                    className="form-control"
                    value={quantity}
                />
            </div>

            <button className="btn btn-primary">Create Product</button>
        </form>
    );

    const showError = () => (
        <div
            className="alert alert-danger"
            style={{ display: error ? "" : "none" }}
        >
            {error}
        </div>
    );

    const showSuccess = () => (
        <div
            className="alert alert-info"
            style={{ display: createdProduct ? "" : "none" }}
        >
            <h2>{`${createdProduct}`} is created!</h2>
        </div>
    );

    const goBack = () => (
        <div className="mt-5">
            <Link to="/admin/dashboard" className="btn btn-outline-warning">
                Back to Dashboard
            </Link>
        </div>
    );

    const showLoading = () =>
        loading && (
            <div className="alert alert-success">
                <h2>Loading...</h2>
            </div>
        );

        
    return (
        <Layout>
            <div className="">
                <Jumbotron 
                 title="Add a new product"
                 description={`G'day ${user.name}, ready to add a new product?`}
                />
            </div>

            <div className="container">
                <div className="mb-5">
                    {goBack()}
                </div>
                <div className="row">
                    <div className="col-md-8 mr-auto">
                        {showLoading()}
                        {showError()}
                        {showSuccess()}
                        {newPostForm()}
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default AddProduct;
