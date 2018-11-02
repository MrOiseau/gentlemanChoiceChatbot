const axios = require('axios');

const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const BASE_FB_URL = 'https://graph.facebook.com/v2.6';
const FB_MESSENGER_URL = `${BASE_FB_URL}/me/messages?access_token=${PAGE_ACCESS_TOKEN}`;

const postMessage = (recipientId, message) => {
  console.log("FB_MESSENGER_URL:", FB_MESSENGER_URL)
  console.log("recipientId", recipientId)
  console.log("message", message)
  return axios.post(FB_MESSENGER_URL, {
    recipient: { id: recipientId }, message
  })
  .catch(function (error) {
    console.error(`Unable to post message to Facebook ${message}`, error);
  });
}

const handleIncomingMessage = (entries) => {
 
  entries.forEach(function (entry) {
    entry.messaging.forEach(function (event) {
      let sender = event.sender.id
      if (event.postback) {
        const { payload } = event.postback;
        if (payload === 'GET_STARTED_BUTTON_CLICKED') {
            postMessage(sender, { text: 'Zdravo! Dobrodošli u našu prodavnicu!' });
        }
      }
    });
  });
}

module.exports = {
  handleIncomingMessage
}



