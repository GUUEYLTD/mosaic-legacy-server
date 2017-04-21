process.env.NODE_ENV = "development";
//require the devDependencies
let chai = require("chai");
let chaiHTTP = require("chai-http");
let app = require("../app");
let should = chai.should();
let expect = chai.expect;
 chai.use(chaiHTTP);
 //test the /GET route
 describe("Stripe web hooks invoice modification", () => {
   it("it should return an invoice line item reflecting a negative balance (positive balance for customer)", (done) => {
     chai.request(app)
     .post("/payments/stripe")
     .send({
       'type': 'invoice.created',
       'id': 'evt_1A8PfWD1KTW9jbYSnYVSfA2J',
        "object": {
          "id": "in_1A8PfWD1KTW9jbYSVBBeoUn3",
          "object": "invoice",
          "amount_due": 4995,
          "application_fee": null,
          "attempt_count": 0,
          "attempted": true,
          "charge": "ch_1A8PfWD1KTW9jbYSovAz6l2y",
          "closed": true,
          "currency": "gbp",
          "customer": "cus_ATMOxavPAhUlnT",
          "date": 1492158038,
          "description": null,
          "discount": null,
          "ending_balance": 0,
          "forgiven": false,
          "lines": {
            "object": "list",
            "data": [
              {
                "id": "sub_ATMO7Whyk78q6s",
                "object": "line_item",
                "amount": 4995,
                "currency": "gbp",
                "description": null,
                "discountable": true,
                "livemode": false,
                "metadata": {
                },
                "period": {
                  "start": 1492158038,
                  "end": 1494750038
                },
                "plan": {
                  "id": "core1",
                  "object": "plan",
                  "amount": 999,
                  "created": 1491894662,
                  "currency": "gbp",
                  "interval": "month",
                  "interval_count": 1,
                  "livemode": false,
                  "metadata": {
                  },
                  "name": "Mosaic Core",
                  "statement_descriptor": "Mosiac Core",
                  "trial_period_days": null
                },
                "proration": false,
                "quantity": 5,
                "subscription": null,
                "subscription_item": "si_1A8PfWD1KTW9jbYS440xUCzM",
                "type": "subscription"
              }
            ],
            "has_more": false,
            "total_count": 1,
            "url": "/v1/invoices/in_1A8PfWD1KTW9jbYSVBBeoUn3/lines"
          },
          "livemode": false,
          "metadata": {
          },
          "next_payment_attempt": null,
          "paid": true,
          "period_end": 1492158038,
          "period_start": 1492158038,
          "receipt_number": null,
          "starting_balance": 0,
          "statement_descriptor": null,
          "subscription": "sub_ATMO7Whyk78q6s",
          "subtotal": 4995,
          "tax": null,
          "tax_percent": null,
          "total": 4995,
          "webhooks_delivered_at": null
        }
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
