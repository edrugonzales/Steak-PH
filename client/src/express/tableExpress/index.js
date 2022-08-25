import React, { useState, useEffect } from "react";
import { Table, Button, Space, Input, Tooltip, Spin  } from 'antd';
import Highlighter from 'react-highlight-words';
import { SearchOutlined, ClearOutlined  } from '@ant-design/icons';
import {isAuthenticated} from '../../auth';
import { getOrderList } from "../../private/requests/orders";
import moment from 'moment';
import Collapsible from 'react-collapsible';
import { Link } from "react-router-dom";

import './table.scss';
const riders = [{
  "5f8cfc5e93c7210017793840": "Barge Gumogda", 
  "5fd6c05537ce798f3036f872": "Rojhun Espinosa", 
  "5fd19ee8a8587b00173ce966": "Jeff Nartatez", 
  "5fd6c2bc37ce798f3036f873": "Angelito Legaspi", 
  "5fe3129b4866f60017e052b2": "Pablito J. Espelembergo"
}];

const statusType = [
  "Arrived on Merchant",
  "On the way",
  "Order on the way",
  "Delivered",
  "Cancelled",
  "Rejected"
];

const ExpressTable = () => {
    const [orders, setOrders] = useState([]);
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

    const loadOrders = () => {
      setValues({loading: true});
      getOrderList(user._id, token).then((data = []) => {
          if (data && data.error) {
              console.log(data.error);
          } else {
            var filteredData = [];
            data.map(obj => {
              // console.log(obj);
              filteredData.push({
                key: obj._id,
                _id: obj._id,
                transactionId: obj.transaction_id,
                customer: obj.user.name,
                orderExpected: moment(obj.createdAt).fromNow(),
                orderUpdated: moment(obj.updatedAt).fromNow(),
                orderStatus: obj.status,
                shop: obj.shop,
                dropoff: obj.address,
                products: obj.products,
                paymentType: obj.paymentType,
                deliveryFee: obj.deliveryFee,
                orderAmount: obj.amount,
                notes: obj.deliveryNotes
              })
            });

              setOrders(filteredData);
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
        loadOrders();
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
      const filterTable = (orders || []).filter(o =>
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
        title: 'Transaction Id',
        dataIndex: 'transactionId',
        key: 'transactionId',
        width: '20%',
        filteredValue: filteredInfo.transactionId || null,
        onFilter: (value, record) => record.transactionId.includes(value),
        sorter: (a, b) => a.transactionId.length - b.transactionId.length,
        sortOrder: sortedInfo.columnKey === 'transactionId' && sortedInfo.order,
        ...getColumnSearchProps('transactionId')
      },
      {
        title: 'Customer',
        dataIndex: 'customer',
        key: 'customer',
        width: '20%',
        ...getColumnSearchProps('customer')
      },
      {
        title: 'Order Expected',
        dataIndex: 'orderExpected',
        key: 'orderExpected',
        width: '20%',
      },
      {
        title: 'Order Updated',
        dataIndex: 'orderUpdated',
        key: 'orderUpdated',
        width: '20%',
      },
      {
        title: 'Status',
        dataIndex: 'orderStatus',
        key: 'orderStatus',
        filters: [
          {text: "Arrived on Merchant", value: "Arrived on Merchant"},
          {text: "On the way", value: "On the way"},
          {text: "Order on the way", value: "Order on the way"},
          {text: "Delivered", value: "Delivered"},
          {text: "Cancelled", value: "Cancelled"},
          {text: "Rejected", value: "Rejected"}
        ],
        filteredValue: filteredInfo.orderStatus || null,
        onFilter: (value, record) => record.orderStatus.includes(value),
        sorter: (a, b) => a.orderStatus.length - b.orderStatus.length,
        sortOrder: sortedInfo.columnKey === 'orderStatus' && sortedInfo.order,
        ellipsis: true,
      },
      {
        title: 'Action',
        key: 'action',
        render: (text, record) => (
          <Space size="middle">
            <Link className="nav-link" to={`/admin/orders/details/${record._id}`}>
              View details
            </Link>
          </Space>
        ),
      },

    ];

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
              <Table
              columns={columns} 
              dataSource={filterData == null ? orders : filterData} 
              onChange={handleChange} 
              pagination={values.pagination}
              loading={values.loading}
              expandable={{
                expandedRowRender: d => {
                  return(
                    <div className="row mx-5 expand-container">
                      <div className="col-md-6 px-0">
                        <p style={{ margin: "8px 0" }}><span className="d-block fw-bold"  style={{width: "100px"}}>Pickup: </span>{d.shop.address}</p>
                        <p style={{ margin: "8px 0" }}><span className="d-block fw-bold"  style={{width: "100px"}}>Drop-off:</span> {d.dropoff}</p>
                        <p style={{ margin: "8px 0" }}><span className="fw-bold">Amount:</span> {d.orderAmount}</p>
                        <p style={{ margin: "8px 0" }}><span className="fw-bold">Delivery Fee:</span> {d.deliveryFee}</p>
                        <p style={{ margin: "8px 0" }}><span className="fw-bold d-block" >Notes: </span>{d.notes}</p>
                      </div>
                      <div className="col-md-6">
                          <Collapsible trigger="Show Products" className="">
                            <> 
                                <b className="mt-4 mb-2 d-block">
                                    Total products in the order:{" "}
                                    {d.products.length}
                                </b>

                                {d.products.map(p => (
                                    <div
                                        className="mb-4"
                                        key={p._id}
                                    >
                                        {showInput("Product name", p.name)}
                                        {showInput("Product price", p.price)}
                                        {showInput("Product total", p.count)}
                                    </div>
                                ))}
                            </>
                        </Collapsible>
                      </div>
                    </div>
                  )
                },
                rowExpandable: record => record.name !== 'Not Expandable',
              }}
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

export default ExpressTable;