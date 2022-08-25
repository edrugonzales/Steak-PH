import React, { useState, useEffect, useCallback } from "react";
import { Table, Button, Space, Input, Tooltip, Spin  } from 'antd';
import Highlighter from 'react-highlight-words';
import { SearchOutlined, ClearOutlined  } from '@ant-design/icons';
import moment from 'moment';
import Collapsible from 'react-collapsible';
import { Link } from "react-router-dom";
import CreateRider from "./create";
import {isAuthenticated} from '../../auth';
import { getRiderList } from "../../private/requests/riders";

import './tableRiders.scss';
const riders = [{
  "5f8cfc5e93c7210017793840": "Barge Gumogda", 
  "5fd6c05537ce798f3036f872": "Rojhun Espinosa", 
  "5fd19ee8a8587b00173ce966": "Jeff Nartatez", 
  "5fd6c2bc37ce798f3036f873": "Angelito Legaspi", 
  "5fe3129b4866f60017e052b2": "Pablito J. Espelembergo"
}];

const statusType = [
  "true",
  "false"
];

const ExpressRiders = () => {
    const [riders, setRiders] = useState([]);
    const { user, token } = isAuthenticated();
    const [ values, setValues ] = useState({
        filteredInfo: null,
        sortedInfo: null,
        searchText: '',
        searchedColumn: '',
        searchInput: [],
        loading: false,
        pagination: {
          current: 1,
          pageSize: 10,
        }
    });
    
    const [filterData, setFilterData] = useState(null);
    const [visible, setVisible] = useState(false);
    const [formRef, setFormRef] = useState(null);
  
    const loadRiders = () => {
      setValues({loading: true});
      getRiderList(token).then((data = []) => {
          if (data && data.error) {
              console.log(data.error);
          } else {
            var filteredData = [];
            data.map(obj => {
              filteredData.push({
                key: obj._id,
                _id: obj._id,
                deviceId: obj.deviceId,
                name: obj.name,
                email: obj.email,
                isActive: obj.isActive,
                photo: obj.photo
              })
            });

              setRiders(filteredData);
              setValues({
                loading: false,
                pagination: {
                  ...filteredData,
                  total: filteredData.length
                } });
          }
      });
    };

    useEffect(() => {
        loadRiders();
        loadFilters();
    }, []);

    const loadFilters = () => {
      const filterArr = [];
      statusType.map(obj => {
        filterArr.push({text: obj, value: obj});
      });
      
      setValues({loading: false});
    }

    const handleChange = (pagination, filters, sorter) => {
        setValues({
        ...values,
        filteredInfo: filters,
        sortedInfo: sorter,
        });
    };
    
    const clearFilters = () => {
        setValues({ ...values, filteredInfo: null });
    };

    const clearAll = () => {
        setValues({
            ...values,
            filteredInfo: null,
            sortedInfo: null,
        });

        setFilterData(null);
    };

    const search = value => {
      if(!value) return false;
      const filterTable = (riders || []).filter(o =>
        Object.keys(o).some(k =>
          String(o[k])
            .toLowerCase()
            .includes(value.toLowerCase())
        )
      );

      setFilterData(filterTable);
    };

    const getColumnSearchProps = dataIndex => ({
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }}>
          <Input
            ref={node => {
              values.searchInput = node;
            }}
            placeholder={`Search ${dataIndex}`}
            value={selectedKeys[0]}
            onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
            onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
            style={{ width: 188, marginBottom: 8, display: 'block' }}
          />
          <Space>
            <Button
              type="primary"
              onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
              icon={<SearchOutlined />}
              size="small"
              style={{ width: 90 }}
            >
              Search
            </Button>
            <Button onClick={() => handleReset(clearFilters)} size="small" style={{ width: 90 }}>
              Reset
            </Button>
          </Space>
        </div>
      ),
      filterIcon: filtered => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
      onFilter: (value, record) =>
        record[dataIndex]
          ? record[dataIndex].toString().toLowerCase().includes(value.toLowerCase())
          : '',
      onFilterDropdownVisibleChange: visible => {
        if (visible) {
          setTimeout(() => values.searchInput.select(), 100);
        }
      },
      render: text =>
        values.searchedColumn === dataIndex ? (
          <Highlighter
            highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
            searchWords={[values.searchText]}
            autoEscape
            textToHighlight={text ? text.toString() : ''}
          />
        ) : (
          text
        ),
    });

    const handleSearch = (selectedKeys, confirm, dataIndex) => {
      confirm();
      setValues({
        ...values,
        searchText: selectedKeys[0],
        searchedColumn: dataIndex,
      });
    };
  
    const handleReset = clearFilters => {
      clearFilters();
      setValues({ ...values, searchText: '' });
    };
  
    const showInput = (key, value) => (
      <div className="input-group mr-sm-2">
          <div className="input-group-prepend border-0"  style={{backgroundColor: "#fbfbfb", width: "100px"}}>
              <div className="input-group-text border-0 p-0" style={{backgroundColor: "#fbfbfb", fontSize: "0.75rem"}}>{key}</div>
          </div>
          <input
              type="text"
              value={value}
              className="form-control border-0"
              style={{backgroundColor: "#fbfbfb", fontSize: "0.75rem"}}
              readOnly
          />
      </div>
  );

    let { sortedInfo, filteredInfo } = values;
    sortedInfo = sortedInfo || {};
    filteredInfo = filteredInfo || {};

    const columns = [
      {
        title: 'Device Id',
        dataIndex: 'deviceId',
        key: 'deviceId',
        width: '20%',
        filteredValue: filteredInfo.deviceId || null,
        onFilter: (value, record) => record.deviceId.includes(value),
        sorter: (a, b) => a.deviceId.length - b.deviceId.length,
        sortOrder: sortedInfo.columnKey === 'deviceId' && sortedInfo.order,
        ...getColumnSearchProps('deviceId')
      },
      {
        title: 'Photo',
        dataIndex: 'photo',
        render:  () => <img src={`photo`} />,
        key: 'photo',
        width: '20%'
      },
      {
        title: 'Rider',
        dataIndex: 'name',
        key: 'name',
        width: '20%',
        ...getColumnSearchProps('name')
      },
      {
        title: 'isActive',
        dataIndex: 'isActive',
        key: 'isActive',
        filters: [
          {text: "Yes", value: true},
          {text: "No", value: false}
        ],
        filteredValue: filteredInfo.isActive || null,
        onFilter: (value, record) => `${record.isActive ? "Yes" : "No"}`,
        sortOrder: sortedInfo.columnKey === 'isActive' && sortedInfo.isActive
      },
      {
        title: 'Action',
        key: 'action',
        render: (text, record) => (
          <Space size="middle">
            <Link className="nav-link" to={`/admin/riders/details/${record._id}`}>
              View details
            </Link>
          </Space>
        ),
      },
    ];

    const handleCreate = () => {
      formRef.validateFields((err, values) => {
        if (err) {
          return;
        }
        formRef.resetFields();
        setVisible(false);
      });
    };
  
    const saveFormRef = useCallback(node => {
      if (node !== null) {
        setFormRef(node);
      }
    }, []);

    

    return (
      
        <>
         <Space style={{ marginBottom: 16, float: "right" }}>
            {/* <Button onClick={setAgeSort}>Sort age</Button> */}
            <div className="filter-div">
              <Input.Search
                placeholder="Search by transaction id"
                enterButton
                onSearch={search}
              />
            </div>
            <Tooltip placement="top" title="Clear filters">
              <Button onClick={clearAll} className="d-flex justify-content-center align-items-center"><ClearOutlined /></Button>
            </Tooltip>
          </Space>
          {!values.loading ? 
            <>
              <Button type="primary" onClick={() => setVisible(true)}>
                Add Rider
              </Button>
              <CreateRider
                ref={saveFormRef}
                visible={visible}
                onCancel={() => setVisible(false)}
                onCreate={() => handleCreate()}
              />
              <Table
              columns={columns} 
              dataSource={filterData == null ? riders : filterData} 
              onChange={handleChange} 
              pagination={values.pagination}
              loading={values.loading}
              />

            </>
          :   
          (
            <Space size="middle">
              <Spin size="large" />
            </Space>
          )
          }

        </>
      )
}

export default ExpressRiders;