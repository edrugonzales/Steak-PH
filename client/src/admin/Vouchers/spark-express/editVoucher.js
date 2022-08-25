import React, { useState, useEffect } from "react";
import Layout from "../../../core/Layout";
import { isAuthenticated } from "../../../auth";
import { Link } from "react-router-dom";
import Jumbotron from "../../../core/Jumbotron";
import moment from "moment";
import { updateVoucher, createNewVoucher } from "../../apiAdmin";

import { Form, Input, Modal, Switch } from "antd";

const EditVoucher = ({
  visible = {},
  voucher,
  handleCancel,
  onUpdate = () => {},
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const { user, token } = isAuthenticated();

  const [available, setAvailable] = useState(false);
  const [oneTimeUse, setOneTimeUse] = useState(false)

  const update = (voucherToUpdate) => {
    setLoading(true);
    updateVoucher(voucherToUpdate, voucher._id, token)
      .then((response) => {
        console.log(response);
        onUpdate();
        form.resetFields();
        setLoading(false);
        setAvailable(false);
      })
      .catch(() => {
        alert("Something happened, please try again");
      });
  };

  useEffect(() => {
    console.log("voucher changed on edit voucher modal");
    setAvailable(voucher?.available);
  }, [voucher]);

  useEffect(() => {
	  form.resetFields();
  }, [visible])

  return (
    <Modal
      visible={visible}
      title="Update voucher Info"
      okText="Update"
      cancelText="Cancel"
      afterClose = {() => {
	      form.resetFields();
      }}
      onCancel={() => {
        form.resetFields();
        handleCancel();
      }}
      confirmLoading={loading}
      onOk={() => {
        form
          .validateFields()
          .then((values) => {
            values.available = available;
            update(values);
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
        initialValues={voucher}
      >
        <Form.Item name="available" label="Available">
          <Switch
            checked={available}
            onChange={() => setAvailable(!available)}
          />
        </Form.Item>
        <Form.Item name="one_time_use" label="One Time use ">
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
          label="Delivery Fee discount eg. free or 50"
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
      </Form>
    </Modal>
  );
};

export default EditVoucher;
