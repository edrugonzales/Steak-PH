import { API } from "../config";
import queryString from 'query-string';
export const getLocation = () => {
    const userLoc = localStorage.getItem("location");
    if(userLoc){
        return `&${queryString.stringify(JSON.parse(userLoc))}`
    }
}

export const getProducts = (sortBy) => {
    const params = getLocation();
    return fetch(`${(process.env.REACT_APP_API_URL) ? `${API}` : '/api'}/product/list/all?sortBy=${sortBy}&order=desc&limit=6${params}`, {
        method: "GET"
    })
        .then(response => {
            return response.json();
        })
        .catch(err => console.log(err));
};

export const getCategories = () => {
    return fetch(`${(process.env.REACT_APP_API_URL) ? `${API}` : '/api'}/category/list/all`, {
        method: "GET"
    })
    .then(response => {
        return response.json();
    })
    .catch(error => console.log(error));
};

export const getFilteredProducts = (skip, limit, filters = {}) => {
    const data = {
        limit,
        skip,
        filters
    };
    return fetch(`${(process.env.REACT_APP_API_URL) ? `${API}` : '/api'}/product/list/by-search`, {
        method: "POST",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    })
        .then(response => {
            return response.json();
        })
        .catch(err => {
            console.log(err);
        });
};

export const list = params => {
    // turning obj params: {search: "react", category: ""}
    const query = queryString.stringify(params);
    // into query string: search=react&category=2321isddsa11d
    return fetch(`${(process.env.REACT_APP_API_URL) ? `${API}` : '/api'}/product/list/search?${query}`, {
        method: "GET"
    })
        .then(response => {
            return response.json();
        })
        .catch(err => console.log(err));
};

export const read = productId => {
    return fetch(`${(process.env.REACT_APP_API_URL) ? `${API}` : '/api'}/product/${productId}`, {
        method: "GET"
    })
        .then(response => {
            return response.json();
        })
        .catch(err => console.log(err));
};

export const listRelated = productId => {
    return fetch(`${(process.env.REACT_APP_API_URL) ? `${API}` : '/api'}/product/list/related/${productId}`, {
        method: "GET"
    })
        .then(response => {
            return response.json();
        })
        .catch(err => console.log(err));
};

export const getBraintreeClientToken = (userId, token) => {
    return fetch(`${(process.env.REACT_APP_API_URL) ? `${API}` : '/api'}/braintree/get-token/${userId}`, {
        method: "GET",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        }
    })
        .then(response => {
            return response.json();
        })
        .catch(err => console.log(err));
};

export const processPayment = (userId, token, paymentData) => {
    return fetch(`${(process.env.REACT_APP_API_URL) ? `${API}` : '/api'}/braintree/payment/${userId}`, {
        method: "POST",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(paymentData)
    })
        .then(response => {
            return response.json();
        })
        .catch(err => console.log(err));
};

export const createOrder = (userId, token, createOrderData) => {
    return fetch(`${(process.env.REACT_APP_API_URL) ? `${API}` : '/api'}/order/create/${userId}`, {
        method: "POST",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ order: createOrderData })
    })
        .then(response => {
            return response.json();
        })
        .catch(err => console.log(err));
};

