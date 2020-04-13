 const express = require('express');
 const mongoose = require('mongoose');
 const path = require('path');
 const validator = require('validator');
 const bcrypt = require('bcrypt');
 const parser = require('body-parser');
 mongoose.promise = global.promise;

let app = express();

app.use(parser.json());
app.use(parser.urlencoded({
  extended: false
}));

 const PORT = process.env.PORT || 8000;
 app.listen(PORT, ()=>{
   console.log(`listening to port ${PORT}`)
 });

 // creating a mongodb connection
const url = "mongodb://localhost:27018/customer"

mongoose.connect(url, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})

//creating a mongodb schema
let customer = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
   email  : {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  }
})

// adding schema as a mongoose model
let customers = mongoose.model("customer", customer)

//user signin and authentication
app.post("/signin", (req, res, next) => {
  customers.findOne({
      email: req.body.email
    })
    .exec()
    .then(customer => {
      if (customer) {
        bcrypt.compare(req.body.password, customer.password, (err, hashed) => {
          if (hashed) {
            return res.json({
              res: "Authentication successful"
            })
          } else {
            return res.json({
              res: "Authentication failed"
            })
          }
        })
      } else {
        return res.json({
          res: "wrong email or password"
        })
      }
    })
    .catch(error => {
      console.log(error)
    })
})





// user signup
app.post("/signup", (req, res, next) => {
  customers.findOne({
      email: req.body.email
    })
    .exec()
    .then(customer => {
      if (customer) {
        return res.json({
          res: "email already exist"
        })
      } else {

        if (validator.isEmail(req.body.email)) {
          bcrypt.hash(req.body.password, 15, (err, hash) => {
            if (err) {
              console.log(err)
            }

            let email = req.body.email
            let new_user = new customers({
              _id: new mongoose.Types.ObjectId,
              email: email,
              password: hash
            })

            new_user
              .save()
              .then(data => {
                if (data) {
                  return res.json({
                    res: "user account created successfully",
                    data: data
                  })
                }
              })
              .catch(error => {
                console.log(error)
              })
          })

        } else {
          return res.json({
            res: "invalid data input for email or age"
          })
        }

      }
    })
    .catch(error => {
      console.log(error)
    })

})


module.exports = app
