const paypalPaymentLoad = require('./paypal/paypal');
const chalk = require('chalk');
const axios = require("axios");
const config = require('config');

try{
const ngeniusPayment = paypalPaymentLoad({axios,config,chalk});


}catch(err){
    console.log(err.message);
}




