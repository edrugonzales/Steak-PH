import React, { useState } from "react";
import Layout from "../core/Layout";
import { Redirect } from 'react-router-dom';
import { signin, authenticate, isAuthenticated } from '../auth';

import { Link } from "react-router-dom";
import spark from '../assets/spark.png';


const Signin = () => {
    const [values, setValues] = useState({
        email: "",
        password: "",
        error: "",
        loading: false,
        redirectToReferrer: false
    });
    const { email, password, loading, error, redirectToReferrer } = values;
    const { user } = isAuthenticated();
    const handleChange = e => {
        const { name, value } = e.target;
        setValues({ ...values, error: false, [name]: value });
    };

    const clickSubmit = e => {
        e.preventDefault();
        setValues({ ...values, error: false, loading: true });
        signin({ email, password })
        .then(data => {
            if (data.error) {
                setValues({ ...values, error: data.error, loading: false });
            } else {
                console.log(data);
                authenticate(data, () => {
                    setValues({
                        ...values,
                        redirectToReferrer: true
                    });
                })
            }
        });
    };

    const signInForm = () => (
        <form onChange={handleChange}>
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
            <button onClick={clickSubmit} className="btn btn-primary w-100">Sign In</button>
            <p className="mt-3">Create an Account <Link to="/signup" className="text-primary">here</Link>.</p>
            
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

    const showLoading = () =>
       loading && (
        <div className="alert alert-info">
            <h2>Loading...</h2>
       </div>
       )
    ;

    const redirectUser = () => {
        if(redirectToReferrer) {
            if(user && user.role > 0) {
                return <Redirect to='/admin/dashboard' />
            } else {
                return <Redirect to='/user/dashboard' />
            }
        }
        if(isAuthenticated()) {
            return <Redirect to='/' />
        }
    }

    return (
        <Layout>
            <div className="container">
                <div className="hv-100 d-flex align-items-center justify-content-center login__container">
                    <div className="w-50 card_login-content">
                        <h2 className="text-center">Welcome to <br /> Sparkles!</h2>
                        <img src={spark} className="img-fluid spark_img"  alt="sparkles" draggable="false"/>
                    </div>
                    <div className="w-50 h-50 d-flex align-items-center justify-content-center">
                        <div className="card_login card__container w-75">
                            {showLoading()}
                            {showError()}
                            {signInForm()}
                            {redirectUser()}
                        </div>
                    </div>
                </div>
            </div>

            {/*This following JSON allows us to see the current object as string*/}
            {/*JSON.stringify(values)*/}
        </Layout>
    );
};

export default Signin;



