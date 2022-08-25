import React, { useState, useEffect } from 'react'

import { Box, Button, Card, CardContent, Stack, TextField } from '@mui/material'

import DataTable from 'react-data-table-component';

import { handleVortexGetBillersRequest } from "../../functions/vortexRequestHandlers"
import CustomLoader from '../../components/CustomLoader';
import useBillerViewer from './hook-components/useBillerViewer';
import useSparkleSnackbar from '../../../../core/useSparkleSnackbar';

const AllVortexBillers = () => {

  const [billers, setBillers] = useState([])

  const [renderData, setRenderData] = useState([])

  const [isLoading, setIsLoading] = useState(true)

  const { showBillerViewer, closeBillerViewer, BillerViewerDialog } = useBillerViewer()

  const [resetPaginationToggle, setResetPaginationToggle] = React.useState(false);

  const { showSnackbar, closeSnackbar, SparkleSnackBar } = useSparkleSnackbar("bottom", "center")

  useEffect(() => {
    handleVortexGetBillersRequest().then((result) => {
      setBillers(result?.docs)
      setIsLoading(false)
    }).catch((error) => {
      setIsLoading(false)
      console.log(error)
    })
  }, [])

  useEffect(() => {
    setRenderData(billers)
  }, [billers])



  const columns = [
    {
      id: 'id',
      name: 'Biller Id',
      selector: row => row.id,
    },
    {
      id: 'name',
      name: 'Biller name',
      selector: row => row.name,
    },
    {
      id: 'category',
      name: 'Biller category',
      selector: row => row.category,
    },
    {
      name: 'View',
      selector: row => (
        <Button onClick={() => {
          showBillerViewer(row)
        }}>
          View
        </Button>
      ),
    },
  ];


  return (
    <Box>
      <Stack spacing={2}>
        <Card>
          <CardContent>
            <Stack direction={"row"} spacing={2}>
              <TextField label="Biller ID"
                onChange={(e) => {
                  if (billers.length > 0) {
                    setResetPaginationToggle(false)

                    let filterData = billers.filter(
                      biller => biller?.id.includes(e.target.value)
                    )

                    setRenderData(filterData)
                  }

                }} />
              <TextField label="Biller Name"
                onChange={(e) => {
                  if (billers.length > 0) {
                    setResetPaginationToggle(false)

                    let filterData = billers.filter(
                      biller => biller?.name.includes(e.target.value)
                    )

                    setRenderData(filterData)
                  }

                }} />
              <TextField label="Biller Category"
                onChange={(e) => {
                  if (billers.length > 0) {
                    setResetPaginationToggle(false)

                    let filterData = billers.filter(
                      biller => biller?.category.includes(e.target.value)
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
          progressComponent={<CustomLoader />}
        />
        <Box>
          <Button variant='contained'
            onClick={() => {
              if (renderData.length > 0) {
                const csvString = [
                  ["id", "name", "category"],
                  ...renderData.map(item => [
                    item.id,
                    item.name,
                    item.category,
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
                link.setAttribute("download", `sparkle_vortex_billers_${date}.csv`);
                document.body.appendChild(link); // Required for FF

                link.click();
              }

            }}
          >Download CSV</Button>
        </Box>
      </Stack>
      <BillerViewerDialog />
      <SparkleSnackBar />
    </Box>
  )
}

export default AllVortexBillers