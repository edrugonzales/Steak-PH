import React, { useState, useEffect } from "react";
import Layout from "./Layout";
import Card from "./Card";
import { getCategories, getFilteredProducts } from './apiCore';
import Checkbox from './Checkbox';
import RadioBox from './RadioBox';
import {prices} from './fixedPrices';

import shopBanner from '../assets/sparkles-shops.jpg';

const Shop = () => {
    const [myFilters, setMyFilters] = useState({
        filters: { category: [], price: [] }
    })
    const [categories, setCategories] = useState([]);
    const [error, setError] = useState(false);
    const [limit, setLimit] = useState(6);
    const [skip, setSkip] = useState(0);
    const [size, setSize] = useState(0);
    const [filteredResults, setFilteredResults] = useState([]);

    const init = () => {
        getCategories()
        .then((data = []) => {
            if (data && data.error) {
                setError(data.error);
            } else {
                setCategories(data);
            }
        });
    };

    const loadFilteredResults = newFilters => {
        // console.log(newFilters);
        getFilteredProducts(skip, limit, newFilters).then((data = []) => {
            if (data && data.error) {
                setError(data.error);
            } else {
                setFilteredResults(data.data);
                setSize(data.size);
                setSkip(0);
            }
        });
    };

    const loadMore = () => {
        let toSkip = skip + limit;
        getFilteredProducts(toSkip, limit, myFilters.filters).then((data = []) => {
            if (data && data.error) {
                setError(data.error);
            } else {
                // joining the current filteredResult with more data to load (...data.data)
                setFilteredResults([...filteredResults, ...data.data]);
                console.log(JSON.stringify(filteredResults));
                setSize(data.size);
                setSkip(toSkip);
            }
        });
    };

    const loadMoreButton = () => {
        return (
            size > 0 &&
            size >= limit && (
                <button onClick={loadMore} className="btn btn-warning mb-5">
                    Load more
                </button>
            )
        );
    };

    // filterBy: either category or price
    const handleFilters = (filters, filterBy) => {
        // console.log("SHOP", filters, filterBy);
        const newFilters = { ...myFilters };
        newFilters.filters[filterBy] = filters;

        if (filterBy === "price") {
            let priceValues = handlePrice(filters);
            newFilters.filters[filterBy] = priceValues;
        }
        loadFilteredResults(myFilters.filters);
        setMyFilters(newFilters);
    };

    const handlePrice = value => {
        const data = prices;
        let newArray = [];

        for (let key in data) {
            if (data[key]._id === parseInt(value)) {
                newArray = data[key].array;
            }
        }
        return newArray;
    };

    useEffect(() => {
        init();
        loadFilteredResults(skip, limit, myFilters.filters);
    }, []);

    return (
        <Layout>
            <div className="section__banner banner-shop"  style={{backgroundImage: `url(${shopBanner})`, backgroundSize: `cover`}}>
            </div>
            <div className="container">
                <div className="py-5 content__shop">
                    <div className="row row__container row__container-shop">
                        <div className="col-4 row__filter">
                            <h4>Filter by categories</h4>
                            <ul>
                                <Checkbox
                                    categories={categories}
                                    handleFilters={filters => handleFilters(filters, 'category')}
                                />
                            </ul>

                            <h4>Filter by price range</h4>
                            <div>
                                <RadioBox
                                    prices={prices}
                                    handleFilters={filters => handleFilters(filters, 'price')}
                                />
                            </div>
                        </div>

                        <div className="col-8 row__content">
                            <h2 className="mb-4"></h2>
                            <div className="row">
                                {filteredResults && filteredResults.map((product, i) => (
                                    <div key={i} className="col-6 mb-3 card__container">
                                        <Card  product={product} />
                                    </div>
                                ))}
                            </div>
                            <hr />
                            {loadMoreButton()}
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Shop;
