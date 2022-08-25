import React, { useState } from "react";
import Layout from "../core/Layout";
import { Redirect } from 'react-router-dom';
import { signin, authenticate, isAuthenticated } from '../auth';
import { Admin, Resource, ListGuesser, ShowGuesser, EditGuesser, Datagrid, TextField, DateField, BooleanField, EmailField, } from 'react-admin'; // eslint-disable-line import/no-unresolved
import jsonServerProvider from 'ra-data-json-server';
import posts from './posts';
import posts2 from './posts2';
import petsProduct from './pets'
import { API } from "../config";
import Dashboard from "./dashboard";
import Jumbotron from './../core/Jumbotron'
import { useLayoutEffect } from "react";


const dataProvider = jsonServerProvider((process.env.REACT_APP_API_URL) ? `${API}` : '/api');



const BackOffice = () => {

    const showAdminBackOffice = () => {
        return(
            <Admin
        // authProvider={authProvider}
        dashboard={Dashboard}
        dataProvider={dataProvider}
        title="Sparkle Admin"
        // layout={Layout}
    >
        <Resource name="product-approval" {...posts} />
        <Resource name="shop-approval" {...posts2} />
        <Resource name="pets-product-approval" {...petsProduct} />
    </Admin>
        );
    }

    return (
        <Layout>            
            <div className="">
                <Jumbotron  title="BackOffice" description="BackOffice to Sparkle"/>
            </div>
            {showAdminBackOffice()}
            {/*This following JSON allows us to see the current object as string*/}
            {/*JSON.stringify(values)*/}
        </Layout>
    );
};

export default BackOffice;



