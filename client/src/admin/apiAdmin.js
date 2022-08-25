import { API } from "../config";

const spark_express_token = `eyJraWQiOiIxMFQrVjBsdGJmeHUxV0tDYjVicWNzYzlzXC9oUUtkYW5mQTh3RjRvblZ6RT0iLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiIwNjUwNjU0NC1iYTFkLTQyMWMtODFiZi03MTA1MTc2NTM2NDEiLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiaXNzIjoiaHR0cHM6XC9cL2NvZ25pdG8taWRwLnVzLWVhc3QtMi5hbWF6b25hd3MuY29tXC91cy1lYXN0LTJfMVZrZUZPOUpFIiwiY3VzdG9tOmFjY291bnRUeXBlIjoiMSIsImNvZ25pdG86dXNlcm5hbWUiOiIwNjUwNjU0NC1iYTFkLTQyMWMtODFiZi03MTA1MTc2NTM2NDEiLCJhdWQiOiI3ZGxuNzdsMHNnb3R0cHNvc3Q5NTY0YWswOCIsImV2ZW50X2lkIjoiZWU4ZTg2MzItZTFhYy00ZTNhLTg4YWYtYjI0MzVkYmE5NGY4IiwiY3VzdG9tOm5hbWUiOiJNaWd1ZWwgQ2xpZW50IiwidG9rZW5fdXNlIjoiaWQiLCJhdXRoX3RpbWUiOjE2Mjg1NzUyMjUsImV4cCI6MTYyODY2MTYyNSwiaWF0IjoxNjI4NTc1MjI1LCJlbWFpbCI6Im1pZ3F1aW50b3MyM0BnbWFpbC5jb20ifQ.G6qx_gPDNQ8c2UMwj_VhOTZgkoYYJqWgLAfUXQf03ctOj1zjaHwH-qSspKUlhhRqphFVtO87lmCn4Tf4_UDs_67wLAKoCUM1KqZFE9K_eY4Mi2Bo7KCfH5sRy5PUzKMTY18LgUd1gx45oKsO8QocjoBMfz5KuCSZ6LoTRkpGdoaZkiWaf-hRVIRMA_uEKKrlMozVxblFbsg1BlMuyA6SdM8IqVbg4vUuNoYGMc-kIDcu8XQCCUyZ9SgQyNFuU8ZwiXmkUfd0fiyaM2PDmFd7tZajlf6OXwINZ7qiqB02HGAmk2-Qc61F-2SJu4XUqh2hdYeMosM71KFQFR605tjthA`

