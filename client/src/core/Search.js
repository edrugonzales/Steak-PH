import React, { useState, useEffect } from "react";
import { getCategories, list } from "./apiCore";
import { Redirect } from 'react-router';

const Search = () => {
    const [data, setData] = useState({
        categories: [],
        category: "",
        search: "",
        results: [],
        searched: false
    });

    const { categories, category, search, results, searched } = data;

    const loadCategories = () => {
        getCategories().then((data = []) => {
            if (data && data.error) {
                console.log(data.error);
            } else {
                setData({ ...data, categories: data });
            }
        });
    };

    useEffect(() => {
        loadCategories();
    }, []);

    const searchData = () => {
        // console.log(search, category);
        if (search) {
            list({ search: search || undefined, category: category }).then(
                response => {
                    if (response.error) {
                        console.log(response.error);
                        return false;
                    } else {
                        setData({ ...data, results: response, searched: true });
                    }
                }
            );
        }
    };

    const searchSubmit = e => {
        e.preventDefault();
        searchData();
    };

    const handleChange = name => event => {
        setData({ ...data, [name]: event.target.value, searched: false });
    };



    const searchedProducts = (results = []) => {
        return (
            <Redirect to={{
                pathname: '/search/result',
                state: { products: results, searched: searched, results: results}
            }}/>
        );
    };


    const searchForm = () => (
        <form onSubmit={searchSubmit}>
            <span className="input-group-text">
                <div className="input-group input-group-lg input__fields">


                    <input
                        type="search"
                        className="form-control"
                        onChange={handleChange("search")}
                        placeholder="Search by name"
                    />
                    {/*Prepend: insert before the search field*/}
                    <div className="input-group-prepend select">
                        <select
                            className="btn mr-2"
                            onChange={handleChange("category")}
                        >
                            <option value="All">All Categories</option>
                            {categories.map((c, i) => (
                                <option key={i} value={c._id}>
                                    {c.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
                <div
                    className="btn input-group-append btn__container"
                    style={{ border: "none" }}
                >
                    <button className="input-group-text">Search</button>
                </div>
            </span>
        </form>
    );

    return (
        <div  className="search__container">
            <div className="row">
                <div className="container mb-3">{searchForm()}</div>
            </div>
            <div className="row row__results">
                <div className="container mb-3">
                {searched ? searchedProducts(results) : ""}
                </div>

            </div>
        </div>
    );
};

export default Search;
