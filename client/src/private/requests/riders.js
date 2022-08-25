import { API } from "../../config";

export const createRider = (userId, token, product) => {
    return fetch(`${(process.env.REACT_APP_API_URL) ? `${API}` : '/api'}/riders/${userId}`, {
        method: "POST",
        headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`
        },
        body: product
    })
    .then(response => {
        return response.json();
    })
    .catch(err => {
        console.log(err);
    });
};

export const getRiderList = (token) => {
    return fetch(`${(process.env.REACT_APP_API_URL) ? `${API}` : '/api'}/riders/list/all`, {
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
