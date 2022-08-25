import React, { useState, useEffect } from 'react'
import Layout from "./Layout";
import Card from "./Card";
import Jumbotron from './Jumbotron';

const Result = (props) => {
    const [data, setData] = useState({
        products: 0,
        results: [],
        searched: false
    });
    const { products, searched, results} = data;
    
    useEffect(() => {
        const propsData = props ? props.location.state : undefined;
        if(propsData){
            setData({...propsData});
        }
    }, [props]);

    const searchMessage = (searched, results) => {
        if (searched && results.length > 0) {
            return `Found ${results.length} products`;
        }
        if (searched && results.length < 1) {
            return `No products found`;
        }
    };

    return (
        <Layout >
                <div className="section__products">
                    <Jumbotron title="Search Result"/>
                    <div className="container">
                        <h2 className="mt-4 mb-4">
                            {searchMessage(searched, results)}
                        </h2>
                        <div className="row">
                            {products.length> 0 ? products.map((product, i) => (
                                 <div key={i} className="col-4 mb-3">
                                    <Card key={i} product={product} />
                                </div>
                            )) : ""}
                        </div>
                    </div>

                </div>
        </Layout>
    );
}

export default Result;