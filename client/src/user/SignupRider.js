import React, { useState } from "react";
import Layout from "../core/Layout";
import { Link } from 'react-router-dom';
import { signup } from '../auth';
import Jumbotron from './../core/Jumbotron'

const SignupRider = () => {
    const [values, setValues] = useState({
        name: "",
        email: "",
        password: "",
        error: "",
        success: false
    });
    const { name, email, password, success, error } = values;

    const handleChange = e => {
        const { name, value } = e.target;
        setValues({ ...values, error: false, [name]: value });
    };

    const clickSubmit = e => {
        e.preventDefault();
        setValues({ ...values, error: false });
        signup({ name, email, password, role:3 })
        .then(data => {
            if (data.error) {
                setValues({ ...values, error: data.error, success: false });
            } else {
                setValues({
                    ...values,
                    name: "",
                    email: "",
                    password: "",
                    error: "",
                    success: true
                });
            }
        });
    };

    const signUpForm = () => (
        <form onChange={handleChange}>
            <div className="form-group">
                <label className="text-muted">Name</label>
                <input
                    name="name"
                    type="text"
                    className="form-control"
                />
            </div>

            <div className="form-group">
                <label className="text-muted">Email</label>
                <input
                    name="email"
                    type="email"
                    className="form-control"
                />
            </div>

            <div className="form-group">
                <label className="text-muted">Password</label>
                <input
                    name="password"
                    type="password"
                    className="form-control"
                />
            </div>
            <button onClick={clickSubmit} className="btn btn-primary">Submit</button>
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
            style={{ display: success ? "" : "none" }}
        >
            New account is created. Please <Link to="/signin">Signin</Link>
        </div>
    );

    return (
        <Layout>
            <div className="">
                <Jumbotron title="SignupRider" description="SignupRider to Sparkle" />
            </div>
            {showError()}
            {showSuccess()}
            {signUpForm()}
            {/*This following JSON allows us to see the current object as string*/}
            {/*JSON.stringify(values)*/}
        </Layout>
    );
};

export default SignupRider;
