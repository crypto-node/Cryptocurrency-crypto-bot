//var config = require('../config.js');
try{
    var config = process.cwd()+'/config.js';
    config = require(config);
}catch (error){
    console.error('ERROR -> Unable to load config file.');
    process.exit(1);
}

var log = require("./log.js");

/* ------------------------------------------------------------------------------ */
// // // // // // // // // // // // // // // // // // // // // // // // // // // //
/* ------------------------------------------------------------------------------ */

// Mysql2
const mysql = require('mysql2');
// connect mysql database
mysqlPool  = mysql.createPool({
    connectionLimit : config.mysql.connectionLimit,
    waitForConnections: config.mysql.waitForConnections,
    host     : config.mysql.dbHost,
    user     : config.mysql.dbUser,
    port     : config.mysql.dbPort,
    password : config.mysql.dbPassword,
    database : config.mysql.dbName
});

const Big = require('big.js'); // https://github.com/MikeMcl/big.js -> http://mikemcl.github.io/big.js/

/* ------------------------------------------------------------------------------ */
// // // // // // // // // // // // // // // // // // // // // // // // // // // //
/* ------------------------------------------------------------------------------ */

module.exports = {
    
    /* ------------------------------------------------------------------------------ */
    // Get confirmed deposits from database
    /* ------------------------------------------------------------------------------ */
    transaction_get_confirmed_deposits: function(){
        return new Promise((resolve, reject)=>{
            mysqlPool.getConnection(function(error, connection){
                if(error){
                    try
                        {
                        mysqlPool.releaseConnection(connection);
                        }
                    catch (e){}
                    var errorMessage = "transaction_get_confirmed_deposits: MySQL connection problem.";
                    if(config.bot.errorLogging){
                        log.log_write_file(errorMessage);
                        log.log_write_file(error);
                    }
                    log.log_write_console(errorMessage);
                    log.log_write_console(error);
                    resolve(false);
                }else{
                    connection.execute("SELECT * FROM deposits WHERE credited = ? AND confirmations > ?",[0,config.wallet.minConfirmationsCredit],function (error, results, fields){
                        mysqlPool.releaseConnection(connection);
                        if(error)
                        {
                            var errorMessage = "transaction_get_confirmed_deposits: MySQL query problem. (SELECT * FROM deposits WHERE credited = ? AND confirmations > ?)";
                            if(config.bot.errorLogging){
                                log.log_write_file(errorMessage);
                                log.log_write_file(error);
                            }
                            log.log_write_console(errorMessage);
                            log.log_write_console(error);
                            resolve(false);
                        }else{
                            resolve(results);
                        }
                    });
                }
            });
        });
    },

    /* ------------------------------------------------------------------------------ */
    // Get deposits from database by address and limit for history
    /* ------------------------------------------------------------------------------ */
    transaction_get_deposits_by_address: function(depositHistoryDisplayCount,userDepositAddress){
        return new Promise((resolve, reject)=>{
            mysqlPool.getConnection(function(error, connection){
                if(error){
                    try
                        {
                        mysqlPool.releaseConnection(connection);
                        }
                    catch (e){}
                    var errorMessage = "transaction_get_confirmed_deposits: MySQL connection problem.";
                    if(config.bot.errorLogging){
                        log.log_write_file(errorMessage);
                        log.log_write_file(error);
                    }
                    log.log_write_console(errorMessage);
                    log.log_write_console(error);
                    resolve(false);
                }else{
                    connection.execute("SELECT * FROM deposits WHERE address = ? ORDER BY id DESC LIMIT "+depositHistoryDisplayCount,[userDepositAddress],function (error, results, fields){
                        mysqlPool.releaseConnection(connection);
                        if(error)
                        {
                            var errorMessage = "transaction_get_confirmed_deposits: MySQL query problem. (SELECT * FROM deposits WHERE address = ? ORDER BY id DESC LIMIT "+depositHistoryDisplayCount+")";
                            if(config.bot.errorLogging){
                                log.log_write_file(errorMessage);
                                log.log_write_file(error);
                            }
                            log.log_write_console(errorMessage);
                            log.log_write_console(error);
                            resolve(false);
                        }else{
                            resolve(results);
                        }
                    });
                }
            });
        });
    },

    /* ------------------------------------------------------------------------------ */
    // Set deposit as confirmed on database
    /* ------------------------------------------------------------------------------ */
    transaction_set_deposit_confirmed: function(creditID){
        return new Promise((resolve, reject)=>{
            mysqlPool.getConnection(function(error, connection){
                if(error){
                    try
                        {
                        mysqlPool.releaseConnection(connection);
                        }
                    catch (e){}
                    var errorMessage = "transaction_set_deposit_confirmed: MySQL connection problem.";
                    if(config.bot.errorLogging){
                        log.log_write_file(errorMessage);
                        log.log_write_file(error);
                    }
                    log.log_write_console(errorMessage);
                    log.log_write_console(error); 
                    resolve(false);
                }else{
                    connection.execute("UPDATE deposits SET credited = ? WHERE id = ?",[1,creditID],function (error, results, fields){ // Set deposit as credited
                        mysqlPool.releaseConnection(connection);
                        if(error)
                        {   
                            var errorMessage = "transaction_set_deposit_confirmed: MySQL query problem. (UPDATE deposits SET credited = ? WHERE id = ?)";
                            if(config.bot.errorLogging){
                                log.log_write_file(errorMessage);
                                log.log_write_file(error);
                            }
                            log.log_write_console(errorMessage);
                            log.log_write_console(error);
                            resolve(false);
                        }else{
                            resolve(true);
                        }
                    });
                }
            });         
        });
    },

    /* ------------------------------------------------------------------------------ */
    // Add new transactions or update confirmations of existing transactions
    /* ------------------------------------------------------------------------------ */
    transaction_add_update_deposits_on_db: function(deposit_address,deposit_amount,deposit_confirmations,deposit_txid){
        return new Promise((resolve, reject)=>{
            mysqlPool.getConnection(function(error, connection){
                if(error){
                    try
                        {
                        mysqlPool.releaseConnection(connection);
                        }
                    catch (e){}
                    var errorMessage = "transaction_add_update_deposits_on_db: MySQL connection problem.";
                    if(config.bot.errorLogging){
                        log.log_write_file(errorMessage);
                        log.log_write_file(error);
                    }
                    log.log_write_console(errorMessage);
                    log.log_write_console(error);
                    resolve(false);
                }else{
                    connection.execute("INSERT INTO deposits (address,amount,txid,confirmations,credited,coin_price) VALUES (?,?,?,?,?,?) ON DUPLICATE KEY UPDATE confirmations = ?",[deposit_address,Big(deposit_amount).toString(),deposit_txid,deposit_confirmations,0,coinPrice,deposit_confirmations],function (error, results, fields){
                        mysqlPool.releaseConnection(connection);
                        if(error)
                        {   
                            var errorMessage = "transaction_add_update_deposits_on_db: MySQL query problem. (INSERT INTO deposits (address,amount,txid,confirmations,credited,coin_price) VALUES (?,?,?,?,?,?) ON DUPLICATE KEY UPDATE confirmations = ?)";
                            if(config.bot.errorLogging){
                                log.log_write_file(errorMessage);
                                log.log_write_file(error);
                            }
                            log.log_write_console(errorMessage);
                            log.log_write_console(error);
                            resolve(false);
                        }else{
                            resolve(true);
                        }
                    });
                }
            });
        })
    },

    /* ------------------------------------------------------------------------------ */
    // Save withdrawal to database
    /* ------------------------------------------------------------------------------ */
    transaction_save_withdrawal_to_db: function(userID,withdrawAddress,withdrawAmount,txID){
        return new Promise((resolve, reject)=>{
            mysqlPool.getConnection(function(error, connection){
                if(error){
                    try
                        {
                        mysqlPool.releaseConnection(connection);
                        }
                    catch (e){}
                    var errorMessage = "transaction_save_withdrawal_to_db: MySQL connection problem.";
                    if(config.bot.errorLogging){
                        log.log_write_file(errorMessage);
                        log.log_write_file(error);
                    }
                    log.log_write_console(errorMessage);
                    log.log_write_console(error);
                    resolve(false);
                }else{
                    connection.execute("INSERT INTO withdrawals (discord_id,address,amount,txid,coin_price) VALUES (?,?,?,?,?)",[userID,withdrawAddress,Big(withdrawAmount).toString(),txID,coinPrice],function (error, results, fields){
                        mysqlPool.releaseConnection(connection);
                        if(error)
                        {   
                            var errorMessage = "transaction_save_withdrawal_to_db: MySQL query problem. (INSERT INTO withdrawals (discord_id,address,amount,txid,coin_price) VALUES (?,?,?,?,?))";
                            if(config.bot.errorLogging){
                                log.log_write_file(errorMessage);
                                log.log_write_file(error);
                            }
                            log.log_write_console(errorMessage);
                            log.log_write_console(error);
                            resolve(false);
                        }else{
                            resolve(true);
                        }
                    });
                }
            });
        })
    },

    /* ------------------------------------------------------------------------------ */
    // Get withdrawals from database by user id and limit for withdrawals
    /* ------------------------------------------------------------------------------ */
    transaction_get_withdrawals_by_user_id: function(withdrawalsHistoryDisplayCount,userID){
        return new Promise((resolve, reject)=>{
            mysqlPool.getConnection(function(error, connection){
                if(error){
                    try
                        {
                        mysqlPool.releaseConnection(connection);
                        }
                    catch (e){}
                    var errorMessage = "transaction_get_withdrawals_by_user_id: MySQL connection problem.";
                    if(config.bot.errorLogging){
                        log.log_write_file(errorMessage);
                        log.log_write_file(error);
                    }
                    log.log_write_console(errorMessage);
                    log.log_write_console(error);
                    resolve(false);
                }else{
                    connection.execute("SELECT * FROM withdrawals WHERE discord_id = ? ORDER BY id DESC LIMIT "+withdrawalsHistoryDisplayCount,[userID],function (error, results, fields){
                        mysqlPool.releaseConnection(connection);
                        if(error)
                        {
                            var errorMessage = "transaction_get_withdrawals_by_user_id: MySQL query problem. (SELECT * FROM withdrawals WHERE discord_id = ? ORDER BY id DESC LIMIT "+withdrawalsHistoryDisplayCount+")";
                            if(config.bot.errorLogging){
                                log.log_write_file(errorMessage);
                                log.log_write_file(error);
                            }
                            log.log_write_console(errorMessage);
                            log.log_write_console(error);
                            resolve(false);
                        }else{
                            resolve(results);
                        }
                    });
                }
            });
        });
    },

    /* ------------------------------------------------------------------------------ */
    // Save payment to db
    /* ------------------------------------------------------------------------------ */
    transaction_save_payment_to_db: function(paymentAmount,fromID,toID,type){
        return new Promise((resolve, reject)=>{
            mysqlPool.getConnection(function(error, connection){
                if(error){
                    try
                        {
                        mysqlPool.releaseConnection(connection);
                        }
                    catch (e){}
                    var errorMessage = "transaction_save_payment_to_db: MySQL connection problem.";
                    if(config.bot.errorLogging){
                        log.log_write_file(errorMessage);
                        log.log_write_file(error);
                    }
                    log.log_write_console(errorMessage);
                    log.log_write_console(error);
                    resolve(false);
                }else{
                    connection.execute("INSERT INTO payments (amount,from_discord_id,to_discord_id,type,coin_price) VALUES (?,?,?,?,?)",[Big(paymentAmount).toString(),fromID,toID,type,coinPrice],function (error, results, fields){
                        mysqlPool.releaseConnection(connection);
                        if(error)
                        {   
                            var errorMessage = "transaction_save_payment_to_db: MySQL query problem. (INSERT INTO payments (amount,from_discord_id,to_discord_id,type,coin_price) VALUES (?,?,?,?,?))";
                            if(config.bot.errorLogging){
                                log.log_write_file(errorMessage);
                                log.log_write_file(error);
                            }
                            log.log_write_console(errorMessage);
                            log.log_write_console(error);
                            resolve(false);
                        }else{
                            resolve(true);
                        }
                    });
                }
            });
        })
    },

    /* ------------------------------------------------------------------------------ */
    // Get payments by id
    /* ------------------------------------------------------------------------------ */
    transaction_get_payments_by_user_id: function(paymentHistoryCoun,userID){
        return new Promise((resolve, reject)=>{
            mysqlPool.getConnection(function(error, connection){
                if(error){
                    try
                        {
                        mysqlPool.releaseConnection(connection);
                        }
                    catch (e){}
                    var errorMessage = "transaction_get_payments_by_user_id: MySQL connection problem.";
                    if(config.bot.errorLogging){
                        log.log_write_file(errorMessage);
                        log.log_write_file(error);
                    }
                    log.log_write_console(errorMessage);
                    log.log_write_console(error);
                    resolve(false);
                }else{
                    connection.execute("SELECT * FROM payments WHERE from_discord_id = ? OR from_discord_id = 'rainall' OR from_discord_id = ? AND to_discord_id = ? ORDER BY id DESC LIMIT "+paymentHistoryCoun,[userID,config.bot.botID,userID],function (error, results, fields){
                        mysqlPool.releaseConnection(connection);
                        if(error)
                        {
                            var errorMessage = "transaction_get_payments_by_user_id: MySQL query problem. (SELECT * FROM payments WHERE from_discord_id = ? ORDER BY id DESC LIMIT)";
                            if(config.bot.errorLogging){
                                log.log_write_file(errorMessage);
                                log.log_write_file(error);
                            }
                            log.log_write_console(errorMessage);
                            log.log_write_console(error);
                            resolve(false);
                        }else{
                            resolve(results);
                        }
                    });
                }
            });
        });
    },

    /* ------------------------------------------------------------------------------ */
    // Get transactions from walletnotify stake table that are not checked
    /* ------------------------------------------------------------------------------ */
    transaction_get_stake_transactions: function(){
        return new Promise((resolve, reject)=>{
            mysqlPool.getConnection(function(error, connection){
                if(error){
                    try
                        {
                        mysqlPool.releaseConnection(connection);
                        }
                    catch (e){}
                    var errorMessage = "transaction_get_stake_transactions: MySQL connection problem.";
                    if(config.bot.errorLogging){
                        log.log_write_file(errorMessage);
                        log.log_write_file(error);
                    }
                    log.log_write_console(errorMessage);
                    log.log_write_console(error);
                    resolve(false);
                }else{
                    connection.execute("SELECT txid FROM transactions WHERE checked = ? LIMIT ?",[0,config.staking.checkCount],function (error, results, fields){
                        mysqlPool.releaseConnection(connection);
                        if(error)
                        {
                            var errorMessage = "transaction_get_stake_transactions: MySQL query problem. (SELECT * FROM transactions WHERE checked = ?)";
                            if(config.bot.errorLogging){
                                log.log_write_file(errorMessage);
                                log.log_write_file(error);
                            }
                            log.log_write_console(errorMessage);
                            log.log_write_console(error);
                            resolve(false);
                        }else{
                            resolve(results);
                        }
                    });
                }
            });
        });
    },

    /* ------------------------------------------------------------------------------ */
    // Get transactions from walletnotify stake table that are checked and stake transactions but not credited
    /* ------------------------------------------------------------------------------ */
    transaction_get_stake_transactions_to_credit: function(){
        return new Promise((resolve, reject)=>{
            mysqlPool.getConnection(function(error, connection){
                if(error){
                    try
                        {
                        mysqlPool.releaseConnection(connection);
                        }
                    catch (e){}
                    var errorMessage = "transaction_get_stake_transactions_to_credit: MySQL connection problem.";
                    if(config.bot.errorLogging){
                        log.log_write_file(errorMessage);
                        log.log_write_file(error);
                    }
                    log.log_write_console(errorMessage);
                    log.log_write_console(error);
                    resolve(false);
                }else{
                    connection.execute("SELECT id, txid, amount FROM transactions WHERE checked = ? AND credited = ? AND stake = ? ORDER BY id ASC LIMIT ?",[1,0,1,config.staking.creditCount],function (error, results, fields){
                        mysqlPool.releaseConnection(connection);
                        if(error)
                        {
                            var errorMessage = "transaction_get_stake_transactions_to_credit: MySQL query problem. (SELECT txid FROM transactions WHERE checked = ? AND credited = ? LIMIT ?)";
                            if(config.bot.errorLogging){
                                log.log_write_file(errorMessage);
                                log.log_write_file(error);
                            }
                            log.log_write_console(errorMessage);
                            log.log_write_console(error);
                            resolve(false);
                        }else{
                            resolve(results);
                        }
                    });
                }
            });
        });
    },

    /* ------------------------------------------------------------------------------ */
    // Update transaction on stake transaction table as checked
    /* ------------------------------------------------------------------------------ */
    transaction_update_stake_transaction: function(txid,stake_amount,transaction_stake){
        return new Promise((resolve, reject)=>{
            mysqlPool.getConnection(function(error, connection){
                if(error){
                    try
                        {
                        mysqlPool.releaseConnection(connection);
                        }
                    catch (e){}
                    var errorMessage = "transaction_update_stake_transaction: MySQL connection problem.";
                    if(config.bot.errorLogging){
                        log.log_write_file(errorMessage);
                        log.log_write_file(error);
                    }
                    log.log_write_console(errorMessage);
                    log.log_write_console(error);
                    resolve(false);
                }else{
                    connection.execute("UPDATE transactions SET amount = ?, stake = ?, checked = ? WHERE txid = ?",[stake_amount,transaction_stake,1,txid],function (error, results, fields){
                        mysqlPool.releaseConnection(connection);
                        if(error)
                        {
                            var errorMessage = "transaction_update_stake_transaction: MySQL query problem. (SELECT * FROM transactions WHERE checked = ?)";
                            if(config.bot.errorLogging){
                                log.log_write_file(errorMessage);
                                log.log_write_file(error);
                            }
                            log.log_write_console(errorMessage);
                            log.log_write_console(error);
                            resolve(false);
                        }else{
                            resolve(results);
                        }
                    });
                }
            });
        });
    },

    /* ------------------------------------------------------------------------------ */
    // Update transaction on stake transaction table as credited
    /* ------------------------------------------------------------------------------ */
    transaction_update_stake_transaction_credited: function(highestTransactionID){
        return new Promise((resolve, reject)=>{
            mysqlPool.getConnection(function(error, connection){
                if(error){
                    try
                        {
                        mysqlPool.releaseConnection(connection);
                        }
                    catch (e){}
                    var errorMessage = "transaction_update_stake_transaction_credited: MySQL connection problem.";
                    if(config.bot.errorLogging){
                        log.log_write_file(errorMessage);
                        log.log_write_file(error);
                    }
                    log.log_write_console(errorMessage);
                    log.log_write_console(error);
                    resolve(false);
                }else{
                    connection.execute("UPDATE transactions SET credited = ? WHERE id <= ? AND stake = ?",[1,highestTransactionID,1],function (error, results, fields){
                        mysqlPool.releaseConnection(connection);
                        if(error)
                        {
                            var errorMessage = "transaction_update_stake_transaction_credited: MySQL query problem. (SELECT * FROM transactions WHERE checked = ?)";
                            if(config.bot.errorLogging){
                                log.log_write_file(errorMessage);
                                log.log_write_file(error);
                            }
                            log.log_write_console(errorMessage);
                            log.log_write_console(error);
                            resolve(false);
                        }else{
                            resolve(results);
                        }
                    });
                }
            });
        });
    },


    /* ------------------------------------------------------------------------------ */
    // Save current coin price to price history table
    /* ------------------------------------------------------------------------------ */
    transaction_coin_price_history: function(historyPrice){
        return new Promise((resolve, reject)=>{
            mysqlPool.getConnection(function(error, connection){
                if(error){
                    try
                        {
                        mysqlPool.releaseConnection(connection);
                        }
                    catch (e){}
                    var errorMessage = "transaction_coin_price_history: MySQL connection problem.";
                    if(config.bot.errorLogging){
                        log.log_write_file(errorMessage);
                        log.log_write_file(error);
                    }
                    log.log_write_console(errorMessage);
                    log.log_write_console(error);
                    resolve(false);
                }else{
                    connection.execute("INSERT INTO coin_price_history (price,currency,api_service) VALUES (?,?,?)",[historyPrice,config.coinPrice.currency,config.coinPrice.apiService],function (error, results, fields){
                        mysqlPool.releaseConnection(connection);
                        if(error)
                        {
                            var errorMessage = "INSERT INTO coin_price_history (price,currency) VALUES (?,?)";
                            if(config.bot.errorLogging){
                                log.log_write_file(errorMessage);
                                log.log_write_file(error);
                            }
                            log.log_write_console(errorMessage);
                            log.log_write_console(error);
                            resolve(false);
                        }else{
                            resolve(results);
                        }
                    });
                }
            });
        });
    }

};