# Cryptocurrency-crypto-bot
Cryptocurrency-crypto-bot is an open-source Node.js wallet bot for Discord. (Deposit,Withdraw,Stake,Tip,Rain,Drop...)

## This bot is fully functional and ready to use. I accept no liability for errors in the code or incorrect use of the bot. I have decided to publish the bot to provide other developers with a basis to continue development. This repo will not get maintained or updated. Please do not send me any requests for support or installation assistance.

### BOT COMMANDS
**+register | +r**  
*Register an account with the bot.*  
**+profile | +p**  
*Display account information.*  
**+balance | +b**  
*Display your current balance.*  
**+deposit | +d**  
*Get your deposit address.*  
**+withdraw address amount | +w address amount**  
*Withdraw balance to an address (0.01 VIP transaction fee will be added on top of the amount).*  
**+stake amount**  
*Convert balance to stake balance for receiving stake pool payouts. (Its always possible to add balance but it will reset the unstake timer)*  
**+unstake amount**  
*Convert balance to normal balance (Only once within 24 hours if no stake/unstake has been done).*__
**+tip @username amount**  
*Tip a user from Discord.*  
**+rain all/online/random amount userCount**  
*(all) Tip amount divided by total user count. / (online) Tip amount divided by active users. / (random) Tip amount divided by **random user count.***  
**+drop phrase/react amount timeInSeconds 30 letter phrase**  
*(phrase) Send coins to all users that reply with the asked phrase. / (react) Send coins to all users that react with the asked icon.*  
**+history deposits/withdrawals/payments | +history d/w/p**  
*(deposits) Show your latest deposits. / (withdrawals) Show your latest withdrawals. / (payments) Show your latest payments.*  
**+update | +u**  
*Update your username.*  
**+donate**  
*Show the bot creators tip address.*  
**+notify <on/off>**  
*Enable or disable to get mentioned by the bot.*  
**+version | +v**  
*Get current bot and wallet information.*  

### ADMIN COMMANDS
**+start / +stop**  
*Enable/Disable all bot commands while the bot is running.*  
**+getdeposits | +gd**   
*Manually get latest transactions from wallet and update confirmations.*  
**+creditdeposits | +cd**  
*Manually check confiramtions on database and credit deposits if they have min confirmations.*  

### Additional information

- It supports all coins using the standard Bitcoin rpc commands  
- It's possible to configure a staking pool for POS coins  
- Written for Node.js  
- The bot offers the option to enable or disable all commands seperated, so its not needed to use them all  
- The backend is a mysql database  
- A massive configuration file to manage all content from one file  
- You can define administrators, moderators and a vip group  
... and many many many more options, please check the config file  

## Installation
:::
