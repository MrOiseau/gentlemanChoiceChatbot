const redis = require('redis');
const bluebird = require('bluebird');
bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);

const client = redis.createClient(process.env.REDIS_URL);

//metoda setData uzima userId i sessionData kao parametre i zove Redis klijenta
//da koristi userId kao kljuc za skladistenje podataka
const setData = (userId, data) => {
    return client.setAsync(userId, JSON.stringify(data));
}

//metoda getData se koristi da bi se vratili podaci o sesiji koji su skladisteni za dati userId
const getData = (userId) => {
    return client.getAsync(userId).then(response => JSON.parse(response));
}

module.exports = {
    getData: getData,
    setData: setData
}