//var config = require('../config.js');
try{
    var config = process.cwd()+'/config.js';
    config = require(config);
}catch (error){
    console.error('ERROR -> Unable to load config file.');
    process.exit(1);
}

var chat = require("./chat.js");
var check = require("./check.js");
var log = require("./log.js");
var storage = require("./storage.js");
var transaction = require("./transaction.js");
var user = require("./user.js");
var wallet = require("./wallet.js");

/* ------------------------------------------------------------------------------ */
// // // // // // // // // // // // // // // // // // // // // // // // // // // //
/* ------------------------------------------------------------------------------ */

const { Client } = require('discord.js');
const client = new Client();

// A lightweight JavaScript date library for parsing, validating, manipulating, and formatting dates.
const moment = require('moment-timezone');

// var AsciiTable = require('ascii-table'); // Build ascii table -> https://github.com/sorensen/ascii-table <- not used but a brillant lib ;)

const Big = require('big.js'); // https://github.com/MikeMcl/big.js -> http://mikemcl.github.io/big.js/

var unique = require('array-unique'); // https://www.npmjs.com/package/array-unique

// Block list 
var commandBlockedUsers = [];

// Add user to command block list
function add_blocklist(userID){
    //console.log('Add blocklist: ' +userID)
    commandBlockedUsers.push(userID);
    //console.log(commandBlockedUsers);
}
// Remove user from command block list
function remove_blocklist(userID){
    //console.log('Remove blocklist: ' +userID)
    var commandcommandBlockedUsersIndex = commandBlockedUsers.indexOf(userID);
    commandBlockedUsers.splice(commandcommandBlockedUsersIndex, 1);
    //console.log(commandBlockedUsers);
}

/* ------------------------------------------------------------------------------ */
// // // // // // // // // // // // // // // // // // // // // // // // // // // //
/* ------------------------------------------------------------------------------ */

