const stripe = require('stripe')('sk_test_51LxBMdACWKfMz1cKfqDNQcPojwSo35t8MLwBjbu8Pr8xuzxz7HhU7HbS2hQKAKrtWlhktmpqv0bYC7Xh0mTwfMu500VtGjqUeD');

// Create a customer and charge them for the initial payment
async function createCustomerAndCharge() {
  try {
    const customer = await stripe.customers.create({
      email: 'customer_test_demo_viewmyads@yopmail.com', // Customer's email
      source: 'tok_visa', // Token representing the customer's payment source (e.g., card)
    });

    // Charge the customer for the initial payment
    const charge = await stripe.charges.create({
      amount: 3300, // Amount in cents ($100 in this example)
      currency: 'usd',
      customer: customer.id,
      description: 'Initial Payment',
    });

    console.log('Charge successful:', charge);

    // At this point, you would likely save the customer ID in your database for future reference
  } catch (error) {
    console.error('Error:', error);
  }
}

// Schedule monthly charges for the customer
async function scheduleMonthlyCharges() {
  try {
    // Retrieve the customer ID from your database (assuming you've stored it)
    const customerId = 'cus_PvyN6t4yyq6CAl';

    // Create a subscription for the customer
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: 6.00 }], // The ID of the monthly price you've created in your Stripe Dashboard
      billing_cycle_anchor: 'now',
    });

    console.log('Subscription created:', subscription);
  } catch (error) {
    console.error('Error:', error);
  }
}

// Call the functions to initiate the payment flow
// createCustomerAndCharge();
scheduleMonthlyCharges();