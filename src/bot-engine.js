const axios = require('axios');

const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
// const PAGE_ACCESS_TOKEN = "EAACZCtG0mQYcBAOwZC9hgfxZB5xRvqftpOYqeKyLCrKczqs7mdhniTZAcsZBPGajYUJ1WV2ujcAAn7YsHm5xAMtYviKZALHiYg4ThwhwXvo3NpgZBQZCZC9T01KeywJZAugwpKeNa0RLOMPiv0iVU1afP5bpSTj8em8iEIcEErZByXZAGgZDZD"
const BASE_FB_URL = 'https://graph.facebook.com/v2.6';
const FB_MESSENGER_URL = `${BASE_FB_URL}/me/messages?access_token=${PAGE_ACCESS_TOKEN}`;

const postMessage = (recipientId, message) => {
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
          // const userDetails = retrieveUserDetails(sender).
          //   then(response => {
          //     const firstName = response.data.first_name;
          //     //postMessage(sender, { text: 'Zdravo! Dobrodošli u našu prodavnicu!' });
          //     postMessage(sender, { text: `Zdravo ${firstName}, dobrodošli u našu prodavnicu!` });
              
          //   });
          sendWelcomeMessage(sender);
        } else if (payload === 'WOMEN_OPTION_SELECTED' || payload === 'MEN_OPTION_SELECTED') {
          sendSizeOptions(sender);
        }

      }

    });
  });

}

module.exports = {
  handleIncomingMessage
}

//pravimo get request da bismo izvukli korisnikovo ime
const retrieveUserDetails = (userId) => {
  return axios.get(`${BASE_FB_URL}/${userId}?fields=first_name&access_token=${PAGE_ACCESS_TOKEN}`)
    .catch(function (error) {
      console.error(`Unable to user details ${userId}`, error);
    });
}

//pravimo da welcome message bude strukturisana
const sendWelcomeMessage = (sender) => {
  const userDetails = retrieveUserDetails(sender).
    then(response => {
      const firstName = response.data.first_name;
      const title = `Zdravo ${firstName}, dobrodošli u našu prodavnicu. Za šta ste zainteresovani danas?`;
      const message = {
        attachment: {
          type: 'template',
          payload: {
            template_type: 'button',
            text: title,
            buttons:
            [
              {
                type: 'postback',
                title: 'Žensko',
                payload: 'WOMEN_OPTION_SELECTED'
              }, {
                type: 'postback',
                title: 'Muško',
                payload: 'MEN_OPTION_SELECTED'
              }
            ]
          }
        }
      };
      postMessage(sender, message);
    });
}

//Importujem store-api da bih dobio size opcije i na osnovu njih napravio dugmica
const storeApi = require('./store-api');

const sendSizeOptions = (sender) => {
    const buttons = storeApi.getSizes.map(function (option) {
        return {
            content_type: 'text',
            title: option.label,
            payload: JSON.stringify({ size: option.value }) //postavljen je na JavaScript objekat sa key size i value - size option value 
        }
    });
    const message = {
        text: `Molimo Vas da odaberite željenu veličinu.`,
        quick_replies: buttons
    }
    postMessage(sender, message);
}