module.exports = {

    /* ------------------------------------------------------------------------------ */
    // !b / !balance -> Display current user balance
    /* ------------------------------------------------------------------------------ */

    command_display_user_balance: async function(userID,userName,messageType,msg){
        var isUserRegistered = await user.user_registered_check(userID);
        if(isUserRegistered == 'error'){
            //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
            chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
            return;
        }
        if(!isUserRegistered){
            //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
            chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.error,false,config.messages.accountNotRegistered,false,false,false,false); 
            return;
        }
        var userBalance = await user.user_get_balance(userID);
        if(!userBalance){
            chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
            return;
        }
        // If show staking balance is enabled
        if(config.staking.balanceDisplay)
            var userStakeBalance = await user.user_get_stake_balance(userID);
        if(config.staking.balanceDisplay && !userStakeBalance){
            chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
            return;
        }
        if(!config.staking.balanceDisplay){
            //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
            chat.chat_reply(msg,'embed',false,messageType,config.colors.success,false,config.messages.balance.balance,[[config.messages.balance.username,userName,true],[config.wallet.coinSymbol,Big(userBalance).toFixed(8)+' '+config.wallet.coinSymbolShort,true]],false,false,config.wallet.thumbnailIcon,false,false);   
            return;  
        }else{
            //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
            chat.chat_reply(msg,'embed',false,messageType,config.colors.success,false,config.messages.balance.balance,[[config.messages.balance.username,userName,true],[config.wallet.coinSymbol,Big(userBalance).toFixed(8)+' '+config.wallet.coinSymbolShort,false],[config.messages.balance.stakeTitle,Big(userStakeBalance).toFixed(8)+' '+config.wallet.coinSymbolShort,false]],false,false,config.wallet.thumbnailIcon,false,false); 
            return;
        }
    },

    /* ------------------------------------------------------------------------------ */
    // !c / !clear -> Clear all message from chat
    /* ------------------------------------------------------------------------------ */

    command_clear_chat: async function(userName,messageType,userRole,msg) {
        if(messageType === 'dm'){
            //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
            chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.error,false,config.messages.clear.no,false,false,false,false);
            return;
        }
        if(userRole < 2){
            //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
            chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.error,false,config.messages.notAllowedCommand,false,false,false,false);
            return;
        }
        msg.channel.bulkDelete(99, true).catch(err => {
            log.log_write_console('there was an error trying to prune messages in this channel!');
        });
        return;
    },

    /* ------------------------------------------------------------------------------ */
    // !cd / !creditdeposits -> Get confirmed transactions from database and credit them to user
    /* ------------------------------------------------------------------------------ */

    command_credit_deposits: async function(manuallyFired,userName,messageType,userRole,msg){
        // Check if user is admin
        if(userRole < 3){
            chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.error,false,config.messages.notAllowedCommand,false,false,false,false);
            return
        }
        // Get transactions from database
        var databaseTransactions = await transaction.transaction_get_confirmed_deposits();
        if(!databaseTransactions){
            if(manuallyFired == 1){
                chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false); 
                return;
            }else{
                return;
            }
        }
        // Check if transactions to process or if empty
        var countCreditedDeposits = 0;
        if(!databaseTransactions.length){
            if(manuallyFired == 1){
                //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
                chat.chat_reply(msg,'embed',userName,messageType,config.colors.special,false,config.messages.creditdeposits.manually,[[config.messages.creditdeposits.deposits,countCreditedDeposits,false]],false,false,false,false,false);
                return;
            }else{
                log.log_write_console(config.messages.creditdeposits.cron+' `'+countCreditedDeposits+'` '+config.messages.creditdeposits.cron2);
                return;
            }
        }
        // For each transaction
        for (var i = 0 ; i < databaseTransactions.length ; ++i){
            var creditID = databaseTransactions[i].id;
            var creditAddress = databaseTransactions[i].address;
            var creditAmount = Big(databaseTransactions[i].amount).toString();
            // Set transactions as credited
            var setTransactionCredited = await transaction.transaction_set_deposit_confirmed(creditID);
            if(!setTransactionCredited){
                if(manuallyFired == 1){
                    chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false); 
                    return;
                }else{
                    return;
                }
            }
            // Credit balance to user
            var creditResult = await user.user_credit_balance(creditAddress,Big(creditAmount).toString());
            if(creditResult){
                countCreditedDeposits++;
            }
            // Log credit value in database log
            var getUserIDbyAddress = await user.user_get_id_by_address(creditAddress);
            if(getUserIDbyAddress == 'notregisteredaddress'){
                log.log_write_database(0,config.messages.log.transctioncreditedunknown+' '+creditAddress,Big(creditAmount).toString());
            }else{
                log.log_write_database(getUserIDbyAddress,config.messages.log.transctioncredited+' '+creditAddress,Big(creditAmount).toString());
            }
            // Return result if all was success
            if(i == databaseTransactions.length-1 && manuallyFired == 1){
                //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
                chat.chat_reply(msg,'embed',userName,messageType,config.colors.special,false,config.messages.creditdeposits.manually,[[config.messages.creditdeposits.deposits,countCreditedDeposits,false]],false,false,false,false,false);
                return;
            }
            if(i == databaseTransactions.length-1 && manuallyFired == 0){
                log.log_write_console(config.messages.creditdeposits.cron+' `'+countCreditedDeposits+'` '+config.messages.creditdeposits.cron2);
                return;
            }
        }
    },

    /* ------------------------------------------------------------------------------ */
    // !cs / !creditstakes -> Credit stakes to users
    /* ------------------------------------------------------------------------------ */

    command_credit_stakes: async function(manuallyFired,userName,messageType,userRole,msg){
        // Check if user is admin
        if(userRole < 3){
            chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.error,false,config.messages.notAllowedCommand,false,false,false,false);
            return
        }
        // Get total wallet balance
        var walletBalance = await wallet.wallet_get_balance();
        if(!walletBalance){
            if(manuallyFired == 1){
                //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
                chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.error,false,config.messages.walletOffline,false,false,false,false);
                return;
            }else{
                log.log_write_console(config.messages.walletOffline);
                return;
            }
        }
        // Debug log
        if(config.staking.debug)
            log.log_write_console(config.messages.log.stakecredit+' '+Big(walletBalance).toFixed());
        // Get not credited stake transactions and sum amount
        var transactionsToCredit = await transaction.transaction_get_stake_transactions_to_credit();
        if(!transactionsToCredit){
            if(manuallyFired == 1){
                chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false); 
                return;
            }else{
                return;
            }
        }
        // Check if no transaction to handle
        var countCreditedStakes = 0;
        if(!transactionsToCredit.length){
            if(manuallyFired == 1){
                //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
                chat.chat_reply(msg,'embed',userName,messageType,config.colors.special,false,config.messages.creditstakes.manually,[[config.messages.creditstakes.transactions,countCreditedStakes,false]],false,false,false,false,false);
                return;
            }else{
                log.log_write_console(config.messages.creditstakes.cron+' `'+countCreditedStakes+'` '+config.messages.creditstakes.cron2);
                return;
            }
        }
        var totalStakes = 0;
        var totalStakeSum = 0;
        var transactionsToCreditLog = config.messages.log.stakecredit7+' ';
        var highestTransactionID = 0;
        for (var i = 0 ; i < transactionsToCredit.length ; ++i){
            //console.log(transactionsToCredit[i].amount);
            transactionsToCreditLog = transactionsToCreditLog + transactionsToCredit[i].id+', ';
            highestTransactionID = transactionsToCredit[i].id;
            totalStakeSum = Big(totalStakeSum).plus(transactionsToCredit[i].amount);
            totalStakes++;
        }
        transactionsToCreditLog = transactionsToCreditLog.slice(0, -2);
        // Debug log
        if(config.staking.debug)
            log.log_write_console(config.messages.log.stakecredit1+' '+Big(totalStakeSum).toFixed());
        // Substract bot owner percentage from total sum of stakes
        var totalStakeSumMinusOwnerPercentage = Big(totalStakeSum).div(100);
        totalStakeSumMinusOwnerPercentage = Big(totalStakeSumMinusOwnerPercentage).times(config.staking.ownerPercentage);
        // Debug log
        if(config.staking.debug){
            log.log_write_console(config.messages.log.stakecredit2+' '+Big(totalStakeSumMinusOwnerPercentage).toFixed());
            log.log_write_console(transactionsToCreditLog);
        }
        // Check for each user how much he owns from totalStakeSumMinusOwnerPercentage balance and calculate percentage of the value he owns
        var getStakeUsers = await user.user_get_stake_users();
        if(!getStakeUsers){
            if(manuallyFired == 1){
                chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false); 
                return;
            }else{
                return;
            }
        }
        var totalUserStaking = getStakeUsers.length;
        var usersToCreditLog = '';
        var stakeBalanceByUserID =  [];
        var totalUserStakeBalance = 0;
        for (var i = 0 ; i < getStakeUsers.length ; ++i){
            var userID = getStakeUsers[i].discord_id;
            var userStakeBalance = getStakeUsers[i].stake_balance;
            stakeBalanceByUserID[userID] = userStakeBalance;
            usersToCreditLog = usersToCreditLog + userID+', ';
            totalUserStakeBalance = Big(totalUserStakeBalance).plus(userStakeBalance);
            countCreditedStakes++;
            //console.log('User: '+userID+' - Stake balance: '+userStakeBalance);
        }
        usersToCreditLog = usersToCreditLog.slice(0, -2);
        // Debug log
        if(config.staking.debug){
            log.log_write_console(config.messages.log.stakecredit3+' '+totalUserStaking);
            log.log_write_console(config.messages.log.stakecredit4+' '+usersToCreditLog);
        }
        // Calculate how much of the stake balance belongs to the users stake balance // Rest balance belongs to wallet as its not market as stake from the users
        var down = 0;
        var totalStakeForStakers = Big(totalUserStakeBalance).div(walletBalance);
        totalStakeForStakers = Big(totalStakeForStakers).times(totalStakeSum).round(8, down);
        // Debug log
        if(config.staking.debug){
            log.log_write_console(config.messages.log.stakecredit5+' '+totalUserStakeBalance);
            log.log_write_console(config.messages.log.stakecredit6+' '+totalStakeForStakers.toFixed(8));
        } 
        // Mark transactions as credited on database
        var markStakesCredited = transaction.transaction_update_stake_transaction_credited(highestTransactionID);
        if(!markStakesCredited){
            if(manuallyFired == 1){
                chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false); 
                return;
            }else{
                return;
            }
        }
        // Credit the user with the % of the not credited sum of stakes from array and write to payment table log for user
        var down = 0;
        for (var key in stakeBalanceByUserID) {
            // Calc % of current stake cedit for user
            var stakeCreditValue = Big(stakeBalanceByUserID[key]).div(totalUserStakeBalance);
            stakeCreditValue = Big(stakeCreditValue).times(totalStakeForStakers).round(8, down);
            // Debug log
            if(config.staking.debug)
                log.log_write_console(config.messages.log.stakecredit8+' '+key +' '+config.messages.log.stakecredit9+' '+stakeBalanceByUserID[key]+' '+config.messages.log.stakecredit10+' '+Big(stakeCreditValue).toFixed(8));
            // Credit stake amount to user
            var creditResult = await user.user_add_balance(Big(stakeCreditValue).toFixed(8),key);
            if(!creditResult){
                if(manuallyFired == 1){
                    chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false); 
                    return;
                }else{
                    return;
                }
            }
            // Write to payment table send and received
            var saveStakeCredit = await transaction.transaction_save_payment_to_db(Big(stakeCreditValue).toString(),key,key,config.messages.payment.stake.received);
            if(!saveStakeCredit){
                if(manuallyFired == 1){
                    chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false); 
                    return;
                }else{
                    return;
                }
            }
        }
        // Write to log on database the ids of the stake transactions and users
        log.log_write_database(0,config.messages.log.stakecredit+' '+Big(walletBalance).toFixed()+config.messages.log.stakecredit1+' '+Big(totalStakeSum).toFixed(8)+config.messages.log.stakecredit2+' '+Big(totalStakeSumMinusOwnerPercentage).toFixed()+' '+config.messages.log.stakecredit3+' '+totalUserStaking+config.messages.log.stakecredit4+' '+usersToCreditLog+config.messages.log.stakecredit5+' '+totalUserStakeBalance+config.messages.log.stakecredit6+' '+totalStakeForStakers,Big(totalStakeForStakers).toFixed(8));
        // Send message to chat about credited transaction count, users, value 
        //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
        if(manuallyFired == 1){
            chat.chat_reply(msg,'embed',false,messageType,config.colors.special,false,config.messages.creditstakes.title,[[config.messages.creditstakes.stakes,totalStakes,true],[config.messages.creditstakes.amount,Big(totalStakeSum).toFixed(8)+' '+config.wallet.coinSymbolShort,true],[config.messages.creditstakes.users,totalUserStaking,true]],config.messages.creditstakes.description,false,config.wallet.thumbnailIcon,false,false);
        }else{
            // Write to log and pool channel
            log.log_write_console(config.messages.creditstakes.cron+' `'+totalStakes+'` '+config.messages.creditstakes.cron2);
            chat.chat_reply('pool','pool',false,messageType,config.colors.special,false,config.messages.creditstakes.title,[[config.messages.creditstakes.stakes,totalStakes,true],[config.messages.creditstakes.amount,Big(totalStakeSum).toFixed(8)+' '+config.wallet.coinSymbolShort,true],[config.messages.creditstakes.users,totalUserStaking,true]],config.messages.creditstakes.description,false,config.wallet.thumbnailIcon,false,false);
        }
    },

    /* ------------------------------------------------------------------------------ */
    // !d / !deposit -> get current deposit address or create new one
    /* ------------------------------------------------------------------------------ */

    command_display_user_deposit_address: async function(userID,userName,messageType,msg){
        // Check if user is registered
        var isUserRegistered = await user.user_registered_check(userID);
        if(isUserRegistered == 'error'){
            chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
            return;
        }
        if(!isUserRegistered){
            chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.error,false,config.messages.accountNotRegistered,false,false,false,false);
            return;
        }
        // Get deposit address
        var userDepositAddress = await user.user_get_address(userID);
        // If no address create a new one
        if(userDepositAddress === null){
            userDepositAddress = await wallet.wallet_create_deposit_address(userID);
        }
        // If new created address save to user/database
        if(userDepositAddress){
            await user.user_add_deposit_address(userDepositAddress,userID);
        }
        // If still fail show error
        if(!userDepositAddress){
            //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
            chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.error,false,config.messages.walletOffline,false,false,false,false);
            return;
        }else{
            // Write to logs in case of false requests to be able to check
            log.log_write_database(userID,config.messages.log.depositaddress+' '+userDepositAddress,0);
            // Display the address
            //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
            chat.chat_reply(msg,'embed',userName,messageType,config.colors.success,false,config.messages.deposit.title,[[config.messages.deposit.address,userDepositAddress,false]],config.messages.deposit.description,false,config.wallet.thumbnailIcon,'http://chart.apis.google.com/chart?cht=qr&chs=300x300&chl='+userDepositAddress+'&choe=UTF-8&chld=L',false);
        }   
    },

    /* ------------------------------------------------------------------------------ */
    // !donate -> show donate address for bot owner
    /* ------------------------------------------------------------------------------ */

    command_donate: function(userID,userName,messageType,msg){
        chat.chat_reply(msg,'embed',userName,messageType,config.colors.success,false,config.messages.donate.title,[[config.messages.donate.address,config.wallet.donateAddress,false]],config.messages.donate.description,false,config.wallet.thumbnailIcon,'http://chart.apis.google.com/chart?cht=qr&chs=300x300&chl='+config.wallet.donateAddress+'&choe=UTF-8&chld=L',false);
        return;
    },

    /* ------------------------------------------------------------------------------ */
    // !drop -> drop amount to users that reacted
    /* ------------------------------------------------------------------------------ */

    command_drop: async function(userID,userName,messageType,msg,partTwo,partThree,partFour,partFive){
        var dropAmount = partThree;
        var dropTime = partFour;
        var dropCollectedUsers = [];
       // Rain on private message not allowed
       if(messageType === 'dm'){
        chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.error,false,config.messages.drop.private,false,false,false,false);
        return;
        }
        // First check before do long queries -> is partThree not empty and is partThree numeric
        if(!partTwo || !partTwo === 'p' || !partTwo === 'phrase' || !partTwo === 'r' || !partTwo === 'react' || !dropAmount || !check.check_isNumeric(dropTime) || check.check_out_of_int_range(dropTime) || !check.check_isNumeric(dropAmount) || check.check_out_of_int_range(dropAmount)){
            //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
            chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.error,false,config.messages.notValidCommand,false,false,false,false);
            return;
        }
        // Set value BigInt and from minus to plus for all values
        dropAmount = Big(dropAmount).toString();
        if(Big(dropAmount).lt(Big(0))){
            dropAmount = dropAmount.times(-1);
        }
        // Check if drop time is valid
        // Make positiv
        dropTime = Big(dropTime).toString();
        if(Big(dropTime).lt(Big(0))){
            dropTime = dropTime.times(-1);
        }
        // Next full integer
        dropTime = Math.ceil(dropTime);
        // Check for min and max from config
        if(dropTime < config.bot.dropMinSeconds){
            chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.error,false,config.messages.drop.minTime+' `'+config.bot.dropMinSeconds+'`.',false,false,false,false);
            return;
        }
        if(dropTime > config.bot.dropMaxSeconds){
            chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.error,false,config.messages.drop.maxTime+' `'+config.bot.dropMaxSeconds+'`.',false,false,false,false);
            return;
        }
        // Check if user is registered
        var isUserRegistered = await user.user_registered_check(userID);
        if(isUserRegistered == 'error'){
            chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
            return;
        }
        if(!isUserRegistered){
            chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.error,false,config.messages.accountNotRegistered,false,false,false,false);
            return;
        }
        // Get user balance
        var userBalance = await user.user_get_balance(userID);
        if(!userBalance){
            chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
            return;
        }
        //  Check if tip amount is smaller as balance
        var dropAmount = Big(dropAmount).toString();
        var userBalance = Big(userBalance).toString();
        if(Big(dropAmount).gt(Big(userBalance))){
            chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.error,false,config.messages.drop.big+' `'+Big(dropAmount).toFixed(8)+' '+config.wallet.coinSymbolShort+'` '+config.messages.drop.big1+' `'+Big(userBalance).toFixed(8)+' '+config.wallet.coinSymbolShort+'`'+config.messages.drop.big2,false,false,false,false);
            return;
        }
        // Check min drop amount
        if(Big(dropAmount).lt(Big(config.bot.minDropValue))){
            chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.error,false,config.messages.drop.min+' `'+Big(config.bot.minDropValue).toFixed(8)+' '+config.wallet.coinSymbolShort+'` ',false,false,false,false);
            return;
        }
        // Check if user is currently blocked to use this command
        if(commandBlockedUsers.includes(userID)){
            chat.chat_reply(msg,'embed',false,messageType,config.colors.warning,false,config.messages.title.warning,false,config.messages.currentlyBlocked,false,false,false,false);
            return;
        }else{
            // Add user when this command fired to blocked list until he can get removed when function is over
            add_blocklist(userID)
        }
        // Check command part two and act
        switch(partTwo) {
            case 'p':
            case 'phrase':
                // Set phrase
                if(partFive.length < 1){
                    var phrase = userName.username;
                }else{
                    var phrase = partFive;
                }
                const phraseFilter = response => {
                    if(phrase.toLowerCase() === response.content.toLowerCase())
                        return true;
                    return false;
                };
                chat.chat_reply(msg,'embed',false,messageType,config.colors.success,false,config.messages.drop.title,[[config.messages.drop.phrase,'```'+phrase+'```',false],[config.messages.drop.amount,Big(dropAmount).toFixed(8)+' '+config.wallet.coinSymbolShort,true],[config.messages.drop.seconds,dropTime,true]],config.messages.drop.dropPhraseReply,false,false,false,false);
                const phraseCollector = msg.channel.createMessageCollector(phraseFilter, {time: dropTime*1000});
                phraseCollector.on('collect', m => {
                    if(!m.author.bot){ // If its not a bot
                        m.react(config.bot.dropBotReactIcon);
                        // Save users that collected to array if array does not already contain the user id
                        if(dropCollectedUsers.indexOf(m.author.id) === -1){
                            dropCollectedUsers.push(m.author.id)
                        }
                    }
                });
                phraseCollector.on('end', collected => {
                    // Check if collected users reach min needed users
                    if(Big(dropCollectedUsers.length).lt(Big(config.bot.dropMinUsers))){
                        // Remove user from command block list
                        remove_blocklist(userID);

                        chat.chat_reply(msg,'embed',false,messageType,config.colors.error,false,config.messages.drop.minFailedUserTitle,false,' `'+dropCollectedUsers.length+'` '+config.messages.drop.minFailedUser+' `'+config.bot.dropMinUsers+'` '+config.messages.drop.minFailedUser1,false,false,false,false);
                        return;
                    }
                    // Check if all users can get a drop or if usercount bigger as min drop value * users
                    var checkIfDropToAllMinValue = Big(dropCollectedUsers.length).times(config.bot.minDropValue);
                    // If drop amount smaller as min drop value * users get random users from user array
                    var randomUserDrop = 0;
                    if(Big(dropAmount).lt(checkIfDropToAllMinValue)){ 
                        // Change random user drop to yes
                        randomUserDrop = 1;
                        // Calculate how many random people can get from the to low for all users drop
                        var peopleToDrop = Big(dropAmount).times(100000000).toFixed(0); 
                        dropCollectedUsers = check.check_getRandomFromArray(dropCollectedUsers, peopleToDrop);
                    }
                    // Calculate drop for each user and round down value to loose no own sat
                    var down = 0
                    var dropSingleUserAmount = Big(dropAmount).div(dropCollectedUsers.length).round(8, down);
                    // Use calculate for each user value to calculate total to reduce value after rounding correction
                    var valueToRemoveFromUser = Big(dropSingleUserAmount).times(dropCollectedUsers.length);
                    // Write to logs in case of false requests to be able to check
                    log.log_write_database(userID,config.messages.log.drop+' '+dropCollectedUsers.length+' '+config.messages.log.drop1,Big(valueToRemoveFromUser).toString());
                    // Async function fix trick?
                    (async () => {
                        // Substract balance from user
                        var balanceSubstract = await user.user_substract_balance(Big(valueToRemoveFromUser).toString(),userID);
                        if(!balanceSubstract){
                            // Remove user from command block list
                            remove_blocklist(userID);
                            
                            chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                            return;  
                        }
                        // Credit balance to each drop user
                        for (var i = 0 ; i < dropCollectedUsers.length ; ++i){
                            var creditResult = await user.user_add_balance(Big(dropSingleUserAmount).toString(),dropCollectedUsers[i]);
                            if(!creditResult){
                                // Remove user from command block list
                                remove_blocklist(userID);
                                
                                chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                                return;  
                            }
                            // Write to payment table send and received
                            var saveDropSend = await transaction.transaction_save_payment_to_db(Big(dropSingleUserAmount).toString(),userID,dropCollectedUsers[i],config.messages.payment.drop.send);
                            if(!saveDropSend){
                                // Remove user from command block list
                                remove_blocklist(userID);
                                 
                                chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                                return;
                            }
                            var saveDropReceived = await transaction.transaction_save_payment_to_db(Big(dropSingleUserAmount).toString(),dropCollectedUsers[i],userID,config.messages.payment.drop.received);
                            if(!saveDropReceived){
                                // Remove user from command block list
                                remove_blocklist(userID);
                                 
                                chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                                return;  
                            }
                        }
                        // Return success message
                        //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
                        chat.chat_reply(msg,'embed',userName,messageType,config.colors.success,false,config.messages.drop.titleSent,[[config.messages.drop.amount,Big(dropAmount).toFixed(8)+' '+config.wallet.coinSymbolShort,true],[config.messages.drop.rounded,Big(valueToRemoveFromUser).toFixed(8)+' '+config.wallet.coinSymbolShort,true],[config.messages.drop.users,dropCollectedUsers.length,true],[config.messages.drop.each,Big(dropSingleUserAmount).toFixed(8)+' '+config.wallet.coinSymbolShort,true]],config.messages.drop.description,false,false,false,false);
                        // List rained users
                        var listUsers = '';
                        var userCount = 0;
                        for (var i = 0 ; i < dropCollectedUsers.length ; ++i){
                            userCount++;
                            // Check if user has notify disabled
                            var userStorageNotify = await storage.storage_read_local_storage(dropCollectedUsers[i],'notify');
                            var userStorageUsername = await storage.storage_read_local_storage(dropCollectedUsers[i],'username');
                            //console.log(userStorageNotify);
                            //console.log(userStorageUsername);
                            //console.log(dropCollectedUsers[i]);
                            if(userCount == 1){
                                if(userStorageNotify != 'off'){
                                    listUsers = listUsers+'<@'+dropCollectedUsers[i]+'>';
                                }else{
                                    listUsers = listUsers+userStorageUsername;
                                }
                            }else{
                                if(userStorageNotify != 'off'){
                                    listUsers = listUsers+' <@'+dropCollectedUsers[i]+'>';
                                }else{
                                    listUsers = listUsers+' '+userStorageUsername;
                                } 
                            }
                            if(userCount == config.bot.listUsers){
                                //chat.chat_reply(msg,'embed',userName,messageType,config.colors.success,false,false,[[config.messages.drop.users,listUsers,false]],false,false,false,false,false);
                                chat.chat_reply(msg,'normal',false,messageType,config.colors.success,false,false,[[config.messages.drop.users,listUsers,false]],listUsers,false,false,false,false);
                                var listUsers = '';
                                userCount = 0;
                            }
                            if(i == dropCollectedUsers.length-1){
                                //chat.chat_reply(msg,'embed',userName,messageType,config.colors.success,false,false,[[config.messages.drop.users,listUsers,false]],false,false,false,false,false);
                                chat.chat_reply(msg,'normal',false,messageType,config.colors.success,false,false,[[config.messages.drop.users,listUsers,false]],listUsers,false,false,false,false);
                            }
                        }
                        // Remove user from command block list
                        remove_blocklist(userID);
                        /* NOT ALL USERS COULD GET A DROP ITS POSSIBLE TO DECIDE TO ADD ANOTHER MESSAGE HERE THAT NOT ALL USERS COULD GET DROPPED
                        // Drop amount cant drop all users message
                        if(randomUserDrop){
                        }else{ // All users can get a share of the drop
                        }
                        */
                    })().catch(err => {
                        chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                        // Remove user from command block list
                        remove_blocklist(userID);
                    });
                });
                return;
            case 'r':
            case 'react':
                chat.chat_reply(msg,'embed',false,messageType,config.colors.success,false,config.messages.drop.title,[[config.messages.drop.icon,'```'+config.bot.dropReactIcon+'```',false],[config.messages.drop.amount,Big(dropAmount).toFixed(8)+' '+config.wallet.coinSymbolShort,true],[config.messages.drop.seconds,dropTime,true]],config.messages.drop.dropReactReply,false,false,false,false).then(function(reactCollectorMessage) {
                    const reactFilter = (reaction, user) => {
                        return reaction.emoji.name === config.bot.dropReactIcon && user.id != reactCollectorMessage.author.id;
                    };
                    const reactCollector = reactCollectorMessage.createReactionCollector(reactFilter, { time: dropTime*1000 });
                    reactCollector.on('collect', (reaction, reactionCollector) => {
                        reaction.users.forEach(function(value, key) {
                            if(key != reactCollectorMessage.author.id){  // If its not a bot
                                // Save users that collected to array if array does not already contain the user id
                                if(dropCollectedUsers.indexOf(key) === -1){
                                    dropCollectedUsers.push(key)
                                }
                            }
                          });
                    });
                    reactCollector.on('end', collected => {
                        // Check if collected users reach min needed users
                        if(Big(dropCollectedUsers.length).lt(Big(config.bot.dropMinUsers))){
                            // Remove user from command block list
                            remove_blocklist(userID);
                                
                            chat.chat_reply(msg,'embed',false,messageType,config.colors.error,false,config.messages.drop.minFailedUserTitle,false,' `'+dropCollectedUsers.length+'` '+config.messages.drop.minFailedUser+' `'+config.bot.dropMinUsers+'` '+config.messages.drop.minFailedUser1,false,false,false,false);
                            return;
                        }
                        // Check if all users can get a drop or if usercount bigger as min drop value * users
                        var checkIfDropToAllMinValue = Big(dropCollectedUsers.length).times(config.bot.minDropValue);
                        // If drop amount smaller as min drop value * users get random users from user array
                        var randomUserDrop = 0;
                        if(Big(dropAmount).lt(checkIfDropToAllMinValue)){ 
                            // Change random user drop to yes
                            randomUserDrop = 1;
                            // Calculate how many random people can get from the to low for all users drop
                            var peopleToDrop = Big(dropAmount).times(100000000).toFixed(0); 
                            dropCollectedUsers = check.check_getRandomFromArray(dropCollectedUsers, peopleToDrop);
                        }
                        // Calculate drop for each user and round down value to loose no own sat
                        var down = 0
                        var dropSingleUserAmount = Big(dropAmount).div(dropCollectedUsers.length).round(8, down);
                        // Use calculate for each user value to calculate total to reduce value after rounding correction
                        var valueToRemoveFromUser = Big(dropSingleUserAmount).times(dropCollectedUsers.length);
                        // Write to logs in case of false requests to be able to check
                        log.log_write_database(userID,config.messages.log.drop+' '+dropCollectedUsers.length+' '+config.messages.log.drop1,Big(valueToRemoveFromUser).toString());
                        // Async function fix trick?
                        (async () => {
                            // Substract balance from user
                            var balanceSubstract = await user.user_substract_balance(Big(valueToRemoveFromUser).toString(),userID);
                            if(!balanceSubstract){
                                // Remove user from command block list
                                remove_blocklist(userID);
                                    
                                chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                                return;  
                            }
                            // Credit balance to each drop user
                            for (var i = 0 ; i < dropCollectedUsers.length ; ++i){
                                var creditResult = await user.user_add_balance(Big(dropSingleUserAmount).toString(),dropCollectedUsers[i]);
                                if(!creditResult){
                                    // Remove user from command block list
                                    remove_blocklist(userID);
                                        
                                    chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                                    return;  
                                }
                                // Write to payment table send and received
                                var saveDropSend = await transaction.transaction_save_payment_to_db(Big(dropSingleUserAmount).toString(),userID,dropCollectedUsers[i],config.messages.payment.drop.send);
                                if(!saveDropSend){
                                    // Remove user from command block list
                                    remove_blocklist(userID);
                                        
                                    chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                                    return;
                                }
                                var saveDropReceived = await transaction.transaction_save_payment_to_db(Big(dropSingleUserAmount).toString(),dropCollectedUsers[i],userID,config.messages.payment.drop.received);
                                if(!saveDropReceived){
                                    // Remove user from command block list
                                    remove_blocklist(userID);
                                        
                                    chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                                    return;  
                                }
                            }
                            // Return success message
                            //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
                            chat.chat_reply(msg,'embed',userName,messageType,config.colors.success,false,config.messages.drop.titleSent,[[config.messages.drop.amount,Big(dropAmount).toFixed(8)+' '+config.wallet.coinSymbolShort,true],[config.messages.drop.rounded,Big(valueToRemoveFromUser).toFixed(8)+' '+config.wallet.coinSymbolShort,true],[config.messages.drop.users,dropCollectedUsers.length,true],[config.messages.drop.each,Big(dropSingleUserAmount).toFixed(8)+' '+config.wallet.coinSymbolShort,true]],config.messages.drop.description,false,false,false,false);
                            // List rained users
                            var listUsers = '';
                            var userCount = 0;
                            for (var i = 0 ; i < dropCollectedUsers.length ; ++i){
                                userCount++;
                                // Check if user has notify disabled
                                var userStorageNotify = await storage.storage_read_local_storage(dropCollectedUsers[i],'notify');
                                var userStorageUsername = await storage.storage_read_local_storage(dropCollectedUsers[i],'username');
                                //console.log(userStorageNotify);
                                //console.log(userStorageUsername);
                                //console.log(dropCollectedUsers[i]);
                                if(userCount == 1){
                                    if(userStorageNotify != 'off'){
                                        listUsers = listUsers+'<@'+dropCollectedUsers[i]+'>';
                                    }else{
                                        listUsers = listUsers+userStorageUsername;
                                    }
                                }else{
                                    if(userStorageNotify != 'off'){
                                        listUsers = listUsers+' <@'+dropCollectedUsers[i]+'>';
                                    }else{
                                        listUsers = listUsers+' '+userStorageUsername;
                                    } 
                                }
                                if(userCount == config.bot.listUsers){
                                    //chat.chat_reply(msg,'embed',userName,messageType,config.colors.success,false,false,[[config.messages.drop.users,listUsers,false]],false,false,false,false,false);
                                    chat.chat_reply(msg,'normal',false,messageType,config.colors.success,false,false,[[config.messages.drop.users,listUsers,false]],listUsers,false,false,false,false);
                                    var listUsers = '';
                                    userCount = 0;
                                }
                                if(i == dropCollectedUsers.length-1){
                                    //chat.chat_reply(msg,'embed',userName,messageType,config.colors.success,false,false,[[config.messages.drop.users,listUsers,false]],false,false,false,false,false);
                                    chat.chat_reply(msg,'normal',false,messageType,config.colors.success,false,false,[[config.messages.drop.users,listUsers,false]],listUsers,false,false,false,false);
                                }
                            }
                            // Remove user from command block list
                            remove_blocklist(userID);
                            /* NOT ALL USERS COULD GET A DROP ITS POSSIBLE TO DECIDE TO ADD ANOTHER MESSAGE HERE THAT NOT ALL USERS COULD GET DROPPED
                            // Drop amount cant drop all users message
                            if(randomUserDrop){
                            }else{ // All users can get a share of the drop
                            }
                            */
                        })().catch(err => {
                            chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                            // Remove user from command block list
                            remove_blocklist(userID);
                        });
                    });
                    reactCollectorMessage.react(config.bot.dropReactIcon);
                });
                return;
            default:
                // Remove user from command block list
                remove_blocklist(userID);
                //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
                chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.error,false,config.messages.notValidCommand,false,false,false,false);
                return;
        }
    },

    /* ------------------------------------------------------------------------------ */
    // !gd / !getdeposits -> get latest deposits and save to db or update confirmations if exist
    /* ------------------------------------------------------------------------------ */

    command_get_deposits: async function(manuallyFired,userName,messageType,userRole,msg){
        // Check if user is admin
        if(userRole < 3){
            chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.error,false,config.messages.notAllowedCommand,false,false,false,false);
            return
        }
        // Get latest transactions from wallet
        var latestDeposits = await wallet.wallet_get_latest_deposits();
        if(!latestDeposits){
            if(manuallyFired == 1){
                chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.error,false,config.messages.walletOffline,false,false,false,false);
                return;
            }else{
                log.log_write_console(config.messages.walletOffline);
                return;
            }
        }else{
            var countDeposits = 0;
            for (var i = 0 ; i < latestDeposits.length ; ++i){
                var deposit_address = latestDeposits[i].address;
                var deposit_category = latestDeposits[i].category;
                var deposit_amount = Big(latestDeposits[i].amount).toString();
                var deposit_confirmations = latestDeposits[i].confirmations;
                var deposit_txid = latestDeposits[i].txid + ' ' + deposit_address;
                var deposit_generated = latestDeposits[i].generated; // Check if its a stake so not use it
                if(deposit_category === 'receive' && !deposit_generated && deposit_confirmations < config.wallet.minConfirmationsDeposit){
                    var creditDeposit = await transaction.transaction_add_update_deposits_on_db(deposit_address,Big(deposit_amount).toString(),deposit_confirmations,deposit_txid);
                    if(creditDeposit){
                        countDeposits++;
                    }                
                }
                if(i == latestDeposits.length-1 && manuallyFired == 1)
                    //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
                    chat.chat_reply(msg,'embed',userName,messageType,config.colors.special,false,config.messages.getdeposits.manually,[[config.messages.getdeposits.deposits,countDeposits,false]],false,false,false,false,false);
                if(i == latestDeposits.length-1 && manuallyFired == 0)
                    log.log_write_console(config.messages.getdeposits.cron+' `'+countDeposits+'` '+config.messages.getdeposits.cron2);
            } 
        }
    },

    /* ------------------------------------------------------------------------------ */
    // !gs / !getstakes -> check transactions on database and mark as stake or no stake
    /* ------------------------------------------------------------------------------ */

    command_get_stakes: async function(manuallyFired,userName,messageType,userRole,msg){
        // Check if user is admin
        if(userRole < 3){
            chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.error,false,config.messages.notAllowedCommand,false,false,false,false);
            return
        }
        // Get transactions from database
        var transactionsToCheck = await transaction.transaction_get_stake_transactions();
        if(!transactionsToCheck){
            if(manuallyFired == 1){
                chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false); 
                return;
            }else{
                return;
            }
        }
        // Check if transactions to check or if empty
        var countTransactionsToCheck = 0;
        if(!transactionsToCheck.length){
            if(manuallyFired == 1){
                chat.chat_reply(msg,'embed',userName,messageType,config.colors.special,false,config.messages.getstakes.manually,[[config.messages.getstakes.transactions,countTransactionsToCheck,false]],false,false,false,false,false);
                return;
            }else{
                log.log_write_console(config.messages.getstakes.cron+' `'+countTransactionsToCheck+'` '+config.messages.getstakes.cron2);
                return;
            }
        }
        // For each txid get transaction and check if its stake or normal and update database
        for (var i = 0 ; i < transactionsToCheck.length ; ++i){
            var transaction_txid = transactionsToCheck[i].txid;
            var getTransaction = await wallet.wallet_get_transaction(transaction_txid);
            if(!getTransaction){
                if(manuallyFired == 1){
                    chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.error,false,config.messages.walletOffline,false,false,false,false);
                    return;
                }else{
                    log.log_write_console(config.messages.walletOffline);
                    return;
                }
            }else{
                // Check if stake
                var transaction_generated = getTransaction.generated;
                if(!transaction_generated){
                    // If not stake
                    log.log_write_console('no stake');
                    var transaction_amount = 0;
                    var transaction_stake = 0;
                    // Update transaction on db
                    var updateTransaction = await transaction.transaction_update_stake_transaction(transaction_txid,Big(transaction_amount).toString(),transaction_stake);
                    if(updateTransaction){
                        countTransactionsToCheck++;
                    }
                }else{
                    // If stake
                    var block = getTransaction.blockhash;
                    var blockhash = String(block);
                        log.log_write_console(blockhash);

                    var getBlock = await wallet.wallet_get_block(blockhash);
                    var getMint = getBlock.mint;
                    var mint = String(getMint);
                        log.log_write_console(getMint);

                    var transaction_amount = Big(getBlock.mint).toString();

                    var transaction_fee = getTransaction.fee;
                    var transaction_stake_amount = Big(transaction_amount); 
                    var transaction_stake = 1;
                    //log.log_write_console('AMOUNT: '+transaction_amount+' - FEE: '+transaction_fee+' STAKE AMOUNT: '+Big(transaction_stake_amount).toString());
                    // Update transaction on db
                    var updateTransaction = await transaction.transaction_update_stake_transaction(transaction_txid,Big(transaction_stake_amount).toString(),transaction_stake);
                    if(updateTransaction){
                        countTransactionsToCheck++;
                       }
                  }
               }
            if(i == transactionsToCheck.length-1 && manuallyFired == 1)
                chat.chat_reply(msg,'embed',userName,messageType,config.colors.special,false,config.messages.getstakes.manually,[[config.messages.getstakes.transactions,countTransactionsToCheck,false]],false,false,false,false,false);
            if(i == transactionsToCheck.length-1 && manuallyFired == 0)
                log.log_write_console(config.messages.getstakes.cron+' `'+countTransactionsToCheck+'` '+config.messages.getstakes.cron2);
        }
    },

    /* ------------------------------------------------------------------------------ */
    // !h / !help -> Show help command infos
    /* ------------------------------------------------------------------------------ */

    command_help: function(userID,userName,messageType,userRole,msg){
        // Normal commands
        var enabledUserCommands = [];
        if(config.commands.register)
            enabledUserCommands.push([config.messages.help.registerTitle,config.messages.help.registerValue,false]);
        if(config.commands.profile)
            enabledUserCommands.push([config.messages.help.profileTitle,config.messages.help.profileValue,false]);
        if(config.commands.balance)
            enabledUserCommands.push([config.messages.help.balanceTitle,config.messages.help.balanceValue,false]);
        if(config.commands.deposit)
            enabledUserCommands.push([config.messages.help.depositTitle,config.messages.help.depositValue,false]);
        if(config.commands.withdraw)
            enabledUserCommands.push([config.messages.help.withdrawTitle,config.messages.help.withdrawValue,false]);
        if(config.commands.stake)
            enabledUserCommands.push([config.messages.help.stakeTitle,config.messages.help.stakeValue,false]);
        if(config.commands.unstake)
            enabledUserCommands.push([config.messages.help.unstakeTitle,config.messages.help.unstakeValue,false]);
        if(config.commands.tip)
            enabledUserCommands.push([config.messages.help.tipTitle,config.messages.help.tipValue,false]);
        if(config.commands.rain)
            enabledUserCommands.push([config.messages.help.rainTitle,config.messages.help.rainValue,false]);
        if(config.commands.drop)
            enabledUserCommands.push([config.messages.help.dropTitle,config.messages.help.dropValue,false]);
        if(config.commands.history)
            enabledUserCommands.push([config.messages.help.historyTitle,config.messages.help.historyValue,false]);
        if(config.commands.update)
            enabledUserCommands.push([config.messages.help.updateTitle,config.messages.help.updateValue,false]);
        if(config.commands.donate)
            enabledUserCommands.push([config.messages.help.donateTitle,config.messages.help.donateValue,false]);
        if(config.commands.notify)
            enabledUserCommands.push([config.messages.help.notifyTitle,config.messages.help.notifyValue,false]);
        if(config.commands.version)
            enabledUserCommands.push([config.messages.help.versionTitle,config.messages.help.versionValue,false]);
        
        // Admin commands
        var enabledAdminCommands = []; 
        if(config.commands.startstop){
            enabledAdminCommands.push([config.messages.help.admin.startStopTitle,config.messages.help.admin.startStopValue,false]);
        }
        if(config.commands.getdeposits)
            enabledAdminCommands.push([config.messages.help.admin.getDepositsTitle,config.messages.help.admin.getDepositsValue,false]);
        if(config.commands.creditdeposits)
            enabledAdminCommands.push([config.messages.help.admin.creditDepositsTitle,config.messages.help.admin.creditDepositsValue,false]);
        if(config.commands.getstakes)
            enabledAdminCommands.push([config.messages.help.admin.getStakesTitle,config.messages.help.admin.getStakesValue,false]);
        if(config.commands.creditstakes)
            enabledAdminCommands.push([config.messages.help.admin.creditStakesTitle,config.messages.help.admin.creditStakesValue,false]);
        if(config.commands.clear)
            enabledAdminCommands.push([config.messages.help.admin.clearTitle,config.messages.help.admin.clearValue,false]);

        if(userRole >= 3){
            chat.chat_reply(msg,'private',userName,messageType,config.colors.normal,false,config.messages.help.admin.title,enabledAdminCommands,false,false,false,false,false);
        }
        chat.chat_reply(msg,'embed',userName,messageType,config.colors.normal,false,config.messages.help.title,enabledUserCommands,false,false,false,false,false);
        return;
    },

    /* ------------------------------------------------------------------------------ */
    // !history d / !history deposits - !history w / !history withdrawals - !history p / !history payments -> Show last user deposit/withdrawal/payment history
    /* ------------------------------------------------------------------------------ */

    command_user_history: async function(userID,userName,messageType,msg,partTwo){
        // Check if user is registered
        var isUserRegistered = await user.user_registered_check(userID);
        if(isUserRegistered == 'error'){
            chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
            return;
        }
        if(!isUserRegistered){
            chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.error,false,config.messages.accountNotRegistered,false,false,false,false);
            return;
        }
        // Check command part two and act
        switch(partTwo) {
            case 'd':
            case 'deposits':
                    // Get deposit address
                    var userDepositAddress = await user.user_get_address(userID);
                    // If no address create a new one and save to user/database
                    if(userDepositAddress === null){
                        userDepositAddress = await wallet.wallet_create_deposit_address(userID);
                    }
                    // If new created address save to user/database
                    if(userDepositAddress){
                        await user.user_add_deposit_address(userDepositAddress,userID);
                    }
                    // GET DEPOSITS BY ADDRESS AND LIMIT
                    var depositHistoryDisplayCount;
                    if(config.wallet.depositsHistory > 7){
                        depositHistoryDisplayCount = 7;
                    }else{
                        depositHistoryDisplayCount = config.wallet.depositsHistory;
                    }
                    var latestUserDeposits = await transaction.transaction_get_deposits_by_address(depositHistoryDisplayCount,userDepositAddress);
                    // If no deposits
                    if(!latestUserDeposits.length > 0){
                        chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.error,false,config.messages.history.deposits.no,false,false,false,false);
                        return;
                    }
                    // Build reply table and reply
                    var replyResult = [];
                    for (var i = 0 ; i < latestUserDeposits.length ; ++i){
                        var creditAmount = Big(latestUserDeposits[i].amount).toFixed(8);
                        var creditCredited = latestUserDeposits[i].credited;
                        var creditConfirmations = latestUserDeposits[i].confirmations;
                        if(creditCredited){
                            creditCredited = config.messages.history.deposits.credited;
                        }else{
                            creditCredited = config.messages.history.deposits.pending;
                        }
                        replyResult.push([config.messages.history.deposits.amount+' ('+config.wallet.coinSymbolShort+')',creditAmount,true]);
                        replyResult.push([config.messages.history.deposits.confirmations,creditConfirmations,true]);
                        replyResult.push([config.messages.history.deposits.status,creditCredited,true]);
                        if(i == latestUserDeposits.length-1){
                            chat.chat_reply(msg,'embed',userName,messageType,config.colors.success,[config.messages.history.deposits.view+' '+userDepositAddress,config.wallet.thumbnailIcon,config.wallet.explorerLinkAddress+userDepositAddress],config.messages.history.deposits.title,replyResult,config.messages.history.deposits.description+" **`"+config.wallet.minConfirmationsCredit+"`** "+config.messages.history.deposits.description1+" **`"+config.wallet.depositsToCheck+"`** "+config.messages.history.deposits.description2,false,false,false,false);
                        }
                    }
                return;
            case 'w':
            case 'withdrawals':
                    // GET DEPOSITS BY ADDRESS AND LIMIT
                    var withdrawalsHistoryDisplayCount;
                    if(config.wallet.withdrawalsHistoryDisplayCount > 10){
                        withdrawalsHistoryDisplayCount = 10;
                    }else{
                        withdrawalsHistoryDisplayCount = config.wallet.withdrawalsHistoryDisplayCount;
                    }
                    var latestUserWithdrawals = await transaction.transaction_get_withdrawals_by_user_id(withdrawalsHistoryDisplayCount,userID);
                    // If no deposits
                    if(!latestUserWithdrawals.length > 0){
                        chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.error,false,config.messages.history.withdrawals.no,false,false,false,false);
                        return;
                    }
                    var replyResult = [];
                    for (var i = 0 ; i < latestUserWithdrawals.length ; ++i){
                            replyResult.push([Big(latestUserWithdrawals[i].amount).toFixed(8)+' '+config.wallet.coinSymbolShort,config.wallet.explorerLinkTransaction+latestUserWithdrawals[i].txid,true]);
                        if(i == latestUserWithdrawals.length-1){
                            //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
                            chat.chat_reply(msg,'embed',userName,messageType,config.colors.success,false,config.messages.history.withdrawals.title,replyResult,config.messages.history.withdrawals.description,false,false,false,false);
                            return;
                        }
                    }
                return;
            case 'p':
            case 'payments':
                    // GET DEPOSITS BY ADDRESS AND LIMIT
                    var paymentHistoryCoun;
                    if(config.wallet.paymentHistoryCoun > 7){
                        paymentHistoryCoun = 7;
                    }else{
                        paymentHistoryCoun = config.wallet.paymentHistoryCoun;
                    }
                    var latestUserPayments = await transaction.transaction_get_payments_by_user_id(paymentHistoryCoun,userID);
                    // If no deposits
                    if(!latestUserPayments.length > 0){
                        chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.error,false,config.messages.history.payments.no,false,false,false,false);
                        return;
                    }
                    var replyResult = [];
                    for (var i = 0 ; i < latestUserPayments.length ; ++i){
                            replyResult.push([config.messages.history.payments.type,latestUserPayments[i].type,true]);
                            replyResult.push([config.messages.history.payments.amount,Big(latestUserPayments[i].amount).toFixed(8)+' '+config.wallet.coinSymbolShort,true]);
                            replyResult.push([0,0,true]);
                        if(i == latestUserPayments.length-1){
                            //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
                            chat.chat_reply(msg,'embed',userName,messageType,config.colors.success,false,config.messages.history.payments.title,replyResult,config.messages.history.payments.description,false,false,false,false);
                        }
                    }
                return;
            default:
                //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
                chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.error,false,config.messages.notValidCommand,false,false,false,false);
                return;
        }
    },

    /* ------------------------------------------------------------------------------ */
    // !notify -> Enable/Disable user for notify
    /* ------------------------------------------------------------------------------ */

    command_user_notify: async function(userID,userName,messageType,msg,partTwo){
        // First check if is valid command on or off
        if(!partTwo || partTwo !== 'on' && partTwo !== 'off'){
            //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
            chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.error,false,config.messages.notValidCommand,false,false,false,false);
            return;
        }
        if(partTwo === 'on'){
            // Remove user from no notify list -> userID
            var storageNotify = await storage.storage_delete_local_storage(userID,'notify');
            if(!storageNotify){
                chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                return;
            }
            //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
            chat.chat_reply(msg,'embed',userName,messageType,config.colors.success,false,config.messages.notify.title,false,config.messages.notify.enabled,false,false,false,false);
            return;
        }
        if(partTwo === 'off'){
            // Add user to no notify list -> userID,userName
            var usernameSave = check.check_slice_string(userName.username,20) // :)
            var storageUsername = await storage.storage_write_local_storage(userID,'username',usernameSave);
            var storageNotify = await storage.storage_write_local_storage(userID,'notify','off');
            if(!storageUsername || !storageNotify){
                chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                return;  
            }
            //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
            chat.chat_reply(msg,'embed',userName,messageType,config.colors.success,false,config.messages.notify.title,false,config.messages.notify.disabled,false,false,false,false);
            return;
        }
        return;
    },

    /* ------------------------------------------------------------------------------ */
    // !p / !profile -> Show user profile
    /* ------------------------------------------------------------------------------ */

    command_user_profile: async function(userID,userName,messageType,msg){
        // Check if user is registered
        var isUserRegistered = await user.user_registered_check(userID);
        if(isUserRegistered == 'error'){
            chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
            return;
        }
        if(!isUserRegistered){
            chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.error,false,config.messages.accountNotRegistered,false,false,false,false);
            return;
        }
        var userInfo = await user.user_get_info(userID);
        if(!userInfo){
            chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
            return;
        }        
        //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
        chat.chat_reply(msg,'embed',userName,messageType,config.colors.success,false,config.messages.profile.title,[[config.messages.profile.username,userInfo[0].username,true],[config.messages.profile.userid,userInfo[0].discord_id,true],[0,0,true],[config.messages.profile.registered,moment.utc(userInfo[0].register_datetime).format('llll')+' (UTC)',true]],config.messages.profile.description,false,false,false,false);
    },

    /* ------------------------------------------------------------------------------ */
    // !rain <amount> -> Rain value to x random server users or latest online users
    /* ------------------------------------------------------------------------------ */
    command_rain: async function(userID,userName,messageType,msg,partTwo,partThree,partFour,serverUsers,activeUsers){
        var tipAmount = partThree;
        // Server users from db
        // var serverUsers = serverUsers;
        var databaseUsers = await user.user_get_discord_ids(config.wallet.maxRainRandomUsers);
        if(!databaseUsers){
            chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
            return;
        }
        // Get ids from database result
        for (var i = 0 ; i < databaseUsers.length ; ++i){
            serverUsers.push(databaseUsers[i].discord_id);
        }
        // Remove rain user id from serverUsers
        serverUsers = serverUsers.filter(item => item !== userID);
        // Get keys only from active users
        activeUsersSingle = [];
        //console.log(activeUsers);
        for(var k in activeUsers){
            activeUsersSingle.push(k);
        }
        //console.log(activeUsersSingle);
        var activeUsers = activeUsersSingle;
        // Remove rain user id from activeUsers
        activeUsers = activeUsers.filter(item => item !== userID);
        //console.log(activeUsers);
        // Make combined user ids unique in array
        var serverActiveUsers = unique(serverUsers.concat(activeUsers));
        //console.log(serverActiveUsers);
        // Remove rain user id from unique array
        serverActiveUsers = serverActiveUsers.filter(item => item !== userID);
        //console.log(serverActiveUsers);
        // Count all results
        var serverUsersCount = serverUsers.length; // not used anymore from here on as serverUsers gets overwritten in reain all from database count
        var activeUsersCount = activeUsers.length;
        var serverActiveUsersCount = serverActiveUsers.length;
        //console.log(serverUsersCount + ' - ' + activeUsersCount + ' - ' + serverActiveUsersCount);
        // Rain on private message not allowed
        if(messageType === 'dm'){
            chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.error,false,config.messages.rain.private,false,false,false,false);
            return;
        }
        // First check before do long queries -> is partTwo not empty and is partTwo numeric and not out of range
        if(!partTwo || partTwo !== 'online' && partTwo !== 'all' && partTwo !== 'random' || !tipAmount || !check.check_isNumeric(tipAmount) || check.check_out_of_int_range(tipAmount)){
            //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
            chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.error,false,config.messages.notValidCommand,false,false,false,false);
            return;
        }
        // Set value BigInt and from minus to plus for all values
        tipAmount = Big(tipAmount).toString();
        if(Big(tipAmount).lt(Big(0))){
            tipAmount = tipAmount.times(-1);
        }
        // Check if user is registered
        var isUserRegistered = await user.user_registered_check(userID);
        if(isUserRegistered == 'error'){
            chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
            return;
        }
        if(!isUserRegistered){
            chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.error,false,config.messages.accountNotRegistered,false,false,false,false);
            return;
        }
        // Get user balance
        var userBalance = await user.user_get_balance(userID);
        if(!userBalance){
            chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
            return;
        }
        //  Check if tip amount is smaller as balance
        var tipAmount = Big(tipAmount).toString();
        var userBalance = Big(userBalance).toString();
        if(Big(tipAmount).gt(Big(userBalance))){
            chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.error,false,config.messages.rain.big+' `'+Big(tipAmount).toFixed(8)+' '+config.wallet.coinSymbolShort+'` '+config.messages.rain.big1+' `'+Big(userBalance).toFixed(8)+' '+config.wallet.coinSymbolShort+'`'+config.messages.rain.big2,false,false,false,false);
            return;
        }
        // Check if user is currently blocked to use this command
        if(commandBlockedUsers.includes(userID)){
            chat.chat_reply(msg,'embed',false,messageType,config.colors.warning,false,config.messages.title.warning,false,config.messages.currentlyBlocked,false,false,false,false);
            return;
        }else{
            // Add user when this command fired to blocked list until he can get removed when function is over
            add_blocklist(userID);
        }
        // Tip all users
        if(partTwo === 'all'){
            // Get all database users count
            var databaseUsersCount = await user.user_get_total_count();
            if(!databaseUsersCount){
                chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                return;
            }
            databaseUsersCount = databaseUsersCount[0].totalusers;
            ///////////////////////////////
            // If no user to tip
            if(databaseUsersCount === 0 || databaseUsersCount == undefined){
                // Remove user from command block list
                remove_blocklist(userID);
                    
                chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.error,false,config.messages.tip.no,false,false,false,false);
                return; 
            }
            // Calculate min tip value for user count calculated with config min value for each tip
            var minServerUsersTipAmount =  Big(databaseUsersCount).times(config.wallet.minTipValue); 
            // If tipAmount is smaller as min rain value
            if(Big(tipAmount).lt(minServerUsersTipAmount)){
                // Remove user from command block list
                remove_blocklist(userID);
                    
                chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.error,false,config.messages.rain.minimum+' `'+Big(minServerUsersTipAmount).toFixed(8)+'` '+config.messages.rain.minimum1+' `'+databaseUsersCount+'` '+config.messages.rain.minimum2,false,false,false,false);
                return;
            }
            // Calculate tip for each user and round down value to loose no own sat
            var down = 0
            var tipSingleUserAmount = Big(tipAmount).div(databaseUsersCount).round(8, down);
            // Use calculate for each user value to calculate total to reduce value after rounding correction
            var valueToRemoveFromUser = Big(tipSingleUserAmount).times(databaseUsersCount);
            //console.log(Big(tipSingleUserAmount).toFixed(8) +' '+ Big(valueToRemoveFromUser).toFixed(8));
            // Write to logs in case of false requests to be able to check
            log.log_write_database(userID,config.messages.log.rain+' '+databaseUsersCount+' '+config.messages.log.rain1,Big(valueToRemoveFromUser).toString());
            // Substract balance from user
            var balanceSubstract = await user.user_substract_balance(Big(valueToRemoveFromUser).toString(),userID);
            if(!balanceSubstract){
                // Remove user from command block list
                remove_blocklist(userID);
                    
                chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                return;  
            }
            // Old rain all with users from discord
            // Credit balance to each rain user
            /*for (var i = 0 ; i < serverUsers.length ; ++i){
                //console.log(serverUsers[i]);
                var creditResult = await user.user_add_balance(Big(tipSingleUserAmount).toString(),serverUsers[i]);
                if(!creditResult){
                    // Remove user from command block list
                    remove_blocklist(userID);
                        
                    chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                    return;  
                }
                // Write to payment table send and received
                var saveTipSend = await transaction.transaction_save_payment_to_db(Big(tipSingleUserAmount).toString(),userID,serverUsers[i],config.messages.payment.tip.send);
                if(!saveTipSend){
                    // Remove user from command block list
                    remove_blocklist(userID);
                        
                    chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                    return;
                }
                var saveTipReceived = await transaction.transaction_save_payment_to_db(Big(tipSingleUserAmount).toString(),serverUsers[i],userID,config.messages.payment.tip.received);
                if(!saveTipReceived){
                    // Remove user from command block list
                    remove_blocklist(userID);
                        
                    chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                    return;  
                }
            }*/
            // Credit balance to each rain user
            var creditallusers = await user.user_add_balance_all(Big(tipSingleUserAmount).toString());
            if(!creditallusers){
                chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                return;
            }
            // Write to payment table send and received
            var saveTipSend = await transaction.transaction_save_payment_to_db(Big(valueToRemoveFromUser).toString(),userID,'rainall',config.messages.payment.tip.send);
            if(!saveTipSend){
                // Remove user from command block list
                remove_blocklist(userID);
                    
                chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                return;
            }
            var saveTipReceived = await transaction.transaction_save_payment_to_db(Big(tipSingleUserAmount).toString(),'rainall','rainall',config.messages.payment.tip.received);
            if(!saveTipReceived){
                // Remove user from command block list
                remove_blocklist(userID);
                                
                chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                return;  
            }
            // Return success message
            //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
            chat.chat_reply(msg,'embed',userName,messageType,config.colors.success,false,config.messages.rain.title,[[config.messages.rain.amount,Big(tipAmount).toFixed(8)+' '+config.wallet.coinSymbolShort,true],[config.messages.rain.rounded,Big(valueToRemoveFromUser).toFixed(8)+' '+config.wallet.coinSymbolShort,true],[config.messages.rain.users,databaseUsersCount,true],[config.messages.rain.each,Big(tipSingleUserAmount).toFixed(8)+' '+config.wallet.coinSymbolShort,true]],config.messages.rain.description,false,false,false,false);
            chat.chat_reply(msg,'normal',false,messageType,false,false,false,false,'@everyone',false,false,false,false);
            // List rained users
            /*var listUsers = '';
            var userCount = 0;
            for (var i = 0 ; i < serverUsers.length ; ++i){
                userCount++;
                if(userCount == 1){
                    listUsers = listUsers+'<@'+serverUsers[i]+'>';
                }else{
                    listUsers = listUsers+' <@'+serverUsers[i]+'>';
                }
                if(userCount == config.bot.listUsers){
                    chat.chat_reply(msg,'embed',userName,messageType,config.colors.success,false,false,[[config.messages.rain.users,listUsers,false]],false,false,false,false,false);
                    var listUsers = '';
                    userCount = 0;
                }
                if(i == serverUsers.length-1){
                    chat.chat_reply(msg,'embed',userName,messageType,config.colors.success,false,false,[[config.messages.rain.users,listUsers,false]],false,false,false,false,false);
                }
            }*/
            // Remove user from command block list
            remove_blocklist(userID);
                
            return;
        }
        // Tip online users
        if(partTwo === 'online'){
            // If no user to tip
            if(activeUsersCount === 0 || activeUsersCount == undefined){
                // Remove user from command block list
                remove_blocklist(userID);
                    
                chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.error,false,config.messages.tip.no,false,false,false,false);
                return; 
            }
            // Calculate min tip value for user count calculated with config min value for each tip
            var minActiveUsersTipAmount =  Big(activeUsersCount).times(config.wallet.minTipValue);
            // If tipAmount is smaller as min rain value
            if(Big(tipAmount).lt(minActiveUsersTipAmount)){
                // Remove user from command block list
                remove_blocklist(userID);
                    
                chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.error,false,config.messages.rain.minimum+' `'+Big(minActiveUsersTipAmount).toFixed(8)+'` '+config.messages.rain.minimum1+' `'+activeUsersCount+'` '+config.messages.rain.minimum2,false,false,false,false);
                return;
            }
            // Calculate tip for each user and round down value to loose no own sat
            var down = 0
            var tipSingleUserAmount = Big(tipAmount).div(activeUsersCount).round(8, down);
            // Use calculate for each user value to calculate total to reduce value after rounding correction
            var valueToRemoveFromUser = Big(tipSingleUserAmount).times(activeUsersCount);
            //console.log(Big(tipSingleUserAmount).toFixed(8) +' '+ Big(valueToRemoveFromUser).toFixed(8));
            // Write to logs in case of false requests to be able to check
            log.log_write_database(userID,config.messages.log.rain+' '+activeUsersCount+' '+config.messages.log.rain1,Big(valueToRemoveFromUser).toString());
            // Substract balance from user
            var balanceSubstract = await user.user_substract_balance(Big(valueToRemoveFromUser).toString(),userID);
            if(!balanceSubstract){
                // Remove user from command block list
                remove_blocklist(userID);
                    
                chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                return;  
            }
            // Credit balance to each rain user
            for (var i = 0 ; i < activeUsers.length ; ++i){
                //console.log(activeUsers[i]);
                var creditResult = await user.user_add_balance(Big(tipSingleUserAmount).toString(),activeUsers[i]);
                if(!creditResult){
                    // Remove user from command block list
                    remove_blocklist(userID);
                        
                    chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                    return;  
                }
                // Write to payment table send and received
                var saveTipSend = await transaction.transaction_save_payment_to_db(Big(tipSingleUserAmount).toString(),userID,activeUsers[i],config.messages.payment.tip.send);
                if(!saveTipSend){
                    // Remove user from command block list
                    remove_blocklist(userID);
                        
                    chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                    return;
                }
                var saveTipReceived = await transaction.transaction_save_payment_to_db(Big(tipSingleUserAmount).toString(),activeUsers[i],userID,config.messages.payment.tip.received);
                if(!saveTipReceived){
                    // Remove user from command block list
                    remove_blocklist(userID);
                        
                    chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                    return;  
                }
            }
            // Return success message
            chat.chat_reply(msg,'embed',userName,messageType,config.colors.success,false,config.messages.rain.title,[[config.messages.rain.amount,Big(tipAmount).toFixed(8)+' '+config.wallet.coinSymbolShort,true],[config.messages.rain.rounded,Big(valueToRemoveFromUser).toFixed(8)+' '+config.wallet.coinSymbolShort,true],[config.messages.rain.users,activeUsersCount,true],[config.messages.rain.each,Big(tipSingleUserAmount).toFixed(8)+' '+config.wallet.coinSymbolShort,true]],config.messages.rain.description,false,false,false,false);
            // List rained users
            var listUsers = '';
            var userCount = 0;
            for (var i = 0 ; i < activeUsers.length ; ++i){
                userCount++;
                // Check if user has notify disabled
                var userStorageNotify = await storage.storage_read_local_storage(activeUsers[i],'notify');
                var userStorageUsername = await storage.storage_read_local_storage(activeUsers[i],'username');
                //console.log(userStorageNotify);
                //console.log(userStorageUsername);
                //console.log(activeUsers[i]);
                if(userCount == 1){
                    if(userStorageNotify != 'off'){
                        listUsers = listUsers+'<@'+activeUsers[i]+'>';
                    }else{
                        listUsers = listUsers+userStorageUsername;
                    }
                }else{
                    if(userStorageNotify != 'off'){
                        listUsers = listUsers+' <@'+activeUsers[i]+'>';
                    }else{
                        listUsers = listUsers+' '+userStorageUsername;
                    } 
                }
                if(userCount == config.bot.listUsers){
                    //chat.chat_reply(msg,'embed',userName,messageType,config.colors.success,false,false,[[config.messages.rain.users,listUsers,false]],false,false,false,false,false);
                    chat.chat_reply(msg,'normal',false,messageType,config.colors.success,false,false,[[config.messages.rain.users,listUsers,false]],listUsers,false,false,false,false);
                    var listUsers = '';
                    userCount = 0;
                }
                if(i == activeUsers.length-1){
                    //chat.chat_reply(msg,'embed',userName,messageType,config.colors.success,false,false,[[config.messages.rain.users,listUsers,false]],false,false,false,false,false);
                    chat.chat_reply(msg,'normal',false,messageType,config.colors.success,false,false,[[config.messages.rain.users,listUsers,false]],listUsers,false,false,false,false)
                }
            }
            // Remove user from command block list
            remove_blocklist(userID);
                
            return;
        }
        // Tip random users
        if(partTwo === 'random'){
            // First check before do long queries -> is partThree not empty and is partThree numeric
            if(!partFour || !check.check_isNumeric(partFour) || check.check_out_of_int_range(partFour)){
                // Remove user from command block list
                remove_blocklist(userID);
                    
                //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
                chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.error,false,config.messages.notValidCommand,false,false,false,false);
                return;
            }
            // If users to tip value is negative make it positiv
            if(Big(partFour).lt(Big(0))){
                partFour = partFour.times(-1); 
            }
            // Round it up to full integer
            partFour = Math.ceil(partFour);
            // Check if random users to tip count is bigger is config value
            if(partFour > config.wallet.maxRainRandomUsers){
                // Remove user from command block list
                remove_blocklist(userID);
                    
                //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
                chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.error,false,config.messages.rain.randommax+' `'+config.wallet.maxRainRandomUsers+'` '+config.messages.rain.randommax1,false,false,false,false);
                return;
            }
            // If no user to tip
            if(serverActiveUsersCount === 0 || serverActiveUsersCount == undefined){
                // Remove user from command block list
                remove_blocklist(userID);
                    
                chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.error,false,config.messages.tip.no,false,false,false,false);
                return; 
            }
            // If users to tip value is smaller as total value of random users get that count only from array
            if(partFour < serverActiveUsersCount){
                serverActiveUsers = check.check_getRandomFromArray(serverActiveUsers, partFour);
            }
            // If bigger as total set to total
            if(partFour > serverActiveUsersCount){
                partFour = serverActiveUsersCount;
            }
            // Calculate min tip value for user count calculated with config min value for each tip
            var minServerActiveUsersTipAmount =  Big(partFour).times(config.wallet.minTipValue);
            // If tipAmount is smaller as min rain value
            if(Big(tipAmount).lt(minServerActiveUsersTipAmount)){
                // Remove user from command block list
                remove_blocklist(userID);
                    
                chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.error,false,config.messages.rain.minimum+' `'+Big(minServerActiveUsersTipAmount).toFixed(8)+'` '+config.messages.rain.minimum1+' `'+partFour+'` '+config.messages.rain.minimum2,false,false,false,false);
                return;
            }
            // Calculate tip for each user and round down value to loose no own sat
            var down = 0
            var tipSingleUserAmount = Big(tipAmount).div(partFour).round(8, down);
            // Use calculate for each user value to calculate total to reduce value after rounding correction
            var valueToRemoveFromUser = Big(tipSingleUserAmount).times(partFour);
            //console.log(Big(tipSingleUserAmount).toFixed(8) +' '+ Big(valueToRemoveFromUser).toFixed(8));
            // Write to logs in case of false requests to be able to check
            log.log_write_database(userID,config.messages.log.rain+' '+partFour+' '+config.messages.log.rain1,Big(valueToRemoveFromUser).toString());
            // Substract balance from user
            var balanceSubstract = await user.user_substract_balance(Big(valueToRemoveFromUser).toString(),userID);
            if(!balanceSubstract){
                // Remove user from command block list
                remove_blocklist(userID);
                    
                chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                return;  
            }
            // Credit balance to each rain user
            for (var i = 0 ; i < serverActiveUsers.length ; ++i){
                //console.log(serverActiveUsers[i]);
                var creditResult = await user.user_add_balance(Big(tipSingleUserAmount).toString(),serverActiveUsers[i]);
                if(!creditResult){
                    // Remove user from command block list
                    remove_blocklist(userID);
                        
                    chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                    return;  
                }
                // Write to payment table send and received
                var saveTipSend = await transaction.transaction_save_payment_to_db(Big(tipSingleUserAmount).toString(),userID,serverActiveUsers[i],config.messages.payment.tip.send);
                if(!saveTipSend){
                    // Remove user from command block list
                    remove_blocklist(userID);
                        
                    chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                    return;
                }
                var saveTipReceived = await transaction.transaction_save_payment_to_db(Big(tipSingleUserAmount).toString(),serverActiveUsers[i],userID,config.messages.payment.tip.received);
                if(!saveTipReceived){
                    // Remove user from command block list
                    remove_blocklist(userID);
                        
                    chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
                    return;  
                }
            }
            // Return success message
            chat.chat_reply(msg,'embed',userName,messageType,config.colors.success,false,config.messages.rain.title,[[config.messages.rain.amount,Big(tipAmount).toFixed(8)+' '+config.wallet.coinSymbolShort,true],[config.messages.rain.rounded,Big(valueToRemoveFromUser).toFixed(8)+' '+config.wallet.coinSymbolShort,true],[config.messages.rain.users,partFour,true],[config.messages.rain.each,Big(tipSingleUserAmount).toFixed(8)+' '+config.wallet.coinSymbolShort,true]],config.messages.rain.description,false,false,false,false);
            // List rained users
            var listUsers = '';
            var userCount = 0;
            for (var i = 0 ; i < serverActiveUsers.length ; ++i){
                userCount++;
                // Check if user has notify disabled
                var userStorageNotify = await storage.storage_read_local_storage(serverActiveUsers[i],'notify');
                var userStorageUsername = await storage.storage_read_local_storage(serverActiveUsers[i],'username');
                //console.log(userStorageNotify);
                //console.log(userStorageUsername);
                //console.log(serverActiveUsers[i]);
                if(userCount == 1){
                    if(userStorageNotify != 'off'){
                        listUsers = listUsers+'<@'+serverActiveUsers[i]+'>';
                    }else{
                        listUsers = listUsers+userStorageUsername;
                    }
                }else{
                    if(userStorageNotify != 'off'){
                        listUsers = listUsers+' <@'+serverActiveUsers[i]+'>';
                    }else{
                        listUsers = listUsers+' '+userStorageUsername;
                    } 
                }
                if(userCount == config.bot.listUsers){
                    //chat.chat_reply(msg,'embed',userName,messageType,config.colors.success,false,false,[[config.messages.rain.users,listUsers,false]],false,false,false,false,false);
                    chat.chat_reply(msg,'normal',false,messageType,config.colors.success,false,false,[[config.messages.rain.users,listUsers,false]],listUsers,false,false,false,false);
                    var listUsers = '';
                    userCount = 0;
                }
                if(i == serverActiveUsers.length-1){
                    //chat.chat_reply(msg,'embed',userName,messageType,config.colors.success,false,false,[[config.messages.rain.users,listUsers,false]],false,false,false,false,false);
                    chat.chat_reply(msg,'normal',false,messageType,config.colors.success,false,false,[[config.messages.rain.users,listUsers,false]],listUsers,false,false,false,false);
                }
            }
            // Remove user from command block list
            remove_blocklist(userID);
                
            return;
        }
        // If passed until here for any reason ;)
        //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
        chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.error,false,config.messages.notValidCommand,false,false,false,false);
        // Remove user from block list
        var commandcommandBlockedUsersIndex = commandBlockedUsers.indexOf(userID);
        commandBlockedUsers.splice(commandcommandBlockedUsersIndex, 1);
        return;
    },

    /* ------------------------------------------------------------------------------ */
    // !r / !register -> Register a user or tell him that he is already registerd
    /* ------------------------------------------------------------------------------ */

    command_user_register: async function(userID,userName,messageType,msg){
        // Check if user is registered
        var isUserRegistered = await user.user_registered_check(userID);
        if(isUserRegistered == 'error'){
            chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
            return;
        }
        if(isUserRegistered){
            chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.error,false,config.messages.register.already,false,false,false,false);
            return;
        }
        var usernameSave = check.check_slice_string(userName.username,60) // :)
        var registerUser = await user.user_register(usernameSave,userID);
        if(!registerUser){
            chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
            return;
        }

        log.log_write_database(userID,usernameSave+' '+config.messages.log.registered,0);
        chat.chat_reply(msg,'embed',userName,messageType,config.colors.success,false,config.messages.register.title,false,config.messages.register.registered,false,false,false,false);
    },

    /* ------------------------------------------------------------------------------ */
    // !stake -> Convert balance to stake balance
    /* ------------------------------------------------------------------------------ */

    command_stake: async function(userID,userName,messageType,msg,partTwo){
        var currentDatetime = moment().tz(config.staking.timezone).format('YYYY-MM-DD HH:mm:ss');
        var stakeAmount = partTwo;
        // First check before do long queries -> is partTwo not empty and numeric
        if(!stakeAmount || !check.check_isNumeric(stakeAmount) || check.check_out_of_int_range(stakeAmount)){
            //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
            chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.error,false,config.messages.notValidCommand,false,false,false,false);
                return;
        }
        // Check min stake amount
        if(Big(stakeAmount).lt(Big(config.staking.minStake))){
            chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.error,false,config.messages.stake.min+' `'+Big(config.staking.minStake).toFixed(8)+' '+config.wallet.coinSymbolShort+'` ',false,false,false,false);
            return;
        }
        // Set value BigInt and from minus to plus
        stakeAmount = Big(stakeAmount).toString();
        if(Big(stakeAmount).lt(Big(0))){
            stakeAmount = stakeAmount.times(-1); 
        }  
        // Check if user is registered
        var isUserRegistered = await user.user_registered_check(userID);
        if(isUserRegistered == 'error'){
            chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
            return;
        }
        if(!isUserRegistered){
            chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.error,false,config.messages.accountNotRegistered,false,false,false,false);
            return;
        }
        // Get user balance
        var userBalance = await user.user_get_balance(userID);
        if(!userBalance){
            chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
            return;
        }
        //  Check if stake amount is smaller balance
        var stakeAmount = Big(stakeAmount).toString();
        var userBalance = Big(userBalance).toString();
        if(Big(stakeAmount).gt(Big(userBalance))){
            chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.error,false,config.messages.stake.big+' `'+Big(stakeAmount).toFixed(8)+' '+config.wallet.coinSymbolShort+'` '+config.messages.stake.big1+' `'+Big(userBalance).toFixed(8)+' '+config.wallet.coinSymbolShort+'`'+config.messages.stake.big2,false,false,false,false);
            return;
        }
        // Check if user is currently blocked to use this command
        if(commandBlockedUsers.includes(userID)){
            chat.chat_reply(msg,'embed',false,messageType,config.colors.warning,false,config.messages.title.warning,false,config.messages.currentlyBlocked,false,false,false,false);
            return;
        }else{
            // Add user when this command fired to blocked list until he can get removed when function is over
            add_blocklist(userID);
        }
        // Write to logs in case of false requests to be able to check
        log.log_write_database(userID,config.messages.log.stake,Big(stakeAmount).toString());
        // Substract balance from user
        var balanceSubstract = await user.user_substract_balance(Big(stakeAmount).toString(),userID);
        if(!balanceSubstract){
            // Remove user from command block list
            remove_blocklist(userID);
                
            chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
            return;  
        }
        // Credit balance to user stake balance
        // Write to logs in case of false requests to be able to check
        log.log_write_database(userID,config.messages.log.stakeadd,Big(stakeAmount).toString());
        var creditStakeBalance = await user.user_add_stake_balance(Big(stakeAmount).toString(),userID,currentDatetime);
        if(!creditStakeBalance){
            // Remove user from command block list
            remove_blocklist(userID);
                
            chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
            return;  
        }
        // Write to payment table stake balance
        var saveStake = await transaction.transaction_save_payment_to_db(Big(stakeAmount).toString(),userID,userID,config.messages.payment.stake.stake);
        if(!saveStake){
            // Remove user from command block list
            remove_blocklist(userID);
                
            chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
            return;  
        }
        // Remove user from command block list
        remove_blocklist(userID);
            
        // Return success message
        //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
        chat.chat_reply(msg,'embed',userName,messageType,config.colors.success,false,config.messages.stake.title,[[config.messages.stake.amount,Big(stakeAmount).toFixed(8)+' '+config.wallet.coinSymbolShort,true]],config.messages.stake.description,false,false,false,false);
    },

    /* ------------------------------------------------------------------------------ */
    // !t / !tip -> tip user with balance
    /* ------------------------------------------------------------------------------ */

    command_tip: async function(userID,userName,messageType,msg,partTwo,partThree){
        var tipUser = partTwo;
        var tipAmount = partThree;
        // Tip on private message not allowed
        if(messageType === 'dm'){
            chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.error,false,config.messages.tip.private,false,false,false,false);
            return;
        }
        // First check before do long queries -> is partTwo not empty and is partThree numeric
        if(!tipUser || !tipAmount || !check.check_isNumeric(tipAmount) || check.check_out_of_int_range(tipAmount)){
        //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
        chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.error,false,config.messages.notValidCommand,false,false,false,false);
            return;
        }
        // Set value BigInt and from minus to plus
        tipAmount = Big(tipAmount).toString();
        if(Big(tipAmount).lt(Big(0))){
            tipAmount = tipAmount.times(-1); 
        }
        // Check if user is registered
        var isUserRegistered = await user.user_registered_check(userID);
        if(isUserRegistered == 'error'){
            chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
            return;
        }
        if(!isUserRegistered){
            chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.error,false,config.messages.accountNotRegistered,false,false,false,false);
            return;
        }
        // Check if user to tip to is a valid discord id
        if(!check.check_valid_discord_id(tipUser)){
            chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.error,false,config.messages.tip.notvalid,false,false,false,false);
            return;
        }
        // Get tipUser discord_id
        var tipUser = tipUser.slice(2, -1);
        // Check if discord admin and remove ! from of discord id!
        if(tipUser.substring(0,1) == '!'){
            tipUser = tipUser.substr(1);
        }
        // If discord id is own discord id <- self tip
        if(Big(userID).eq(tipUser)){
            chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.error,false,config.messages.tip.self,false,false,false,false);
            return;
        }
        // Check min tip amount
        if(Big(tipAmount).lt(Big(config.wallet.minTipValue))){
            chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.error,false,config.messages.tip.min+' `'+Big(config.wallet.minTipValue).toFixed(8)+' '+config.wallet.coinSymbolShort+'` ',false,false,false,false);
            return;
        }
        // Get user balance
        var userBalance = await user.user_get_balance(userID);
        if(!userBalance){
            chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
            return;
        }
        //  Check if tip amount is smaller balance
        var tipAmount = Big(tipAmount).toString();
        var userBalance = Big(userBalance).toString();
        if(Big(tipAmount).gt(Big(userBalance))){
            chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.error,false,config.messages.tip.big+' `'+Big(tipAmount).toFixed(8)+' '+config.wallet.coinSymbolShort+'` '+config.messages.tip.big1+' `'+Big(userBalance).toFixed(8)+' '+config.wallet.coinSymbolShort+'`'+config.messages.tip.big2,false,false,false,false);
            return;
        }
        // Check if user is currently blocked to use this command
        if(commandBlockedUsers.includes(userID)){
            chat.chat_reply(msg,'embed',false,messageType,config.colors.warning,false,config.messages.title.warning,false,config.messages.currentlyBlocked,false,false,false,false);
            return;
        }else{
            // Add user when this command fired to blocked list until he can get removed when function is over
            add_blocklist(userID);
        }
        // Write to logs in case of false requests to be able to check
        log.log_write_database(userID,config.messages.log.tip+' '+tipUser,Big(tipAmount).toString());
        // Substract balance from user
        var balanceSubstract = await user.user_substract_balance(Big(tipAmount).toString(),userID);
        if(!balanceSubstract){
            // Remove user from command block list
            remove_blocklist(userID);
                
            chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
            return;  
        }
        // Credit balance to user
        var creditResult = await user.user_add_balance(Big(tipAmount).toString(),tipUser);
        if(!creditResult){
            // Remove user from command block list
            remove_blocklist(userID);
                
            chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
            return;  
        }
        // Write to payment table send and received
        var saveTipSend= await transaction.transaction_save_payment_to_db(Big(tipAmount).toString(),userID,tipUser,config.messages.payment.tip.send);
        if(!saveTipSend){
            // Remove user from command block list
            remove_blocklist(userID);
                
            chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
            return;  
        }
        var saveTipReceived = await transaction.transaction_save_payment_to_db(Big(tipAmount).toString(),tipUser,userID,config.messages.payment.tip.received);
        if(!saveTipReceived){
            // Remove user from command block list
            remove_blocklist(userID);
                
            chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
            return;  
        }
        // Remove user from command block list
        remove_blocklist(userID);
            
        // Return success message
        //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
        chat.chat_reply(msg,'embed',userName,messageType,config.colors.success,false,config.messages.tip.title,[[config.messages.tip.user,'<@'+tipUser+'>',true],[config.messages.tip.amount,Big(tipAmount).toFixed(8)+' '+config.wallet.coinSymbolShort,true]],config.messages.tip.description,false,false,false,false);
    },

    /* ------------------------------------------------------------------------------ */
    // !unstake -> Convert stake balance to normal balance
    /* ------------------------------------------------------------------------------ */

    command_unstake: async function(userID,userName,messageType,msg,partTwo){
        var currentDatetime = moment().tz(config.staking.timezone).format('YYYY-MM-DD HH:mm:ss');
        var unstakeAmount = partTwo;
        // First check before do long queries -> is partTwo not empty and numeric
        if(!unstakeAmount || !check.check_isNumeric(unstakeAmount) || check.check_out_of_int_range(unstakeAmount)){
            //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
            chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.error,false,config.messages.notValidCommand,false,false,false,false);
                return;
        }
        // Check min unstake amount
        if(Big(unstakeAmount).lt(Big(config.staking.minUnstake))){
            chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.error,false,config.messages.unstake.min+' `'+Big(config.staking.minUnstake).toFixed(8)+' '+config.wallet.coinSymbolShort+'` ',false,false,false,false);
            return;
        }
        // Check if the minimum time between payments and payouts as defined in config has been respected.
        var userInfo = await user.user_get_info(userID);
        if(!userInfo){
            chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
            return;
        }
        // Convert database datetime to same dateime as the current date from moment
        var unstake_datetime = moment(userInfo[0].unstake_datetime).format('YYYY-MM-DD HH:mm:ss');
        // Convert both date strings into date format
        unstake_datetime = new Date(unstake_datetime);
        currentDatetime = new Date(currentDatetime);
        // Get difference between both times
        var diff = unstake_datetime.getTime() - currentDatetime.getTime();
        // Get seconds between both times
        var seconds_from_current_unstake = diff / 1000;
        seconds_from_current_unstake = Math.abs(seconds_from_current_unstake);
        // If seconds smaller as min seconds from config return time left until next possible unstake
        if(seconds_from_current_unstake < config.staking.lockTime){
            var timeLeftSecondsToNextUnstake = (config.staking.lockTime-seconds_from_current_unstake)*1000;
            var duration = moment.duration(timeLeftSecondsToNextUnstake);
            /*
            console.log(duration.years() + ' years');               // 0 years
            console.log(duration.months() + ' months');             // 0 months
            console.log(duration.days() + ' days');                 // 2 days
            console.log(duration.hours() + ' hours');               // 6 hours
            console.log(duration.minutes() + ' minutes');           // 43 minutes
            console.log(duration.seconds() + ' seconds');           // 41 seconds
            console.log(duration.milliseconds() + ' milliseconds'); // 250 milliseconds
            */
            chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.unstake.locked,false,config.messages.unstake.left+' `'+duration.days() + ' '+config.messages.unstake.leftdays+' '+duration.hours() + ' '+config.messages.unstake.lefthours+' '+duration.minutes() + ' '+config.messages.unstake.leftminutes+' '+duration.seconds() + ' '+config.messages.unstake.leftseconds+'`'+config.messages.unstake.left2,false,false,false,false);
            return;
        }
        // Set value BigInt and from minus to plus
        unstakeAmount = Big(unstakeAmount).toString();
        if(Big(unstakeAmount).lt(Big(0))){
            unstakeAmount = unstakeAmount.times(-1); 
        }  
        // Check if user is registered
        var isUserRegistered = await user.user_registered_check(userID);
        if(isUserRegistered == 'error'){
            chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
            return;
        }
        if(!isUserRegistered){
            chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.error,false,config.messages.accountNotRegistered,false,false,false,false);
            return;
        }
        // Get user balance
        var userStakeBalance = await user.user_get_stake_balance(userID);
        if(!userStakeBalance){
            chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
            return;
        }
        //  Check if unstake amount is smaller stake balance
        var unstakeAmount = Big(unstakeAmount).toString();
        var userStakeBalance = Big(userStakeBalance).toString();
        if(Big(unstakeAmount).gt(Big(userStakeBalance))){
            chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.error,false,config.messages.unstake.big+' `'+Big(unstakeAmount).toFixed(8)+' '+config.wallet.coinSymbolShort+'` '+config.messages.unstake.big1+' `'+Big(userStakeBalance).toFixed(8)+' '+config.wallet.coinSymbolShort+'`'+config.messages.unstake.big2,false,false,false,false);
            return;
        }
        // Check if the rest balance after unstake would be under min stake balance and set unstake to stake balance if true
        var unstakeReply = '';
        var afterUnstakeBalance = Big(userStakeBalance).minus(Big(unstakeAmount));
        if(Big(afterUnstakeBalance).lt(Big(config.staking.minStake))){
            // Show total withdraw message only if not total balance is taken but lower as min balance would be left
            if(afterUnstakeBalance != 0)
                unstakeReply = unstakeReply + config.messages.unstake.rest+' `'+Big(afterUnstakeBalance).toFixed(8)+'` '+config.messages.unstake.rest2+' `'+Big(config.staking.minUnstake).toFixed(8)+'`'+config.messages.unstake.rest3;
            // Set unstake balance to total stake balance
            unstakeAmount = Big(userStakeBalance).toString();
        }
        /////////////
        // Check if user is currently blocked to use this command
        if(commandBlockedUsers.includes(userID)){
            chat.chat_reply(msg,'embed',false,messageType,config.colors.warning,false,config.messages.title.warning,false,config.messages.currentlyBlocked,false,false,false,false);
            return;
        }else{
            // Add user when this command fired to blocked list until he can get removed when function is over
            add_blocklist(userID);
        }
        // Write to logs in case of false requests to be able to check
        log.log_write_database(userID,config.messages.log.unstake,Big(unstakeAmount).toString());
        // Substract balance from user
        var stakeBalanceSubstract = await user.user_substract_stake_balance(Big(unstakeAmount).toString(),userID,currentDatetime);
        if(!stakeBalanceSubstract){
            // Remove user from command block list
            remove_blocklist(userID);
                
            chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
            return;  
        }
        // Credit balance to user stake balance
        // Write to logs in case of false requests to be able to check
        log.log_write_database(userID,config.messages.log.unstakeadd,Big(unstakeAmount).toString());
        var creditResult = await user.user_add_balance(Big(unstakeAmount).toString(),userID);
        if(!creditResult){
            // Remove user from command block list
            remove_blocklist(userID);
                
            chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
            return;  
        }
        // Write to payment table stake balance
        var saveUnstake = await transaction.transaction_save_payment_to_db(Big(unstakeAmount).toString(),userID,userID,config.messages.payment.stake.unstake);
        if(!saveUnstake){
            // Remove user from command block list
            remove_blocklist(userID);
                
            chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
            return;  
        }
        // Remove user from command block list
        remove_blocklist(userID);
            
        // Return success message
        //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
        chat.chat_reply(msg,'embed',userName,messageType,config.colors.success,false,config.messages.unstake.title,[[config.messages.unstake.amount,Big(unstakeAmount).toFixed(8)+' '+config.wallet.coinSymbolShort,true]],config.messages.unstake.description + unstakeReply,false,false,false,false);
    },

    /* ------------------------------------------------------------------------------ */
    // !u / !update -> Update username with discord name
    /* ------------------------------------------------------------------------------ */

    command_update_username: async function(userID,userName,messageType,msg){
        // Check if user is registered
        var isUserRegistered = await user.user_registered_check(userID);
        if(isUserRegistered == 'error'){
            chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
            return;
        }
        if(!isUserRegistered){
            chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.error,false,config.messages.accountNotRegistered,false,false,false,false);
            return;
        }
        var usernameSave = check.check_slice_string(userName.username,60) // :) 
        var updateUsername = user.user_update_username(usernameSave,userID);
        if(!updateUsername){
            chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
            return;
        }

        log.log_write_database(userID,config.messages.log.username+' '+usernameSave,0);
        chat.chat_reply(msg,'embed',userName,messageType,config.colors.success,false,config.messages.update.title,false,config.messages.update.description,false,false,false,false);

    },

    /* ------------------------------------------------------------------------------ */
    // !v / !version -> Get current bot and wallet infos
    /* ------------------------------------------------------------------------------ */

    command_version: async function(userID,userName,messageType,msg){
        var walletInfo = await wallet.wallet_get_info();
        // If wallet not reachable
        if(walletInfo === 'error'){
            chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.error,false,config.messages.walletOffline,false,false,false,false);
            return;
        }
        var botVersion = config.bot.version;
        var walletVersion = walletInfo.version;
        var walletProtocolversion = walletInfo.protocolversion;
        var walletConnections = walletInfo.connections;
        var walletBlocks = walletInfo.blocks;
        var walletDifficulty = walletInfo.difficulty;
        //log.log_write_console(walletVersion);
        //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
        chat.chat_reply(msg,'embed',false,messageType,config.colors.success,false,config.messages.version.title,[[config.messages.version.botversion,botVersion,false],[config.messages.version.walletversion,walletVersion,true],[config.messages.version.walletprotocolversion,walletProtocolversion,true],[config.messages.version.walletconnections,walletConnections,true],[config.messages.version.walletblocks,walletBlocks,true],[config.messages.version.walletdifficulty,walletDifficulty,true]],false,false,false,false,false); 
        return;
    },

    /* ------------------------------------------------------------------------------ */
    // !withdraw address amount -> withdraw balance to external wallet
    /* ------------------------------------------------------------------------------ */

    command_withdraw: async function(userID,userName,messageType,msg,partTwo,partThree){
        var withdrawAddress = partTwo;
        var withdrawAmount = partThree;
        // First check before do long queries -> is partTwo not empty and is partThree numeric
        if(!withdrawAddress || !withdrawAmount || !check.check_isNumeric(withdrawAmount) || check.check_out_of_int_range(withdrawAmount)){
            //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
            chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.error,false,config.messages.notValidCommand,false,false,false,false);
            return;
        }
        // Set value BigInt
        var withdrawAmount = Big(partThree).toString();
        if(Big(withdrawAmount).lt(Big(0))){
            withdrawAmount = withdrawAmount.times(-1); 
        }
        // Check if user is registered
        var isUserRegistered = await user.user_registered_check(userID);
        if(isUserRegistered == 'error'){
            chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
            return;
        }
        if(!isUserRegistered){
            chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.error,false,config.messages.accountNotRegistered,false,false,false,false);
            return;
        }
        // Check min withdrawal
        if(Big(withdrawAmount).lt(Big(config.wallet.minWithdrawalValue))){
            chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.error,false,config.messages.withdraw.min+' `'+Big(config.wallet.minWithdrawalValue).toFixed(8)+' '+config.wallet.coinSymbolShort+'` ',false,false,false,false);
            return;
        }
        // Check if addres is valid payout address
        var isAddressValid = await wallet.wallet_validate_address(withdrawAddress);
        // If wallet not reachable
        if(isAddressValid === 'error'){
            chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.error,false,config.messages.walletOffline,false,false,false,false);
            return;
        }
        // If address not valid
        if(!isAddressValid){
            chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.error,false,config.messages.withdraw.notvalid,false,false,false,false);
            return;
        }
        // Get user balance
        var userBalance = await user.user_get_balance(userID);
        if(!userBalance){
            chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
            return;
        }
        //  Check if withdraw amount + withdraw fee is smaller or same as balance
        var withdrawAmount = Big(withdrawAmount).toString();
        var withdrawFee = Big(config.wallet.transactionFee).toString();
        var withdrawAmountPlusWithdrawFee = Big(withdrawAmount).plus(withdrawFee).toString();
        var withdrawAmountAvailable = Big(userBalance).minus(withdrawFee).toString();
        var userBalance = Big(userBalance).toString();
        if(Big(withdrawAmountPlusWithdrawFee).gt(Big(userBalance))){
            // If balance lower withdrawal fee
            if(Big(withdrawAmountAvailable).lt(Big(0))){
                var withdrawAmountAvailable = 0;
            }
            chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.error,false,config.messages.withdraw.big+' `'+Big(withdrawAmount).toFixed(8)+' '+config.wallet.coinSymbolShort+'` '+config.messages.withdraw.big1+' `'+Big(withdrawFee).toFixed(8)+' '+config.wallet.coinSymbolShort+'` '+config.messages.withdraw.big2+' `'+Big(withdrawAmountPlusWithdrawFee).toFixed(8)+' '+config.wallet.coinSymbolShort+'` '+config.messages.withdraw.big3+' `'+Big(userBalance).toFixed(8)+' '+config.wallet.coinSymbolShort+'`'+config.messages.withdraw.big4+' `'+Big(withdrawAmountAvailable).toFixed(8)+' '+config.wallet.coinSymbolShort+'`'+config.messages.withdraw.big5,false,false,false,false);
            return;
        }
        // Check if user is currently blocked to use this command
        if(commandBlockedUsers.includes(userID)){
            chat.chat_reply(msg,'embed',false,messageType,config.colors.warning,false,config.messages.title.warning,false,config.messages.currentlyBlocked,false,false,false,false);
            return;
        }else{
            // Add user when this command fired to blocked list until he can get removed when function is over
            add_blocklist(userID);
        }
        // Write to logs in case of false requests to be able to check
        log.log_write_database(userID,config.messages.log.withdrawrequest+' '+withdrawAddress,Big(withdrawAmount).toString());
        // Do withdraw
        var txID = await wallet.wallet_send_to_address(withdrawAddress,parseFloat(withdrawAmount));
        if(!txID){
            // Remove user from command block list
            remove_blocklist(userID);
                
            chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.error,false,config.messages.walletOffline,false,false,false,false);
            return;
        }
        // Substract balance from user
        var balanceSubstract = await user.user_substract_balance(Big(withdrawAmountPlusWithdrawFee).toString(),userID);
        if(!balanceSubstract){
            // Remove user from command block list
            remove_blocklist(userID);
                
            chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.error,false,config.messages.wentWrong,false,false,false,false);
            return;  
        }
        // Set withdraw to database
        var saveTransaction = await transaction.transaction_save_withdrawal_to_db(userID,withdrawAddress,Big(withdrawAmount).toString(),txID);
        if(!saveTransaction){
            // Remove user from command block list
            remove_blocklist(userID);
                
            chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,config.messages.title.error,false,config.messages.withdraw.failDBsave,false,false,false,false);
            return;  
        }
        // Remove user from command block list
        remove_blocklist(userID);
            
        // Display withdrawal message to user
        //msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp
        chat.chat_reply(msg,'embed',userName,messageType,config.colors.success,false,config.messages.withdraw.title,[[config.messages.withdraw.amount,Big(withdrawAmount).toFixed(8)+' '+config.wallet.coinSymbolShort,false],[config.messages.withdraw.address,withdrawAddress,false],[config.messages.withdraw.transaction,config.wallet.explorerLinkTransaction+txID,false]],config.messages.withdraw.description,false,false,false,false);
    },

    /* ------------------------------------------------------------------------------ */
    // Fire commands - Role value 0 = normal user, 1 = vip user, 2 = moderator, 3 = admin
    /* ------------------------------------------------------------------------------ */

    fire_command: function(msg,userID,userName,messageType,userRole,partOne,partTwo,partThree,partFour,partFive,serverUser,activeUsers){
        switch(partOne) {
            case 'b':
            case 'balance':
                if(config.commands.balance){
                    this.command_display_user_balance(userID,userName,messageType,msg);
                }
                return;
            case 'c':
            case 'clear':
                if(config.commands.clear){
                    this.command_clear_chat(userName,messageType,userRole,msg);
                }
                return;
            case 'cd':
            case 'creditdeposits':
                if(config.commands.creditdeposits){
                    this.command_credit_deposits(1,userName,messageType,userRole,msg);
                }
                return;
            case 'cs':
            case 'creditstakes':
                if(config.commands.creditstakes){
                    this.command_credit_stakes(1,userName,messageType,userRole,msg);
                }
                return;
            case 'd':   
            case 'deposit':
                if(config.commands.deposit){
                    this.command_display_user_deposit_address(userID,userName,messageType,msg);
                }
                return;
            case 'donate':
                if(config.commands.donate){
                    this.command_donate(userID,userName,messageType,msg);
                }
                return;   
            case 'drop':
                if(config.commands.drop){
                    this.command_drop(userID,userName,messageType,msg,partTwo,partThree,partFour,partFive);
                }
                return;  
            case 'gd':
            case 'getdeposits':
                if(config.commands.getdeposits){
                    this.command_get_deposits(1,userName,messageType,userRole,msg);
                }
                return;
            case 'gs':
            case 'getstakes':
                if(config.commands.getstakes){
                    this.command_get_stakes(1,userName,messageType,userRole,msg);
                }
                return;
            case "h":
            case 'help':
                if(config.commands.help){
                    this.command_help(userID,userName,messageType,userRole,msg);
                }
                 return;
            case "history":
                if(config.commands.history){
                    this.command_user_history(userID,userName,messageType,msg,partTwo);
                }
                return;
            case 'notify':
                if(config.commands.notify){
                    this.command_user_notify(userID,userName,messageType,msg,partTwo);
                }
                return;
            case 'p':
            case 'profile':
                if(config.commands.profile){
                    this.command_user_profile(userID,userName,messageType,msg);
                }
                return;
            case 'rain':
                if(config.commands.rain){
                    this.command_rain(userID,userName,messageType,msg,partTwo,partThree,partFour,serverUser,activeUsers);
                }
                return;
            case 'r':
            case 'register':
                if(config.commands.register){
                    this.command_user_register(userID,userName,messageType,msg);
                }   
                return;
            case 'stake':
                if(config.commands.stake){
                    this.command_stake(userID,userName,messageType,msg,partTwo);
                }   
                return;
            case 't':
            case 'tip':
                if(config.commands.tip){
                    this.command_tip(userID,userName,messageType,msg,partTwo,partThree);
                }
                return;
            case 'unstake':
                if(config.commands.unstake){
                    this.command_unstake(userID,userName,messageType,msg,partTwo);
                }   
                return;
            case 'u':
            case 'update':
                if(config.commands.update){
                    this.command_update_username(userID,userName,messageType,msg);
                }
                return;
            case 'v':
            case 'version':
                if(config.commands.version){
                    this.command_version(userID,userName,messageType,msg);
                }
                return;
            case 'w':
            case 'withdraw':
                if(config.commands.withdraw){
                    this.command_withdraw(userID,userName,messageType,msg,partTwo,partThree);
                }
                return;
            default:
                return chat.chat_reply(msg,'embed',userName,messageType,config.colors.error,false,false,false,config.messages.notValidCommand,false,false,false,false);
        }
    }

};
