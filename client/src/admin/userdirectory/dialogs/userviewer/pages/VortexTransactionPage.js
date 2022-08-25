import React, { useState, useEffect } from 'react'

import { Box, Button, CircularProgress } from '@mui/material'

import DataTable from 'react-data-table-component';
import moment from 'moment-timezone';


import useResponseViewer from '../hook-components/useResponseViewer';
import useRetryRequest from '../hook-components/useRetryRequest';
import useInputViewer from '../hook-components/useInputViewer';
import useVortexTransactionViewer from '../hook-components/useVortexTransactionViewer';
import { getAllVortexTransactionByUserID } from '../../../data/vortex';



const VortexTransactionPage = (props) => {


  // STATES
  const [data, setdata] = useState([])

  const [isLoading, setIsLoading] = useState(true)


  const [refresh, setRefresh] = useState(false)




  // HOOK COMPONENTS
  const { showResponseViewer, closeResponseViewer, ResponseDialog } = useResponseViewer()
  const { showInputViewer, closeInputViewer, InputDialog } = useInputViewer()
  const { showRetryRequest, closeRetryRequest, RetryDialog } = useRetryRequest()
  const { showVortexTransactionViewer, closeVortexTransactionViewer, VortexTransactionViewerDialog } = useVortexTransactionViewer()

  const columns = [
    {
      id: 'createdAt',
      name: 'Created At',
      selector: row => moment(row.createdAt
      ).tz('Asia/Manila').format("YYYY MMMM DD - hh:mm:ss a"),
      sortable: true,
    },
    {
      id: "type",
      name: 'Type',
      selector: row => row.type,
    },
    {
      id: "referenceNumber",
      name: 'Reference number',
      selector: row => row.referenceNumber,
    },
    {
      id: "paymentId",
      name: 'Payment ID',
      selector: row => row.paymentId,
    },
    {
      name: 'User Inputs',
      selector: row => (
        <Button onClick={() => {
          showInputViewer(row.requestInputPayload)
        }}>View</Button>
      ),
    },
    {
      name: 'Response',
      selector: row => (
        <Button onClick={() => {
          showResponseViewer(row.transactionData)
        }}>View</Button>
      ),
    },
    {
      name: 'Current Status',
      selector: row => (
        <Button onClick={() => {
          showVortexTransactionViewer(row)
        }}>View</Button>
      ),
    },
    {
      name: 'Retry Request',
      selector: row => (
        <Button onClick={() => {
          showRetryRequest(row)
        }}>Retry</Button>
      ),
    },

  ];





  useEffect(() => {

    getAllVortexTransactionByUserID({ userId: props?.user?._id })
      .then((response) => {
        if (response?.status === 200) {
          response.json()
            .then(result => {


              setdata(result)
              setIsLoading(false)
            })
        } else {
          setIsLoading(false)
          throw Error("Failed getting vortex transactions")
        }
      })
      .catch((error) => {
        setIsLoading(false)
        throw error
      })


  }, [refresh])




  const CustomLoader = () => {
    return <CircularProgress />
  }


  return (
    <Box>
      <DataTable
        pagination
        columns={columns}
        data={data}
        defaultSortFieldId={'createdAt'}
        defaultSortAsc={false}
        progressPending={isLoading}
        progressComponent={<CustomLoader />}
      />
      <ResponseDialog />
      <InputDialog />
      <VortexTransactionViewerDialog />
      <RetryDialog onSuccess={() => {
        setRefresh(!refresh)
      }} />

    </Box>
  )
}

export default VortexTransactionPage