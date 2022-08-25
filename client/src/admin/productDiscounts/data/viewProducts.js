import { API } from '../../../config'

const viewProducts = async (shopId) => {
	const { token } = JSON.parse(localStorage.getItem('jwt'))
	
	return await fetch(`${API}/product/list/shop/${shopId}?ismerchant=true`, {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
		},
	})
		.then((response) => {
			return response;
		})
		.catch((err) => {
			//console.log(err)
			return err;
		});
}

export default viewProducts