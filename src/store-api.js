//2
const axios = require('axios');

const API_BASE_URL = process.env.API_BASE_URL;  //URL od moje prodavnice API Heroku app (dodam varijablu na heroku rucno)
const GET_PRODUCTS_API_URL = `${API_BASE_URL}products`;



const sizes = [
    { label: 'XS', value: 'XS' },
    { label: 'S', value: 'S' },
    { label: 'M', value: 'M' },
    { label: 'L', value: 'L' },
    { label: 'XL', value: 'XL' }
  ];
  
  const genders = [{ label: 'Muško', value: 'M' }, { label: 'Žensko', value: 'Ž' }]
  

//2 - GET request do store API-ja proizvoda da vratimo sve proizvode bez filtera
//   const retriveProducts = () => {
//     return axios.get(GET_PRODUCTS_API_URL)
//       .then(response => {
//         return response.data.map(product => {
//           return Object.assign({}, product, {  //f-ja svim matchovanim produktima dodeljuje imageURL i url
//             imageUrl: `${API_BASE_URL}images/${product.id}.png`,
//             url: `${GET_PRODUCTS_API_URL}/${product.id}`,
//           });
//         });
//       })
//       .catch(function (error) {
//         console.error('Vraćanje proizvoda je bezuspešno', error);
//       });
//   }

//3- Azuriramo retriveProducts f-ju da prosledimo filter object properties kao query
//parametre dok pravimo GET zahteve za naš backend service
  const retriveProducts = (filters) => {
    return axios.get(GET_PRODUCTS_API_URL, {
        params: filters
    }).then(response => {
        return response.data.map(product => {
          return Object.assign({}, product, {  //f-ja svim matchovanim produktima dodeljuje imageURL i url
            imageUrl: `${API_BASE_URL}images/${product.id}.png`,
            url: `${GET_PRODUCTS_API_URL}/${product.id}`,
          });
        });
      }).catch(function (error) {
        console.error('Vraćanje proizvoda je bezuspešno', error);
      });
  }


  module.exports = {
    getSizes: sizes,
    getGender: genders,
    retriveProducts
  }



 