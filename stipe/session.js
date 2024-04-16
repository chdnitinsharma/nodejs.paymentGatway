
const stripe = require('stripe')('sk_test_51LxBMdACWKfMz1cKfqDNQcPojwSo35t8MLwBjbu8Pr8xuzxz7HhU7HbS2hQKAKrtWlhktmpqv0bYC7Xh0mTwfMu500VtGjqUeD');

async function createCheckoutSession() {
    try {

        
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

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: 'Product Name', // Replace with your product name
              },
              unit_amount: 1200, // Replace with the price in cents
            },
            quantity: 1,
          },
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: 'Product Name', // Replace with your product name
              },
              unit_amount: 1500, // Replace with the price in cents
            },
            quantity: 1,
          },
        // { price: domainPrice.id, quantity: 2 }, // Domain
        // { price: laborPrice.id, quantity: 40 }, // Labor
        { price: emailAccountPrice.id, quantity: 1 }, // Email Account
        ],
        mode: 'subscription',
        success_url: 'https://example.com/success', // Replace with your success URL
        cancel_url: 'https://example.com/cancel', // Replace with your cancel URL
      });
      
      console.log(session.url);

      // Return the session ID
      return session.id;
    } catch (error) {
      console.error('Error creating Checkout session:', error);
      throw error;
    }
  }
  
  async function main() {
    try {
      // Create Checkout session
      const sessionId = await createCheckoutSession();
      
      // Construct the URL
      const checkoutUrl = `https://checkout.stripe.com/pay/cs_live?sessionId=${sessionId}`;
  
      console.log('Checkout URL:', checkoutUrl);
    } catch (error) {
      console.error('Error:', error);
    }
  }
  
  main();