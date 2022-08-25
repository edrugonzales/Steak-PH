import {API} from '../../../config'

const searchShop = async (name) => {
	const {token} = JSON.parse(localStorage.getItem('jwt'))

	return await fetch(
		`${process.env.REACT_APP_API_URL ? `${API}` : "/api"}/shop/search`,
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
}

export default searchShop