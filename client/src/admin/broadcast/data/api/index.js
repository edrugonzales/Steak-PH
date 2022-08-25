import { API } from "../../../../config";

export const getAllNotifications = async () => {
  const { token } = JSON.parse(localStorage.getItem("jwt"));
  console.log(token);
  return await fetch(
    `${
      process.env.REACT_APP_API_URL ? `${API}` : "/api"
    }/broadcasts/all/notifications`,
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

export const getAllPromotions = async () => {
  const { token } = JSON.parse(localStorage.getItem("jwt"));
  return await fetch(
    `${
      process.env.REACT_APP_API_URL ? `${API}` : "/api"
    }/broadcasts/all/promotions`,
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

export const getAllAdvisory = async () => {
  const { token } = JSON.parse(localStorage.getItem("jwt"));
  return await fetch(
    `${
      process.env.REACT_APP_API_URL ? `${API}` : "/api"
    }/broadcasts/all/advisory`,
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

export const createNewGeneralBroadcast = async (broadcastData) => {
  const { token } = JSON.parse(localStorage.getItem("jwt"));
  const formdata = new FormData();

  // console.log(productData.name);

  for (let index = 0; index < broadcastData.images.length; index++) {
    formdata.append("file", broadcastData.images[index]);
  }

  formdata.append("title", broadcastData.title);
  formdata.append("body", broadcastData.body);
  formdata.append("createdBy", broadcastData.createdBy);
  formdata.append("type", broadcastData.type);
  formdata.append("link", broadcastData.link);
  formdata.append("published", broadcastData.published);

  for (let index = 0; index < broadcastData.targetUsers.length; index++) {
    formdata.append("targetUsers", broadcastData.targetUsers[index]);
  }

  return await fetch(
    broadcastData.target === "General"
      ? `${API}/broadcasts/general/post`
      : `${API}/broadcasts/selected/post`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formdata,
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

export const updateBroadcast = async (broadcastId, data) => {
  const { token } = JSON.parse(localStorage.getItem("jwt"));
  return await fetch(
    `${
      process.env.REACT_APP_API_URL ? `${API}` : "/api"
    }/broadcasts/${broadcastId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
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

export const deleteBroadcast = async (broadcastId) => {
  const { token } = JSON.parse(localStorage.getItem("jwt"));
  return await fetch(
    `${
      process.env.REACT_APP_API_URL ? `${API}` : "/api"
    }/broadcasts/${broadcastId}`,
    {
      method: "DELETE",
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
