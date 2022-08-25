const Category = require("../models/Category");
const CategoryShop = require("../models/shop/Category");
const { dbErrorHandler } = require("../helpers/dbErrorHandler");

// MIDDLEWARES - mw
exports.mwCategoryById = (req, res, next, id) => {
    Category.findById(id).exec((err, category) => {
        if (err || !category) {
            return res.status(400).json({
                error: "Category does not exist"
            });
        }
        req.category = category;
        next();
    });
};
// END MIDDLEWARES

exports.create = (req, res) => {
    const { name, type } = req.body
    switch(type){
        case "shop": 
            return createCategoryShop(name, res, req);
        default:
            return createCategory(name,res, req);
    }

};

exports.read = (req, res) => {
    return res.json(req.category);
}

exports.update = (req, res) => {
    const category = req.category;
    category.name = req.body.name;
    category.save((err, data) => {
        if (err) {
            return res.status(400).json({
                error: dbErrorHandler(err)
            });
        }
        res.json(data);
    });
};

exports.remove = (req, res) => {
    const category = req.category;
    category.remove((err, data) => {
        if (err) {
            return res.status(400).json({
                error: dbErrorHandler(err)
            });
        }
        res.json({
            message: "Category deleted"
        });
    });
};

exports.getList = (req, res) => {
    return fetchCategory(res, req);
};


exports.getListByType = (req, res) => {
    var type = req.params.type
    switch(type){
        case "shop": 
            return fetchCategoryShop(res, req);
        default:
            return fetchCategory(res, req);
    }
};




/* Homemade */
function createCategory(name, res, req){
    Category.findOne({ name })
    .then(category => {
        // check if the category already exists
        if(category) return res.status(400).json({ error: "The category already exists"})

        const newCategory = new Category(req.body);
        newCategory.save((err, data) => {
            if (err) {
                return res.status(400).json({
                    error: dbErrorHandler(err)
                });
            }
            res.json({ data });
        });
    })
}

function fetchCategory(res, req){
    Category.find().exec((err, data) => {
        if (err) {
            return res.status(400).json({
                error: dbErrorHandler(err)
            });
        }
        res.json(data);
        //FIXME: get all REST function for React Admin low-prio
        // res.set('x-total-count', data.length)
        // res.json(data.map(d => ({"id": d._id, ...d._doc})));
    });
}

/* Coop */
function createCategoryShop(name, res, req){
    CategoryShop.findOne({ name })
    .then(category => {
        // check if the category already exists
        if(category) return res.status(400).json({ error: "The category already exists"})

        const newCategory = new CategoryShop(req.body);
        newCategory.save((err, data) => {
            if (err) {
                return res.status(400).json({
                    error: dbErrorHandler(err)
                });
            }
            res.json({ data });
        });
    })
}

function fetchCategoryShop( res, req){
    CategoryShop.find().exec((err, data) => {
        if (err) {
            return res.status(400).json({
                error: dbErrorHandler(err)
            });
        }
        res.json(data);
        //FIXME: get all REST function for React Admin low-prio
        // res.set('x-total-count', data.length)
        // res.json(data.map(d => ({"id": d._id, ...d._doc})));
    });
}