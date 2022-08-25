import { API } from '../../../config'



export const updateProductDiscount = async (product, productNewData) => {
	const { token, user } = JSON.parse(localStorage.getItem('jwt'))

	return await fetch(`${API}/product/${product._id}/${user._id}`, {
		method: "PUT",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${token}`,
		},
		body: JSON.stringify(productNewData),
	})
		.then((response) => {
			return response;
		})
		.catch((err) => {
			//console.log(err)
			return err;
		});

};