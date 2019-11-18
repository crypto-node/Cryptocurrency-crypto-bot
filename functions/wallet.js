//var config = require('../config.js');
try{
    var config = process.cwd()+'/config.js';
    config = require(config);
}catch (error){
    console.error('ERROR -> Unable to load config file.');
    process.exit(1);
}

var log = require('./log.js');

/* ------------------------------------------------------------------------------ */
// // // // // // // // // // // // // // // // // // // // // // // // // // // //
/* ------------------------------------------------------------------------------ */

// A node.js library for communicating with Bitcoin daemon. -> https://www.npmjs.com/package/altcoin-rpc
const Client = require('altcoin-rpc');
const coinClient = new Client({ host: config.wallet.server, username: config.wallet.user, password: config.wallet.password, port: config.wallet.port });

const Big = require('big.js'); // https://github.com/MikeMcl/big.js -> http://mikemcl.github.io/big.js/

/* ------------------------------------------------------------------------------ */
// // // // // // // // // // // // // // // // // // // // // // // // // // // //
/* ------------------------------------------------------------------------------ */

module.exports = {

    /* ------------------------------------------------------------------------------ */
    // Create deposit address for user id
    /* ------------------------------------------------------------------------------ */

    wallet_create_deposit_address: function(){
        return new Promise((resolve, reject)=>{
            coinClient.getNewAddress(function(error, result) {
                if(error){
                    var errorMessage = "wallet_create_deposit_address: Wallet query problem. (getnewaddress)";
                    if(config.bot.errorLogging){
                        log.log_write_file(errorMessage);
                        log.log_write_file(error);
                    }
                    log.log_write_console(errorMessage);
                    log.log_write_console(error);
                    resolve(false);
                }else{
                    resolve(result);
                }   
            });
        });
    },

    /* ------------------------------------------------------------------------------ */
    // Get latest deposits from wallet
    /* ------------------------------------------------------------------------------ */

    wallet_get_latest_deposits: function(){
        return new Promise((resolve, reject)=>{
            coinClient.listTransactions('*', config.wallet.depositsToCheck, function(error, result) {
                if(error){
                    var errorMessage = "wallet_get_latest_deposits: Wallet query problem. (listTransactions)";
                    if(config.bot.errorLogging){
                        log.log_write_file(errorMessage);
                        log.log_write_file(error);
                    }
                    log.log_write_console(errorMessage);
                    log.log_write_console(error);
                    resolve(false);
                }else{
                    resolve(result);
                }   
            });
        });
    },

    /* ------------------------------------------------------------------------------ */
    // Check if payout address is valid
    /* ------------------------------------------------------------------------------ */

    wallet_validate_address: function(address){
        return new Promise((resolve, reject)=>{
            coinClient.validateAddress(address, function(error, result) {
                if(error){
                    var errorMessage = "wallet_validate_address: Wallet query problem. (validateAddress)";
                    if(config.bot.errorLogging){
                        log.log_write_file(errorMessage);
                        log.log_write_file(error);
                    }
                    log.log_write_console(errorMessage);
                    log.log_write_console(error);
                    resolve('error');
                }else{
                    resolve(result.isvalid);
                }   
            });
        });
    },

    /* ------------------------------------------------------------------------------ */
    // Do withdrawal to address
    /* ------------------------------------------------------------------------------ */

    wallet_send_to_address: function(address,amount){
        return new Promise((resolve, reject)=>{
            coinClient.sendToAddress(address,amount, function(error, result) {
                if(error){
                    var errorMessage = "wallet_send_to_address: Wallet query problem. (sendToAddress)";
                    if(config.bot.errorLogging){
                        log.log_write_file(errorMessage);
                        log.log_write_file(error);
                    }
                    log.log_write_console(errorMessage);
                    log.log_write_console(error);
                    resolve(false);
                }else{
                    resolve(result);
                }   
            });
        });
    },

    /* ------------------------------------------------------------------------------ */
    // Get transaction
    /* ------------------------------------------------------------------------------ */

    wallet_get_transaction: function(txid){
        return new Promise((resolve, reject)=>{
            coinClient.getTransaction(txid, function(error, result) {
                if(error){
                    var errorMessage = "wallet_get_transaction: Wallet query problem. (getTransaction)";
                    if(config.bot.errorLogging){
                        log.log_write_file(errorMessage);
                        log.log_write_file(error);
                    }
                    log.log_write_console(errorMessage);
                    log.log_write_console(error);
                    resolve(false);
                }else{
                    resolve(result);
                }   
            });
        });
    },

    /* ------------------------------------------------------------------------------ */
    // Get balance
    /* ------------------------------------------------------------------------------ */

    wallet_get_balance: function(){
        return new Promise((resolve, reject)=>{
            coinClient.getBalance('*',function(error, result) {
                if(error){
                    var errorMessage = "wallet_get_balance: Wallet query problem. (getTransaction)";
                    if(config.bot.errorLogging){
                        log.log_write_file(errorMessage);
                        log.log_write_file(error);
                    }
                    log.log_write_console(errorMessage);
                    log.log_write_console(error);
                    resolve(false);
                }else{
                    resolve(result);
                }   
            });
        });
    },

    /* ------------------------------------------------------------------------------ */
    // Get wallet info
    /* ------------------------------------------------------------------------------ */

    wallet_get_info: function(){
        return new Promise((resolve, reject)=>{
            coinClient.getInfo(function(error, result) {
                if(error){
                    var errorMessage = "wallet_get_info: Wallet query problem. (getInfo)";
                    if(config.bot.errorLogging){
                        log.log_write_file(errorMessage);
                        log.log_write_file(error);
                    }
                    log.log_write_console(errorMessage);
                    log.log_write_console(error);
                    resolve('error');
                }else{
                    resolve(result);
                }   
            });
        });
    }

};