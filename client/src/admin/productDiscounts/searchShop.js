import React, { useState } from 'react'
import { Box, InputBase, CircularProgress, AppBar, Toolbar, CssBaseline, Typography, IconButton, Stack } from '@mui/material'

import SearchIcon from '@mui/icons-material/Search';
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import { useHistory } from 'react-router-dom'

import { Form, Formik } from 'formik'

import searchShop from './data/searchShop'

import ShopCard from '../userdirectory/component/UserCard'

const SearchShop = ({viewShop = () => {}, goback = () => {}}) => {
	const history = useHistory()
	const [shops, setShops] = useState([])

	async function handleShopSearch(shop) {
		let response = await searchShop(shop)

		if (response.status === 200) {
			let result = await response.json()
			setShops(result)
			console.log(result)
		}
	}

	//get the shops here


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
					<Formik initialValues={{}} onSubmit={async (data) => { await handleShopSearch(data.searchvalue) }}>
						{({ handleChange, isSubmitting }) => {
							console.log(isSubmitting)
							return <Form>
								<Stack spacing={2} direction={"row"}>
									<Box sx={{
										marginLeft: 0,
										width: '100%',
										borderRadius: "0.2em",
										backgroundColor: "#ffffff15",
										'&:hover': {
											backgroundColor: "#ffffff25",
										},

									}}>
										<InputBase
											sx={{
												padding: "5px",
												color: "white"
											}}
											disabled={isSubmitting}
											name={"searchvalue"}
											onChange={handleChange}
											placeholder={"Search shop here"}
											required
										/>
										<IconButton type="submit" disabled={isSubmitting}>
											{isSubmitting ?  <CircularProgress size = {30}/> : <SearchIcon sx={{ fill: "white" }} />}
										</IconButton>

									</Box>

								</Stack>
							</Form>
						}}
					</Formik>
				</Box>
			</Toolbar>
		</AppBar>

		<Toolbar />
		<Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
			{shops.length > 0 && shops.map(shop => {
				return <ShopCard
					image={shop.logo}
					name={shop.name}
					address={shop.address}
					phone = 'shop' 
					email = 'shop'
					role={1}
					onClick = {() => {
						viewShop(shop)
					}}
				/>
			})}
		</Box>
	</CssBaseline>
}

export default SearchShop