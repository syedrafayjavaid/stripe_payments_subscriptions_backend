const express = require("express");
const app = express();
const stripe = require("stripe")("sk_test_51MGcB9KTpObysRsz09cqgJQMMotThnENOwVZIwMC4imArADJjv0vGjFuuqiAICOjAuJzkmcC7srmZ39Wsw80R0ks00VquiSkQ6")
const cors = require("cors");
const uuid4 = require("uuid4");


// loading env variables
require('dotenv').config();

// Middlewares
app.use(express.json())
app.use(cors())


// Making server listen
app.listen(process.env.PORT, () => {
    console.log(`The stripe app is listening on the port ${process.env.PORT}`);
})

app.get('/', (req, res) => {

    res.send("Stripe backend is live")
})

app.post('/payment', (req, res) => {

    const { product, token } = req.body;

    const idempotencyKey = uuid4();

    return stripe.customers.create({
        email: token.email,
        source: token.id
    }).then((customer) => {
        stripe.charges.create({
            amount: product.price * 100, // As stripe operates in cents so converting in dollars,
            currency: 'usd',
            customer: customer.id,
            receipt_email: token.email,
            description: `Purchase of ${product.name}`,
            shipping: {
                name: token.card.name,
                address: {
                    country: token.card.address_country
                }
            }

        }, { idempotencyKey: idempotencyKey })
    })
        .then(result => { res.status(200).json({ data: result }) })
        .catch(err => { console.log("Error occured", err); })


})

app.post('/subscription', (req, res) => {

    const { product, token } = req.body;
    console.log("product has", product);
    console.log("Price has", product.price)
    console.log("The token has", token);

    return stripe.customers.create({
        email: token.email,
        source: token.id
    }).then((customer) => {
        stripe.subscriptions.create({
            customer: customer.id,
            items: [
                { price: 'price_1MH0X3KTpObysRszGYooICkT' },
            ]
        })
    }).then(result => { res.status(200).json({ data: result }) })
        .catch(err => { console.log("Error occured", err); })


})

app.post('/createProduct', (req, res) => {

    const { product } = req.body;
    return stripe.products.create({
        name: product.name,
        default_price_data: {
            currency: "PKR",
            unit_amount: product.price * 100,
            recurring: {
                interval: "month"
            }
        },
        description: product.description
    }).then(result => {
        console.log("The product creation result has", result);
        res.status(200).json({ data: result })
    })
        .catch(err => { console.log("Error occured", err); })


})
