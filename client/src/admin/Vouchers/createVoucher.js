import React, { useState, useEffect } from "react";
import Layout from "../../core/Layout";
import { isAuthenticated } from "../../auth";
import { Link } from "react-router-dom";
import Jumbotron from "../../core/Jumbotron";
import moment from "moment";
import { getVouchers, createNewVoucher } from "../apiAdmin";

import ShopsSelector from "./shopsSelector";

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

const ShopsApplicable = ({ shops }) => {
  return <div> these are the shops</div>;
};

const CreateVoucher = ({
  visible,
  handleOk,
  confirmLoading,
  handleCancel,
  onCreate,
  shopsAvailable,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const { user, token } = isAuthenticated();

  const [available, setAvailable] = useState(false);
  const [oneTimeUse, setOneTimeUse] = useState(false);
  const  [applyAutomatically, setApplyAutomatically] = useState(false)

  const [shopsSelected, setShopSelected] = useState([]);

  const handleShopsSelection = (shop) => {
    setShopSelected(shop);
  };

  const createVoucher = (voucher) => {
    setLoading(true);
    createNewVoucher(voucher, token)
      .then((response) => {
        console.log(response);
        onCreate();
        form.resetFields();
        setLoading(false);
        setAvailable(false);
      })
      .catch(() => {
        alert("Something happened, please try again");
        window.location.reload();
      });
  };

  return (
    <>
      <Modal
        visible={visible}
        title="Create a new collection"
        okText="Create"
        cancelText="Cancel"
        onCancel={handleCancel}
        confirmLoading={loading}
        onOk={() => {
          console.log(shopsSelected);
          form
            .validateFields()
            .then((values) => {
              values.apply_automatically = applyAutomatically
              values.available = available;
              values.one_time_use = oneTimeUse;
              values.shops = shopsSelected 
              console.log(shopsSelected)
              console.log(values)
              createVoucher(values);
              form.resetFields();
            })
            .catch((info) => {
              console.log("Validate Failed:", info);
            });
        }}
      >
        <Form
          form={form}
          layout="vertical"
          name="form_in_modal"
          initialValues={{ modifier: "public" }}
        >
          <Form.Item name="apply_automatically" label="Apply Automatically">
            <Switch
              checked={applyAutomatically}
              onChange={() => setApplyAutomatically(!applyAutomatically)}
            />
          </Form.Item>
          <Form.Item name="available" label="Available">
            <Switch
              checked={available}
              onChange={() => setAvailable(!available)}
            />
          </Form.Item>
          <Form.Item name="one_time_use" label="One time Use Only">
            <Switch
              checked={oneTimeUse}
              onChange={() => setOneTimeUse(!oneTimeUse)}
            />
          </Form.Item>
          <Form.Item
            name="name"
            label="Name"
            rules={[
              {
                required: true,
                message: "Please input the title of collection!",
              },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="delivery_fee_discount"
            label="Delivery Fee discount eg. free or 50 or 30%"
            rules={[
              {
                required: true,
                message: "Please input the title of collection!",
              },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="amount"
            label="Discounted amount from user's purchase, eg. 50 or 30%"
            rules={[
              {
                required: true,
                message: "Please input the title of collection!",
              },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="valid_from"
            label="Valid From (please don't fill if not required)"
          >
            <Input type="date" />
          </Form.Item>
          <Form.Item
            name="valid_to"
            label="Valid To (please don't fill if not required)"
          >
            <Input type="date" />
          </Form.Item>
          <Form.Item
            name="minimum_purchase"
            label="Minimum purchase (please don't fill if not required)"
          >
            <Input type="text" />
          </Form.Item>
          <Form.Item
            name="every_date_of_month"
            label="Every date of month (please don't fill if not required). eg. 20,21,22"
          >
            <Input type="text" />
          </Form.Item>
          <Form.Item
            name="areas"
            label="Areas (please don't fill if not required). eg. Makati,Manila"
          >
            <Input type="text" />
          </Form.Item>
        </Form>
        <div>
          <b>Shops used</b>
          <ShopsSelector
            shops={shopsAvailable}
            onChange={handleShopsSelection}
            value={shopsSelected}
          />
        </div>
      </Modal>
    </>
  );
};

export default CreateVoucher;
