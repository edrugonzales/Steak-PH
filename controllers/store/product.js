const { dbErrorHandler } = require('../../helpers/dbErrorHandler');
const  ShopProduct  = require('../../models/shop/Products');

exports.getListSearch = (req, res) => {
    const query = {};


    if (req.query.name) {
        query.name = { $regex: req.query.name, $options: "i" };

        ShopProduct.find(query).exec((err, products) => {
            if (err) {
                return res.status(400).json({
                    error: dbErrorHandler(err)
                })
            }
            res.json(products)
        })
    }
}