import React, { useEffect, useState } from 'react';
import { Modal } from "antd";
import { isAuthenticated } from "../../../auth";
import { createRider } from "../../../private/requests/riders";

import './create.scss';

const CreateRider = ({ visible, onCancel, onCreate }) => {
  const [values, setValues] = useState({
      name: "",
      email: "",
      deviceId: "",
      isActive: false,
      photo: "",
      loading: false,
      error: "",
      redirectToProfile: false,
      formData: ""
  });

  const { user, token } = isAuthenticated();
  const {
      name,
      email,
      deviceId,
      isActive,
      photo,
      loading,
      error,
      redirectToProfile,
      formData
  } = values;

  const init = () => {
    setValues({
      ...values,
      formData: new FormData()
  });
  }

  useEffect(() => {
    init();
  }, []);

  const handleChange = name => event => {
    const value =
        name === "photo" ? event.target.files[0] : event.target.value;
    formData.set(name, value);
    setValues({ ...values, [name]: value });
  };

  const clickSubmit = event => {
    event.preventDefault();
    setValues({ ...values, error: "", loading: true });

    createRider(user._id, token, formData).then(data => {
        if (data.error) {
            setValues({ ...values, error: data.error });
        } else {
            setValues({
                ...values,
                name: "",
                email: "",
                deviceId: "",
                isActive: false,
                photo: "",
                loading: false,
                error: false
            });
        }
    });
} ;
  const showSuccess = () => {
    if (values.success) {
        return <h3 className="text-success">{values.name} is created</h3>;
    }
  };

  const showError = () => {
    if (values.error) {
        return <h3 className="text-danger">Rider already exists.</h3>;
    }
  };

  const riderForm = () => (
    <form className="mb-3">
      <div className="form-group">
          <label className="text-muted">Name</label>
          <input
            onChange={handleChange("name")}
            name="name"
            type="text"
            className="form-control"
            value={name}
            />
      </div>
      <div className="form-group">
          <label className="text-muted">Email</label>
          <input
            onChange={handleChange("email")}
            name="email"
            type="email"
            className="form-control"
            value={email}
            />
      </div>
      <div className="form-group">
          <label className="text-muted">Device Id</label>
          <input
            onChange={handleChange("deviceId")}
            name="deviceId"
            type="text"
            className="form-control"
            value={deviceId}
            />
      </div>

      <div className="form-group">
        <label className="text-muted">Account active?</label>
        <select
            onChange={handleChange("isActive")}
            name="isActive"
            className="form-control"
        >
            <option>Please select</option>
            <option value="0">No</option>
            <option value="1">Yes</option>
        </select>
      </div>
      <div className="form-group">
          <label className="btn btn-secondary">
          <input
            onChange={handleChange("photo")}
            type="file"
            name="photo"
            accept="image/*"
            />
          </label>
      </div>
    </form>
    );


    return (
        <Modal
          visible={visible}
          title="Rider form"
          okText="Submit"
          onCancel={onCancel}
          onOk={clickSubmit}
        >
        
          {riderForm()}
          {showSuccess()}
          {showError()}
        </Modal>
      );
}

export default CreateRider;