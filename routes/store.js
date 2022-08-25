const express = require('express');
const router = express.Router();
const { getOrders, updateOrderStatus, mwFindOrderById } = require('../controllers/store/order')
const { getListSearch } = require('../controllers/store/product');
const { getCategoryBrands } = require('../controllers/store/brands');
const { getBranches } = require('../controllers/store/branches');
const ShopProduct = require('../models/shop/Products');
const { StoreOrder } = require('../models/shop/Order');
const ShopCategory = require('../models/shop/Category');
const { dbErrorHandler } = require('../helpers/dbErrorHandler');


router.get('/list/search', getListSearch);
router.get('/orders', getOrders)
router.get('/brands/:categoryId', getCategoryBrands);
router.get('/products', (req, res) => {
    ShopProduct.find().exec((err, result) => {
        res.json(result)
    })
})

router.put('/category/brand', (req, res) => {
    console.log(req.body)
    const { id, brands } = req.body;
    let updates = { brands: brands }
    console.log(id)
    ShopCategory.findByIdAndUpdate(id, updates).exec((err, result) => {
        if (err) {
            return res.status(400).json({
                error: dbErrorHandler(err)
            })
        }
        console.log(result)
        res.json(result)
    })
})

router.put('/orders/:orderId', updateOrderStatus)

//get the branches
router.get('/branches', getBranches)
router.get('/order/list/all', getOrders)


router.param("orderId", mwFindOrderById)
module.exports = router;