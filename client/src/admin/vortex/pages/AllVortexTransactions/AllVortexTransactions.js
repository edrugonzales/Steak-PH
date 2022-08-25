


import React, { useState, useEffect } from 'react'

import { Box, Button, Card, CardContent, IconButton, Menu, MenuItem, Stack, TextField, Typography } from '@mui/material'


import MoreHorizIcon from '@mui/icons-material/MoreHoriz';

import DataTable from 'react-data-table-component';
import moment from 'moment-timezone';


import useResponseViewer from './hook-components/useResponseViewer';
import useRetryRequest from './hook-components/useRetryRequest';
import useInputViewer from './hook-components/useInputViewer';
import useVortexTransactionViewer from './hook-components/useVortexTransactionViewer';
import { getAllVortexTransactionsByDaterange } from '../../data/remote/vortex';
import { handleVortexRequest } from '../../functions/VortexGcashFunctions';
import CustomLoader from '../../components/CustomLoader';
import useSparkleSnackbar from '../../../../core/useSparkleSnackbar';


import 'react-date-range/dist/styles.css'; // main style file
import 'react-date-range/dist/theme/default.css'; // theme css file
import { DateRangePicker } from 'react-date-range';
import useUserDetailsViewer from './hook-components/useUserDetailsViewer';



