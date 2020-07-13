const path = require("path");
const ejs = require("ejs");
const fs = require("fs");

// injection
const init = ({request,config,chalk})=>{
     
    const paymentGateway= 'NGenius';
    const nGeniusConfig = config.get(`Gateway.${paymentGateway}`);

    // console.log(config.has('Gateway.NGenius.OUTLETS'))
    // console.log(config.get('Gateway.NGenius.OUTLETS'))
    
    const message = {
        'CONFIG_NOT_FOUND':'Ngenius Payment Config not found!'
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
    const OUTLETS = nGeniusConfig.OUTLETS;
    const HOSTED_SESSION_APIKEY = nGeniusConfig.HOSTED_SESSION_APIKEY;
    
  
const getAccessToken = async function () {  

    const url = "https://api-gateway.sandbox.ngenius-payments.com/identity/auth/access-token";


    let options = {
        method: 'POST',
        url: url,
        headers: {
            'content-type': 'application/vnd.ni-identity.v1+json',
            'Authorization': 'Basic ' + API_KEY,
            'accept': 'application/vnd.ni-identity.v1+json'
        },
        json: {
            "grant_type": "client_credentials"
        }
    };

    return new Promise((resolve, reject)=>{

        request(options, function (error, response, body) {
            if (body.error){
                errorLog(body.error);
                reject(body.error_description);
            }else{
                console.log('body: ',body);
                resolve(body.access_token);
            } 
    
        });
    });

};

const getHostedPaymentPageUrl = (access_token, customObj ) => {

    const url = "https://api-gateway.sandbox.ngenius-payments.com/transactions/outlets/" + OUTLETS + "/orders";
    
    // eg: 2500 means AED 25.
    //'skip3DS': true, in merchantAttributes
    // when you have savedCard object
    const requestData = {
        'action': customObj.action,
        'amount': customObj.amount,
        'emailAddress': customObj.emailAddress,
        'merchantOrderReference': customObj.merchantOrderReference,
        'merchantAttributes': {
            'skip3DS': true,
            'redirectUrl': customObj.redirectUrl,
            'cancelUrl':customObj.cancelUrl, 'cancelText': 'Cancel', 'skipConfirmationPage': true
        },
        'billingAddress':{
            'firstName': "customObj.firstname",
            'lastName':" customObj.lastname",
            'address1': "customObj.customer_address",
            'city': "city",
            'countryCode': "UAE",
        },
     savedCard:{
            maskedPan: '411111******1111',
            expiry: '2024-07',
            cardholderName: 'NAME',
            scheme: 'VISA',
            cardToken: 'XXXXXXX',
            recaptureCsc: true
          }
        
    };

    console.log(requestData);

    var options = {
        method: 'POST',
        url: url,
        headers:
        {
            'Content-Type': 'application/vnd.ni-payment.v2+json',
            'Accept': 'application/vnd.ni-payment.v2+json',
            Authorization: 'Bearer ' + access_token
        },
        json: true,
        json: requestData,
    };

    return new Promise((resolve, reject)=>{

        request(options, function (error, response, body) {

            console.log(JSON.stringify(body));
            // console.log(body._links);

            if (body.error){
                errorLog(body.error);
                reject(body.error_description);
            }else{
                // you will get order reference from 'reference': body.reference
                resolve({paymentLink: body._links['payment']['href'],
                paymentSavedLink : body._embedded.payment[0] && body._embedded.payment[0]["_links"] && body._embedded.payment[0]["_links"]["payment:saved-card"] ? body._embedded.payment[0]["_links"]["payment:saved-card"].href:"", 
                reference: body.reference });
            } 
    
        });
    });
};


const createOrder = (cb) => {

    const url = " https://api-gateway-uat.ngenius-payments.com/transactions/outlets/" + OUTLETS + "/orders";

    const requestData = {
        'action': 'SALE',
        'amount': { 'currencyCode': 'AED', 'value': 2500 },
        'emailAddress': 'createOrder@gmail.com',
        
    };

    var options = {
        method: 'POST',
        url: url,
        headers:
        {
            'Content-Type': 'application/vnd.ni-payment.v2+json',
            'Accept': 'application/vnd.ni-payment.v2+json',
            Authorization: 'Bearer ' + access_token
        },
        json: true,
        json: requestData,
    };

    return new Promise((resolve, reject)=>{
        request(options, function (error, response, body) {
            if (body.error){
                errorLog(body.error);
                reject(body.error_description);
            }else{
                const result = {
                    'payment_href': body._links['payment']['href'],
                    'card_link': body._embedded.payment[0]['_links']['payment:card']['href'],
                    'reference': body.reference
                };
                resolve(result);
            } 
        });
    });
};

/*
cardLink: you will get from card_link
*/
const cardEntered = (cardLink, access_token) => {

    const url = cardLink;

    const requestData = {
        "pan":"4111111111111111",
        "expiry":"2031-09",
        "cvv":"123",
        "cardholderName":"Card Holder Name"
    };
    var options = {
        method: 'PUT',
        url: url,
        headers:
        {
            'Content-Type': 'application/vnd.ni-payment.v2+json',
            'Accept': 'application/vnd.ni-payment.v2+json',
            Authorization: 'Bearer ' + access_token
        },
        json: true,
        json: requestData,
    };

    return new Promise((resolve, reject)=>{
        request(options, function (error, response, body) {
            if (body.error){
                errorLog(body.error);
                reject(body.error_description);
            }else{
                resolve(body);
            } 
        });
    });
};



const createOrderAndPaymentSingleCall = (access_token) => {
    const url = " https://api-gateway-uat.ngenius-payments.com/transactions/outlets/" + OUTLETS + "/payment/card";

    const requestData = {
        "order": {
            "action": "SALE",
            "amount": { "currencyCode": "AED", "value": 1000 },
            'emailAddress': 'test@yopmail.com'
        },
        "payment": {
            "pan":"4111111111111111",
            "expiry":"2031-09",
            "cvv":"123",
            "cardholderName":"Card Holder Name"
        }
    };
    var options = {
        method: 'POST',
        url: url,
        headers:
        {
            'Content-Type': 'application/vnd.ni-payment.v2+json',
            'Accept': 'application/vnd.ni-payment.v2+json',
            Authorization: 'Bearer ' + access_token
        },
        json: true,
        json: requestData,


    };


    return new Promise((resolve, reject)=>{
        request(options, function (error, response, body) {
            if (body.error){
                errorLog(body.error);
                reject(body.error_description);
            }else{
                const jsonReturn = {
                    "paymentMethod": body.paymentMethod,
                    "authResponse": body.authResponse,
                    "authorizationCode": body.authResponse.authorizationCode,
                    "state": body.state,
                }
                resolve(jsonReturn);
            } 
    
        });
    });
};


const createOrderAndPaymentRecurringSingleCall = (access_token)=>{
    const url = "https://api-gateway-uat.ngenius-payments.com/recurring-payments/outlets/" + OUTLETS + "/orders";

    const requestData ={
        "order": {
            "amount": { "currencyCode":"AED", "value":1000 },
            'emailAddress': 'recurringCall@gmail.com',
            'merchantOrderReference':'myorder-1777',
            'frequency':'WEEKLY'
        },
        "payment":{
            "pan":"4111111111111111",
            "expiry":"2031-09",
            "cvv":"123",
            "cardholderName":"Card Holder Name"
        }
    };
var options = { method: 'POST',
url: url,
headers: 
 { 'Content-Type': 'application/vnd.ni-recurring-payment.v1+json',
 'Accept': 'application/vnd.ni-recurring-payment.v1+json',
   Authorization: 'Bearer '+access_token },
   json: true,
json: requestData,


};

return new Promise((resolve, reject)=>{
    request(options, function (error, response, body) {
        if (body.error){
            errorLog(body.error);
            reject(body.error_description);
        }else{
            resolve(body);
        } 

    });
});

};


const getOrderDetail = (access_token, orderReference) => {
    const url = "https://api-gateway-uat.ngenius-payments.com/transactions/outlets/" + OUTLETS + "/orders/" + orderReference;

    var options = {
        method: 'GET',
        url: url,
        headers:
        {
            'Content-Type': 'application/vnd.ni-payment.v2+json',
            'Accept': 'application/vnd.ni-payment.v2+json',
            Authorization: 'Bearer ' + access_token
        },
        json: true

    };

    return new Promise((resolve, reject)=>{
        request(options, function (error, response, body) {
            if (body.error){
                errorLog(body.error);
                reject(body.error_description);
            }else{
                resolve(body);
            } 
    
        });
    });
};


const createOrderAUTH = (access_token, cb) => {

    const url = " https://api-gateway-uat.ngenius-payments.com/transactions/outlets/" + OUTLETS + "/orders";
 // eg: 2500 means AED 25.  
   
    const requestData = {
        action: 'AUTH',
        'amount': { 'currencyCode': 'AED', 'value': 2500 },
        'emailAddress':'testhostedPage@yopmail.com',
        'merchantOrderReference':'customId-orderID',
        'billingAddress':{
            firstName: 'FIRST_NAME',
            lastName: 'LAST_NAME'
        },
        
    };

    var options = {
        method: 'POST',
        url: url,
        headers:
        {
            'Content-Type': 'application/vnd.ni-payment.v2+json',
            'Accept': 'application/vnd.ni-payment.v2+json',
            Authorization: 'Bearer ' + access_token
        },
        json: true,
        json: requestData,
    };

    return new Promise((resolve, reject)=>{
        request(options, function (error, response, body) {
            if (body.error){
                errorLog(body.error);
                reject(body.error_description);
            }else{
                const result = {
                    'payment_href': body._links['payment']['href'],
                    'state': body._embedded.payment[0]['state'],
                    '_link': body._embedded.payment[0]['_links'],
                    'card_link': body._embedded.payment[0]['_links']['payment:card']['href'],
                    'saved-card': body._embedded.payment[0]['_links']['payment:saved-card']['href'],                    
                    'reference': body.reference
                };
                resolve(result);
            } 
        });
    });
};



const submitpaymentCardInformation = (access_token, paymentCardUrl, cb) => {
    const url =paymentCardUrl;
    // eg: 2500 means AED 25.  
      
       const requestData = {
           pan: "4111111111111111",
           expiry: "2021-06",
           cvv: "123",
           cardholderName: "John Brown"
       };
   
       var options = {
           method: 'PUT',
           url: url,
           headers:
           {
               'Content-Type': 'application/vnd.ni-payment.v2+json',
               'Accept': 'application/vnd.ni-payment.v2+json',
               cardholderName: "John Brown",
               Authorization: 'Bearer ' + access_token
           },
           json: true,
           json: requestData,
       };
   
       return new Promise((resolve, reject)=>{
           request(options, function (error, response, body) {
   
               if (body.error){
                   errorLog(body.error);
                   reject(body.error_description);
               }else{
                   const result = {
                       'cnp3ds_url': body._links['cnp:3ds'].href,
                       'state': body.state,
                       '3ds': body['3ds']
                   };
                   resolve(result);
               } 
           });
       });
};


function get3dsHtml(_3ds){
const emailTemplatePath = path.join(__dirname);
  
  const filePathContent = `${emailTemplatePath}/_3dspage.ejs`;
  const compiled = ejs.compile(fs.readFileSync(filePathContent, "utf8"));

  const defaultParams ={
    out_acsurl : _3ds.acsUrl,
    out_acspareq : _3ds.acsPaReq,
    out_acsmd : _3ds.acsMd,
    out_acsterm: "http://domain/success",
    terminateScript:"http://domain/reject"
  }; 

  let allParams =defaultParams;

  const html = compiled(allParams);

  return html;
}




const payAfter3dPayment = (cnp3ds_url,accessToken,param, cb) => {
    const url =cnp3ds_url;
    // eg: 2500 means AED 25.  
      
       const requestData = param;
   
       var options = {
           method: 'POST',
           url: url,
           headers:
           {
               'Content-Type': 'application/vnd.ni-payment.v2+json',
               'Accept': 'application/vnd.ni-payment.v2+json',
               Authorization: 'Bearer ' + accessToken
           },
           json: true,
           json: requestData,
       };
   
       return new Promise((resolve, reject)=>{
           request(options, function (error, response, body) {
   
               if (body.error){
                   errorLog(body.error);
                   reject(body.error_description);
               }else{

                console.log(body);
                process.exit();

                   const result = {
                       'cnp3ds_url': body._links['cnp:3ds'].href,
                       'state': body.state,
                       '3ds': body['3ds']
                   };

                 resolve(result);
               } 
           });
       });
};




const paymentFromSavedCard = (saveCardPaymentUrl,accessToken,param, cb) => {
    const url =saveCardPaymentUrl;
    // eg: 2500 means AED 25.  
      
       const requestData = param;
   
       var options = {
           method: 'PUT',
           url: url,
           headers:
           {
               'Content-Type': 'application/vnd.ni-payment.v2+json',
               'Accept': 'application/vnd.ni-payment.v2+json',
               Authorization: 'Bearer ' + accessToken
           },
           json: true,
           json: requestData,
       };
   
       return new Promise((resolve, reject)=>{
           request(options, function (error, response, body) {
   
               if (body.error){
                   errorLog(body.error);
                   reject(body.error_description);
               }else{

                console.log(body);
                console.log(JSON.stringify(body));
                process.exit();
        resolve(result);
               } 
           });
       });
};

const capturePayment = (capture_url,accessToken,param) => {
    const url =capture_url;
    // eg: 2500 means AED 25.  
      
       const requestData = param;
   
       var options = {
           method: 'POST',
           url: url,
           headers:
           {
               'Content-Type': 'application/vnd.ni-payment.v2+json',
               'Accept': 'application/vnd.ni-payment.v2+json',
               Authorization: 'Bearer ' + accessToken
           },
           json: true,
           json: requestData,
       };
   
       return new Promise((resolve, reject)=>{
           request(options, function (error, response, body) {
            console.log(JSON.stringify(body));
               if (body.error){
                   errorLog(body.error);
                   reject(body.error_description);
               }else{
                const result = {
                    'amount': body.amount,
                    'state': body.state,
                    'savedCard': body.savedCard,
                    'updateDateTime': body.updateDateTime,
                    'orderReference': body.orderReference
                 };
               resolve(result);
               } 
           });
       });
};



const cancelPayment = (capture_url,accessToken) => {
    const url =capture_url;
    // eg: 2500 means AED 25.  
      

       var options = {
           method: 'PUt',
           url: url,
           headers:
           {
               'Content-Type': 'application/vnd.ni-payment.v2+json',
               'Accept': 'application/vnd.ni-payment.v2+json',
               Authorization: 'Bearer ' + accessToken
           }
       };
   
       return new Promise((resolve, reject)=>{
           request(options, function (error, response, body) {
            console.log(url);
               if (body.error){
                   errorLog(body.error);
                   reject(body.error_description);
               }else{

                console.log(body);
                process.exit();

                   const result = {
                       'cnp3ds_url': body._links['cnp:3ds'].href,
                       'state': body.state,
                       '3ds': body['3ds']
                   };

                   resolve(result);
               } 
           });
       });
};



function websdk(){
    const emailTemplatePath = path.join(__dirname);
      
      const filePathContent = `${emailTemplatePath}/web_sdk.ejs`;
      const compiled = ejs.compile(fs.readFileSync(filePathContent, "utf8"));
    
      const defaultParams ={
          outlet:OUTLETS,
          hostedSessionId:HOSTED_SESSION_APIKEY
      }; 
    
      let allParams =defaultParams;
    
      const html = compiled(allParams);
    
      return html;
    }


    
    const payment_hostedSession = (access_token,sessionId, cb) => {

        const url = "https://api-gateway.sandbox.ngenius-payments.com/transactions/outlets/"+OUTLETS+"/payment/hosted-session/"+sessionId
        
     // eg: 2500 means AED 25.  
       
        const requestData = {
            action: 'AUTH',
            'amount': { 'currencyCode': 'AED', 'value': 2500 },
            'emailAddress':'testhostedPage@yopmail.com',
            'merchantOrderReference':'customId-orderID',
            'billingAddress':{
                firstName: 'FIRST_NAME',
                lastName: 'LAST_NAME'
            },
            
        };
    
        var options = {
            method: 'POST',
            url: url,
            headers:
            {
                'Content-Type': 'application/vnd.ni-payment.v2+json',
                'Accept': 'application/vnd.ni-payment.v2+json',
                Authorization: 'Bearer ' + access_token
            },
            json: true,
            json: requestData,
        };
    
        return new Promise((resolve, reject)=>{
            request(options, function (error, response, body) {
                if (body.error){
                    errorLog(body.error);
                    reject(body.error_description);
                }else{

                  const result = {
                        'payment_href': body._links['payment']['href'],
                        'state': body._embedded.payment[0]['state'],
                        '_link': body._embedded.payment[0]['_links'],
                        'card_link': body._embedded.payment[0]['_links']['payment:card']['href'],
                        'saved-card': body._embedded.payment[0]['_links']['payment:saved-card']['href'],                    
                        'reference': body.reference
                    };
                    resolve(result);
                } 
            });
        });
    };



    return {
        getAccessToken,
        getHostedPaymentPageUrl,
        paymentFromSavedCard,
        createOrder,
        cardEntered,
        createOrderAndPaymentSingleCall,
        createOrderAndPaymentRecurringSingleCall,
        getOrderDetail,
        createOrderAUTH,
        submitpaymentCardInformation,
        get3dsHtml,
        payAfter3dPayment,
        capturePayment,
        cancelPayment,
        websdk,
        payment_hostedSession
    };

};

module.exports = init;