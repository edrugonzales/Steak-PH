import { API } from "../../config";

export const getOrderList = (userId, token) => {
    return fetch(`${(process.env.REACT_APP_API_URL) ? `${API}` : '/api'}/order/list/all/${userId}`, {
        method: "GET",
        headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`
        }
    })
        .then(response => {
            return response.json();
        })
        .catch(err => console.log(err));
};

export const getOrderDetails = (orderId, token) => {
    return fetch(`${(process.env.REACT_APP_API_URL) ? `${API}` : '/api'}/order/${orderId}`, {
        method: "GET",
        headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`
        }
    })
    .then(response => {
        return response.json();
    })
    .catch(err => console.log(err));
}


export const getShopDetails = (shopId, token) => {
    return fetch(`${(process.env.REACT_APP_API_URL) ? `${API}` : '/api'}/shop/${shopId}`, {
        method: "GET",
        headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`
        }
    })
    .then(response => {
        return response.json();
    })
    .catch(err => console.log(err));
}