const AllVortexTransactions = (props) => {


  // STATES
  const [data, setdata] = useState([])

  const [renderData, setRenderData] = useState([])

  const [isLoading, setIsLoading] = useState(true)

  const [refresh, setRefresh] = useState(false)

  const [menuAnchorEl, setMenuAnchorEl] = React.useState(null);

  const [selectedRow, setSelectedRow] = useState(null)

  const [resetPaginationToggle, setResetPaginationToggle] = React.useState(false);

  var date = new Date();


  const [dateRangeSelection, setdateRangeSelection] = useState([
    {
      startDate: new Date(date.getFullYear(), date.getMonth(), date.getDate() - 7),
      endDate: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59),
      key: 'selection',
    }
  ])


  //Handlers
  const moreMenuOpen = Boolean(menuAnchorEl);


  const handleMoreMenuClick = (event, row) => {
    setSelectedRow(row)
    setMenuAnchorEl(event.currentTarget);

  };

  const handleMoreMenuClose = () => {
    setMenuAnchorEl(null);
  };

  const handleDaterangeSelect = (range) => {


    let newDateRange = {
      startDate: new Date(range.startDate.getFullYear(), range.startDate.getMonth(), range.startDate.getDate()),
      endDate: new Date(range.endDate.getFullYear(), range.endDate.getMonth(), range.endDate.getDate(), 23, 59, 59),
      key: 'selection',
    }




    setdateRangeSelection([newDateRange])


    console.log(dateRangeSelection);
  }

  const handleGetDataRequest = () => {
    setIsLoading(true)
    setdata([])

    getAllVortexTransactionsByDaterange({ startDate: dateRangeSelection[0].startDate, endDate: dateRangeSelection[0].endDate })

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
  }

  const downloadCsv = () => {

    try {

      if (renderData.length > 0) {
        const csvString = [
          [
            "DATE CREATED",
            "DATE UPDATED",
            "REFERENCE NUMBER",
            "CLIENT REQUEST ID",
            "WALLET TYPE",
            "CURRENCY",
            "WALLET",
            "TRANSACTION TYPE",
            "USER",
            "SENDER MOBILE",
            "RECIPIENT MOBILE NUMBER",
            "TRANSACTION DETAILS",
            "QUANTITY",
            "AMOUNT",
            "DISCOUNT AMOUNT",
            "REBATES",
            "WALLET DEDUCTION",
            "STATUS",
            "PAYMENT ID",
            "PAYMENT METHOD"
          ],
          ...renderData.map(item => {

            let parsedTransactionData = JSON.parse(item?.transactionData || '{"data":"empty"}')

            let parsedUserInputs = JSON.parse(item?.requestInputPayload || '{"data":"empty"}')

            return [
              item?.createdAt || "NA",
              item?.updatedAt || "NA",
              item?.referenceNumber || "NA",
              parsedTransactionData?.clientRequestId || "NA",
              parsedTransactionData?.walletType || "NA",
              parsedTransactionData?.currency || "NA",
              parsedTransactionData?.wallet || "NA",
              item?.type || "NA",
              item?.userId?.name || "NA",
              parsedUserInputs?.formData?.senderMobile || "NA",
              parsedUserInputs?.formData?.recipientMobile || parsedTransactionData?.mobileNumber || "NA",
              parsedTransactionData?.productName?.replace(',', '') || "NA",
              parsedUserInputs?.formData?.quantity || "NA",
              item.totalAmount || "NA",
              item?.dispensingDiscount || "NA",
              item?.rebate?.rebateAmount || "NA",
              item?.walletDeduction || "NA",
              item?.status || "NA",
              item?.paymentId || "NA",
              item?.paymentMethod || "NA"
            ];
          }
          )
        ].map(e => e.join(","))
          .join("\n");


        let csvContent = "data:text/csv;charset=utf-8,"
          + csvString



        var today = new Date();

        var date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();

        var encodedUri = encodeURI(csvContent);
        var link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `sparkle_vortex_transactions_${date}.csv`);
        document.body.appendChild(link); // Required for FF

        link.click();
      }

    } catch (error) {
      console.log(error)
    }
  }


  // HOOK COMPONENTS
  const { showResponseViewer, closeResponseViewer, ResponseDialog } = useResponseViewer()

  const { showInputViewer, closeInputViewer, InputDialog } = useInputViewer()

  const { showRetryRequest, closeRetryRequest, RetryDialog } = useRetryRequest()

  const { showVortexTransactionViewer, closeVortexTransactionViewer, VortexTransactionViewerDialog } = useVortexTransactionViewer()

  const { showUserDetailsViewer, closeUserDetailsViewerer, UserDetailsViewer } = useUserDetailsViewer()

  const { showSnackbar, closeSnackbar, SparkleSnackBar } = useSparkleSnackbar("bottom", "center")





  const columns = [
    {
      id: 'createdAt',
      name: 'Created At',
      selector: row => row.createdAt,
      sortable: true,
      cell: row => <span>{moment(row.createdAt
      ).tz('Asia/Manila').format("YYYY MMMM DD - hh:mm:ss a")}
      </span>,
      grow: 2,
    },
    {
      id: "type",
      name: 'Type',
      selector: row => row.type,
    },
    {
      id: "id",
      name: 'ID',
      grow: 2,
      selector: row => (
        <Button onClick={() => {
          navigator.clipboard.writeText(row._id)
          showSnackbar("Text copied", "success")
        }}>
          {row._id}
        </Button>
      ),
    },
    {
      id: "referenceNumber",
      name: 'Ref no',
      grow: 2,
      selector: row => (
        <Button onClick={() => {
          navigator.clipboard.writeText(row.referenceNumber)
          showSnackbar("Text copied", "success")
        }}>
          {row.referenceNumber}
        </Button>
      ),
    },
    {
      id: "user",
      name: 'User',
      selector: row => (
        <Button onClick={() => {
          navigator.clipboard.writeText(row?.userId?.name)
          showSnackbar("Text copied", "success")
        }}>
          {row?.userId?.name || "No User"}
        </Button>
      ),
    },
    {
      id: "status",
      name: 'Status',
      selector: row => row.status,
    },
    {
      id: "paymentId",
      name: 'Payment ID',
      selector: row => row.paymentId,
    },
    {
      id: "paymentMethod",
      name: 'Method',
      selector: row => row.paymentMethod,
      sortable: true,

    },

    {
      id: "actionButton",
      name: 'Confirm GCASH',
      selector: row => (
        <div>
          {
            <Button disabled={row.paymentId !== 'Awaiting for GCash Payment'} onClick={
              () => {
                let gCashTransactionNum = prompt("Enter GCash transaction/reference number:");

                if (gCashTransactionNum) {
                  handleVortexRequest(row, gCashTransactionNum);
                }

                setRefresh(!refresh)

              }

            }>Confirm</Button>

          }
        </div>
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
    {
      name: 'Options',
      selector: row => (
        <Box>
          <IconButton
            id="basic-button"
            aria-controls={moreMenuOpen ? 'basic-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={moreMenuOpen ? 'true' : undefined}
            onClick={(event) => {
              handleMoreMenuClick(event, row)
            }}
          >
            <MoreHorizIcon />
          </IconButton>

        </Box>
      ),
    },

  ];

  useEffect(() => {

    getAllVortexTransactionsByDaterange({ startDate: dateRangeSelection[0].startDate.toLocaleDateString(), endDate: dateRangeSelection[0].endDate })

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


  useEffect(() => {

    setRenderData(data)

  }, [data])



  return (
    <Box>
      <Stack spacing={2}>
        <Card>
          <CardContent>
            <Stack direction={"row"} spacing={2}>
              <Stack>
                <DateRangePicker
                  // onChange={item => setdateRangeSelection([item.selection])}
                  onChange={item => handleDaterangeSelect(item.selection)}
                  showSelectionPreview={true}
                  moveRangeOnFirstSelection={false}
                  months={1}
                  ranges={dateRangeSelection}
                  direction="horizontal"
                />
                <Box>
                  <Button variant={"contained"} onClick={() => {
                    handleGetDataRequest()
                  }}>GET DATA</Button>
                </Box>
              </Stack>
              <TextField label="Transaction ID"
                onChange={(e) => {
                  if (data.length > 0) {
                    setResetPaginationToggle(false)

                    let filterData = data.filter(
                      transaction => transaction?._id.includes(e.target.value)
                    )

                    setRenderData(filterData)
                  }

                }} />
              <TextField label="Reference no"
                onChange={(e) => {
                  if (data.length > 0) {
                    setResetPaginationToggle(false)

                    let filterData = data.filter(
                      transaction => transaction?.referenceNumber.includes(e.target.value)
                    )

                    setRenderData(filterData)
                  }

                }} />
              <TextField label="User name"
                onChange={(e) => {
                  if (data.length > 0) {
                    setResetPaginationToggle(false)

                    let filterData = data.filter(
                      transaction => transaction?.userId?.name.includes(e.target.value)
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
          defaultSortFieldId={'createdAt'}
          defaultSortAsc={false}
          progressPending={isLoading}
          paginationResetDefaultPage={resetPaginationToggle}
          progressComponent={<CustomLoader />}

        />
        <Box>
          <Button variant='contained'
            onClick={downloadCsv}

          >Download CSV</Button>
        </Box>
      </Stack>
      <ResponseDialog />
      <InputDialog />
      <VortexTransactionViewerDialog />
      <RetryDialog onSuccess={() => {
        setRefresh(!refresh)
      }} />
      <UserDetailsViewer />
      <Menu
        id="basic-menu"
        anchorEl={menuAnchorEl}
        open={moreMenuOpen}
        onClose={handleMoreMenuClose}
        MenuListProps={{
          'aria-labelledby': 'basic-button',
        }}
      >
        <MenuItem onClick={() => {
          handleMoreMenuClose()
          showInputViewer(selectedRow.requestInputPayload)
        }}>User inputs</MenuItem>
        <MenuItem onClick={() => {
          handleMoreMenuClose()
          showResponseViewer(selectedRow.transactionData)
        }}>Initial Response</MenuItem>
        <MenuItem onClick={() => {
          handleMoreMenuClose()
          showVortexTransactionViewer(selectedRow)
        }}>Current Status</MenuItem>
        <MenuItem onClick={() => {
          handleMoreMenuClose()
          showUserDetailsViewer(selectedRow?.userId)
        }}>User Details</MenuItem>
      </Menu>
      <SparkleSnackBar />
    </Box>
  )
}

export default AllVortexTransactions