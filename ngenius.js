const ngeniusPaymentLoad = require('./ngenius/ngenius');
const chalk = require('chalk');
const request = require("request");
const config = require('config');

const WEBSITE_LINK = "https://WEBSITE_LINK";
try{
const ngeniusPayment = ngeniusPaymentLoad({request,config,chalk});


// ngeniusPayment.getAccessToken().then( (data)=>{
//     console.log(data);
// }).catch(e=>console.log(e));


/*
When you dont have PCI complaince 
*/
async function hostedPaymentLinkSample(){

    const accessToken = await ngeniusPayment.getAccessToken();

    const encryptRedirectUrl = 'queryValue';
    // eg: 2500 means AED 25.  
    const createObject={
        'amount': { 'currencyCode': 'AED', 'value': 2500 },
        'emailAddress':'testhostedPage@gmail.com',
        'merchantOrderReference':'customId',
        'redirectUrl': WEBSITE_LINK + '/endpoint?queryName=' + encryptRedirectUrl,
        'cancelUrl': WEBSITE_LINK 
        }; 

    try{
        const hostedPaymentLink=await ngeniusPayment.getHostedPaymentPageUrl(accessToken, createObject);

        /*
        you will get https://paypage-uat.ngenius-payments.com/?code=XXXXXXX  like this url. Copy paste on browser.
        When payment done successfull then it will redirect to your redirectUrl which you given.

        If you don't want payment header to be display then you can add slim=true in query string

        https://paypage-uat.ngenius-payments.com/?code=XXXXXXX&slim=true
        */
        console.log(hostedPaymentLink);
    }catch(e){
        console.log('hostedPaymentLinkSample Error : ',e);
    }

}
// hostedPaymentLinkSample();



async function getOrderDetail(){

    const accessToken = await ngeniusPayment.getAccessToken();
    const orderReference="XXXXX-XXXXX-XXXXX-XXXXX"; 

    try{
        const orderDetail=await ngeniusPayment.getOrderDetail(accessToken, orderReference);
        console.log(orderDetail);
    }catch(e){
        console.log('hostedPaymentLinkSample Error : ',e);
    }

}
getOrderDetail();

}catch(err){
    console.log(err.message);
}




