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
        "action":'AUTH', // 'SALE', 'AUTH'
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



async function getOrderDetail(orderReference){

    const accessToken = await ngeniusPayment.getAccessToken();
    try{
        const orderDetail=await ngeniusPayment.getOrderDetail(accessToken, orderReference);
        console.log(orderDetail);
        console.log(orderDetail._embedded.payment[0]._links['cnp:capture'].href);
        console.log(orderDetail._embedded.payment[0]._links['cnp:cancel'].href);
        console.log(orderDetail._embedded.payment[0].savedCard);
        
    }catch(e){
        console.log('getOrderDetail Error : ',e);
    }

}
// getOrderDetail("1a1af18a-f001-4141-a08b-f3995e78df03");


async function paymentFromSavedCard(paymentSavedCardUrl){

    const accessToken = await ngeniusPayment.getAccessToken();
    try{
        const param={
            maskedPan: '411111******1111',
<<<<<<< HEAD
            expiry: '2024-07',
            cardholderName: 'NAME',
            scheme: 'VISA',
            cardToken: 'XXXXXXX',
=======
            expiry: '2022-02',
            cardholderName: 'Avc',
            scheme: 'VISA',
            cardToken: 'dG9rZW5pemVkUGFuLy92MS8vU0hPV19OT05FLy8xMTExMTExNDExMTExMTEx',
>>>>>>> 751d9d805edb45460feee5683b6eb88a4432e524
            recaptureCsc: true
          };
        const response = await ngeniusPayment.paymentFromSavedCard(paymentSavedCardUrl,accessToken,param);
        console.log(response);
        
    }catch(e){
        console.log('hostedPaymentLinkSample Error : ',e);
    }

}
<<<<<<< HEAD
// paymentFromSavedCard("");
=======
paymentFromSavedCard("");
>>>>>>> 751d9d805edb45460feee5683b6eb88a4432e524


/*
createOrder
*/
async function createOrderAUTH(){

    const accessToken = await ngeniusPayment.getAccessToken();
console.log(accessToken);
    try{
          const paymentCard = await ngeniusPayment.createOrderAUTH(accessToken);
        console.log(paymentCard);
    }catch(e){
        console.log('createOrderAUTH Error : ',e);
    }

}
// createOrderAUTH();

/*
submitpaymentCardInformation
*/
async function submitpaymentCardInformation(){

    const accessToken = await ngeniusPayment.getAccessToken();
console.log(accessToken);
    try{
        const paymentCard = await ngeniusPayment.createOrderAUTH(accessToken);
        console.log(paymentCard);
          const paymentCardUrl = paymentCard.card_link;
          const _3dspaymentCard = await ngeniusPayment.submitpaymentCardInformation(accessToken, paymentCardUrl);

          console.log(_3dspaymentCard);
          // cnp3ds_url

          const _3dsHtml = await ngeniusPayment.get3dsHtml(_3dspaymentCard['3ds']);
        console.log(_3dsHtml);
    }catch(e){
        console.log('createOrderAUTH Error : ',e);
    }

}
// submitpaymentCardInformation();


/*
payAfter3dPayment
*/
async function payAfter3dPayment(cnp3ds_url){
    try{
        const accessToken = await ngeniusPayment.getAccessToken();
        
        const param={"PaRes":"Y"};
        const _3dsHtml = await ngeniusPayment.payAfter3dPayment(cnp3ds_url,accessToken,param);
        console.log(_3dsHtml);
        
    }catch(e){
        console.log('createOrderAUTH Error : ',e);
    }

}
// payAfter3dPayment("cnp3ds_url");

/*
capturePayment
*/
async function capturePayment(capture_url){
    try{
        const accessToken = await ngeniusPayment.getAccessToken();
        
        const param={ amount: { currencyCode: 'AED', value: 4000 } };
        const _3dsHtml = await ngeniusPayment.capturePayment(capture_url,accessToken,param);
        console.log(_3dsHtml);
        
    }catch(e){
        console.log('createOrderAUTH Error : ',e);
    }

}
// capturePayment("");


/*
payAfter3dPayment
*/
async function cancelPayment(capture_url){
    try{
        const accessToken = await ngeniusPayment.getAccessToken();
        
        const captureResponse = await ngeniusPayment.cancelPayment(capture_url,accessToken);
        console.log(captureResponse);
        
    }catch(e){
        console.log('createOrderAUTH Error : ',e);
    }

}
//  cancelPayment(capture_url);





/*
websdk
*/
async function websdk(){

//     const accessToken = await ngeniusPayment.getAccessToken();
// console.log(accessToken);
    try{
          const _3dsHtml = await ngeniusPayment.websdk();
        console.log(_3dsHtml);
    }catch(e){
        console.log('createOrderAUTH Error : ',e);
    }

}
// websdk();


/*
websdk
*/
async function payment_hostedSession(sessionId){

        const accessToken = await ngeniusPayment.getAccessToken();
        try{
              const _3dsHtml = await ngeniusPayment.payment_hostedSession(accessToken,sessionId);
            console.log(_3dsHtml);
        }catch(e){
            console.log('createOrderAUTH Error : ',e);
        }
    
    }
    // payment_hostedSession("sessionId");



}catch(err){
    console.log(err.message);
}




