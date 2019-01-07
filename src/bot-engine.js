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

      //da posalje poruku korisnicima sa listom proizvoda nakon selektovanja velicine majce
      // // if (event.message) {
      // //   if (event.message.quick_reply) {  //ako primis messaging event sa quick_reply objektom
      // //    sendMatchingProducts(sender);
      // //   }
      // // }
      if (event.message && event.message.quick_reply) {
        handleQuickReplies(sender, event.message.quick_reply);
      } else if (event.postback) {
        handlePostback(sender, event.postback);
      }
    });
  });
}

// //       if (event.postback) {
// //         const { payload } = event.postback;
// //         if (payload === 'GET_STARTED_BUTTON_CLICKED') {
// //           // const userDetails = retrieveUserDetails(sender).
// //           //   then(response => {
// //           //     const firstName = response.data.first_name;
// //           //     //postMessage(sender, { text: 'Zdravo! Dobrodošli u našu prodavnicu!' });
// //           //     postMessage(sender, { text: `Zdravo ${firstName}, dobrodošli u našu prodavnicu!` });
              
// //           //   });
// //           sendWelcomeMessage(sender);
// //         } else if (payload === 'WOMEN_OPTION_SELECTED' || payload === 'MEN_OPTION_SELECTED') {
// //           sendSizeOptions(sender);
// //         }

// //       }

// //     });
// //   });

// // }

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

// // //pravimo da welcome message bude strukturisana
// // const sendWelcomeMessage = (sender) => {
// //   const userDetails = retrieveUserDetails(sender).
// //     then(response => {
// //       const firstName = response.data.first_name;
// //       const title = `Zdravo ${firstName}, dobrodošli u našu prodavnicu. Za šta ste zainteresovani danas?`;
// //       const message = {
// //         attachment: {
// //           type: 'template',
// //           payload: {
// //             template_type: 'button',
// //             text: title,
// //             buttons:
// //             [
// //               {
// //                 type: 'postback',
// //                 title: 'Žensko',
// //                 payload: 'WOMEN_OPTION_SELECTED'
// //               }, {
// //                 type: 'postback',
// //                 title: 'Muško',
// //                 payload: 'MEN_OPTION_SELECTED'
// //               }
// //             ]
// //           }
// //         }
// //       };
// //       postMessage(sender, message);
// //     });
// // }

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



// // const sendMatchingProducts = (sender) => {
// //   storeApi.retriveProducts().then(response => {
// //     const message = createProductList(response);
// //     postMessage(sender, message);
// //   });
// // }

//šaljemo akciju tiping_on pre nego što pozovemo našu backend service 
//za preuzimanje proizvoda, a zatim pošaljite akciju tiping_off kada dobijemo 
//odgovor od service.
const sendMatchingProducts = (sender, filter) => {
  postSenderAction(sender, 'typing_on');
  storeApi.retriveProducts(filter).then(response => {
    const message = createProductList(response);

    postMessage(sender, message).then((response) => {
      //showMessageToStartNewSearch(sender);
      sendOptionToStartNewSearch(sender);
      postSenderAction(sender, 'typing_off');
    });
  });
}

function createProductList(products) {
  const elements = products.map(product => {
    return {
      title: product.name,
      subtitle: product.description,
      image_url: product.imageUrl,
      item_url: product.url,
      buttons: [{
        type: "web_url",
        url: product.url,
        title: "Kupi"
      }],
    }
  });
  return {
    attachment: {
      type: "template",
      payload: {
        template_type: "generic",
        elements
      }
    }
  };
}



//Sada moramo da ažuriramo naš bot engine da biste sačuvali opcije koje je 
//izabrao korisnik, a zatim koristimo ove opcije da dobijemo 
//odgovarajuće proizvode.
//1
const session = require('./session');

//updateUserFilter f-ja preuzima podatke iz sesije korisnika, azurira ih 
//novim podacima i cuva ih na nasem Redis serveru
const updateUserFilter = (userId, newData) => {
  return session.getData(userId).then((userData) => {
    if (!userData) {
      userData = { filter: {} };
    }
    userData.filter = Object.assign({}, userData.filter, newData);
    session.setData(userId, userData);
    return userData.filter;
  });
}

//koristi updateUserFilter da sacuva selektovanu velicinu a onda prosledjuje
//azurirani filter ili selektovani pol i velicinu do sendMatchingProducts f-je
//sendMatchingProducts f-ja je azurirana da prosledi filter do storeApi retriveProducts f-je
const handleQuickReplies = (sender, quickReply) => {
  if (quickReply && quickReply.payload) {
    const value = JSON.parse(quickReply.payload);
    updateUserFilter(sender, value)
      .then(filter => {
        sendMatchingProducts(sender, filter);
      });
  }
}

//kada korisnik odabere pol, ova f-ja prosledjuje userId i primljeni payload
//do updateUserFilter f-je da bi sacuvala selektovani pol u korisnickoj sesiji
const handlePostback = (sender, postback) => {
  const { payload } = postback;
  if (payload === 'GET_STARTED_BUTTON_CLICKED') {
    sendWelcomeMessage(sender);
  } else if (payload === 'START_NEW_SEARCH') {
    session.setData(sender, {});
    postMessage(sender, buildButtonTemplateMessage('Šta je to što želite?', getGenderOptionButtons()));  
  } else {
    const value = JSON.parse(payload);
    updateUserFilter(sender, value)
      .then(filter => {
        sendSizeOptions(sender);
      });
  }
}



const sendWelcomeMessage = (sender) => {
  const userDetails = retrieveUserDetails(sender).
    then(response => {
      const firstName = response.data.first_name;
      const title = `Zdravo ${firstName}, dobrodošli u našu prodavnicu. Za šta ste zainteresovani danas?`;
      postMessage(sender, buildButtonTemplateMessage(title, getGenderOptionButtons()));
    });
}

const buildButtonTemplateMessage = (text, buttons) => {
  return {
    attachment: {
      type: 'template',
      payload: {
        template_type: 'button',
        text,
        buttons
      }
    }
  };
}

//da vrati listu postback dugmica za selektovani pol
const getGenderOptionButtons = () => {
  return storeApi.getGender.map(function (option) {
    return {
      type: 'postback',
      title: option.label,
      payload: JSON.stringify({ gender: option.value })
    }
  });
}



//valjda je ovde
 const sendOptionToStartNewSearch = (sender) => {
    const buttons = [{
      type: 'postback',
      title: 'Pronađi još majci',
      payload: 'START_NEW_SEARCH'
    }];
    postMessage(sender, buildButtonTemplateMessage('Klikni ovde da bi započeo novu pretragu.', buttons));
  }

  

//da svojim korisnicima pokažemo vizuelni indikator da obrađujemo njihov zahtev - kuca se itd.
  const postSenderAction = (sender, action) => {
    axios.post(FB_MESSENGER_URL, {
      recipient: { id: sender },
      sender_action: action 
    }).catch(function (error) {
      console.error('Onemogućeno postavljanje poruke na fejsbuk. ', error);
    });
  }









  


 