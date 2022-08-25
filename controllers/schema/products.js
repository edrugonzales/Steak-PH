exports.schemaProducts = (limit,long, lat) => {
    return [{
        $facet: {
          new: [ { 
                    $lookup: { 
                        "from": "user-stores", 
                        "localField": "store", 
                        "foreignField": "_id", 
                        "as": "store" 
                    }
                },
                {
                    $unwind: "$store"
                },
                {
                    $lookup: { 
                        "from": "store-product-categories", 
                        "localField": "category", 
                        "foreignField": "_id", 
                        "as": "category" 
                    }
                },
                {
                    $unwind: "$category"
                },
                {
                    $match: {
                        "store.status": true,
                        "isApproved": true,
                        "status": true,
                        "isArchived": false
                    }
                },
                {
                    $match: {
                        "store.location": {
                            $geoWithin: {
                                $centerSphere: [[long, lat], 5/6378.1]
                            }
                        }
                    }
                },
                { "$sort": { "createdAt": -1 } },
                { "$limit": 6 },
                {
                    $addFields: {
                        "isNew": true
                    }
                }
            ],
            bestseller: [ { 
                    $lookup: { 
                        "from": "user-stores", 
                        "localField": "store", 
                        "foreignField": "_id", 
                        "as": "store" 
                    }
                },
                {
                    $unwind: "$store"
                },
                {
                    $lookup: { 
                        "from": "store-product-categories", 
                        "localField": "category", 
                        "foreignField": "_id", 
                        "as": "category" 
                    }
                },
                {
                    $unwind: "$category"
                },
                {
                    $match: {
                        "store.status": true,
                        "isApproved": true,
                        "status": true,
                        "isArchived": false
                    }
                },
                {
                    $match: {
                        "store.location": {
                            $geoWithin: {
                                $centerSphere: [[long, lat], 5/6378.1]
                            }
                        }
                    }
                },
                { "$sort": { "sold": -1 } },
                { "$limit": 6 },
                {
                    $addFields: {
                        "isBestSeller": true
                    }
                }
            ],
            mostreviewed: [ { 
                    $lookup: { 
                        "from": "user-stores", 
                        "localField": "store", 
                        "foreignField": "_id", 
                        "as": "store" 
                    }
                },
                {
                    $unwind: "$store"
                },
                {
                    $lookup: { 
                        "from": "store-product-categories", 
                        "localField": "category", 
                        "foreignField": "_id", 
                        "as": "category" 
                    }
                },
                {
                    $unwind: "$category"
                },
                {
                    $match: {
                        "store.status": true,
                        "isApproved": true,
                        "status": true,
                        "isArchived": false
                    }
                },
                { 
                    $lookup: { 
                        "from": "reviews", 
                        "localField": "_id", 
                        "foreignField": "product", 
                        "as": "reviews" 
                    }
                },
                {
                    $addFields: {
                        "totalReviews": {$sum: {$size: "$reviews.message" }}
                    }
                },
                {
                    $match: {
                        "store.location": {
                            $geoWithin: {
                                $centerSphere: [[long, lat], 5/6378.1]
                            }
                        }
                    }
                },
                { "$sort": { "totalReviews": -1 } },
                { "$limit": 6 },
                {
                    $addFields: {
                        "isMostReviewed": true,
                    }
                }
            ],
            open: [ { 
                        $lookup: { 
                            "from": "user-stores", 
                            "localField": "store", 
                            "foreignField": "_id", 
                            "as": "store" 
                        }
                    },
                    {
                        $unwind: "$store"
                    },
                    {
                        $lookup: { 
                            "from": "store-product-categories", 
                            "localField": "category", 
                            "foreignField": "_id", 
                            "as": "category" 
                        }
                    },
                    {
                        $unwind: "$category"
                    },
                    {
                        $match: {
                            "store.status": true,
                            "isApproved": true,
                            "status": true,
                            "isArchived": false
                        }
                    },
                    {
                        $match: {
                            "store.location": {
                                $geoWithin: {
                                    $centerSphere: [[long, lat], 5/6378.1]
                                }
                            }
                        }
                    },
                    { "$sort": { "createdAt": -1 } },
                    { "$limit": limit },
                    {
                    $addFields: {
                        "isAlways": true,
                    }
                }
                ]
        }
    }, 
    {
        $project: {
            all:{
                $setUnion:['$new', '$bestseller', '$mostreviewed', '$open']
            }
        }
    },
    {
        $unwind: '$all'
    },
    {
        $replaceRoot: { newRoot: "$all" }
    }
    ,
    {
        $limit: limit 
    }]
}