# Cryptocurrency-crypto-bot
Cryptocurrency-crypto-bot is an open-source Node.js wallet bot for Discord. (Deposit,Withdraw,Stake,Tip,Rain,Drop...)

## This bot is fully functional and ready to use. I accept no liability for errors in the code or incorrect use of the bot. I have decided to publish the bot to provide other developers with a basis to continue development. This repo will not get maintained or updated. Please do not send me any requests for support or installation assistance.

### BOT COMMANDS
**+register || +r**__
*Register an account with the bot.*__
**+profile || +p**__
*Display account information.*__
**+balance || +b**__
*Display your current balance.*__
**+deposit || +d**__
*Get your deposit address.*__
**+withdraw <address> <amount> || +w <address> <amount>**__
*Withdraw balance to an address (0.01 VIP transaction fee will be added on top of the amount).*__
**+stake <amount>**__
*Convert balance to stake balance for receiving stake pool payouts. (Its always possible to add balance but it will reset the unstake timer)*__
**+unstake <amount>**__
*Convert balance to normal balance (Only once within 24 hours if no stake/unstake has been done).*__
**+tip <@username> <amount>**__
*Tip a user from Discord.*__
**+rain all/online/random <amount> <userCount>**__
*(all) Tip amount divided by total user count. / (online) Tip amount divided by active users. / (random) Tip amount divided by **random user count.***__
**+drop phrase/react <amount> <timeInSeconds> <30 letter phrase>**__
*(phrase) Send coins to all users that reply with the asked phrase. / (react) Send coins to all users that react with the asked icon.*__
**+history deposits/withdrawals/payments || +history d/w/p**__
*(deposits) Show your latest deposits. / (withdrawals) Show your latest withdrawals. / (payments) Show your latest payments.*__
**+update || +u**__
*Update your username.*__
**+donate**__
*Show the bot creators tip address.*__
**+notify <on/off>**__
*Enable or disable to get mentioned by the bot.*__
**+version || +v**__
*Get current bot and wallet information.*__

### ADMIN COMMANDS
**+start / +stop**__
*Enable/Disable all bot commands while the bot is running.*____
**+getdeposits || +gd**__
*Manually get latest transactions from wallet and update confirmations.*__
**+creditdeposits || +cd**__
*Manually check confiramtions on database and credit deposits if they have min confirmations.*__

### Additional information

- It supports all coins using the standard Bticoin rpc commands__
- It's possible to configure a staking pool for POS coins__
- Written for Node.js__
- The bot offers the option to enable or disable all commands seperated, so its not needed to use them all __
- The backend is a mysql database____
- A massive configuration file to manage all content from one file__
- You can define administrators, moderators and a vip group__
... and many many many more options, please check the config file__

## Installation
:::
