"use strict";

module.exports.hiGuest = (event, context, callback) => {
  const response = {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*", // Required for CORS support to work
    },
    body: JSON.stringify({
      message: "Hello there Guest, Please sign up !",
    }),
  };

  callback(null, response);
};

module.exports.hiCustomer = (event, context, callback) => {
  const response = {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "http://localhost:3000", // Required for CORS support to work
      "Access-Control-Allow-Credentials": true, // Required for cookies, authorization headers with HTTPS
    },
    body: JSON.stringify({
      message: "Welcome, You are now a registered Customer!",
    }),
  };

  callback(null, response);
};

module.exports.hiProvider = (event, context, callback) => {
  const response = {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "http://localhost:3001", // Required for CORS support to work
      "Access-Control-Allow-Credentials": true, // Required for cookies, authorization headers with HTTPS
    },
    body: JSON.stringify({
      message: "Welcome, You are now a registered Service Provider!",
    }),
  };

  callback(null, response);
};
