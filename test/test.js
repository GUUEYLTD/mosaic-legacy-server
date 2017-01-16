process.env.NODE_ENV = "development";
//require the devDependencies
let chai = require("chai");
let chaiHTTP = require("chai-http");
let app = require("../app");
let should = chai.should();
 chai.use(chaiHTTP);

 //test the /GET route
 describe("Stripe web hooks invoice modification", () => {
   it("it should return an invoice line item reflecting a negative balance (positive balance for customer)", (done) => {
     chai.request(app)
     .post("/payments/stripe")
     .send({
        "id": "evt_19XghwHnBEehGBcbFRouhOlG",
        "object": "event",
        "api_version": "2016-07-06",
        "created": 1483405400,
        "data": {
          "object": {
            "id": "in_19XghwHnBEehGBcb226S4UAh",
            "object": "invoice",
            "amount_due": 12987,
            "application_fee": null,
            "attempt_count": 0,
            "attempted": false,
            "charge": null,
            "closed": false,
            "currency": "gbp",
            "customer": "cus_9rNyiLO6y8GGwW",
            "date": 1483405400,
            "description": null,
            "discount": null,
            "ending_balance": null,
            "forgiven": false,
            "lines": {
              "object": "list",
              "data": [
                {
                  "id": "sub_9rPUtBJdigpR6B",
                  "object": "line_item",
                  "amount": 12987,
                  "currency": "gbp",
                  "description": null,
                  "discountable": true,
                  "livemode": false,
                  "metadata": {},
                  "period": {
                    "start": 1483405317,
                    "end": 1483491717
                  },
                  "plan": {
                    "id": "test",
                    "object": "plan",
                    "amount": 999,
                    "created": 1483405219,
                    "currency": "gbp",
                    "interval": "day",
                    "interval_count": 1,
                    "livemode": false,
                    "metadata": {},
                    "name": "test",
                    "statement_descriptor": null,
                    "trial_period_days": null
                  },
                  "proration": false,
                  "quantity": 13,
                  "subscription": null,
                  "type": "subscription"
                }
              ],
              "has_more": false,
              "total_count": 1,
              "url": "/v1/invoices/in_19XghwHnBEehGBcb226S4UAh/lines"
            },
            "livemode": false,
            "metadata": {},
            "next_payment_attempt": 1483409000,
            "paid": false,
            "period_end": 1483405317,
            "period_start": 1483405257,
            "receipt_number": null,
            "starting_balance": 0,
            "statement_descriptor": null,
            "subscription": "sub_9rPUtBJdigpR6B",
            "subtotal": 12987,
            "tax": null,
            "tax_percent": null,
            "total": 12987,
            "webhooks_delivered_at": null
          }
        },
        "livemode": false,
        "pending_webhooks": 1,
        "request": null,
        "type": "invoice.created"
      })
     .end((err, res) => {
       if(err){
         console.log(err);
       } else {
         console.log(res.body);
         res.body.should.have.property("discount");
         res.body.discount.should.have.property("amount");
         res.body.discount.amount.should.be.below(0);
       };
       done();
     });
   });
 });
