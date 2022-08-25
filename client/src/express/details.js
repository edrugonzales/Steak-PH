import React, { useState, useEffect } from "react";
import { Layout, Breadcrumb, Card, Timeline, Space, Spin } from 'antd';
import { Link, useParams } from "react-router-dom";
import moment from 'moment';
import Sidebar from './sidebar';
import Footer from './footer';
import { getOrderDetails} from "../private/requests/orders";
import { isAuthenticated } from '../auth';

const { Meta } = Card;
const { Header, Content } = Layout;
const riders = [{
    "5f8cfc5e93c7210017793840": "Barge Gumogda", 
    "5fd6c05537ce798f3036f872": "Rojhun Espino1", 
    "5fd19ee8a8587b00173ce966": "Jeff Nartatez", 
    "5fd6c2bc37ce798f3036f873": "Angelito Legaspi", 
    "5fe3129b4866f60017e052b2": "Pablito J. Espelembergo"
}];

const OrderDetails = () => {
    const [details, setDetails] = useState([]);
    const [shopDetails, setShopDetails] = useState([]);
    const { user, token } = isAuthenticated();
    const { orderId } = useParams();
    const [loading, isLoading] = useState(false);
    
    const loadOrder = () => {
        isLoading(true);
        getOrderDetails(orderId, token).then((data = []) => {
            if (data && data.error) {
                console.log(data.error);
            } else {
                setDetails(data);
                console.log(data);
                isLoading(false);
            }
        });
    };
      
    useEffect(() => {
        loadOrder();
    }, []);

    return (
        
        <Layout style={{ minHeight: '100vh' }}>
        <Sidebar />
            <Layout className="site-layout">
            <Header theme="light" className="p-0 bg-white" />
            <Content className="mx-1">
                <Breadcrumb className="mx-2 my-2 px-3 pt-5">
                    <Breadcrumb.Item><Link className="nav-link" to={`/admin/express/orders`} className="float-left text-primary">Manage Orders</Link></Breadcrumb.Item>
                    <Breadcrumb.Item>Order</Breadcrumb.Item>
                    <Breadcrumb.Item>{orderId}</Breadcrumb.Item>
                </Breadcrumb>
                {details && !loading ? 
                <div className="site-layout-background" style={{ padding: 24, minHeight: 360 }}>
                    <div className="row">
                        <div className="col-md-9">
                            {details.trip && details.trip.length > 0 ?
                                <div className="hypertrack__container rounded-3 overflow-hidden shadow-sm" style={{height: "400px"}}>
                                    
                                        <embed src={details.trip[details.trip.length -1].views.share_url} style={{width: "100%", height: "100%"}}/>
                                
                                </div>
                            : <h3 className="d-flex justify-content-center align-items-center d-block h-15 bg-white rounded shadow-sm p-5">Hypertrack Not available</h3>}

                            <div className="row mt-4">
                                <div className="col-md-4">
                                    <Card className="rounded overflow-hidden shadow-sm">
                                    <h5 className="d-block text-black">History</h5>
                                    <hr className="mb-3"/>
                                        <Timeline>
                                            {details.history ?
                                                details.history.map( (dd, i) => {
                                                    return <Timeline.Item key={i}>{dd.status} <br /> {moment(dd.updatedAt).format('YYYY-MM-DD HH:mm a')}</Timeline.Item>
                                                }) : ""
                                            }
                                        </Timeline>
                                    </Card>
                                </div>
                                <div className="col-md-8">
                                    <Card>
                                        <h5 className="d-block text-black">Items</h5>
                                        <hr className="mb-3"/>
                                        {details.products ? details.products.map((obj, i) => {
                                            return (
                                                <div className="card border-0" key={i}>
                                                    <div className="row">
                                                        <div className="col-md-3">
                                                            <img src="" />
                                                        </div>
                                                        <div className="col-md-9">
                                                            <h5 className="mb-0">{obj.name}</h5>
                                                            <div className="d-flex w-100 mt-3">
                                                                <p className="fw-bold w-50 text-left">x{obj.count}</p>
                                                                <h5 className="w-50 text-right text-gray">P {obj.price}</h5>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        }) : ""}
                                        
                                        <hr className="mt-3" />
                                        <div className="px-2">
                                            <div className="d-flex w-100">
                                                <div className="w-75">Subtotal</div>
                                                <div className="w-25 text-right"><b>P {details.amount}</b></div>
                                            </div>
                                            <div className="d-flex w-100">
                                                <div className="w-75">Delivery Fee</div>
                                                <div className="w-25 text-right"><b>P {details.deliveryFee}</b></div>
                                            </div>
                                            <div className="d-flex w-100">
                                                <div className="w-75">Total</div>
                                                <div className="w-25 text-right"><b>P {details.deliveryFee + details.amount}</b></div>
                                            </div>
                                        </div>

                                    </Card>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <Card className="bg-primary rounded-3 overflow-hidden shadow-sm text-center mb-3">
                                <h5 className="mb-0 text-white">{details.status}</h5>
                            </Card>
                            {details.assignedRider ? 
                                <Card className="text-center rounded overflow-hidden shadow-sm mb-3">
                                    <h5 className="d-block text-left text-black">Rider</h5>
                                    <hr className="mb-3"/>
                                    {details.assignedRider.photo ? <img alt="example" src={details.assignedRider.photo} className="w-50 mb-3" draggable="false" /> : ""} 
                                    <Meta title={details.assignedRider.name} description={details.assignedRider.phone} />
                                </Card>
                            : ""}

                            {details.user ? 
                                <Card className="text-left rounded overflow-hidden shadow-sm mb-3">
                                    <h5 className="d-block text-black">Customer</h5>
                                    <hr className="mb-3"/>
                                    {details.user.photo ? <img alt="example" src={details.shop.photo} className="w-50 mb-3" draggable="false" /> : ""} 
                                    <div className="text-center mb-3">
                                        <Meta title={details.user.name} description={details.user.address} />
                                    </div>
                                    <div>Id: <b>{details.user._id}</b></div>
                                    <div>Contact No: <b>{details.user.phone}</b></div>
                                </Card>
                            : ""}

                            {details.shop ? 
                                <Card className="text-center rounded overflow-hidden shadow-sm mb-3">
                                    <h5 className="d-block text-left text-black">Merchant</h5>
                                    <hr className="mb-3"/>
                                    {details.shop.logo ? <img alt="example" src={details.shop.logo} className="w-50 mb-3" draggable="false" /> : ""} 
                                    <Meta title={details.shop.name} description={details.shop.address} />
                                </Card>
                            : ""}
                        </div>
                    </div>
                </div>
                :       
                <Space size="middle">
                    <Spin size="large" />
                </Space>
                }
            </Content>
            <Footer />
            </Layout>
        </Layout>
        )

}

export default OrderDetails;