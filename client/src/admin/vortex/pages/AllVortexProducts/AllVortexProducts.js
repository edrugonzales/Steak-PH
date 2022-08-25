import React, { useState, useEffect } from 'react'

import { Box, Button, Card, CardContent, Stack, TextField } from '@mui/material'

import DataTable from 'react-data-table-component';

import { handleVortexGetProductRequest } from "../../functions/vortexRequestHandlers"
import CustomLoader from '../../components/CustomLoader';
import useSparkleSnackbar from '../../../../core/useSparkleSnackbar';

const AllVortexProducts = () => {

  const [products, setProducts] = useState([])

  const [renderData, setRenderData] = useState([])

  const [isLoading, setIsLoading] = useState(true)

  const [resetPaginationToggle, setResetPaginationToggle] = React.useState(false);

  const { showSnackbar, closeSnackbar, SparkleSnackBar } = useSparkleSnackbar("bottom", "center")


  useEffect(() => {
    handleVortexGetProductRequest().then((result) => {
      setProducts(result)
      setIsLoading(false)
    }).catch((error) => {
      setIsLoading(false)
      console.log(error)
    })
  }, [])

  useEffect(() => {
    setRenderData(products)

  }, [products])



  const columns = [
    {
      id: 'brand',
      name: 'Product Brand',
      selector: row => row.brand,
    },
    {
      id: 'code',
      name: 'Product Code',
      selector: row => row.code,
    },
    {
      id: 'name',
      name: 'Product name',
      selector: row => row.name,
    },
    {
      id: 'category',
      name: 'Category',
      selector: row => row.category,
    },
    {
      id: 'category',
      name: 'Category',
      selector: row => (
        <Button onClick={() => {
          navigator.clipboard.writeText(row.category)
          showSnackbar("Text copied", "success")
        }}>
          {row.category}
        </Button>
      ),
    },
    {
      id: 'price',
      name: 'Price',
      selector: row => `${row.pricing.price} ${row.pricing.unit}`,
    },

  ];


  return (
    <Box>
      <Stack spacing={2}>
        <Card>
          <CardContent>
            <Stack direction={"row"} spacing={2}>
              <TextField label="Category"
                onChange={(e) => {
                  if (products.length > 0) {
                    setResetPaginationToggle(false)

                    let filterData = products.filter(
                      product => product?.category.includes(e.target.value)
                    )

                    setRenderData(filterData)
                  }

                }} />
            </Stack>
          </CardContent>
        </Card>
        <DataTable
          pagination
          columns={columns}
          data={renderData}
          progressPending={isLoading}
          paginationResetDefaultPage={resetPaginationToggle}
          progressComponent={<CustomLoader />}
        />
        <Box>
          <Button variant='contained'
            onClick={() => {
              if (renderData.length > 0) {
                const csvString = [
                  ["brand", "code", "name", "category", "price"],
                  ...renderData.map(item => [
                    item.brand,
                    item.code,
                    item.name.replace(/,/g, ''),
                    item.category,
                    `${item.pricing.price} ${item.pricing.unit}`
                  ])
                ].map(e => e.join(","))
                  .join("\n");


                let csvContent = "data:text/csv;charset=utf-8,"
                  + csvString

                var today = new Date();

                var date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();

                var encodedUri = encodeURI(csvContent);
                var link = document.createElement("a");
                link.setAttribute("href", encodedUri);
                link.setAttribute("download", `sparkle_vortex_products_${date}.csv`);
                document.body.appendChild(link); // Required for FF

                link.click();
              }
            }}
          >Download CSV</Button>
        </Box>
      </Stack>
      <SparkleSnackBar />
    </Box>
  )
}

export default AllVortexProducts