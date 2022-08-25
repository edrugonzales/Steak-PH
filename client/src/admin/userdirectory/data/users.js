import { API } from "../../../config";

export const searchUsers = async (name) => {
  const { token } = JSON.parse(localStorage.getItem("jwt"));
  return await fetch(
    `${process.env.REACT_APP_API_URL ? `${API}` : "/api"}/user/search/byname`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name }),
    }
  )
    .then((response) => {
      return response;
    })
    .catch((err) => {
      //console.log(err)
      return err;
    });
};


export const getUserById = async (userId) => {
  const { token } = JSON.parse(localStorage.getItem("jwt"));
  return await fetch(
    `${process.env.REACT_APP_API_URL ? `${API}` : "/api"}/user/byid/${userId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  )
    .then((response) => {
      return response;
    })
    .catch((err) => {
      //console.log(err)
      return err;
    });
};


