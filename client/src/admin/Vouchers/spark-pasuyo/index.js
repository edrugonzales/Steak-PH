import React, { useState, useEffect } from "react";
import Layout from "../../../core/Layout";
import { isAuthenticated } from "../../../auth";
import { Link } from "react-router-dom";
import Jumbotron from "../../../core/Jumbotron";
import moment from "moment";
import { getSparkPasuyoVouchers, createNewVoucher, deleteVoucher } from "../../apiAdmin";

import {
  Form,
  Input,
  Button,
  Checkbox,
  Modal,
  Table,
  Space,
  Radio,
  Switch,
} from "antd";

import CreateVoucher from "./createVoucher";
import EditVoucher from "./editVoucher";

const Vouchers = () => {
  const { user, token } = isAuthenticated();
  const [vouchers, setvouchers] = useState([]);
  const [create, setCreate] = useState(false);

  const [edit, setEdit] = useState(false);
  const [voucherToEdit, setVoucherToEdit] = useState({});

  const loadVouchers = () => {
    getSparkPasuyoVouchers().then((vouchers) => {
	    console.log(vouchers)
      if (!vouchers.error) {
        setvouchers(vouchers);
      }
    });
  };

  const toggleEdit = async (id) => {
    console.log(id)
    //find the voucher
    let voucher = await vouchers.find((voucher) => voucher._id === id);
    setVoucherToEdit(voucher);
    console.log(voucher)
    setEdit(true);
  };

    const removeVoucher = (id) => {
    if (window.confirm("Are you sure you want to delete the voucher?")) {
      deleteVoucher(id).then((response) => {
        console.log(response)
        loadVouchers();
      });
    }
  };


  useEffect(() => {
    loadVouchers();
  }, []);

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (text) => <a>{text}</a>,
    },
    {
      title: "Available",
      dataIndex: "available",
      key: "available",
      render: (text, { available }) => {
        return <> {available ? `Yes` : `No`} </>;
      },
    },
    {
      title: "one time use", 
      dataIndex: "one_time_use", 
      key: "one_time_use",
      render: (text, {one_time_use}) => {
        return <>{one_time_use ? `Yes` : `No`}</>
      }
    },
    {
      title: "Delivery fee discount", 
      dataIndex: "delivery_fee_discount", 
      key: "delivery_fee_discount",
    },
    {
      title: "Valid From",
      dataIndex: "valid_from",
      key: "valid_from",
      render: (text) => {
        return typeof text !== "undefined"
          ? moment(text).format("dddd, MMMM Do YYYY")
          : "Not applied";
      },
    },
    {
      title: "Valid To",
      dataIndex: "valid_to",
      key: "valid_to",
      render: (text) => {
        return typeof text !== "undefined"
          ? moment(text).format("dddd, MMMM Do YYYY")
          : "Not applied";
      },
    },
    {
      title: "Every date of month",
      dataIndex: "every_date_of_month",
      key: "every_date_of_month",
      render: (text) => {
        return text ? text : "not applied";
      },
    },
    {
      title: "Minimum Purchase",
      dataIndex: "minimum_purchase",
      key: "minimum_purchase",
      render: (text) => (text ? text : "no minimum purchase"),
    },
    {
      title: "Action",
      key: "action",
      render: (text, voucher) => (
        <>
          <Button size="middle" onClick={() => toggleEdit(voucher._id)}>
            <a>Edit</a>
          </Button>

          <Button size="middle" onClick={() => removeVoucher(voucher._id)}>
            <a>Delete</a>
          </Button>
        </>
      ),
    },
  ];

  //get the vouchers
  return (
    <Layout>
      <EditVoucher
        visible={edit}
        voucher = {voucherToEdit}
        onUpdate={() => {
          loadVouchers();
          setEdit(false);
          setVoucherToEdit({});
        }}
        handleCancel={() => {
          setVoucherToEdit({})
          setEdit(false);
        }}
      />

      <CreateVoucher
        visible={create}
        onCreate={() => {
          loadVouchers();
          setCreate(false);
        }}
        handleCancel={() => {
          setCreate(false);
        }}
      />
      <div className="">
        <Jumbotron
          title="Voucher"
          description={`G'day ${user.name}, you can manage all the orders here`}
        />
      </div>
      <div className="container">
        <div className="mb-5">go back daw</div>
        <div className="row">
          <Button onClick={() => setCreate(true)}>Create new Voucher</Button>
          <div className="col-md-12 mr-auto">
            <Table columns={columns} dataSource={vouchers} />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Vouchers;
