import React from "react";
import { BrowserRouter, Switch, Route } from "react-router-dom";
import Signup from "./user/Signup";
import SignupRider from "./user/SignupRider";
import Signin from "./user/Signin";
import Home from "./core/Home";
import Dashboard from "./user/UserDashboard";
import AdminDashboard from "./user/AdminDashboard";
import PrivateRoute from "./auth/PrivateRoute";
import AdminRoute from "./auth/AdminRoute";
import NewPassword from "./core/Newpassword";
import AddCategory from "./admin/AddCategory";
import AddProduct from "./admin/AddProduct";
import Orders from "./admin/Orders";
import OrderDelivery from "./admin/OrderDelivery";
import Shop from "./core/Shop";
import Product from "./core/Product";
import Cart from "./core/Cart";
import Result from "./core/Result";
import Profile from "./user/Profile";
import ManageProducts from "./admin/ManageProducts";
import UpdateProduct from "./admin/UpdateProduct";
import BackOffice from "./backoffice/main";
import OrderDetails from "./express/details";

import ExpressOfficeDashboard from "./express/dashboard";
import ExpressOfficeRiders from "./express/riders";
import ExpressOfficeOrders from "./express/orders";

import AddCategoryCoop from "./admin/coop/AddCategory";
import AddProductCoop from "./admin/coop/AddProduct";
import OrdersCoop from "./admin/coop/Orders";
import ManageProductsCoop from "./admin/coop/ManageProducts";
import ViewCategories from "./admin/coop/ViewCategories";

import SparkleVouchers from "./admin/Vouchers";
import SparkExpressVouchers from "./admin/Vouchers/spark-express";
import SparklePasuyo from "./admin/Vouchers/spark-pasuyo";
import BroadcastMainPage from "./admin/broadcast/BroadcastMainPage";
import ProductDiscounts from './admin/productDiscounts'
import UserDirectoryMainPage from "./admin/userdirectory/UserDirectoryMainPage";
import VortexMainPage from "./admin/vortex/VortexMainPage";

const Routes = () => {
  return (
    <BrowserRouter>
      <Switch>
        <Route path='/' exact component={Home} />
        <Route path='/shop' exact component={Shop} />
        <Route path='/search/result' exact component={Result} />
        <Route path='/signin' exact component={Signin} />
        <Route path='/signup' exact component={Signup} />
        <Route path='/rider/signup' exact component={SignupRider} />
        <PrivateRoute path='/user/dashboard' exact component={Dashboard} />
        <AdminRoute path='/admin/dashboard' exact component={AdminDashboard} />
        <AdminRoute path='/create/category' exact component={AddCategory} />
        <AdminRoute path='/create/product' exact component={AddProduct} />
        <AdminRoute path='/admin/orders' exact component={Orders} />
        <AdminRoute
          path='/admin/broadcasts'
          exact
          component={BroadcastMainPage}
        />
        <AdminRoute
          path = '/admin/product-discounts'
          exact
          component = {ProductDiscounts}
        />
        <AdminRoute
          path='/admin/userdirectory'
          exact
          component={UserDirectoryMainPage}
        />
        <AdminRoute
          path='/admin/orderdelivery'
          exact
          component={OrderDelivery}
        />
        <AdminRoute
          path='/admin/vortex'
          exact
          component={VortexMainPage}
        />
        <AdminRoute path='/admin/backoffice' exact component={BackOffice} />
        <AdminRoute
          path='/admin/orders/details/:orderId'
          exact
          component={OrderDetails}
        />
        <AdminRoute path='/admin/products' exact component={ManageProducts} />
        <AdminRoute
          path='/admin/product/update/:productId'
          exact
          component={UpdateProduct}
        />
        <Route path='/product/:productId' exact component={Product} />
        <Route path='/cart' exact component={Cart} />
        <Route path='/reset/:token' exact component={NewPassword} />
        <PrivateRoute path='/profile/:userId' exact component={Profile} />

        <AdminRoute
          path='/admin/create/coop/category'
          exact
          component={AddCategoryCoop}
        />
        <AdminRoute
          path='/admin/create/coop/product'
          exact
          component={AddProductCoop}
        />
        <AdminRoute path='/admin/coop/orders' exact component={OrdersCoop} />
        <AdminRoute
          path='/admin/coop/products'
          exact
          component={ManageProductsCoop}
        />
        <AdminRoute
          path='/admin/express'
          exact
          component={ExpressOfficeDashboard}
        />
        <AdminRoute
          path='/admin/express/riders'
          exact
          component={ExpressOfficeRiders}
        />
        <AdminRoute
          path='/admin/express/orders'
          exact
          component={ExpressOfficeOrders}
        />
        <AdminRoute
          path='/admin/coop/category'
          exact
          component={ViewCategories}
        />

        <AdminRoute path='/admin/vouchers' exact component={SparkleVouchers} />
        <AdminRoute
          path='/admin/spark-express-vouchers'
          exact
          component={SparkExpressVouchers}
        />
        <AdminRoute
          path='/admin/pasuyo-vouchers'
          exact
          component={SparklePasuyo}
        />
      </Switch>
    </BrowserRouter>
  );
};

export default Routes;
