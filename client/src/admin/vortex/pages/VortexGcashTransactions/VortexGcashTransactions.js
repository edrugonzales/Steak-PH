import React, { useState, useEffect } from "react";
import { isAuthenticated } from "../../../../auth";
import { getGCashTransactions } from "../../../apiAdmin";
import moment from 'moment';
import Collapsible from 'react-collapsible';
import { Box, Button, CircularProgress } from "@mui/material";
import DataTable from "react-data-table-component";
import useInputViewer from "./hook-components/useInputViewer";
import useResponseViewer from "./hook-components/useResponseViewer";


const VortexGcashTransactions = () => {



    const [upcoming_orders, setUpcomingOrders] = useState([]);

    const [isLoading, setIsLoading] = useState(true)

    const { user, token } = isAuthenticated();

    const { showInputViewer, closeInputViewer, InputDialog } = useInputViewer()

    const { showResponseViewer, closeResponseViewer, ResponseDialog } = useResponseViewer()

    const loadUpcomingOrders = () => {
        setIsLoading(true)
        getGCashTransactions().then((data = []) => {

            if (data && data.error) {
                console.log(data.error);
                setIsLoading(false)
            } else {

                setUpcomingOrders(data);
                setIsLoading(false)
            }
        });
    };

    const getVortexTokenBase = async () => {

        return await fetch(`${process.env.REACT_APP_API_URL}/vortex/token`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
        })
            .then((response) => {
                return response
            })
            .catch((err) => {

                return err
            })
    }

    //send a vortex request
    const sendVortexRequest = async (access_token, body, url) => {

        console.log('test - i know the request', url)

        return await fetch(`${process.env.REACT_APP_API_URL}${url}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
                "access_token": `${access_token}`
            },
            body: JSON.stringify(body)
        })
            .then((response) => {
                if (!response.ok) {
                    console.log(response)
                    //   throw Error(response.statusText);
                }
                return response;
            })
            .then((response) => {
                console.log(response)
                return response
            })
            .catch((err) => {
                console.log(err)
                return err
            })
    }

    const updateVortexByRefId = async ({ refId, data }) => {

        let reqBody = data

        return await fetch(`${process.env.REACT_APP_API_URL}/vortex/transaction/update/${refId}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify(reqBody)
        })
            .then((response) => {
                return response
            })
            .catch((err) => {

                return err
            })
    }

    async function handleVortexRequest(tranData, gtn) {
        try {
            let vortexTokenResponse = await getVortexTokenBase()

            if (vortexTokenResponse.status === 200) {
                let vortextTokenResult = await vortexTokenResponse.json()

                let td = JSON.parse(tranData.requestInputPayload)

                console.log(td);

                let reqBody = {};
                let vortexTransactionResponse = {};


                switch (tranData.type) {
                    case "billspayment":

                        reqBody = {
                            "clientRequestId": `SPARKLEADMIN${tranData.referenceNumber}`,
                            "billerId": td.billerId,
                            "billDetails": {
                                ...td.billDetails
                            },
                            "callbackUrl": td.callbackUrl,
                            "docId": tranData._id,
                            "paymentId": `gcash_${gtn}`
                        }

                        vortexTransactionResponse = await sendVortexRequest(
                            vortextTokenResult.access_token,
                            reqBody,
                            "/vortex/bills-payment"
                        )

                        break;
                    case "gift":
                        reqBody = {
                            "productCode": td.productCode.trim(),
                            "clientRequestId": `SPARKLEADMIN${tranData.referenceNumber}`,
                            "senderName": td.formData.senderName.trim(),
                            "senderMobile": td.formData.senderMobile.trim(),
                            "senderEmail": td.formData.senderEmail.trim(),
                            "recipientName": td.formData.recipientName.trim(),
                            "recipientMobile": td.formData.recipientMobile.trim(),
                            "recipientEmail": td.formData.recipientEmail.trim(),
                            "quantity": parseInt(td.formData.quantity),
                            "message": td.formData.message,
                            "docId": tranData._id,
                            "paymentId": `gcash_${gtn}`
                        }

                        vortexTransactionResponse = await sendVortexRequest(
                            vortextTokenResult.access_token,
                            reqBody,
                            "/vortex/gift"
                        )

                        break;
                    case "topup":
                        reqBody = {
                            "clientRequestId": `SPARKLEADMIN${tranData.referenceNumber}`,//`${clientRequestId}${uniqueId}`,
                            "mobileNumber": `${td.mobileNumber.trim()}`,
                            "productCode": `${td.productCode.trim()}`,
                            "docId": tranData._id,
                            "paymentId": `gcash_${gtn}`
                        }

                        vortexTransactionResponse = await sendVortexRequest(
                            vortextTokenResult.access_token,
                            reqBody,
                            "/vortex/topup"
                        )

                        break;


                    default:
                        alert("Unknown type cancelled process")
                        break;
                }
                loadUpcomingOrders();
            }
        } catch (error) {
            console.log(error)
            alert(error)
        }
    }

    useEffect(() => {
        loadUpcomingOrders();
    }, []);




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
            id: "actionButton",
            name: 'CONFIRM GCASH PAYMENT',
            selector: row => (
                <div>
                    {
                        <Button disabled={row.paymentId !== 'Awaiting for GCash Payment'} onClick={
                            () => {
                                let gCashTransactionNum = prompt("Enter GCash transaction/reference number:");

                                if (gCashTransactionNum) {
                                    handleVortexRequest(row, gCashTransactionNum);
                                }

                            }

                        }>Confirm</Button>

                    }
                </div>
            ),
        },
    ];

    return (
        <Box>
            <DataTable
                defaultSortFieldId={'createdAt'}
                pagination
                columns={columns}
                data={upcoming_orders}
                progressPending={isLoading}
                progressComponent={<CircularProgress />}
            />
            <InputDialog />
            <ResponseDialog />
            {/* {upcoming_orders.map(
                o => {
                    return (
                        <div className="mt-5" key={o._id} style={{ borderBottom: "5px solid indigo" }}>
                            <ul className="list-group mb-2">
                                <Collapsible trigger={(<p>Reference: {o.referenceNumber} Amount: {o.totalAmount}  - {o.type}</p>)} >
                                    <li className="list-group-item">Ordered on/updated: {moment(o.createdAt).fromNow()} / {moment(o.updatedAt).fromNow()}</li>
                                    <li className="list-group-item">transactionData: {o.transactionData}</li>
                                    <li className="list-group-item">requestInputPayload: {o?.requestInputPayload}</li>
                                    {o.paymentId === 'Awaiting for GCash Payment' && <button onClick={
                                        () => {
                                            let gCashTransactionNum = prompt("Enter GCash transaction/reference number:");

                                            if (gCashTransactionNum) {
                                                handleVortexRequest(o, gCashTransactionNum);
                                            }

                                        }

                                    }>Confirm payment </button>}

                                    <button onClick={
                                        () => {

                                        }

                                    }>Rerequest to Vortex </button>
                                </Collapsible>
                            </ul>
                        </div>
                    )

                })} */}
        </Box>
    );
};

export default VortexGcashTransactions;
