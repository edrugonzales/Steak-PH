const { dbErrorHandler } = require('../../helpers/dbErrorHandler');
const ShopCategory = require('../../models/shop/Category')

exports.getCategoryBrands = (req, res) => {
    //find the category
    let categoryId = req.params.categoryId
    if (categoryId === '')
        res.json([]);

    
    //find category 
    ShopCategory.findById(categoryId).exec((err, data) => {
        if(err){
            return res.status(400).json({
                error: dbErrorHandler(err)
            })
        }
        res.json(data)
    }) 

}