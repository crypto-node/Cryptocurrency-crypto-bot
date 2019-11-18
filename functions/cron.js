//var config = require('../config.js');
try{
    var config = process.cwd()+'/config.js';
    config = require(config);
}catch (error){
    console.error('ERROR -> Unable to load config file.');
    process.exit(1);
}

const Big = require('big.js'); // https://github.com/MikeMcl/big.js -> http://mikemcl.github.io/big.js/

var command = require("./command.js");
var check = require("./check.js");
var transaction = require("./transaction.js");

/* ------------------------------------------------------------------------------ */
// // // // // // // // // // // // // // // // // // // // // // // // // // // //
/* ------------------------------------------------------------------------------ */

module.exports = {

    /* ------------------------------------------------------------------------------ */
    // Process deposits cron
    /* ------------------------------------------------------------------------------ */

    cron_get_deposits: function() {
        setInterval(function (){ 
            command.command_get_deposits(0);
        }, config.wallet.depositsConfirmationTime*1000);
    },

    /* ------------------------------------------------------------------------------ */
    // Credit deposits cron
    /* ------------------------------------------------------------------------------ */

    cron_credit_deposits: function() {
        setInterval(function (){ 
            command.command_credit_deposits(0);
        }, config.wallet.depositsCreditTime*1000);
    },

    /* ------------------------------------------------------------------------------ */
    // Check saved wallet transactions for stakes
    /* ------------------------------------------------------------------------------ */

    cron_get_stakes: function() {
        setInterval(function (){ 
            command.command_get_stakes(0);
        }, config.staking.checkTime*1000);
    },

    /* ------------------------------------------------------------------------------ */
    // Credit stake transactions
    /* ------------------------------------------------------------------------------ */

    cron_credit_stakes: function() {
        setInterval(function (){ 
            command.command_credit_stakes(0);
        }, config.staking.creditTime*1000);
    },

    /* ------------------------------------------------------------------------------ */
    // Get coin price
    /* ------------------------------------------------------------------------------ */

    cron_price: async function() {
        var newCoinPrice = 0; 
        newCoinPrice = await check.check_get_coin_price();
        if(newCoinPrice){
            coinPrice = newCoinPrice;
            coinCentPrice = Big(0.01).div(newCoinPrice).toFixed(8);
            saveCoinPriceHistory = await transaction.transaction_coin_price_history(coinPrice);
        }
        setInterval(async function (){ 
            // Check if bot is curently disabled
            if(botEnabled){
                newCoinPrice = await check.check_get_coin_price();
                if(newCoinPrice){
                    coinPrice = newCoinPrice;
                    coinCentPrice = Big(0.01).div(newCoinPrice).toFixed(8);
                    saveCoinPriceHistory = await transaction.transaction_coin_price_history(coinPrice);
                }
            }
        }, config.coinPrice.cronTime*1000);
    } 

};