const instamojoPaymentLoad = require('./instamojo/instamojo');
const chalk = require('chalk');
const request = require("request");
const config = require('config');

const WEBSITE_LINK = "https://WEBSITE_LINK";
try{
const instamojoPayment = instamojoPaymentLoad({request,config,chalk});

async function createaRequest(){
    try{
        const paymentLink = await instamojoPayment.createaRequest();
        const {id, longurl } = paymentLink
        console.log({id, longurl});      
        /**
         *  After redirect url generate like this: 
         *  http://www.example.com/redirect/?payment_id=MOJO1327&payment_status=Credit&payment_request_id=aada767b3db94e848
         *  payment_request_id: same as paymentLink.id
         * payment_id: same as paymentLink.id
         * payment_status:
         *  */  
    }catch(e){
        console.log('createaRequest Error : ',e);
    }

}
// createaRequest();

async function getPaymentRequestsDetail(id, pid){
    try{
        // payment_request_id,payment_id
        const paymentDetail = await instamojoPayment.getPaymentRequestsDetail(id, pid);
        console.log(paymentDetail);
        // const {id, longurl } = paymentLink
        // console.log({id, longurl});      
        /**
         *  After redirect url generate like this: 
         *  http://www.example.com/redirect/?payment_id=MOJO1327&payment_status=Credit&payment_request_id=aada767b3db94e848
         *  payment_request_id: same as paymentLink.id
         * payment_id: same as paymentLink.id
         * payment_status:
         *  */  
    }catch(e){
        console.log('getPaymentRequestsDetail Error : ',e);
    }

}
// payment_request_id,payment_id
// http://www.example.com/redirect/?payment_id=MOJO1327&payment_status=Credit&payment_request_id=aada767b3db94e848
// getPaymentRequestsDetail("aada767b3db94e848","MOJO1327");

async function getPaymentDetail(pid){
    try{
        // payment_id
        const paymentDetail = await instamojoPayment.getPaymentDetail(pid);
        console.log(paymentDetail);
        // const {id, longurl } = paymentLink
        // console.log({id, longurl});      
        /**
         *  After redirect url generate like this: 
         *  http://www.example.com/redirect/?payment_id=MOJO1327&payment_status=Credit&payment_request_id=aada767b3db94e848
         *  payment_request_id: same as paymentLink.id
         * payment_id: same as paymentLink.id
         * payment_status:
         *  */  
    }catch(e){
        console.log('getPaymentDetail Error : ',e);
    }

}
getPaymentDetail("MOJO1327");



}catch(err){
    console.log(err.message);
}
