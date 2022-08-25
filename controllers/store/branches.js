const { dbErrorHandler } = require('../../helpers/dbErrorHandler');
const ShopShop = require('../../models/shop/Shop');

exports.getBranches = (req, res) => {
    ShopShop.find().exec((err, result) => {
        if (err) {
            return res.status(400).json({
                error: dbErrorHandler(err)
            })
        }

        res.json(result)
    })
}