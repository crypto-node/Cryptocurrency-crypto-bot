//var config = require('../config.js');
try{
    var config = process.cwd()+'/config.js';
    config = require(config);
}catch (error){
    console.error('ERROR -> Unable to load config file.');
    process.exit(1);
}

/* ------------------------------------------------------------------------------ */
// // // // // // // // // // // // // // // // // // // // // // // // // // // //
/* ------------------------------------------------------------------------------ */

const Big = require('big.js'); // https://github.com/MikeMcl/big.js -> http://mikemcl.github.io/big.js/
const rp = require('request-promise');

/* ------------------------------------------------------------------------------ */
// // // // // // // // // // // // // // // // // // // // // // // // // // // //
/* ------------------------------------------------------------------------------ */

module.exports = {

    /* ------------------------------------------------------------------------------ */
    // Get x random elements from array
    /* ------------------------------------------------------------------------------ */

    check_getRandomFromArray: function (arr, n) {
        var result = new Array(n),
            len = arr.length,
            taken = new Array(len);
        if (n > len)
            throw new RangeError("getRandom: more elements taken than available");
        while (n--) {
            var x = Math.floor(Math.random() * len);
            result[n] = arr[x in taken ? taken[x] : x];
            taken[x] = --len in taken ? taken[len] : len;
        }
        return result;
    },

    /* ------------------------------------------------------------------------------ */
    // Check if valid json
    /* ------------------------------------------------------------------------------ */

    check_valid_json: function (n) {
        if (/^[\],:{}\s]*$/.test(n.replace(/\\["\\\/bfnrtu]/g, '@').
        replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').
        replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {
            return true;
        }else{
            return false;
        }
    },

    /* ------------------------------------------------------------------------------ */
    // Check if value is out of javascript max integer range
    /* ------------------------------------------------------------------------------ */

    check_out_of_int_range: function (n) {
        if(Big(n).gte(Big(Number.MAX_SAFE_INTEGER))){
            return true;
        }
        if(Big(n).lte(Big(Number.MIN_SAFE_INTEGER))){
            return true;
        }
        return false;
    },

    /* ------------------------------------------------------------------------------ */
    // Check if value is a number
    /* ------------------------------------------------------------------------------ */

    check_isNumeric: function (n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
    },

    /* ------------------------------------------------------------------------------ */
    // Slice string
    /* ------------------------------------------------------------------------------ */

    check_slice_string: function(string,lenght){
        try{
            return string.substring(0, lenght);
        }catch (error){
            return 'noName';
        }
    },

    /* ------------------------------------------------------------------------------ */
    // Check if the message is a valid message and only contains valid characters
    /* ------------------------------------------------------------------------------ */

    check_valid_content: function(msg){
        //console.log(msg);
        return /^[a-zA-Z0-9\.\ \_\:\!\+\[\]\#\@\<\>]{2,500}$/.test(msg);
    },

    /* ------------------------------------------------------------------------------ */
    // Check valid discord id (start with <@ , mid only numbers, end >)
    /* ------------------------------------------------------------------------------ */

    /*check_valid_discord_id: function(msg){
        return /^\/<@?|<@!?\d+\>$/.test(msg);
    },*/

    check_valid_discord_id: function(msg){
        //console.log(msg);
        //return /^\<@\d+\>$/.test(msg);
        if(/^\<@\d+\>$/.test(msg)){
            return true;   
        }else if(/^\<@!\d+\>$/.test(msg)){ 
            return true;
        }else{ 
            return false;
        }
     },

    /* ------------------------------------------------------------------------------ */
    // Check if the channel is a valid channel to repond to
    /* ------------------------------------------------------------------------------ */

    check_respond_channel: function(channelID){
        var respondChannelIDs = {};
        for (var i = 0 ; i < config.bot.respondChannelIDs.length ; ++i)
        respondChannelIDs[config.bot.respondChannelIDs[i]] = true;
        return respondChannelIDs[channelID];
    },

    /* ------------------------------------------------------------------------------ */
    // Return the user role
    /* ------------------------------------------------------------------------------ */

    check_user_role: function(userID,userRoles){ // Role value 0 = normal user, 1 = vip user, 2 = moderator, 3 = admin
        var adminIDs = {};
        for (var i = 0 ; i < config.bot.adminIDs.length ; ++i)
          adminIDs[config.bot.adminIDs[i]] = true;
        if(adminIDs[userID])
            return 3; // if admin
        var moderatorIDs = {};
        for (var i = 0 ; i < config.bot.moderatorIDs.length ; ++i)
          moderatorIDs[config.bot.moderatorIDs[i]] = true;
        if(moderatorIDs[userID])
            return 2; // if moderator
        if(userRoles !== 'none'){
            if(userRoles.find(x => x.name === config.bot.vipGroupName))
            return 1; // if vip user
        }
        return 0; // If no role
    },

    /* ------------------------------------------------------------------------------ */
    // Get current currency price for coin id
    /* ------------------------------------------------------------------------------ */
    check_get_coin_price: function(){ 
        return new Promise((resolve, reject)=>{

            var apiService = config.coinPrice.apiService;
            var requestOptions = {}; 

            switch (apiService) {
                case 'coinmarketcap':
                        requestOptions = {
                            method: 'GET',
                            uri: 'https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest',
                            qs: {
                                'symbol': config.coinPrice.coinSymbol,
                                'convert': config.coinPrice.currency
                            },
                            headers: {
                                'X-CMC_PRO_API_KEY': config.coinPrice.apiKey
                            },
                            json: true,
                            gzip: true
                        };
                        rp(requestOptions).then(response => {
                            if(response.status.error_code > 0){
                                resolve(false);
                            }else{
                                resolve(response.data[config.coinPrice.coinSymbol].quote[config.coinPrice.currency].price);
                            }
                        }).catch((err) => {
                            resolve(false);
                        });
                    break;
                case 'cryptocompare':
                        requestOptions = {
                            method: 'GET',
                            uri: 'https://min-api.cryptocompare.com/data/price',
                            qs: {
                                'fsym': config.coinPrice.coinSymbol,
                                'tsyms': config.coinPrice.currency,
                                'api_key': config.coinPrice.apiKey
                            },
                            json: true,
                            gzip: true
                        };
                        rp(requestOptions).then(response => {
                            if(response.Response == "Error"){
                                resolve(false);
                            }else{
                                resolve(response[config.coinPrice.currency]);
                            }
                        }).catch((err) => {
                            resolve(false);
                        });
                    break;
                default:
                    resolve(false);
            }

        });
    }
    
};