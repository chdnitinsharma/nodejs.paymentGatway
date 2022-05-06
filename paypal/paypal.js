const qs = require("qs");
// injection
const init = ({axios,config,chalk})=>{
     
    const paymentGateway= 'PAYPAL';
    const paypalConfig = config.get('Gateway.PAYPAL');

    const message = {
        'CONFIG_NOT_FOUND':'PAYPAL Payment Config not found!'
    };


    if(!paypalConfig){
        console.log(chalk.bgRed(message.CONFIG_NOT_FOUND))
        throw new Error(message.CONFIG_NOT_FOUND);
    }

    const errorLog = (mgs)=>{
        const tag = chalk.red(paymentGateway);
        console.log(tag,mgs);
    }


    const CLIENT_ID = paypalConfig.CLIENT_ID;
    const CLIENT_SECRET_KEY = paypalConfig.CLIENT_SECRET_KEY;
    const BASEURL = paypalConfig.BASEURL;

        const generateAccessToken = async function () {  
         
           const base64EncodeKey = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET_KEY}`).toString('base64');
           
           console.log(base64EncodeKey);

           var data = qs.stringify({
            'grant_type': 'client_credentials',
            'ignoreCache': 'true',
            'return_authn_schemes': 'true',
            'return_client_metadata': 'true',
            'return_unconsented_scopes': 'true' 
          });
        var config = {
            method: 'post',
            url: 'https://api-m.sandbox.paypal.com/v1/oauth2/token',
            headers: { 
              'Authorization': `Basic ${base64EncodeKey}`, 
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            data : data
          };
       
        
          return axios(config)
          .then(function (response) {
           return response.data.access_token;
          })
          .catch(function (error) {
            console.log(error);
          });
          
    }

    async function createPaymentLink(){
        const accessToken = await generateAccessToken();
var data = JSON.stringify({
  "intent": "CAPTURE",
  "purchase_units": [
    {
      "items": [
        {
          "name": "T-Shirt",
          "description": "Green XL",
          "quantity": "1",
          "unit_amount": {
            "currency_code": "USD",
            "value": "100.00"
          }
        }
      ],
      "amount": {
        "currency_code": "USD",
        "value": "100.00",
        "breakdown": {
          "item_total": {
            "currency_code": "USD",
            "value": "100.00"
          }
        }
      }
    }
  ],
  "application_context": {
    "return_url": "https://example.com/return",
    "cancel_url": "https://example.com/cancel"
  }
});

var config = {
  method: 'post',
  url: 'https://api-m.sandbox.paypal.com/v2/checkout/orders',
  headers: { 
    'Content-Type': 'application/json', 
    'Prefer': 'return=representation', 
    // 'PayPal-Request-Id': '021f3a08-0c15-41ed-af4d-29821c475d02', 
    'Authorization': `Bearer ${accessToken}`
  },
  data : data
};

axios(config)
.then(function (response) {
//   console.log(JSON.stringify());
  const links = response.data.links;
  for(let linkRec of links){

    if(linkRec.rel === "capture"){
        console.log(linkRec.href);
    }

  }
})
.catch(function (error) {
  console.log(error);
});

    }

    async function orderDetail(orderId){
      const accessToken = await generateAccessToken();
var config = {
method: 'get',
url: 'https://api-m.sandbox.paypal.com/v2/checkout/orders/'+orderId,
headers: { 
  'Content-Type': 'application/json', 
  'Prefer': 'return=representation', 
  // 'PayPal-Request-Id': '021f3a08-0c15-41ed-af4d-29821c475d02', 
  'Authorization': `Bearer ${accessToken}`
}
};

return new Promise((resolve, reject)=>{
  return axios(config)
  .then(function (response) {
    console.log(response.data);
       resolve(response.data);
  })
  .catch(function (error) {
    reject(error);
  });
});


  }

  // orderDetail("ORDER_ID");

    async function payToAnotherPaypalAccount(){
      const accessToken = await generateAccessToken();
var data = JSON.stringify({
  intent: 'CAPTURE',
  purchase_units: [{
    amount: {
      currency_code: 'USD',
      value: '220.00'
    },
    payee: {
      email_address: 'receiveraccount@emaildomain.com'
    }
  }]
});

var config = {
method: 'post',
url: 'https://api-m.sandbox.paypal.com/v2/checkout/orders',
headers: { 
  'Content-Type': 'application/json', 
  'Prefer': 'return=representation', 
  // 'PayPal-Request-Id': '021f3a08-0c15-41ed-af4d-29821c475d02', 
  'Authorization': `Bearer ${accessToken}`
},
data : data
};

axios(config)
.then(function (response) {
//   console.log(JSON.stringify());
const links = response.data.links;
for(let linkRec of links){

  if(linkRec.rel === "capture"){
      console.log(linkRec.href);
  }

}
})
.catch(function (error) {
console.log(error);
});

  }
  payToAnotherPaypalAccount();


    return {
      createPaymentLink,
        getPaymentRequestsDetail,
        getPaymentDetail
    };

};

module.exports = init;