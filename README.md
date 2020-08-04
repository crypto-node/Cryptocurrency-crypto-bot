# Cryptocurrency-crypto-bot is an open-source Node.js wallet bot for Discord.

### Preview pictures
<img src="https://user-images.githubusercontent.com/8712219/69255023-68990180-0bb7-11ea-8e15-755491968a5e.jpg" width="45%"></img> <img src="https://user-images.githubusercontent.com/8712219/69255024-68990180-0bb7-11ea-9ce4-f962a17f6a0a.jpg" width="45%"></img> <img src="https://user-images.githubusercontent.com/8712219/69255026-69319800-0bb7-11ea-9f9e-acd0883a0d1d.jpg" width="45%"></img> <img src="https://user-images.githubusercontent.com/8712219/69255027-69319800-0bb7-11ea-85ad-f93b84c9c475.jpg" width="45%"></img> <img src="https://user-images.githubusercontent.com/8712219/69255028-69ca2e80-0bb7-11ea-81e6-ae11149e539a.jpg" width="45%"></img> <img src="https://user-images.githubusercontent.com/8712219/69255030-69ca2e80-0bb7-11ea-86b4-4965995a4438.jpg" width="45%"></img> <img src="https://user-images.githubusercontent.com/8712219/69255034-6a62c500-0bb7-11ea-8c0e-a9117234cda6.jpg" width="45%"></img> <img src="https://user-images.githubusercontent.com/8712219/69255037-6afb5b80-0bb7-11ea-88b2-3806c594639e.jpg" width="45%"></img> <img src="https://user-images.githubusercontent.com/8712219/69255039-6b93f200-0bb7-11ea-82f7-1dd738795eb1.jpg" width="45%"></img> <img src="https://user-images.githubusercontent.com/8712219/69255040-6c2c8880-0bb7-11ea-95a9-9d4d44401de5.jpg" width="45%"></img> <img src="https://user-images.githubusercontent.com/8712219/69255043-6cc51f00-0bb7-11ea-8818-f2bc151f1fbd.jpg" width="45%"></img> 

### BOT COMMANDS
> ```+register | +r```  
Register an account with the bot.  
```+profile | +p```  
Display account information.  
```+balance | +b```  
Display your current balance.  
```+deposit | +d```  
Get your deposit address.  
```+withdraw <address> <amount> | +w <address> <amount>```  
Withdraw balance to an address (0.01 VIP transaction fee will be added on top of the amount).  
```+stake <amount>```  
Convert balance to stake balance for receiving stake pool payouts. (Its always possible to add balance but it will reset the unstake timer)  
```+unstake <amount>```  
Convert balance to normal balance (Only once within 24 hours if no stake/unstake has been done).__
```+tip <@username> <amount>```  
Tip a user from Discord.  
```+rain <all/online/random> <amount> <userCount>```  
(all) Tip amount divided by total user count. / (online) Tip amount divided by active users. / (random) Tip amount divided by random user count.
```+drop <phrase/react> <amount> <timeInSeconds> <30 letter phrase>```  
(phrase) Send coins to all users that reply with the asked phrase. / (react) Send coins to all users that react with the asked icon.  
```+history <deposits/withdrawals/payments> | +history <d/w/p>```  
(deposits) Show your latest deposits. / (withdrawals) Show your latest withdrawals. / (payments) Show your latest payments. 
```+update | +u```  
Update your username.  
```+donate```  
Show the bot creators tip address.  
```+notify <on/off>```  
Enable or disable to get mentioned by the bot.  
```+version | +v```  
Get current bot and wallet information.  

### ADMIN COMMANDS
> ```+start / +stop```  
Enable/Disable all bot commands while the bot is running.  
```+getdeposits | +gd```   
Manually get latest transactions from wallet and update confirmations.  
```+creditdeposits | +cd```  
Manually check confiramtions on database and credit deposits if they have min confirmations.  
```+getstakes || +gs```   
Manually check transactions on database if they are stakes.  
```+creditstakes || +cs```  
Manually credit stakes to users.
```+clear || +c```  
Delete all visible messages from chat.

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
1. Create a MySQL Database and import the cryptocurrency-crypto-bot.sql  
2. Edit the config file carefully without missing any needed value!
3. Start your bot and enjoy! -> node index.js

## Staking
1. The database connection needs to work  
2. Enable staking on your wallet and add walletnotify option to your coin config (change the path to the bots transactions.sh script)  
staking=1  
walletnotify=/path/to/your/bot/folder/transaction.sh %s  
3. Enalbe staking options on the config file  
4. Check if transactionns are coming in to database

## Projects using the bot - Feel free to contact me to get added
- Limitless (VIP) - Discord: https://discord.gg/wtz6QYX - Website: http://vip.limitlessvip.co.za/
- BARE Coin (BARE) - Discord: https://discord.gg/xmQbzNH - Website: https://bare.network/
- Coin Pool Services - Discord: https://discord.gg/eWB5z2E - Website: https://coinpoolservices.com/
- Beyondcoin (BYND) - Discord: https://discord.gg/j3BUcJU - Website: https://beyondcoin.io
- Shroud Protocol (SHROUD) - Discord: https://discord.gg/7U8chR4 - Website: https://shroudx.org
