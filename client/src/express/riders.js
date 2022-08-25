import React  from "react";
import { Layout, Breadcrumb } from 'antd';

import Sidebar from './sidebar';
import Footer from './footer';
import ExpressRiders from './tableRiders';

const { Header, Content } = Layout;
const Dashboard = () => {

    return (
        <Layout style={{ minHeight: '100vh' }}>
        <Sidebar />
            <Layout className="site-layout">
            <Header theme="light" className="p-0 bg-white" />
            <Content className="mx-1">
                <Breadcrumb className="mx-2 my-2 px-3 pt-5">
                <Breadcrumb.Item>Manage Riders</Breadcrumb.Item>
                </Breadcrumb>
                <div className="site-layout-background" style={{ padding: 24, minHeight: 360 }}>
                    <ExpressRiders />
                </div>
            </Content>
            <Footer />
            </Layout>
        </Layout>
        )

}

export default Dashboard;