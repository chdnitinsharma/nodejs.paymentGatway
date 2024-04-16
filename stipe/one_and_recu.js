const stripe = require('stripe')('sk_test_51LxBMdACWKfMz1cKfqDNQcPojwSo35t8MLwBjbu8Pr8xuzxz7HhU7HbS2hQKAKrtWlhktmpqv0bYC7Xh0mTwfMu500VtGjqUeD');

(async function(){



const domainPrice = await stripe.prices.create({
    currency: 'usd',
    recurring: {
      interval: 'month',
    },
    product_data: {
      name: 'Domain (.com, .net)', // Name of the product
    },
    unit_amount: 1200, // Amount in cents ($12.00)
  });

  const laborPrice = await stripe.prices.create({
    currency: 'usd',
    recurring: {
      interval: 'month',
    },
    product_data: {
      name: 'Labor', // Name of the product
    },
    unit_amount: 1500, // Amount in cents ($15.00)
  });

  const emailAccountPrice = await stripe.prices.create({
    currency: 'usd',
    recurring: {
      interval: 'month',
    },
    product_data: {
      name: 'Email Account', // Name of the product
    },
    recurring: {
      interval: 'month', // Monthly billing
    },
    unit_amount: 600, // Amount in cents ($6.00)
  });

  // Create a subscription with the individual prices
  const subscription = await stripe.subscriptions.create({
    customer: 'cus_PvyN6t4yyq6CAl', // Customer's email
    items: [
      { price: domainPrice.id, quantity: 2 }, // Domain
      { price: laborPrice.id, quantity: 40 }, // Labor
      { price: emailAccountPrice.id, quantity: 40 }, // Email Account
    ],
    // success_url: 'https://yourwebsite.com/success', // Redirect URL after successful payment
    // cancel_url: 'https://yourwebsite.com/cancel', // Redirect URL after canceled payment
  });

  console.log( JSON.stringify(subscription) );
  console.log(subscription.latest_invoice.hosted_invoice_url);

})()