import React, { Fragment, useState } from "react";
import { Link, withRouter, useHistory} from "react-router-dom";
import { signout, isAuthenticated } from '../auth';
import { itemTotal } from './cartHelpers';
import sparklesLogo from '../assets/sparkles-logo.png';
import {ShoppingBasket, Close} from '@material-ui/icons';
import MenuIcon from '@material-ui/icons/Menu';
const Menu = ({toggleCart}) => {
    const history = useHistory();
    const [isToggle, setToggle] = useState(false);
    const toggle = (t) => setToggle(t);

    const isActive = (history, path) => {
        if (history.location.pathname === path) {
            return { color: "#ff9900", fontWeight: 600 };
        } else {
            return { color: "#000" };
        }
    };
    return (
        <div className="navigation">
            <div  className="container">
                <div className="nav__container">
                    <div className="nav__logo">
                        <Link className="nav-link" style={isActive(history, "/")} to="/" >
                            <img src={sparklesLogo} alt="sparkles-logo" />
                        </Link>
                    </div>
                    <div className="mobile__menu-container hidden">
                        
                            <button className="nav-link mobile__cart" onClick={toggleCart}>
                                <ShoppingBasket />
                                <sup>
                                    <span style={{fontSize:"1em"}} className="badge badge-danger badge-pill">{itemTotal()}</span>
                                </sup>

                            </button>
                            <button className="btn btn-outline-primary" onClick={() => toggle(true)}><MenuIcon /></button>
                    </div>
                    <ul className={`nav nav-tabs border-0 ${isToggle ? "active" : "hidden"}`}>
                        {isToggle ? (
                            <li className="nav-item text-right my-3 mx-2">
                                <button className="btn btn-outline-primary btn__close" onClick={() => toggle(false)}><Close /> </button>
                            </li>
                        ) : ""}
                        <li className="nav-item">
                            <Link
                                className="nav-link"
                                style={isActive(history, "/")}
                                to="/"
                            >
                                Home
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link
                                className="nav-link"
                                style={isActive(history, "/shop")}
                                to="/shop"
                            >
                                Shop
                            </Link>
                        </li>


                        {isAuthenticated() && isAuthenticated().user.role === 0 && (
                            <li className="nav-item">
                                <Link
                                    className="nav-link"
                                    style={isActive(history, "/user/dashboard")}
                                    to="/user/dashboard"
                                >
                                    Dashboard
                                </Link>
                            </li>
                        )}

                        {isAuthenticated() && isAuthenticated().user.role > 0 && (
                            <li className="nav-item">
                                <Link
                                    className="nav-link"
                                    style={isActive(history, "/admin/dashboard")}
                                    to="/admin/dashboard"
                                >
                                    Dashboard
                                </Link>
                            </li>
                        )}
                        {!isAuthenticated() && (
                            <Fragment>
                                <li className="nav-item">
                                    <Link
                                        className="nav-link"
                                        style={isActive(history, "/signin")}
                                        to="/signin"
                                    >
                                        Signin
                                    </Link>
                                </li>

                                <li className="nav-item">
                                    <Link
                                        className="nav-link"
                                        style={isActive(history, "/signup")}
                                        to="/signup"
                                    >
                                        Signup
                                    </Link>
                                </li>
                            </Fragment>
                        )}

                        {isAuthenticated() && (
                            <li className="nav-item">
                                <span
                                    className="nav-link"
                                    onClick={() =>
                                        signout(() => {
                                            //Redirect to homepage
                                            history.push("/");
                                        })}
                                >
                                    Signout
                                </span>
                            </li>
                        )}
                        <li className="nav-item mobile__hidden">
                            <button className="btn__cart" onClick={toggleCart}>
                                <ShoppingBasket />
                                <sup>
                                    <span style={{fontSize:"1em"}} className="badge badge-danger badge-pill">{itemTotal()}</span>
                                </sup>

                            </button>
                        </li>

                    </ul>
            
                </div>
            </div>
        </div>
    )
}

export default withRouter(Menu);
