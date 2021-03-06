'use strict'

const express = require('express');
const bodyParser = require('body-parser');
const request = require('request'); //dodao 
//const app = express();
const app = require('express')(); //
const botEngine = require('./src/bot-engine'); //

const VALIDATION_TOKEN = 'gentlemanchoicebottoken'; //

//res.setHeader("Content-Type", "application/json; charset=utf-8"); //ja dodao za utf-8

const hbs = require('express-handlebars').create({});

const products = require('./products'); 


app.set('port', (process.env.PORT || 5000));
// console.log(process.env.PORT)
  
// Process application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}));

// Process application/json
app.use(bodyParser.json());


app.use(express.static('public'));
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');

// Index route
app.get('/', function (req, res) {
    res.status(200).send('Zdravo! Ja sam četbot. Napiši mi nešto.')
});

// for Facebook verification //
app.get('/webhook', function (req, res) {
  //console.log("query", req.query)
  if (req.query['hub.mode'] === 'subscribe' && req.query['hub.verify_token'] === VALIDATION_TOKEN) {
      res.status(200).send(req.query['hub.challenge']);
  } else {
      res.sendStatus(403);
  }
});

// Spin up the server
app.listen(app.get('port'), function() {
    console.log('Aplikacija je pokrenuta na portu', app.get('port'))
});



app.post('/webhook', function (req, res) {
  // console.log(req)
  // console.log(req.body.entry[0])
    /* da probam za chapter 3 izmene
    var data = req.body;
    // console.log(data.object)
    // Make sure this is a page subscription
    if (data.object === 'page') {
  
      // Iterate over each entry - there may be multiple if batched
      data.entry.forEach(function(entry) {
        var pageID = entry.id;
        var timeOfEvent = entry.time;
  
        // Iterate over each messaging event
        entry.messaging.forEach(function(event) {
          if (event.message) {
            receivedMessage(event);
          } else {
            console.log("Webhook received unknown event: ", event);
          }
        });
      });
      */
  
      // Everything went well.
      //
      // You must send back a 200, within 20 seconds, to let the platform know
      // you've successfully received the callback. Otherwise, the request
      // will time out and Facebook Messenger Platform will keep trying to resend.
      
      res.sendStatus(200);
      botEngine.handleIncomingMessage(req.body.entry); 
      //res.status(200).send();
    //}
  });
  
  function receivedMessage(event) {
    // echo the received message for now
    console.log("Message data: ", event.message);
  }

  app.get('/products/', function (req, res) {
    res.status(200).send(filterProducts(req.query, products));
  });

  app.get('/products/:productId', function (req, res) {
    const productId = req.params.productId;
    const product = products.find(p => p.id === productId);
    // for(i = 0; i< products.listen; i++){
    //   if(products[i].id === productId){
    //     return products[i]
    //   }
    // }
    // const product = products.find(function(p){
    //   if(p.id === productId)
    //     return p;
    // });

    if (product) {
      res.status(200).render('product.handlebars', product)
      // res.status(200).send({product})
    } else {
      res.status(404).send({ code: 404, messasge: 'NOT_FOUND' });
    }
  });

  const filterProducts = (query, products) => {
    let filteredProducts = products;
  
    if (query.gender) {
      filteredProducts = filteredProducts.filter(product => product.gender === query.gender);
    }

    if (query.size) {
      filteredProducts = filteredProducts.filter(product => {
        const availableSizes = product.availableSizes;
        return availableSizes.indexOf(query.size) > -1;
      });
    }
    return filteredProducts;
  }




 
  



















