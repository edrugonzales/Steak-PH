// MONGODB imgix scripts - https://public.3.basecamp.com/p/2HDf6cbHEYCcVz2HrMp96ANX - tutorial

var MongoClient = require('mongodb').MongoClient;
// var url = "mongodb://localhost:27017/";
// var url = "mongodb+srv://admin:SparkleStar2020@cluster0.uqugt.mongodb.net/com-sparkle-sparkle";

MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  var dbo = db.db("com-sparkle-sparkle");
//   var query = { address: "Park Lane 38" };
//   dbo.collection("orders").find({}).toArray(function(err, result) {
//     if (err) throw err;
//     console.log(result);
//     db.close();
//   });
// dbo.collection('products').updateMany({},
//     [
//         {
//             $set: { 
//                imagePrimary: {
//                    $replaceOne: { 
//                        input: "$imagePrimary", 
//                        find: "https://com-sparkle-sparkle.herokuapp.com/api/product/image/", 
//                         replacement: "https://com-sparkle.imgix.net/live/"                 }   
//                 }
//             }
//        },
//     //   {
//     //        $addFields: {
//     //           "imagePrimary": { $concat: ["$imagePrimary", ".png"]}
//     //        }
//     //   }
//     ])


    // dbo.collection('products').updateMany({},[
    //     {
    //      $addFields: {
    //        id: 1,
    //        "imagePrimary": {
    //          $arrayElemAt: [
    //            {
    //               "$split": [
    //                 "$imagePrimary",
    //                ".png"
    //              ]
    //             },
    //             0
    //           ]
    //         }
    //       }
    //     }
    //   ])


    // dbo.collection('products').updateMany({},
    //     [
    //         {
    //             $set: {
    //                 images: {
    //                    $map: {
    //                        input: "$images",
    //                        as: "i",
    //                        in: {
    //                             "$mergeObjects": [
    //                                 "$$i",
    //                                 {
    //                                    url: {
    //                                        "$replaceOne": {
    //                                             "input": "$$i.url",
    //                                             "find": "https://com-sparkle-sparkle.herokuapp.com/api/product/image/",
    //                                            "replacement": "https://com-sparkle.imgix.net/live/"
    //                                         }
    //                                     }
    //                                 }
    //                             ]
    //                         }
    //                    }
    //                 }
    //           }
    //         },
    //         {
    //             $addFields: {
    //                 images: {
    //                     $map: {
    //                         input: "$images",
    //                         as: "i",
    //                         in: {
    //                             "$mergeObjects": [
    //                                 "$$i",
    //                                 {
    //                                     url: {
    //                                         $concat: ["$$i.url", ".png"]
    //                                     }
    //                                 }
    //                             ]
    //                         }
    //                     }
    //                 }
    //             }
    //         }
    //     ])

        // dbo.collection('products').updateMany({},[
        //     {
        //       $addFields: {
        //         id: 1,
        //         "images": {
        //           $map: {
        //             input: "$images",
        //             as: "i",
        //             in: {
        //               "$mergeObjects": [
        //                 "$$i",
        //                 {
        //                   url: {
        //                     $arrayElemAt: [
        //                       {
        //                         "$split": [
        //                           "$$i.url",
        //                           ".png"
        //                         ]
        //                       },
        //                       0
        //                     ]
         
        
        //                  }
        //                }
        //              ]
        //             }
        //           }
        //         }
        //       }
        //     }
        //   ])

});