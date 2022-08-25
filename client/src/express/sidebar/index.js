import React, { useState, useEffect } from "react";
import { Layout, Menu } from 'antd';
import { signout, isAuthenticated } from '../../auth';
import {
    LogoutOutlined,
    PieChartOutlined,
    TeamOutlined,
    HomeOutlined,
    FileTextOutlined,
    DingtalkOutlined
} from '@ant-design/icons';

import './sidebar.scss';
import { Link, useHistory } from "react-router-dom";

const { Sider } = Layout;
const { SubMenu } = Menu;

const Sidebar = () => {
    const history = useHistory();
    const [values, setValues] = useState({
        collapsed: false,
    });

    const [url, setUrl] = useState("");

    const onCollapse = collapse => {
        setValues({ ...values, collapsed: collapse });
    }

    const {
        user: { _id, name, email, role }
    } = isAuthenticated();

    useEffect(() => {
        setActiveTab();
    },[])

    const setActiveTab = () => {
        const path = window.location.pathname.split('/');
        const arrayUrl = ["dashboard", "riders", "orders","products","product","category"];

        if(path[3] == undefined || path[3] == ""){
            path[3] = "dashboard";
        }

        Object.keys(arrayUrl).some(k =>{
            if(path[3] === arrayUrl[k]){
               return setUrl(k);
            }
        });
    }

    return(
        <Sider theme="light" collapsible collapsed={values.collapsed} onCollapse={onCollapse} className={`sidebar`}>
            <h5 className="logo text-center text-black mb-0 d-flex align-items-center justify-content-center" style={{ minHeight: '64px' }}>Spark Express</h5>
            <Menu theme="light" defaultSelectedKeys={JSON.stringify([url])}  selectedKeys={JSON.stringify([url])} mode="inline">
                <Menu.Item key="0" icon={<PieChartOutlined />}>
                    <Link to="/admin/express">Dashboard</Link>
                </Menu.Item>
                {/* {role === 99 ?  */}
                    <Menu.Item key="1" icon={<DingtalkOutlined />}>
                        <Link to="/admin/express/riders"> Riders </Link>
                    </Menu.Item>
                    <Menu.Item key="2" icon={<FileTextOutlined />}>
                        <Link to="/admin/express/orders"> Orders </Link>
                    </Menu.Item>
                {/* : "" } */}

                {role === 1 || role === 99 ? 
                    <SubMenu key="sub1" icon={<HomeOutlined />} title="Products">
                        <Menu.Item key="3"><Link to="/admin/products">Manage Products</Link></Menu.Item>
                        <Menu.Item key="4"><Link to="/create/product">Create Product</Link></Menu.Item>
                        <Menu.Item key="5"><Link to="/create/category">Create Category</Link></Menu.Item>
                    </SubMenu>
                : ""}

                {role === 2 || role === 99 ? 
                <SubMenu key="sub2" icon={<TeamOutlined />} title="Coop">
                    <Menu.Item key="6">Manage Products</Menu.Item>
                    <Menu.Item key="7">Create Product</Menu.Item>
                    <Menu.Item key="8">Create Category</Menu.Item>
                </SubMenu>
                : "" }

                {isAuthenticated() && (
                <Menu.Item key="9" icon={<LogoutOutlined />}  
                onClick={() => signout(() => { history.push("/"); })}>
                  Sign out
                </Menu.Item>
                )}
            </Menu>
        </Sider>      
    )
}

export default Sidebar;