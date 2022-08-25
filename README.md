# Spark Express API & WEB

###### tags: `Documentation` `API`

The initial back-end application for both mobile and web services. under MERN Stack.

## Table of Contents

[TOC]

# Installation

### Code Environment

1. `npm install npm client install`
2. Fill up .env (client and root folder)
   - `MONGO_KEY= {mongoDB/} `
   - `JWT_SECRET= {} `
   - `REACT_APP_API_URL= {<host.domain>/api} `
   - `BRAINTREE_MERCHANT_ID= {} `
   - `BRAINTREE_PUBLIC_KEY= {} `
   - `BRAINTREE_PRIVATE_KEY= {} `
   - `SEND_GRID_KEY={}`
3. `npm run dev`

Run Locally with Localtunnel - so your localhost is exposed with the world and doesn't change when you change WiFi `npx localtunnel --port 8000 ssh -R 80:localhost:8080 ssh.localhost.run https://dashboard.ngrok.com/get-started/setup`

### Database

1. Install [MongoDB Enterprise ](https://www.mongodb.com/try/download/enterprise) - Version 4.2.11
2. Request for the Datbase dump (ex. sparkle-stage)
3. Using MongoCompass GUI, Connect without indicating the localhost and port for now.
4. Create database with collection (Any name would do for now).
5. Create a dump folder (ex. D:/databaseDump/sparkles).
6. Set Environment Variables `(eg. C:\Program Files\MongoDB\Server\4.4\bin & C:\Program Files\MongoDB\Server\Tools\100\bin)` in the Path.
7. Open your Terminal, then copy-paste this `mongorestore --db dbsparkles D:\databaseDump\sparkle-stage`.
8. Wait for the completion of the import process.

Note: databaseDump folder should contain the collections (json/bson) files to initiate import.

MongoDB Version 4.4 above Kindly install [MongoDB Tools](https://fastdl.mongodb.org/tools/db/mongodb-database-tools-windows-x86_64-100.2.1.msi) for MongoRestore since MongoDB tools aren't included in the setup.

# MongoDB tools

```
//change the link localhost
db.products.find({  })
.forEach(function (doc) {
    doc.images.forEach(function (image) {
        image.url = image.url.replace("https://com-sparkle-sparkle.herokuapp.com/", "http://localhost:8000/")
    });

    db.products.save(doc);
});

//change the links on cloud images
db.products.find({  })
.forEach(function (doc) {
    doc.images.forEach(function (image) {
        image.url = image.url.replace("sparkle-staging", "com-sparkle-sparkle")
    });

    db.products.save(doc);
});

//add primary image on products
db.products.find({  })
.forEach(function (doc) {

    var imageP = "";
    doc.images.forEach(function (image) {
        if(image.isApproved) {
            imageP = image.url
        }

    });

    print(imageP)
    if(imageP == "") {
        imageP= doc.images[0].url;
    }
    doc.imagePrimary = imageP;
    db.products.save(doc);
});


db.collection('user-shops').updateMany(
{ logo: { $regex: /sparkle-staging/ } },
[{
    $set: { logo: {
        $replaceOne: {
            input: "$logo",
            find: "sparkle-staging",
            replacement: "com-sparkle-sparkle"
        }
    }}
}]).then((data, error) => {
    if(error) console.log('failed')
    else console.log('success')
})

db.collection('user-shops').updateMany( {
    banner: {  $regex: /sparkle-staging/ }
    }, [{
    $set: {
        banner: {
            $replaceOne: {
                input: "$banner",
                find: "sparkle-staging",
                replacement: "com-sparkle-sparkle"
            }
        }
    }
}]
).then((data, error) => {
    if(error) console.log('failed')
    else console.log('success')
})

db.collection('all-users').updateMany( {
    photo: { $regex: /sparkle-staging/ }
    }, [{
        $set: {
            photo: {
                $replaceOne: {
                    input: "$photo",
                    find: "sparkle-staging",
                    replacement: "com-sparkle-sparkle"
                }
            }
        }
    }]
).then((data, error) => {
    if(error) console.log('failed')
    else console.log('success')
})



```

# Heroku

### Upload

Fill up .env "Config Vars"

- `MONGO_KEY= {mongoDB/}`
- `JWT_SECRET= {}`
- `REACT_APP_API_URL= {<host.domain>/api} `
- `BRAINTREE_MERCHANT_ID= {}` `BRAINTREE_PUBLIC_KEY= {} `
- `BRAINTREE_PRIVATE_KEY= {}`
- `SEND_GRID_KEY={}`

# Features

- Node API Codebase based on MVC (Model-View-Controller) architectural Design Pattern
- Node JS API (Backend) Development
- React JS (Frontend) Web Development
- Write Functional Components with React Hooks
- the Fundamental Concepts of Building Ecommerce Application
- Implement Payment Gateway using Credit Card and PayPal
- Integrate Braintree (A PayPal Company) for Payment Processing
- Implement Advance Searching/Filtering based on Categories
- Implement Advance Searching/Filtering based on Price Range
- Implement Standard Products Search System with Categories option/dropdown
- Build Shopping Cart
- Implement Authentication based on JWT
- Build Scalable React App with Proper Layouts and Routes
- build Admin and User Dashboard
- Implement Flexible Private and Admin Routing System Learn advance CRUD with Products and Categories
- handle File Upload
- use LocalStorage (CRUD) to Minimize Requests to Backend
- Store Sold Products Record into the Database for Further Processing User Profile and Update Ability
- implement Order Management System by Admin
- Deploy your app to Digital Ocean's Cloud Servers
- add a Custom Domain name to your app
- use Cloudflare's CDN to serve your app (for speed)
- use Cloudflare's free SSL to secure your app
