import React, { useState, useEffect } from "react";
import Layout from "./Layout";
import { getProducts } from "./apiCore";
import Card from './Card';
import Search from './Search';

import sparkleBanner from '../assets/sparkles-banner.jpg';

const Home = () => {
    const [productsBySell, setProductsBySell] = useState([]);
    const [productsByArrival, setProductsByArrival] = useState([]);
    const [error, setError] = useState(false);

    const loadProductsBySell = () => {
        getProducts("sold")
        .then((data = []) => {
            if (data && data.error) {
                setError(data.error);
            } else {
                setProductsBySell(data);
            }
        });
    };

    const loadProductsByArrival = () => {

        getProducts("createdAt")
        .then((data = []) => {
            if (data && data.error) {
                setError(data.error);
            } else {
                setProductsByArrival(data);
            }
        });
    };


    useEffect(() => {
        loadProductsByArrival();
        loadProductsBySell();
    }, []);

    return (
        <Layout>
            <div className="section__banner banner-home"  style={{backgroundImage: `url(${sparkleBanner})`}}>
                <div className="container">
                    <h1 className="mb-4">Sparkling Taste of Home</h1>
                    <Search />
                </div>
            </div>

            <div className="section__products">
                <div className="container">

                    <h2 className="mb-4">New Arrivals</h2>
                    <div className="row row__container mb-5">
                        {productsByArrival.map((product, ind) => (
                            <div key={ind} className="col-4 mb-3 card__container">
                                <Card  product={product} />
                            </div>
                        ))}
                    </div>
                    
                    <h2 className="mb-4">Best Sellers</h2>
                    <div className="row row__container">
                        {productsBySell.map((product, ind) => (
                            <div key={ind} className="col-4 mb-3 card__container">
                                <Card  product={product} />
                            </div>
                        ))}
                    </div>


                </div>
            </div>
        </Layout>
    );
};

export default Home;
