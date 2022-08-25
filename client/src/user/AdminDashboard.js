import React from "react";
import Layout from "../core/Layout";
import { isAuthenticated } from "../auth";
import { Link } from "react-router-dom";
import Jumbotron from "./../core/Jumbotron";
const AdminDashboard = () => {
  const {
    user: { _id, name, email, role },
  } = isAuthenticated();

  const adminLinks = () => {
    return (
      <>
        {role === 99 ? (
          <div className='card mb-5'>
            <p className='card-header'>Administrator</p>
            <ul className='list-group'>
              <li className='list-group-item'>
                <Link className='nav-link' to='/admin/userdirectory'>
                  User Directory
                </Link>
              </li>
              <li className='list-group-item'>
                <Link className='nav-link' to='/admin/backoffice'>
                  Back office
                </Link>
              </li>
              <li className='list-group-item'>
                <Link className='nav-link' to='/admin/orderdelivery'>
                  Order delivery
                </Link>
              </li>
              <li className='list-group-item'>
                <Link className='nav-link' to='/admin/vortex'>
                  Vortex
                </Link>
              </li>
              <li className='list-group-item'>
                <Link className='nav-link' to='/admin/vouchers'>
                  Sparkle Vouchers
                </Link>
              </li>
              <li className='list-group-item'>
                <Link className='nav-link' to='/admin/spark-express-vouchers'>
                  Spark Express Parcel Vouchers
                </Link>
              </li>
              <li className='list-group-item'>
                <Link className='nav-link' to='/admin/pasuyo-vouchers'>
                  Spark Express Pasuyo Vouchers
                </Link>
              </li>
              <li className='list-group-item'>
                <Link className='nav-link' to='/admin/orders'>
                  View Orders
                </Link>
              </li>
              <li className='list-group-item'>
                <Link className='nav-link' to='/admin/broadcasts'>
                  Broadcast
                </Link>
              </li>
                  <li className='list-group-item'>
                <Link className='nav-link' to='/admin/product-discounts'>
                  Product Discounts
                </Link>
              </li>
            </ul>
          </div>
        ) : (
          <></>
        )}

        {role === 99 || role === 1 ? (
          <div className='card'>
            <p className='card-header'>Merchant Links</p>
            <ul className='list-group'>
              <li className='list-group-item'>
                <Link className='nav-link' to='/create/category'>
                  Create Category
                </Link>
              </li>
              {/* <li className="list-group-item">
                                <Link className="nav-link" to="/create/product">
                                    Create Product
                                </Link>
                            </li> */}

              {/* <li className="list-group-item">
                                <Link className="nav-link" to="/admin/products">
                                    Manage Products
                                </Link>
                            </li> */}
            </ul>
          </div>
        ) : (
          <></>
        )}

        {role === 99 || role === 2 ? (
          <div className='card mt-5'>
            <p className='card-header'>Coop</p>
            <ul className='list-group'>
              <li className='list-group-item'>
                <Link className='nav-link' to='/admin/create/coop/category'>
                  Create Category
                </Link>
              </li>
              <li className='list-group-item'>
                <Link className='nav-link' to='/admin/create/coop/product'>
                  Create Product
                </Link>
              </li>
              <li className='list-group-item'>
                <Link className='nav-link' to='/admin/coop/orders'>
                  View Orders
                </Link>
              </li>
              <li className='list-group-item'>
                <Link className='nav-link' to='/admin/coop/products'>
                  Manage Products
                </Link>
              </li>
              <li className='list-group-item'>
                <Link className='nav-link' to='/admin/coop/category'>
                  Update Category Brands
                </Link>
              </li>
            </ul>
          </div>
        ) : (
          <></>
        )}
      </>
    );
  };

  const adminInfo = () => {
    return (
      <div className='card mb-5'>
        <h3 className='card-header'>User Information</h3>
        <ul className='list-group'>
          <li className='list-group-item'>{name}</li>
          <li className='list-group-item'>{email}</li>
          <li className='list-group-item'>
            {role === 0 ? "Registered User" : ""}
            {role === 1 ? "Merchant" : ""}
            {role === 2 ? "Coop Seller" : ""}
            {role === 3 ? "Rider" : ""}
            {role === 99 ? "Sparkle Admin" : ""}
          </li>
        </ul>
      </div>
    );
  };

  return (
    <Layout>
      <div className=''>
        <Jumbotron title='Dashboard' description={`Starry day ${name}!`} />
      </div>
      <div className='container'>
        <div className='row'>
          <div className='col-3'>{adminLinks()}</div>
          <div className='col-9'>{adminInfo()}</div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;
