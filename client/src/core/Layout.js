import React, {useState} from "react";
import Menu from "./Menu";
import Cart from "./Cart";
import "../styles.css";

const Layout = ({
    className,
    children,
}) => {
   const [cart, setCart] = useState(false);
   const toggleCart = () => {
       setCart(cart ?  false : true);
    };
   return (
        <div>
            <Menu toggleCart={toggleCart} />
            {/* <div className="jumbotron">
                <div className="container">
                    <h2>{title}</h2>
                    <p className="lead">{description}</p>
                </div>
            </div> */}
            <div className={className}>{children}</div>

            <div className={`modal__cart ${cart ? "active" : "hidden"}`}>
                <Cart toggleCart={toggleCart}   />
            </div>
            <div className="footer">
                <div className="container">
                    <p className="text-center">2022 © Sparkles. All rights reserved.</p>
                </div>
            </div>
        </div>
    );
}

export default Layout;
