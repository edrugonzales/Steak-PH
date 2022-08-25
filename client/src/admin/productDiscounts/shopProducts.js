import React, { useState, useEffect } from 'react'
import { Box, InputBase, CircularProgress, AppBar, Toolbar, CssBaseline, Typography, IconButton, Stack } from '@mui/material'

import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import viewProducts from './data/viewProducts'

import ProductCard from './components/productCardItem'


const ShopProducts = ({ shop, goback}) => {
	const [products, setProducts] = useState([])
	const [loading, setLoading] = useState(false)
	//get the shops here


	async function getProducts() {
		let response = await viewProducts(shop._id)

		if (response.status === 200) {
			let result = await response.json()
			setProducts(result)
			setLoading(false)
			console.log(result)
		}
	}

	useEffect(() => {
		let mounted = true

		if (mounted) {
			//search products here
			getProducts()
		}

		return () => {
			mounted = false
		}
	}, [])


	if (loading) {
		return <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50%" }}>
			<CircularProgress />
		</Box>
	}

	return <CssBaseline>
		<AppBar>
			<Toolbar>
				<IconButton
					size='large'
					edge='start'
					color='inherit'
					aria-label='menu'
					sx={{ mr: 2 }}
					onClick = {goback}
				>
					<ChevronLeftIcon />
				</IconButton>
				<Box >
					View Shop Products
				</Box>
			</Toolbar>
		</AppBar>
		<div style={{
			display: 'flex',
			flexWrap: 'wrap',
			paddingTop: '5em',
			paddingBottom: '5em'
		}}>
			{products.length > 0 && products.map((product) => {
				return <ProductCard product={product} key={product._id} />
			})}
		</div>
		<Toolbar />
	</CssBaseline>
}

export default ShopProducts