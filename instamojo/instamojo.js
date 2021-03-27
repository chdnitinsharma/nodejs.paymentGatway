const path = require("path");
const ejs = require("ejs");
const fs = require("fs");

// injection
const init = ({request,config,chalk})=>{
     
    const paymentGateway= 'INSTAMOJO';
    const nGeniusConfig = config.get(`Gateway.${paymentGateway}`);

    // console.log(config.has('Gateway.NGenius.OUTLETS'))
    // console.log(config.get('Gateway.NGenius.OUTLETS'))
    
    const message = {
        'CONFIG_NOT_FOUND':'INSTAMOJO Payment Config not found!'
    };

    if(!nGeniusConfig){
        console.log(chalk.bgRed(message.CONFIG_NOT_FOUND))
        throw new Error(message.CONFIG_NOT_FOUND);
    }


    const errorLog = (mgs)=>{
        const tag = chalk.red(paymentGateway);
        console.log(tag,mgs);
    }


    const API_KEY = nGeniusConfig.API_KEY;
    const AUTH_TOKEN = nGeniusConfig.AUTH_TOKEN;
    const BASEURL = "https://test.instamojo.com/api/1.1";

  
const createaRequest = async function () {  

    const url = BASEURL+"/payment-requests/";
    const payload = {
        purpose: 'FIFA 16', // 30 characters
        amount: '2500',
        phone: '9999999999',
        buyer_name: 'John Doe',
        redirect_url: 'http://www.example.com/redirect/',
        send_email: true,
        webhook: 'http://www.example.com/webhook/',
        send_sms: true,
        email: 'foo@example.com',
        allow_repeated_payments: false
    };

    let options = {
        method: 'POST',
        url: url,
        headers: {
            'X-Api-Key': API_KEY,
            'X-Auth-Token': AUTH_TOKEN
        },
        form: payload,
        json: true
    };

    return new Promise((resolve, reject)=>{

        request(options, function (error, response, body) {

            if(!error && response.statusCode == 201){
                console.log(typeof body);
                console.log('body: ',body);
                resolve(body.payment_request);
              }else{
                errorLog(error);
                reject(error);
              }
    
        });
    });

};

const getPaymentRequestsDetail = async function (id,pid) {  

    const url = `${BASEURL}/payment-requests/${id}/${pid}/`;
    let options = {
        method: 'GET',
        url: url,
        headers: {
            'X-Api-Key': API_KEY,
            'X-Auth-Token': AUTH_TOKEN
        },
        json: true
    };

    console.log(options)

    return new Promise((resolve, reject)=>{

        request(options, function (error, response, body) {

            if(!error && response.statusCode == 200){
                console.log(typeof body);
                console.log('body: ',body);
                resolve(body.payment_request);
              }else{
                errorLog(error);
                reject(error);
              }
    
        });
    });

};



const getPaymentDetail = async function (pid) {  

    const url = `${BASEURL}/payments/${pid}/`;
    let options = {
        method: 'GET',
        url: url,
        headers: {
            'X-Api-Key': API_KEY,
            'X-Auth-Token': AUTH_TOKEN
        },
        json: true
    };

    return new Promise((resolve, reject)=>{

        request(options, function (error, response, body) {

            if(!error && response.statusCode == 200){
                console.log('body: ',body);
                resolve(body.payment);
              }else{
                errorLog(error);
                reject(error);
              }
    
        });
    });

};

    return {
        createaRequest,
        getPaymentRequestsDetail,
        getPaymentDetail
    };

};

module.exports = init;