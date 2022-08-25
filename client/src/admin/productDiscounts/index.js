import React, { useState } from 'react'
import SearchShop from './searchShop'
import ShopProducts from './shopProducts'

const ProductDiscounts = () => {
	let [navigation, setNavigation] = useState({
		page: 0,
		data: {}
	})

	function proceed(data) {
		setNavigation({
			page: navigation.page + 1,
			data: data
		})
	}

	function goback(data) {
		setNavigation({
			page: navigation.page - 1,
			data: data
		})
	}

	return <>
		{navigation.page === 0 && <SearchShop viewShop={proceed} />}
		{navigation.page === 1 && <ShopProducts shop = {navigation.data} goback = {goback}/>}
	</>
}


export default ProductDiscounts