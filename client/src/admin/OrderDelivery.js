import React, { useState, useEffect } from "react";
import Layout from "../core/Layout";
import { isAuthenticated } from "../auth";
import { Link } from "react-router-dom";
import { getOrderDeliveryList, getStatusValues, updateOrderDeliveryStatus, getRiders, getUpcomingOrders, updateOrderStatus, sendSMS, cancelDelivery } from "./apiAdmin";
import moment from 'moment';
import Collapsible from 'react-collapsible';
import Jumbotron from '../core/Jumbotron';
import RemoveInSparkExpress from './orderDelivery/removeInSparkExpressRiders'

const OrderDelivery = () => {
    const [counter, setCounter] = useState(30)
    const [orders, setOrders] = useState([]);
    const [upcoming_orders, setUpcomingOrders] = useState([]);
    const [statusValues, setStatusValues] = useState([]);
    const [ridersExpress, setRidersExpress] = useState([]);
    const [smsMessage, setSMSMessage] = useState("");
    const [number, setNumber] = useState("");

    const { user, token } = isAuthenticated();

    const stopBroadcastOrder = (id) => {
        cancelDelivery(id).then((response) => {
            console.log(response)
            if(response.ok)
                alert('broadcast stopped')
            else 
                alert('something happened, please try again')
        })
    }


    const loadUpcomingOrders = () => {
        getUpcomingOrders(token).then((data = []) => {

            console.log('upcoming', data)
            if (data && data.error) {
                console.log(data.error);
            } else {
                setUpcomingOrders(data);
            }
        });
    };

    const loadOrders = () => {
        getOrderDeliveryList(user._id, token).then((data = []) => {
            if (data && data.error) {
                console.log(data.error);
            } else {
                setOrders(data);
            }
        });
    };

    const timerCountdown = () => {
        const timer =
            counter > 0 && setInterval(() => setCounter(counter - 1), 1000);
        return () => {
            console.log("check for new orders")
            setCounter(30)
        };
    };

    //TODO: load riders

    const loadRiders = () => {
        getRiders().then((data = []) => {
            if (data && data.error) {
                console.log(data.error);
            } else {
                console.log('riders data', data);
                setRidersExpress(data);
            }
        });
    };

    const loadStatusValues = () => {
        getStatusValues(user._id, token).then((data = []) => {
            if (data && data.error) {
                console.log(data.error);
            } else {
                setStatusValues(data);
            }
        });
    };

    useEffect(() => {
        loadOrders();
        loadStatusValues();
        loadUpcomingOrders();
    }, []);

    useEffect(() => {
        const timer =
            counter > 0 && setInterval(() => setCounter(counter - 1), 1000);
        return () => clearInterval(timer);
    }, [counter]);

    const showOrdersLength = () => {
        if ((orders.length + upcoming_orders.length) > 0) {
            return (
                <h6 className="text-danger display-4">
                    Current orders: {orders.length + upcoming_orders.length}
                </h6>
            );
        } else {
            return <h1 className="text-danger">No Ongoing Order</h1>;
        }
    };

    const showRiders = () => {
        if (orders.length > 0) {
            return (
                <div className="row">
                    <div className="col-md-4 offset-md-2">
                        {orders.map(
                            o => {
                                if (o.assignedRider) {
                                    return (<></>);
                                } else {
                                    console.log("needs assigning", o)
                                    return (
                                        <div className="mt-5" key={o._id} style={{ borderBottom: "5px solid indigo" }}>
                                            {/* <h2 className="mb-5">
                                        <span className="bg-primary text-white">Order ID: {o._id}</span>
                                    </h2> */}
                                            <ul className="list-group mb-2">
                                                <li className="list-group-item">{showStatus(o)}</li>
                                                <Collapsible trigger={triggerHeadUnAssigned(o)} >
                                                    <li className="list-group-item">Amount: {o.amount}+{o.deliveryFee} = {o.amount + o.deliveryFee}</li>
                                                    {/* <li className="list-group-item">Ordered by: {o.user.name}</li> */}
                                                    <Collapsible trigger={`Ordered by: ${o.user.name}`} className="list-group-item">
                                                        <>
                                                            <li className="list-group-item">Chomper number: {o.user.phone}</li>
                                                            <li className="list-group-item">Chomper email: {o.user.email}</li>
                                                            <li className="list-group-item">Chomper messenger: {o.user.messenger}</li>
                                                        </>
                                                    </Collapsible>
                                                    <li className="list-group-item">Ordered on/updated: {moment(o.createdAt).fromNow()} / {moment(o.updatedAt).fromNow()}</li>
                                                    <li className="list-group-item">Delivery Notes / Voucher: {o.deliveryNotes} / <strong>{o.voucher}</strong></li>
                                                    <Collapsible trigger="Show Products" className="list-group-item">
                                                        <>
                                                            <h3 className="my-4 font-italic">
                                                                Total products in the order:{" "}
                                                                {o.products.length}
                                                            </h3>

                                                            {o.products.map(p => (
                                                                <div
                                                                    className="mb-4"
                                                                    key={p._id}
                                                                    style={{
                                                                        padding: "20px",
                                                                        border: "1px solid indigo"
                                                                    }}
                                                                >
                                                                    {showInput("Product name", p.name)}
                                                                    {showInput("Product price", p.price)}
                                                                    {showInput("Product total", p.count)}
                                                                    {/* {showInput("Product Id", p._id)} */}
                                                                </div>
                                                            ))}
                                                        </>
                                                    </Collapsible>
                                                </Collapsible>
                                            </ul>
                                        </div>
                                    )
                                }

                            })}
                    </div>
                    <div className="col-md-4">
                        {/* INSERT RIDER NAME HERE */}
                        {([
                            // "Barge Gumogda", "Rojhun Espinosa", "Jeff Nartatez", "Angelito Legaspi", "Roselle Obina",
                            // "ELJUÑO D. REYES", "John Ryan mangilan", "Marchie Gabriel", "Jerald Payos", "Ephraim Oplimo",
                            // "Aldrin Dy", "Jimson Macaalay", "Jefferson Rivera", "Al Emran Abdul Mohammad", "Jason Reyes Hernandez",
                            // "RODEL BELARMINO TANA", "Jovel Rex C. Ordonio", "John Michael Caballes", "Kobie Suela Armada", "Jayson C. Halili",
                            // "Jerome Mondejar", "Jericho Juico Catungal", "Cyril Gamalo Macabinquil", "Bryan M. Guadalupe", "Rhostum Jhay Lubas",
                            // "Kristoffer Andrew D. Yusi", "Rey Bugarin", "Kram Anthony L. Bermudez", "Kevin Agoncillo", "Jarenz Marcaida Rubio",
                            // "Richard Yubal", "Dennis Ambrocio", "Yoshiyuki Lagman", "Eulysis H. Vapor", "Daniel Avecilla",
                            // "Stephen Arcee O. Calma", "Prince Rommel Baclayo", "Frank Bulacja", "Daryl Gillamac", 
                            // "Roland Plabbio", "Jhem Vigo", "Er Vin", "Francis Dumalaog", "Pyle Zara", "Leonard Bryan Dizon", "Kevin E. Binuya",
                            // "Ryan Paruli", "Rodel Avenido Quinos", "Rafael Bergonio", "Ram Niamed", "Steven Ortiz", "Raf Cabrera", "Junior Paulo",
                            // "Johnluc Andaya", "Julian Awa Aganan", "Eduard Isip", "Michael Joseph Siarez", "Darwin Torres", "Jon-jon Manalili",
                            // "Rommel Bryan Rebelito", "John John Gonzales", "PeeJay Mariñas Mabiniu", "Pete Natividad", "Jerome Marquez", "Norman Soriao Siamen Jr.",
                            // "Mark Anthony Resuena", "Chille Tipace", "Gheoff Ortsac Gnalupad", "Ronell Pelayo Oranza", "Ram Sanchez Mijares",
                            // "Prince Jerome Paguirigan", "Eimor Yohr Latniuq", "Santi Steven Sambajon Llagas", "Bassit M Naga", "Ryan Jamora Adea",
                            // "Kim Francis Curia", "Joarthur Peñamayor", "Ashley Custodio", 
                            "Benedicto Viray", "Carl Romero", "Zhyrus Gonzales", "Bandido Hizuka Asprec", "Ehm Bie"]).map(ridername => {
                                var isShown = false;
                                return (<div>
                                    {orders.map(
                                        orderRider => { 
                                            const { _id, assignedRider, } = orderRider;
                                            if (orderRider?.assignedRider) {
                                                if (ridername === assignedRider.name) {
                                                    isShown = true;
                                                    return (<h4> {ridername} </h4>);
                                                }
                                            }
                                        })}
                                    {orders.map(
                                        assignedOrder => {
                                            if (assignedOrder?.assignedRider) {
                                                const { _id, assignedRider, status, shop, user, updatedAt, when, address, trips, transaction_id } = assignedOrder;
                                                console.log("rider loop", assignedOrder);
                                                if (ridername === assignedRider?.name) {
                                                    console.log("assignedOrder", assignedOrder)
                                                    return (
                                                        <div className="mt-5" key={_id} style={{ borderBottom: "5px solid indigo" }}>
                                                            <ul className="list-group mb-2">
                                                                <Collapsible trigger={triggerHeadAssigned(assignedOrder)} >
                                                                    <Collapsible trigger={`Ordered by: ${assignedOrder.user.name}`} className="list-group-item">
                                                                        <>
                                                                            <li className="list-group-item">Chomper number: {assignedOrder.user.phone}</li>
                                                                            <li className="list-group-item">Chomper email: {assignedOrder.user.email}</li>
                                                                            <li className="list-group-item">Chomper messenger: {assignedOrder.user.messenger}</li>
                                                                        </>
                                                                    </Collapsible>
                                                                    <li className="list-group-item">Amount: {assignedOrder.amount}+{assignedOrder.deliveryFee} = {assignedOrder.amount + assignedOrder.deliveryFee}</li>
                                                                    <li className="list-group-item">Ordered on/updated: {moment(assignedOrder.createdAt).fromNow()} / {moment(assignedOrder.updatedAt).fromNow()}</li>
                                                                    <li className="list-group-item">Delivery Notes / Voucher: {assignedOrder.deliveryNotes} / <strong>{assignedOrder.voucher}</strong></li>
                                                                    <li className="list-group-item">Rider messenger: {assignedRider.messenger}</li>
                                                                    <li className="list-group-item">{showOrderedStatus(assignedOrder)}</li>
                                                                    <li className="list-group-item">{showOrderStatus(assignedOrder)}</li>
                                                                    <Collapsible trigger="Show Products" className="list-group-item">
                                                                        <>
                                                                            <h3 className="my-4 font-italic">
                                                                                Total products in the order:{" "}
                                                                                {assignedOrder.products.length}
                                                                            </h3>

                                                                            {assignedOrder.products.map(p => (
                                                                                <div
                                                                                    className="mb-4"
                                                                                    key={p._id}
                                                                                    style={{
                                                                                        padding: "20px",
                                                                                        border: "1px solid indigo"
                                                                                    }}
                                                                                >
                                                                                    {showInput("Product name", p.name)}
                                                                                    {showInput("Product price", p.price)}
                                                                                    {showInput("Product total", p.count)}
                                                                                    {/* {showInput("Product Id", p._id)} */}
                                                                                </div>
                                                                            ))}
                                                                        </>
                                                                    </Collapsible>
                                                                </Collapsible>
                                                            </ul>

                                                            {/* {trips.map(p => (
                                                <div
                                                    className="mb-4"
                                                    key={p._id}
                                                    style={{
                                                        padding: "20px",
                                                        border: "1px solid indigo"
                                                    }}
                                                >
                                                    {showInput("Trip Embed URL", p.views.embed_url)}
                                                    
                                                </div>
                                            ))} */}
                                                        </div>
                                                    )
                                                }
                                            }
                                        })}
                                </div>)
                                isShown = false;
                            })}
                    </div>
                </div>
            )
        }
        else {
            return (<></>);
        }
    }

    const showInput = (key, value) => (
        <div className="input-group mb-2 mr-sm-2">
            <div className="input-group-prepend">
                <div className="input-group-text">{key}</div>
            </div>
            <input
                type="text"
                value={value}
                className="form-control"
                readOnly
            />
        </div>
    );

    const handleStatusChange = (e, orderId) => {
        updateOrderDeliveryStatus(orderId, e.target.value)
            .then((data = []) => {
                if (data && data.error) {
                    console.log("Assigned Rider failed");
                } else {
                    loadOrders(); // this will update the status
                }
            })
    }

    const handleSMSSend = e => {
        e.preventDefault();
        // make request to api to create category
        sendSMS({ number, message: smsMessage })
            .then(data => {
                if (data.error) {
                    alert('Unsent - something went wrong')
                } else {
                    alert('Message sent')
                    setNumber('');
                    setSMSMessage('')
                }
            });
    }

    const handleChangeNumber = e => {
        setNumber(e.target.value);
    };

    const handleChangeMessage = e => {
        setSMSMessage(e.target.value);
    };

    const showSMSForm = o => (
        <form onSubmit={handleSMSSend}>
            <div className="form-group">
                <label className="text-muted">Phone:</label>
                <input
                    type="text"
                    className="form-control"
                    onChange={handleChangeNumber}
                    value={number}
                    autoFocus
                    required
                />
                <label className="text-muted">Message:</label>
                <input
                    type="text"
                    className="form-control"
                    onChange={handleChangeMessage}
                    value={smsMessage}
                    autoFocus
                    required
                />
            </div>
            <button className="btn btn-outline-primary">Send SMS</button>
        </form>
    );

    const handleOrderStatusChange = (e, orderId) => {

        if (e.target.value === 'Cancelled' || e.target.value === 'Rejected') {
            var statusMessage = prompt("Please enter status message", "Merchant not available. Exceeded 10 mins");

            if (statusMessage) {
                updateOrderStatus(user._id, token, orderId, e.target.value, statusMessage)
                    .then((data = []) => {
                        if (data && data.error) {
                            console.log("Order Status update failed");
                        } else {
                            loadUpcomingOrders(); // this will update the status
                        }
                    })
            }
        } else {
            var statusMessage = '';
            statusMessage = prompt("Enter Rider Details/When delivered", "Rider name: - Rider handled on messenger");
            console.log(orderId)
            updateOrderStatus(user._id, token, orderId, e.target.value, statusMessage)
                .then((data = []) => {
                    if (data && data.error) {
                        console.log("Order Status update failed");
                    } else {
                        loadUpcomingOrders(); // this will update the status
                    }
                })

        }
    }

    const showOrderedStatus = o => (
        <div className="form-group">
            {/* <h3 className="mark mb-4">Status: {o.status}</h3> */}
            <select
                className="form-control"
                onChange={e => handleStatusChange(e, o._id)}
            >
                <option>{o.assignedRider?.name}</option>
                <option value="">Remove assignment</option>
                {/* <option value="5f8cfc5e93c7210017793840">Barge Gumogda - Q2 </option>
                <option value="5fd19ee8a8587b00173ce966">Jefferson Nartatez - Q1 - </option>
                <option value="5fd6c05537ce798f3036f872">Rojhun Espinosa - Q3</option>
                <option value="5fd6c2bc37ce798f3036f873">Angelito Legaspi - Q4 </option>
                <option value="5ff83a6203241a0017e98676">Roselle Obina  - On Call </option>
                <option value="6000102019c8800017a91b1a">ELJUÑO D. REYES  - On Call </option>
                <option value="6000102019c8800017a91b1b">John Ryan mangilan - On Call </option>
                <option value="6006885eb8388200173f636e">Marchie Gabriel - On Call </option>
                <option value="6006a537dbe1760017ff0e27">Jerald Payos - On Call </option>
                <option value="6006a559dbe1760017ff0e28">Ephraim Oplimo - On Call </option>
                <option value="60080782fe45f50017ee696f">Aldrin Dy - On Call </option>
                <option value="60090e164ac7c90017c9e55d">Jimson Macaalay - On Call </option>
                <option value="60093d614ac7c90017c9e590">Jefferson Rivera - On Call </option>
                <option value="600a885c7abaac0017083812">Al Emran Abdul Mohammad - On Call </option>
                <option value="6010bceb98afb3001777459c">RODEL BELARMINO TANA - On Call </option>
                <option value="6010bdd898afb3001777459d">Jason Reyes Hernandez - On Call </option>
                <option value="6010c6dff2f8570017d5e5ed">Jovel Rex C. Ordonio - On Call </option>
                <option value="6010c8b9942c600017ee74a4">John Michael Caballes - On Call</option>
                <option value="6010eb92ebc511001735d930">Kobie Suela Armada - On Call</option>
                <option value="601222ef1b1b600017aadbcb">Jayson C. Halili - On Call</option>
                <option value="6017b015d820b3001766dafc">Jerome Mondejar - On Call</option>
                <option value="6017d3a057e33c001732ea4d">Jericho Juico Catungal - On Call</option>
                <option value="601a6cc13020770017294b8a">Cyril Gamalo Macabinquil - On Call</option>
                <option value="601b5d0e2293e40017c2799b">Bryan M. Guadalupe - On Call</option>
                <option value="601b8b10856a960017c9c854">Rhostum Jhay Lubas - On Call</option>
                <option value="601bb811db112300173c8d53">Kristoffer Andrew D. Yusi - On Call</option>
                <option value="601bbb980035c80017aa4aee">Rey Bugarin - On Call</option>
                <option value="60224c2ee54d79001791026d">Kram Anthony L. Bermudez - On Call</option>
                <option value="6022891cb4ac460017552047">Kevin Agoncillo - On Call</option>
                <option value="60233eb00dbec00017835006">Jarenz Marcaida Rubio - On Call</option>
                <option value="60234ba55bcee1001726d7ae">Richard Yubal - On Call</option>
                <option value="6023a0c9a87f0200176a6626">Dennis Ambrocio - On Call</option>
                <option value="6023a46880b4e70017058260">Yoshiyuki Lagman - On Call</option>
                <option value="6024bbee71312200172ef482">Eulysis H. Vapor - On Call</option>
                <option value="60262014dd1b4d0017e38fd3">Daniel Avecilla - On Call</option>
                <option value="6026219fdd1b4d0017e38fd4">Stephen Arcee O. Calma - On Call</option>
                <option value="602a138b36775e00178e0b03">Prince Rommel Baclayo - On Call</option>
                <option value="602a1731b9136000173d258b">Frank Bulacja - On Call</option>
                <option value="602b88bb6b5a4f00174efa9f">Daryl Gillamac - On Call </option>
                <option value="602c9cf9cf6be60017cb0f0f">Roland Plabbio - On Call </option>
                <option value="602cccc7f00b4a0017470cc8">Jhem Vigo - On Call </option>
                <option value="602cd67f7a819a00177cec66">Er Vin - On Call </option>
                <option value="602d3d8c335c5c0017ff8500">Francis Dumalaog - On Call </option>
                <option value="602d383f335c5c0017ff84ff">Pyle Zara - On Call </option>
                <option value="602d0fc9335c5c0017ff84f8">Leonard Bryan Dizon - On Call </option>
                <option value="602df5430d05510017a57d3d">Kevin E. Binuya - On Call </option>
                <option value="602df8c270b6de00175ccd8f">Ryan Paruli - On Call </option>
                <option value="602e17a40635f70017d3f24c">Rodel Avenido Quinos - On Call </option>
                <option value="602e2bb4eac687001752144d">Rafael Bergonio - On Call </option>
                <option value="602e40e93321b60017274f3a">Ram Niamed - On Call </option>
                <option value="602f273730f155001776f2eb">Steven Ortiz - On Call </option>
                <option value="602f27ff30f155001776f2ec">Raf Cabrera - On Call </option>
                <option value="602f61781361460017435bc3">Junior Paulo - On Call </option>
                <option value="602f952b88f12d0017748bd0">Johnluc Andaya - On Call </option>
                <option value="602fc12add4f27001786b9c7">Julian Awa Aganan - On Call </option>
                <option value="603335220df2db00177cfd1f">Eduard Isip - On Call </option>
                <option value="60337d663e7cec0017b614d0">Michael Joseph Siarez - On Call </option>
                <option value="6033a9620ed0a10017d8b3fd">Darwin Torres - On Call </option>
                <option value="60344b8f56d2cf0017c0f585">Jon-jon Manalili - On Call </option>
                <option value="6034a7e830021f0017e79267">Rommel Bryan Rebelito - On Call </option>
                <option value="6034aac0a1ff0b001764cbd8">John John Gonzales - On Call </option>
                <option value="6034b09703a5dc0017cf44aa">PeeJay Mariñas Mabiniu - On Call </option>
                <option value="6034baebf23e4200179e0b64">Pete Natividad - On Call </option>
                <option value="6035be672563a30017ff7338">Jerome Marquez - On Call </option>
                <option value="603709ea8828520017a7aaf9">Norman Soriao Siamen Jr. - On Call </option>
                <option value="60373adb310afa00170f7986">Mark Anthony Resuena - On Call </option>
                <option value="6039d7460abc570017a6d9a1">Chille Tipace - On Call </option>
                <option value="603cea52abf89c001736f629">Gheoff Ortsac Gnalupad - On Call </option>
                <option value="603ddabb6bdd9e00176d4061">Ronell Pelayo Oranza - On Call </option>
                <option value="603ddf111b4f1700178ae9c3">Ram Sanchez Mijares - On Call </option>
                <option value="603df19fba1bd700176fc9b8">Prince Jerome Paguirigan - On Call </option>
                <option value="603f2122760871001720c458">Eimor Yohr Latniuq - On Call </option>
                <option value="60409b8858037b00170766ca">Santi Steven Sambajon Llagas - On Call </option>
                <option value="6040b0c1e5ed600017e7c787">Bassit M Naga - On Call </option>
                <option value="6045d623810f0a0017926dba">Ryan Jamora Adea - On Call </option>
                <option value="6047799c2f626a00170b4d7b">Kim Francis Curia - On Call </option>
                <option value="60484c2912897a001796ce7e">Joarthur Peñamayor - On Call </option>
                <option value="604857be587a02001711a2ec">Ashley Custodio - On Call </option> */}
                <option value="602c905f9e815e00173a98f7">Benedicto Viray - On Call </option>
                <option value="60489bd4add9e80017034797">Carl Romero - On Call </option>
                <option value="6048c99b21511e0017d99859">Zhyrus Gonzales - On Call </option>
                <option value="60587b9cc135fc00171994c9">Bandido Hizuka Asprec - On Call </option>
                <option value="606a8c27f8cc9700179cb523">Ehm Bie - On Call </option>
                {/* INSERT NEW RIDER */}
                {/* {statusValues.map((status, index) => (
                    <option key={index} value={status}>
                        {status}
                    </option>
                ))} */}
            </select>
        </div>
    );

    const showStatus = o => (
        <div className="form-group">
            {/* <h3 className="mark mb-4">Status: {o.status}</h3> */}
            <select
                className="form-control"
                onChange={e => handleStatusChange(e, o._id)}
            >
                <option>Assign Rider</option>
                {/* <option value="5f8cfc5e93c7210017793840">Barge Gumogda - Q2</option>
                <option value="5fd19ee8a8587b00173ce966">Jefferson Nartatez - Q1 </option>
                <option value="5fd6c05537ce798f3036f872">Rojhun Espinosa - Q3</option>
                <option value="5fd6c2bc37ce798f3036f873">Angelito Legaspi - Q4</option>
                <option value="5ff83a6203241a0017e98676">Roselle Obina  - On Call </option>
                <option value="6000102019c8800017a91b1a">ELJUÑO D. REYES  - On Call </option>
                <option value="6000102019c8800017a91b1b">John Ryan mangilan - On Call </option>
                <option value="6006885eb8388200173f636e">Marchie Gabriel - On Call </option>
                <option value="6006a537dbe1760017ff0e27">Jerald Payos - On Call </option>
                <option value="6006a559dbe1760017ff0e28">Ephraim Oplimo - On Call </option>
                <option value="60080782fe45f50017ee696f">Aldrin Dy - On Call </option>
                <option value="60090e164ac7c90017c9e55d">Jimson Macaalay - On Call </option>
                <option value="60093d614ac7c90017c9e590">Jefferson Rivera - On Call </option>
                <option value="600a885c7abaac0017083812">Al Emran Abdul Mohammad - On Call </option>
                <option value="6010bceb98afb3001777459c">RODEL BELARMINO TANA - On Call </option>
                <option value="6010bdd898afb3001777459d">Jason Reyes Hernandez - On Call </option>
                <option value="6010c6dff2f8570017d5e5ed">Jovel Rex C. Ordonio - On Call </option>
                <option value="6010c8b9942c600017ee74a4">John Michael Caballes - On Call</option>
                <option value="6010eb92ebc511001735d930">Kobie Suela Armada - On Call</option>
                <option value="601222ef1b1b600017aadbcb">Jayson C. Halili - On Call</option>
                <option value="6017b015d820b3001766dafc">Jerome Mondejar - On Call</option>
                <option value="6017d3a057e33c001732ea4d">Jericho Juico Catungal - On Call</option>
                <option value="601a6cc13020770017294b8a">Cyril Gamalo Macabinquil - On Call</option>
                <option value="601b5d0e2293e40017c2799b">Bryan M. Guadalupe - On Call</option>
                <option value="601b8b10856a960017c9c854">Rhostum Jhay Lubas - On Call</option>
                <option value="601bb811db112300173c8d53">Kristoffer Andrew D. Yusi - On Call</option>
                <option value="601bbb980035c80017aa4aee">Rey Bugarin - On Call</option>
                <option value="60224c2ee54d79001791026d">Kram Anthony L. Bermudez - On Call</option>
                <option value="6022891cb4ac460017552047">Kevin Agoncillo - On Call</option>
                <option value="60233eb00dbec00017835006">Jarenz Marcaida Rubio - On Call</option>
                <option value="60234ba55bcee1001726d7ae">Richard Yubal - On Call</option>
                <option value="6023a0c9a87f0200176a6626">Dennis Ambrocio - On Call</option>
                <option value="6023a46880b4e70017058260">Yoshiyuki Lagman - On Call</option>
                <option value="6024bbee71312200172ef482">Eulysis H. Vapor - On Call</option>
                <option value="60262014dd1b4d0017e38fd3">Daniel Avecilla - On Call</option>
                <option value="6026219fdd1b4d0017e38fd4">Stephen Arcee O. Calma - On Call</option>
                <option value="602a138b36775e00178e0b03">Prince Rommel Baclayo - On Call</option>
                <option value="602a1731b9136000173d258b">Frank Bulacja - On Call</option>
                <option value="602b88bb6b5a4f00174efa9f">Daryl Gillamac - On Call </option>
                <option value="602c9cf9cf6be60017cb0f0f">Roland Plabbio - On Call </option>
                <option value="602cccc7f00b4a0017470cc8">Jhem Vigo - On Call </option>
                <option value="602cd67f7a819a00177cec66">Er Vin - On Call </option>
                <option value="602d3d8c335c5c0017ff8500">Francis Dumalaog - On Call </option>
                <option value="602d383f335c5c0017ff84ff">Pyle Zara - On Call </option>
                <option value="602d0fc9335c5c0017ff84f8">Leonard Bryan Dizon - On Call </option>
                <option value="602df5430d05510017a57d3d">Kevin E. Binuya - On Call </option>
                <option value="602df8c270b6de00175ccd8f">Ryan Paruli - On Call </option>
                <option value="602e17a40635f70017d3f24c">Rodel Avenido Quinos - On Call </option>
                <option value="602e2bb4eac687001752144d">Rafael Bergonio - On Call </option>
                <option value="602e40e93321b60017274f3a">Ram Niamed - On Call </option>
                <option value="602f273730f155001776f2eb">Steven Ortiz - On Call </option>
                <option value="602f27ff30f155001776f2ec">Raf Cabrera - On Call </option>
                <option value="602f61781361460017435bc3">Junior Paulo - On Call </option>
                <option value="602f952b88f12d0017748bd0">Johnluc Andaya - On Call </option>
                <option value="602fc12add4f27001786b9c7">Julian Awa Aganan - On Call </option>
                <option value="603335220df2db00177cfd1f">Eduard Isip - On Call </option>
                <option value="60337d663e7cec0017b614d0">Michael Joseph Siarez - On Call </option>
                <option value="6033a9620ed0a10017d8b3fd">Darwin Torres - On Call </option>
                <option value="60344b8f56d2cf0017c0f585">Jon-jon Manalili - On Call </option>
                <option value="6034a7e830021f0017e79267">Rommel Bryan Rebelito - On Call </option>
                <option value="6034aac0a1ff0b001764cbd8">John John Gonzales - On Call </option>
                <option value="6034b09703a5dc0017cf44aa">PeeJay Mariñas Mabiniu - On Call </option>
                <option value="6034baebf23e4200179e0b64">Pete Natividad - On Call </option>
                <option value="6035be672563a30017ff7338">Jerome Marquez - On Call </option>
                <option value="603709ea8828520017a7aaf9">Norman Soriao Siamen Jr. - On Call </option>
                <option value="60373adb310afa00170f7986">Mark Anthony Resuena - On Call </option>
                <option value="6039d7460abc570017a6d9a1">Chille Tipace - On Call </option>
                <option value="603cea52abf89c001736f629">Gheoff Ortsac Gnalupad - On Call </option>
                <option value="603ddabb6bdd9e00176d4061">Ronell Pelayo Oranza - On Call </option>
                <option value="603ddf111b4f1700178ae9c3">Ram Sanchez Mijares - On Call </option>
                <option value="603df19fba1bd700176fc9b8">Prince Jerome Paguirigan - On Call </option>
                <option value="603f2122760871001720c458">Eimor Yohr Latniuq - On Call </option>
                <option value="60409b8858037b00170766ca">Santi Steven Sambajon Llagas - On Call </option>
                <option value="6040b0c1e5ed600017e7c787">Bassit M Naga - On Call </option>
                <option value="6045d623810f0a0017926dba">Ryan Jamora Adea - On Call </option>
                <option value="6047799c2f626a00170b4d7b">Kim Francis Curia - On Call </option>
                <option value="60484c2912897a001796ce7e">Joarthur Peñamayor - On Call </option>
                <option value="604857be587a02001711a2ec">Ashley Custodio - On Call </option> */}
                <option value="602c905f9e815e00173a98f7">Benedicto Viray - On Call </option>
                <option value="60489bd4add9e80017034797">Carl Romero - On Call </option>
                <option value="6048c99b21511e0017d99859">Zhyrus Gonzales - On Call </option>
                <option value="60587b9cc135fc00171994c9">Bandido Hizuka Asprec - On Call </option>
                <option value="606a8c27f8cc9700179cb523">Ehm Bie - On Call </option>
                {/* INSERT NEW RIDER */}
                {/* {statusValues.map((status, index) => (
                    <option key={index} value={status}>
                        {status}
                    </option>
                ))} */}
            </select>
        </div>
    );

    const showOrderStatus = o => (
        <div className="form-group" style={{ display: 'inline-block' }}>
            {/* <h3 className="mark mb-4">Status: {o.status}</h3> */}
            {o?.origin?.address ? <select
                className="form-control"
                onChange={e => handleOrderStatusChange(e, o._id)}
            >
                <option>{o.status}</option>
                <option value="Accepted">Accepted </option>
                <option value="Cancelled">Cancelled</option>
                <option value="Rejected">Rejected</option>
                <option value="Looking for a Rider"> Looking for a Rider</option>
                <option value="On the way to pickup">On the way to pickup</option>
                <option value="Arrived on pickup point">Arrived on Pickup</option>
                <option value="Picked up">Picked up</option>
                <option value="Delivery on the way">Delivery on the way</option>
                <option value="Arrived">Arrived</option>
                <option value="Delivered">Delivered</option>
                {/* {statusValues.map((status, index) => (
                    <option key={index} value={status}>
                        {status}
                    </option>
                ))} */}
            </select> :
                <select
                    className="form-control"
                    onChange={e => handleOrderStatusChange(e, o._id)}
                >
                    <option>{o.status}</option>
                    <option value="Not processed">Not processed (Accept Payment)</option>
                    <option value="Accepted">Accepted</option>
                    <option value="Cancelled">Cancelled</option>
                    <option value="Rejected">Rejected</option>
                    <option value="On the way">On the way</option>
                    <option value="Arrived on Merchant">Arrived on Merchant</option>
                    <option value="Picked up">Picked up</option>
                    <option value="Order on the way">Order on the way</option>
                    <option value="Arrived">Arrived</option>
                    <option value="Delivered">Delivered</option>
                    {/* {statusValues.map((status, index) => (
                    <option key={index} value={status}>
                        {status}
                    </option>
                ))} */}
                </select>
            }
        </div>
    );
    // accepetd
    const triggerHeadUnAssigned = o => (
        o?.origin?.address ? <>
            <li className="list-group-item">Transaction ID:  {o.transaction_id}</li>
            <RemoveInSparkExpress id= {o._id}/> 
            <li className="list-group-item">Status: {showOrderStatus(o)}</li>
            {/* {/* <li className="list-group-item">Shop Name: {o.shop.name}</li> */}
            <li className="list-group-item">Parcel Delivery</li>
            <li className="list-group-item">Ordered On/ Expected:  {moment(o.createdAt).fromNow()}  /{o.when === 'ASAP' ? <>ASAP</> : <>{moment(o.createdAt).fromNow()}/ {moment(o.when).fromNow()} </>}</li>
            {/* <li className="list-group-item">Ordered on: {moment(o.createdAt).fromNow()}</li> */}
            <li className="list-group-item">Pick up: {o.origin.address}</li>
            <li className="list-group-item">Pick up person: {o.origin.person}</li>
            <li className="list-group-item">Pick up contact: {o.origin.number}</li>

            <li className="list-group-item">Drop Off: {o.destination.address}</li>
            <li className="list-group-item">Drop Off person: {o.destination.person}</li>
            <li className="list-group-item">Drop Off contact: {o.destination.number}</li>
            <li className="list-group-item">payment from: {o.paymentFrom}</li>
            {/*pabili*/}
            {
                o?.pabili.items.length > 0 ? <>
                    <li className="list-group-item">Pabili Items{
                        o.pabili.items.map(item => <> {item.quantity} {item.name}, </>)
                    }</li>
                    <li className="list-group-item">Pabili Estimated Amount: {o.pabili.amount}</li>
                </> : <></>
            }
        </>
            :
            <>
                <li className="list-group-item">Transaction ID:  {o.transaction_id} </li>
                <li className="list-group-item">Status: {showOrderStatus(o)}</li>
               <RemoveInSparkExpress id = {o._id}/>
                {/* {/* <li className="list-group-item">Shop Name: {o.shop.name}</li> */}
                <Collapsible trigger={`Shop Name: ${o.shop.name}`} className="list-group-item">
                    <>
                        <li className="list-group-item">Merchant name: {o.shop.user.name}</li>
                        <li className="list-group-item">Merchant number: {o.shop.user.phone}</li>
                        <li className="list-group-item">Merchant email: {o.shop.user.email}</li>
                    </>
                </Collapsible>
                <li className="list-group-item">Ordered On/ Expected: {moment(o.createdAt).fromNow()}/ {moment(o.when).fromNow()}</li>
                {/* <li className="list-group-item">Ordered on: {moment(o.createdAt).fromNow()}</li> */}
                <li className="list-group-item">Pick up: {o.shop.address}</li>
                <li className="list-group-item">Drop Off: {o.address}</li>
            </>
    );

    // upcoming orders
    const triggerHeadUpcomingUnAssigned = o => (

        o?.origin.coordinates.length > 0 ? <>
            <li className="list-group-item">Transaction ID:{o.transaction_id} </li>
            <Collapsible trigger={`Parcel Delivery`} className="list-group-item">
                <>
                    <li className="list-group-item">Pickup point:{o.origin.address} </li>
                    <li className="list-group-item">Pickup person:{o.origin.person} </li>
                    <li className="list-group-item">Pickup contact:{o.origin.number} </li>

                    <li className="list-group-item">Dropoff point: {o.destination.address}</li>
                    <li className="list-group-item">Dropoff person: {o.destination.person}</li>
                    <li className="list-group-item">Dropoff contact: {o.destination.number}</li>

                    <li className="list-group-item">Payment from: {o.paymentFrom}</li>
                    {/*pabili*/}
                    {
                        o?.pabili.items.length > 0 ? <>
                            <li className="list-group-item">Pabili Items{
                                o.pabili.items.map(item => <> {item.quantity} {item.name}, </>)
                            }</li>
                            <li className="list-group-item">Pabili Estimated Amount: {o.pabili.amount}</li>
                        </> : <></>
                    }
                </>
            </Collapsible>
            <li className="list-group-item">Ordered On/ Expected:{moment(o.createdAt).format('MMMM Do YYYY, h:mm:ss a')} /{o.when === 'ASAP' ? 'ASAP' : moment(o.when).format('MMMM Do YYYY, h:mm:ss a')}</li>
            <li className="list-group-item">Delivery Notes / Voucher: {o.deliveryNotes} / <strong>{o.voucher}</strong></li>

        </> :
            <>
                {/* <li className="list-group-item">Transaction ID:  {o.transaction_id}</li> */}
                {/* <li className="list-group-item">Status: {o.status}</li> */}
                {/* <li className="list-group-item">Shop Name: {o.shop.name}</li> */}
                <li className="list-group-item"><div
                    className="btn input-group-append btn__container"
                    style={{ border: "none" }}
                >
                    <RemoveInSparkExpress id = {o._id}/>
                </div></li>
                <li className="list-group-item">Transaction ID:{o.transaction_id}  - Amount: {o.amount}+{o.deliveryFee} = {o.amount + o.deliveryFee}  </li>
                <Collapsible trigger={`Shop Name: ${o.shop.name}`} className="list-group-item">
                    <>
                        <li className="list-group-item">Merchant name: {o.shop.user.name}</li>
                        <li className="list-group-item">Merchant number: {o.shop.user.phone}</li>
                        <li className="list-group-item">Merchant email: {o.shop.user.email}</li>
                    </>
                </Collapsible>
                <li className="list-group-item">Ordered On/ Expected: {moment(o.createdAt).fromNow()}/ {moment(o.when).fromNow()}</li>
                <li className="list-group-item">Delivery Notes / Voucher: {o.deliveryNotes} / <strong>{o.voucher}</strong></li>
                {/* <li className="list-group-item">Pick up: {o.shop.address}</li>
            <li className="list-group-item">Drop Off: {o.address}</li> */}
            </>
    );
    // assigned
    const triggerHeadAssigned = o => (

        o?.origin?.address ?
            <>
                <li className="list-group-item">Transaction ID: {o.transaction_id}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Status: <strong>{o.status}</strong></li>
                <li className="list-group-item">Ordered On/ Expected: {moment(o.createdAt).fromNow()}/ {moment(o.when).fromNow()}</li>
                <li className="list-group-item">{showOrderStatus(o)}</li>
                {/* <li className="list-group-item">Pick up: {o.shop.address}  ({o.shop.name})</li> */}
                <Collapsible trigger={`Pick up: ${o.origin.address}`} className="list-group-item">
                    <>
                        {/* <li className="list-group-item">Pickup address: {o.origin.address}</li> */}
                        <li className="list-group-item">Pickup name: {o.origin.person}</li>
                        <li className="list-group-item">Pickup number: {o.origin.number}</li>
                    </>
                </Collapsible>
                <li className="list-group-item">Drop Off Address: {o.destination.address}</li>
                <li className="list-group-item">Drop Off name: {o.destination.person}</li>
                <li className="list-group-item">Drop Off number: {o.destination.number}</li>
                <li className="list-group-item">Payment from: {o.paymentFrom}</li>
                {
                    o?.pabili.items.length > 0 ? <>
                        <li className="list-group-item">Pabili Items{
                            o.pabili.items.map(item => <> {item.quantity} {item.name}, </>)
                        }</li>
                        <li className="list-group-item">Pabili Estimated Amount: {o.pabili.amount}</li>
                    </> : <></>
                }
            </> :
            <>
                <li className="list-group-item">Transaction ID: {o.transaction_id}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Status: <strong>{o.status}</strong></li>
                <li className="list-group-item">Ordered On/ Expected: {moment(o.createdAt).fromNow()}/ {moment(o.when).fromNow()}</li>
                <li className="list-group-item">{showOrderStatus(o)}</li>
                {/* <li className="list-group-item">Pick up: {o.shop.address}  ({o.shop.name})</li> */}
                <Collapsible trigger={`Pick up: ${o.shop.address}  (${o.shop.name})`} className="list-group-item">
                    <>
                        <li className="list-group-item">Merchant name: {o.shop.user.phone}</li>
                        <li className="list-group-item">Merchant number: {o.shop.user.phone}</li>
                        <li className="list-group-item">Merchant email: {o.shop.user.email}</li>
                    </>
                </Collapsible>
                <li className="list-group-item">Drop Off: {o.address}</li>
            </>
    )


    return (
        <Layout >
            <div className="">
                <Jumbotron title="Order Delivery" description="Order tracking" />
            </div>

            <div className="container">

                {((upcoming_orders.length + orders.length) != 0) ?
                    <Collapsible trigger={`Send SMS`} className="list-group-item">
                        <>
                            {showSMSForm()}
                        </>
                    </Collapsible> : <></>}
                {(upcoming_orders.length != 0) ? <h6>New Orders</h6> : <></>}
                <div className='row'>
                    {upcoming_orders.map(
                        o => {
                            if (o.assignedRider) {
                                console.log(o)
                            } else {
                                console.log("upcoming order", o);
                                return (
                                    <div className="col-md" key={o._id} style={{ borderBottom: "5px solid indigo" }}>
                                        <ul className="list-group mb-2">
                                            <li className="list-group-item">{showOrderStatus(o)}</li>
                                            <Collapsible trigger={triggerHeadUpcomingUnAssigned(o)} >
                                                <li className="list-group-item">Amount: {o.amount}+{o.deliveryFee} = {o.amount + o.deliveryFee}</li>
                                                {/* <li className="list-group-item">Ordered by: {o.user.name}</li> */}
                                                <Collapsible trigger={`Ordered by: ${o.user.name}`} className="list-group-item">
                                                    <>
                                                        <li className="list-group-item">Chomper number: {o.user.phone}</li>
                                                        <li className="list-group-item">Chomper email: {o.user.email}</li>
                                                    </>
                                                </Collapsible>
                                                <li className="list-group-item">Ordered on/updated: {moment(o.createdAt).fromNow()}/ {moment(o.updatedAt).fromNow()}</li>
                                                <Collapsible trigger="Show Products" className="list-group-item">
                                                    <>
                                                        <h3 className="my-4 font-italic">
                                                            Total products in the order:{" "}
                                                            {o.products.length}
                                                        </h3>

                                                        {o.products.map(p => (
                                                            <div
                                                                className="mb-4"
                                                                key={p._id}
                                                                style={{
                                                                    padding: "20px",
                                                                    border: "1px solid indigo"
                                                                }}
                                                            >
                                                                {showInput("Product name", p.name)}
                                                                {showInput("Product price", p.price)}
                                                                {showInput("Product total", p.count)}
                                                                {/* {showInput("Product Id", p._id)} */}
                                                            </div>
                                                        ))}
                                                        <li className="list-group-item">Pick up: {o.origin.coordinates.length > 0 ? o.origin.address : o.shop.address}</li>
                                                        {/* this is for pacel deliverys*/}
                                                        {o?.origin.coordinates.length > 0 ? <>
                                                            <li className="list-group-item">Pick up person: {o.origin.person}</li>
                                                            <li className="list-group-item">Pick up contact: {o.origin.phone}</li>

                                                        </> : <>

                                                        </>}
                                                        <li className="list-group-item">Drop Off: {o.destination ? o.destination.address : o.address}</li>

                                                        {
                                                            o?.destination.coordinates.length > 0 ? <>
                                                                <li className="list-group-item">Drop Off Person: {o.destination.person}</li>
                                                                <li className="list-group-item">Drop Off Contact: {o.destination.phone}</li>
                                                            </> : <> </>
                                                        }

                                                        {
                                                            o?.paymentFrom ? <>
                                                                <li className="list-group-item">Payment from: {o.paymentFrom}</li>
                                                            </> : <> </>
                                                        }

                                                        {
                                                            o?.pabili.items.length > 0 ? <>
                                                                <li className="list-group-item">Pabili Items{
                                                                    o.pabili.items.map(item => <> {item.quantity} {item.name}, </>)
                                                                }</li>
                                                                <li className="list-group-item">Pabili Estimated Amount: {o.pabili.amount}</li>
                                                            </> : <></>
                                                        }
                                                        <li className="list-group-item">Delivery Notes / Voucher: {o.deliveryNotes} / <strong>{o.voucher}</strong></li>

                                                    </>
                                                </Collapsible>
                                            </Collapsible>
                                        </ul>
                                    </div>
                                )
                            }

                        })}
                </div>
            </div>
            <div className="row">
                <div className="col-md-8 offset-md-2">
                    {showOrdersLength(orders)}
                    <div>Auto refresh: {counter}</div>
                </div>
            </div>
            {showRiders()}

        </Layout>
    );
};

export default OrderDelivery;
//add order details updating
// +  product management
// + add on template