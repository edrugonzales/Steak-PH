"use strict";

/**
 * Get unique error field name
 */
const uniqueMessage = error => {


    try {
        // let fieldName = error.message.substring(
        //     error.message.lastIndexOf(".$") + 2,
        //     error.message.lastIndexOf("_1")
        // );

        let propertyNames = Object.keys(error.keyValue);


        return propertyNames[0] + " already exists";
    } catch (ex) {
        return "Unique field already exists";
    }


};

/**
 * Get the erroror message from error object
 */
exports.dbErrorHandler = error => {
    let message = "";

    if (!error)
        return message

    if (error.code) {
        switch (error.code) {
            case 11000:
                return uniqueMessage(error);

            case 11001:
                return uniqueMessage(error);

            default:
                return "Something went wrong";
        }
    }

    return message;
};

