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
  
    
const getAccessToken = () => {

    const url = "https://identity-uat.ngenius-payments.com/auth/realms/ni/protocol/openid-connect/token";

    var options = {
        method: 'POST',
        url: url,
        headers:
        {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: 'BASIC: ' + API_KEY
        },
        json: true,
        form: { grant_type: 'client_credentials' }
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

    const url = " https://api-gateway-uat.ngenius-payments.com/transactions/outlets/" + OUTLETS + "/orders";

    // eg: 2500 means AED 25.   
    const requestData = {
        'action': 'SALE',
        'amount': customObj.amount,
        'emailAddress': customObj.emailAddress,
        'merchantOrderReference': customObj.merchantOrderReference,
        // 'merchantAttributes': {
        //   'redirectUrl': customObj.redirectUrl,
        //   'cancelUrl':customObj.cancelUrl, 'cancelText': 'Back to website', 'skipConfirmationPage': true
        // },
        
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
                console.log('body: ',body);

                // you will get order reference from 'reference': body.reference
                resolve({paymentLink: body._links['payment']['href'], reference: body.reference });
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
            'emailAddress': 'test@gmail.com'
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

    return {
        getAccessToken,
        getHostedPaymentPageUrl,
        createOrder,
        cardEntered,
        createOrderAndPaymentSingleCall,
        createOrderAndPaymentRecurringSingleCall,
        getOrderDetail
    };

};

module.exports = init;