export const cancelDelivery = (id) => {
  console.log(`https://spark-express.herokuapp.com/api/express/request/${id}/cancel`)
  return fetch(`https://spark-express.herokuapp.com/api/express/request/${id}/cancel`, {
    method: 'GET', 
    headers: {
       headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${spark_express_token}`,
      },
    }
  }).then(response => response.json()).catch(err => {
    console.log(err)
  })
}



export const createCategory = (userId, token, category) => {
  return fetch(
    `${process.env.REACT_APP_API_URL ? `${API}` : "/api"}/category/${userId}`,
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(category),
    }
  )
    .then((response) => {
      return response.json();
    })
    .catch((err) => {
      console.log(err);
    });
};

export const sendSMS = (sms) => {
  console.log("sendSms api admin", sms);
  return fetch(
    `${process.env.REACT_APP_API_URL ? `${API}` : "/api"}/order-delivery/sms`,
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(sms),
    }
  )
    .then((response) => {
      return response.json();
    })
    .catch((err) => {
      console.log(err);
      return err;
    });
};

export const createProduct = (userId, token, product) => {
  return fetch(
    `${process.env.REACT_APP_API_URL ? `${API}` : "/api"}/product/${userId}`,
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: product,
    }
  )
    .then((response) => {
      return response.json();
    })
    .catch((err) => {
      console.log(err);
    });
};

export const createProductByType = (shopId, token, product, type) => {
  return fetch(
    `${
      process.env.REACT_APP_API_URL ? `${API}` : "/api"
    }/product/${shopId}/${type}`,
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: product,
    }
  )
    .then((response) => {
      return response.json();
    })
    .catch((err) => {
      console.log(err);
    });
};

export const storageUpload = (productId, image, type) => {
  image.set("env", `${process.env.REACT_APP_VPS_ENV_KEY}`);
  image.set("id", productId);
  image.set("type", type);

  return fetch(
    `${process.env.REACT_APP_VPS_URL}/internal/product/image/upload`,
    {
      method: "POST",
      headers: {
        "X-API-KEY": `${process.env.REACT_APP_VPS_TOKEN_KEY}`,
      },
      body: image,
    }
  )
    .then((response) => {
      return response.json();
    })
    .catch((err) => {
      console.log(err);
    });
};

export const getCategories = () => {
  return fetch(
    `${process.env.REACT_APP_API_URL ? `${API}` : "/api"}/category/list/all`,
    {
      method: "GET",
    }
  )
    .then((response) => {
      return response.json();
    })
    .catch((err) => console.log(err));
};

export const getCategoriesByType = (type) => {
  return fetch(
    `${
      process.env.REACT_APP_API_URL ? `${API}` : "/api"
    }/category/list/all/${type}`,
    {
      method: "GET",
    }
  )
    .then((response) => {
      return response.json();
    })
    .catch((err) => console.log(err));
};

export const getOrderList = (userId, token) => {
  return fetch(
    `${process.env.REACT_APP_API_URL ? `${API}` : "/api"}/order/list/all`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  )
    .then((response) => {
      return response.json();
    })
    .catch((err) => console.log(err));
};

export const getCoopOrderList = (userId, token) => {
  return fetch(
    `${process.env.REACT_APP_API_URL ? `${API}` : "/api"}/coop/order/list/all`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  )
    .then((response) => {
      return response.json();
    })
    .catch((err) => console.log(err));
};

export const getOrderDeliveryList = (userId, token) => {
  return fetch(
    `${process.env.REACT_APP_API_URL ? `${API}` : "/api"}/order-delivery`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  )
    .then((response) => {
      return response.json();
    })
    .catch((err) => console.log(err));
};

export const getUpcomingOrders = (userId, token) => {
  return fetch(
    `${
      process.env.REACT_APP_API_URL ? `${API}` : "/api"
    }/order-delivery/upcoming`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  )
    .then((response) => {
      return response.json();
    })
    .catch((err) => console.log(err));
};

export const getStatusValues = (userId, token) => {
  return fetch(
    `${
      process.env.REACT_APP_API_URL ? `${API}` : "/api"
    }/order/status-values/${userId}`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  )
    .then((response) => {
      return response.json();
    })
    .catch((err) => console.log(err));
};

export const getRiders = (userId, token) => {
  return fetch(
    `${process.env.REACT_APP_API_URL ? `${API}` : "/api"}/user/list/rider`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  )
    .then((response) => {
      return response.json();
    })
    .catch((err) => console.log(err));
};

export const updateOrderStatus = (
  userId,
  token,
  orderId,
  status,
  statusMessage
) => {
  return fetch(
    `${
      process.env.REACT_APP_API_URL ? `${API}` : "/api"
    }/order/${orderId}/status/${userId}`,
    {
      method: "PUT",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status, orderId, statusMessage }),
    }
  )
    .then((response) => {
      return response.json();
    })
    .catch((err) => console.log(err));
};

export const updateOrderDeliveryStatus = (orderId, assignedRider) => {
  return fetch(
    `${
      process.env.REACT_APP_API_URL ? `${API}` : "/api"
    }/order-delivery/rider/${orderId}`,
    {
      method: "PUT",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ assignedRider }),
    }
  )
    .then((response) => {
      return response.json();
    })
    .catch((err) => console.log(err));
};

/**
 * to perform crud on product
 * get all products
 * get a single product
 * update single product
 * delete single product
 */

export const getProducts = () => {
  return getList();
};

export const getProductsByType = (type) => {
  switch (type) {
    case "shop":
      return getListShop();
    default:
      return getList();
  }
};

export const deleteProduct = (productId, userId, token) => {
  return fetch(
    `${
      process.env.REACT_APP_API_URL ? `${API}` : "/api"
    }/product/${productId}/${userId}`,
    {
      method: "DELETE",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  )
    .then((response) => {
      return response.json();
    })
    .catch((err) => console.log(err));
};

export const getProduct = (productId) => {
  return fetch(
    `${process.env.REACT_APP_API_URL ? `${API}` : "/api"}/product/${productId}`,
    {
      method: "GET",
    }
  )
    .then((response) => {
      return response.json();
    })
    .catch((err) => console.log(err));
};

export const updateProduct = (productId, userId, token, product) => {
  return fetch(
    `${
      process.env.REACT_APP_API_URL ? `${API}` : "/api"
    }/product/${productId}/${userId}`,
    {
      method: "PUT",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: product, // this is in form data
    }
  )
    .then((response) => {
      return response.json();
    })
    .catch((err) => console.log(err));
};

export const updateProductCoop = (productId, userId, token, product) => {
  return fetch(
    `${
      process.env.REACT_APP_API_URL ? `${API}` : "/api"
    }/product/coop/${productId}/${userId}`,
    {
      //needs updating
      method: "PUT",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: product, // this is in form data
    }
  )
    .then((response) => {
      return response.json();
    })
    .catch((err) => console.log(err));
};

/* Homemade */
function getList() {
  return fetch(
    `${
      process.env.REACT_APP_API_URL ? `${API}` : "/api"
    }/product/list/all?limit=-1`,
    {
      // n1
      method: "GET",
    }
  )
    .then((response) => {
      return response.json();
    })
    .catch((err) => console.log(err));
}

function getListShop() {
  return fetch(
    `${process.env.REACT_APP_API_URL ? `${API}` : "/api"}coop/products`,
    {
      // n1
      method: "GET",
    }
  )
    .then((response) => {
      return response.json();
    })
    .catch((err) => console.log(err));
}

/* Shop */

// n1 ?limit=undefined` = get rid of default limit of 6 to be displayed
export function getAllCategories() {
  return fetch(
    `${
      process.env.REACT_APP_API_URL ? `${API}` : "/api"
    }/category/list/all/shop`,
    {
      // n1
      method: "GET",
    }
  )
    .then((response) => {
      return response.json();
    })
    .catch((err) => console.log(err));
}

export function updateCategoryBrands(update, token) {
  console.log(update);
  return fetch(
    `${process.env.REACT_APP_API_URL ? `${API}` : "/api"}/coop/category/brand`,
    {
      //needs updating
      method: "PUT",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(update), // this is in form data
    }
  )
    .then((response) => {
      console.log(response.json());
      return response.json();
    })
    .catch((err) => console.log(err));
}

export const coopUpdateOrderStatus = (
  userId,
  token,
  orderId,
  status,
  statusMessage
) => {
  return fetch(
    `${
      process.env.REACT_APP_API_URL ? `${API}` : "/api"
    }/coop/orders/${orderId}`,
    {
      method: "PUT",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    }
  )
    .then((response) => {
      return response.json();
    })
    .catch((err) => console.log(err));
};

export const getVouchers = () => {

  return fetch(
    `${process.env.REACT_APP_API_URL ? `${API}` : "/api"}/voucher`,
    {
      method: "GET",
    }
  )
    .then((response) => {
      return response.json();
    })
    .catch((err) => console.log(err));
};

export const getSparkExpressVouchers = () => {

  return fetch(
    `${process.env.REACT_APP_API_URL ? `${API}` : "/api"}/voucher/spark-express`,
    {
      method: "GET",
    }
  )
    .then((response) => {
      return response.json();
    })
    .catch((err) => console.log(err));
};

export const getSparkPasuyoVouchers = () => {

  return fetch(
    `${process.env.REACT_APP_API_URL ? `${API}` : "/api"}/voucher/pasuyo`,
    {
      method: "GET",
    }
  )
    .then((response) => {
      console.log('there is response')
      return response.json();
    })
    .catch((err) => console.log(err));
};

export const createNewVoucher  = (voucher, token) => {
   return fetch(
    `${process.env.REACT_APP_API_URL ? `${API}` : "/api"}/voucher`,
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(voucher),
    }
  )
    .then((response) => {
      return response.json();
    })
    .catch((err) => {
      console.log(err);
    }); 
}

export const updateVoucher  = (voucher, voucherId, token) => {
   return fetch(
    `${process.env.REACT_APP_API_URL ? `${API}` : "/api"}/voucher/${voucherId}`,
    {
      method: "PATCH",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(voucher),
    }
  )
    .then((response) => {
      return response.json();
    })
    .catch((err) => {
      console.log(err);
    }); 
}

export const deleteVoucher = (voucherId, token) => {
     return fetch(
    `${process.env.REACT_APP_API_URL ? `${API}` : "/api"}/voucher/${voucherId}`,
    {
      method: "DELETE",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  )
    .then((response) => {
      console.log('may response na ')
      return response.json();
    })
    .catch((err) => {
      console.log(err);
    }); 
}


export const getSparkleShops = () =>{
  return fetch(
    `${process.env.REACT_APP_API_URL ? `${API}` : "/api"}/shop/list/all`,
    {
      method: "GET",
    }
  )
    .then((response) => {
      return response.json();
    })
    .catch((err) => console.log(err));
}

export const getGCashTransactions = () =>{
  return fetch(
    `${process.env.REACT_APP_API_URL ? `${API}` : "/api"}/vortex/paymentTransactions`,
    {
      method: "GET",
    }
  )
    .then((response) => {
      return response.json();
    })
    .catch((err) => console.log(err));
}