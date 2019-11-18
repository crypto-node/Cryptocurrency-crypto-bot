module.exports = {
    "bot": {
        "version": "1.3.2", // Current bot version
        "setNewAvatar": false, // Bot does crash if avatar gets changed too often! If you set a new image, set the value to true and the bot sets the new avatar. After change the value back to false!!!!
        "avatar":"./avatar.png", // Set bot avatar img -> local file path
        "gameMessage":"bot game message | +help", // Message under the bot name in the discord user list
        "adminMode": false, // If enabled the bot only accepts commands from admins
        "errorLogging": true, // Enable error logging to file discordbot.log
        "commandPrefix": "+", // Bot prefix to trigger the bot <- if symbol changed it needs to get allowed on check.js
        "cooldownTime": 10, // Cooldown a user need to wait between commands in seconds
        "activeUserTime": 600, // Seconds a user counts as active for rain online users
        "botID": "XXX", // Bot Discord ID - important else it react to own messages 
        "adminIDs": [ "XXX", "XXX", "XXX" ], // This discrod user IDs are able to use admin commands and bypass cooldowns
        "moderatorIDs": [ "XXX" ], // This discrod user IDs are able to use moderator commands and bypass cooldowns
        "vipGroupName": "Dev Team", // Users of this group are able to use vip commands and bypass cooldowns
        "respondChannelIDs": [ "XXX" ], // Discord server channel IDs the bot does listen to
        "commandIgnor": ["battle","cversion","destroy","gift","kill","lock","me","rez","top","use","me","cstart","cstop","cstart","jackpot","summary","shop","activate","mention","claim"], // commands to ignor because of other bots
        "stakePoolChannelID": "XXX", // If staking is configured use this channel to broadcast stake pool payouts
        "allowDM": true, // Allow or disable direct messages for commands to the bot with true or false
        "botToken": "XXX", // Discord bot token
        "listUsers": 30, // Define how many users get listed in one message on rain or drop <- Take care about 2200 letters limit from discord
        "dropBotReactIcon":"✅", // If change -> http://twitter.github.io/twemoji/2/test/preview.html -> click icon copy from popup and past it into the string!, // SOME ARE NOT WORKING!! TEST IT BEFORE MAKE IT LIVE
        "dropReactIcon":"🍀", // If change -> http://twitter.github.io/twemoji/2/test/preview.html -> click icon copy from popup and past it into the string!, // SOME ARE NOT WORKING!! TEST IT BEFORE MAKE IT LIVE
        "dropMinSeconds": 10, // Drop message min reply time in seconds
        "dropMaxSeconds": 300, // Drop message max reply time in seconds
        "dropMinUsers": 1, // Users minimum needed for drop
        "minDropValue": 0.00000001, // Minimum value for drop 
    }, 
    "mysql":{ // Dont forget to import the empty database before starting the bot
        "dbHost": "XXX", // Database server
        "dbName": "XXX", // Database name
        "dbUser": "XXX", // Database user
        "dbPassword": "XXX", // Database password
        "dbPort": 3306, // Database port
        "connectionLimit": 20, // Database maximal database pool connections
        "waitForConnections": true, // If true, the pool will queue the connection request and call it when one becomes available
    },
    "wallet":{
        "server": "127.0.0.1", // Wallet server
        "user": "XXX", // Wallet username
        "password": "XXX", // Wallet password
        "port": "1234", // Wallet port
        // TODO ENCRYPTION KEY FOR WALLET
        "coinSymbol": "Coin (CoinSymbol)", // Coin name
        "coinSymbolShort": "Symbol", // Coin name
        "thumbnailIcon": "https://domain.link/image.png", // Thumbnail icon for all messages (need to get enabled first in code to work = not ready)
        "check": true, // If enabled it checks (cron) for new transactions
        "credit": true, // If enabled it credits (cron) new transactions
        "depositsToCheck": 60, // How many latest deposits should be checked from the wallet
        "depositsCreditTime": 120, // How often deposits get checked for credit in seconds
        "depositsConfirmationTime": 40, // How often confirmations get checked
        "minConfirmationsDeposit": 2000, // Until this confirmations the deposit cron will update the confirmations on database
        "minConfirmationsCredit": 5, // Minimum confirmations to get the deposit balance credited
        "depositsHistory": 5, // How many deposits get shown on deposit history command !! Max value 7 !!
        "withdrawalsHistoryDisplayCount": 5, // How many withdrawals get shown on withdrawal history command !! Max value 5 !!
        "paymentHistoryCoun": 7, // How many payments get shown on withdrawals payments command !! Max value 7 !!
        "explorerLinkAddress": "https://explorer.link/#/address/", // Explorer link address for addresses
        "explorerLinkTransaction": "ttps://explorer.link/#/tx/", // Explorer link transaction
        "transactionFee": 0.01, // Fee taken for a transaction a user makes - Change value also on help command
        "minWithdrawalValue": 0.00000001, // Minimum value for withdrawal
        "minTipValue": 0.00000001, // Minimum value for tip 
        "maxRainRandomUsers": 15, // Please take care as the bot can crash if the value is to big as for each user a database query is fired!
        "donateAddress":"XXX" // Address for donations
    },
    "coinPrice":{ // If enabled the current coin price will be saved next to each transaction made from the bot and into the price history database table
        "enabled": false,
        "cronTime": 1800, // Cron time in seconds
        "apiService": "coinmarketcap", // define the api to use -> The coin must be listed on the api! Current possible values are "coinmarketcap" and "cryptocompare" -> you need to register to get a api key
        "apiKey": "XXX",
        "coinSymbol": "Symbol", // e.g. BTC
        "currency": "EUR" // Cent prices in this currency
    },
    "staking":{
        // Please hold this option disabled and configure it before!
        // 1. The database connection needs to work
        // 2. Enable staking on your wallet and add walletnotify option to your coin config (change the path to the bots transactions.sh script)
        // staking=1
        // walletnotify=/path/to/your/bot/folder/transaction.sh %s
        // 3. Check if transactionns are coming in to database
        "debug": false, // Debug stake credit on console
        "check": false, // If enabled it checks (cron) the saved transaction from walletnotify on database for stakes and calculated the amount
        "checkTime": 60, // Check for new transaction in seconds
        "checkCount": 50, // How many transactions max get checked at once from database
        "credit": false, // If enabled it credits (cron) all users with new stakes from database
        "creditTime": 80, // Credit new transactions in seconds
        "creditCount": 50, // How many transactions get credited to the users with one run
        "balanceDisplay": false, // Enable take balance display on balance command
        "minStake": 20, // Minimum value to stake
        "minUnstake": 20, // Minimum value to unstake
        "ownerPercentage": 95, // Bot owner percentage // Define how many percente users get from 100%
        "lockTime": 86400, // 24hours = 86400 - Lock time in seconds -> Check if the minimum time between payments and payouts as defined has been respected // Prevent stake pool hopping ;)
        "timezone": "Europe/Berlin" // Used for detect if unstake command can be used or is blocked <- only change if you know what you do! Best value would be same as mysql database time
    },  
    "commands": {
        // Enable or disable commands -> true/false
        // Admin commands
        "startstop": true,
        "getdeposits": true,
        "creditdeposits": true,
        // Please configure staking part first on top!!!!
        "getstakes": false,
        "creditstakes": false,
        ///////
        "clear": false,
        // Normal commands
        "help": true,
        "register": true,
        "profile": true,
        "balance": true,
        "deposit": true,
        "withdraw": true,
        "tip": true,
        "rain": true,
        "drop": true,
        "history": true,
        "update": true,
        "donate": true,
        "stake": false,
        "unstake": false,
        "notify": true,
        "version": true
    },
    "colors": {
        "normal": "0xecf0f1", // grey
        "success": "0x2ecc71", // green
        "warning": "0xe67e22", // orange
        "error": "0xe74c3c", // red
        "special": "0xE91E63" // pink
    },
    "messages": { // Some messages contain markdown -> http://markdown.de
        // Not command related messages
        "botStarted": "Bot started and online as",
        "adminMode": "Developer mode is enabled. Only admins are allowed to send commands.",
        "cooldown": "Please wait the cooldown of 10 sec on all commands.",
        "DMDisabled": "Direct messages are disabled. Please use the official command channel.",
        "notValidCommand": "This is not a valid command. Type **+help** for a list and try again.",
        "notAllowedCommand": "You are not allowed to use this command!",
        "walletOffline": "The wallet is not reachable. Please try again. \nIf the problem persists after another attempt, please contact the admin.",
        "wentWrong": "Somethig went wrong with your request. Please try again. \nIf the problem persists after another attempt, please contact the admin.",
        "comingSoon":"Coming soon!",
        "accountNotRegistered": "You are not registered. \nPlease type **+register** to create an account.",
        "currentlyBlocked":"Please wait until your other task is done before starting another one.",
        "payment": {
            "tip": {
                "send":"tip (sent)",
                "received":"tip (received)"
            },
            "drop":{
                "send":"drop (sent)",
                "received":"drop (received)"
            },
            "stake": {
                "stake": "stake balance (added)",
                "unstake": "stake balance (removed)",
                "received":"stake(s) (received)"
            }

        },
        "startstop": {
            "enabled":"Bot commands enabled.",
            "disabled":"Bot commands disabled.", 
        },
        "log": {
            "registered":"successfully registered.",
            "username":"Updated the username to",
            "depositaddress":"Deposit address created",
            "transctioncredited":"Credited blance to address",
            "transctioncreditedunknown":"Credited blance to unknown address",
            "withdrawrequest":"Withdraw request to address",
            "rain":"Sent rain to",
            "rain1":"users.",
            "tip":"Sent tip to user",
            "drop":"Sent drop to",
            "drop1":"users.",
            "stake":"Value removed from normal to stake balance",
            "stakeadd":"Value added from normal to stake balance",
            "unstake":"Value removed from stake to normal balance",
            "unstakeadd":"Value added from stake to normal balance",
            "stakecredit": "- Total wallet balance:",
            "stakecredit1": "- Total stake amount:",
            "stakecredit2": "- Total stake amount minus developer percentage:",
            "stakecredit3": "- Stake user count:",
            "stakecredit4": "- Stake users:",            
            "stakecredit5": "- Total stake balance of all users:",
            "stakecredit6": "- Total value for stake users from the total stake amount (totalUserStakeBalance/walletBalance*totalStakeForStakers):",
            "stakecredit7":"- IDs of processing transactions:",
            "stakecredit8":"- Discord ID:",
            "stakecredit9":"- Stake balance:",
            "stakecredit10":"- Credit amount:"
        },
        "balance": {
            "balance":"Balance",
            "username":"Username",
            "stakeTitle": "Stake balance", // Stake balance title
        },
        "clear": {
            "no": "I am not allowed to delete private messages!",
        },
        "creditdeposits": {
            "manually":"Manually credited",
            "deposits":"Deposits",
            "cron":"Cron credited",
            "cron2":"deposits"
        },
        "deposit": {
            "title":"Deposit",
            "address":"Address",
            "description":"Please double check your deposit address before sending any coins."
        },
        "donate": {
            "title":"Donate",
            "address":"Address",
            "description":"Feel free to send a tip to the following address if you want to support the bot creator. Thank you! :o)"
        },
        "drop": {
            "private":"Please use the public chat to drop.",
            "big":"Drop amount",
            "big1":"is bigger as your balance",
            "big2":".",
            "min":"The min value for a drop is",
            "minTime":"Min seconds for a drop are",
            "maxTime":"Max seconds for a drop are",
            "minFailedUserTitle":"Drop terminated",
            "minFailedUser":"users entered into the drop.",
            "minFailedUser1":"users are needed for a successful drop.",
            "dropPhraseReply":"Answer in this channel with the following phrase to win a share.",
            "dropReactReply":"React with the following icon to win a share.",
            "title":"Drop started",
            "phrase":"Phrase (copy & paste)",
            "icon":"Icon",
            "amount":"Drop amount",
            "seconds":"Drop time (seconds)",
            "titleSent":"Drop sent",
            "rounded":"rounded to",
            "users":"Users",
            "each":"each",
            "description":"Drop successfully sent.",
        },
        "getdeposits": {
            "manually":"Manually updated",
            "deposits":"Deposits",
            "cron":"Cron updated",
            "cron2":"deposits"
        },
        "help": {
            "title":"Bot commands",
            "registerTitle":"+register || +r",
            "registerValue":"Register an account with the bot.",
            "profileTitle":"+profile || +p",
            "profileValue":"Display account information.",
            "balanceTitle":"+balance || +b",
            "balanceValue":"Display your current balance.",
            "depositTitle":"+deposit || +d",
            "depositValue":"Get your deposit address.",
            "withdrawTitle":"+withdraw <address> <amount> || +w <address> <amount>",
            "withdrawValue":"Withdraw balance to an address (0.01 Symbol transaction fee will be added on top of the amount).",
            "stakeTitle":"+stake <amount>",
            "stakeValue":"Convert balance to stake balance for receiving stake pool payouts. (Its always possible to add balance but it will reset the unstake timer)",
            "unstakeTitle":"+unstake <amount>",
            "unstakeValue":"Convert balance to normal balance (Only once within 24 hours if no stake/unstake has been done).",
            "tipTitle":"+tip <@username> <amount>",
            "tipValue":"Tip a user from Discord.",
            "rainTitle":"+rain all/online/random <amount> <userCount>",
            "rainValue":"(all) Tip amount divided by total user count. / (online) Tip amount divided by active users. / (random) Tip amount divided by random user count.",
            "dropTitle":"+drop phrase/react <amount> <timeInSeconds> <30 letter phrase>",
            "dropValue":"(phrase) Send coins to all users that reply with the asked phrase. / (react) Send coins to all users that react with the asked icon.", 
            "historyTitle":"+history deposits/withdrawals/payments || +history d/w/p",
            "historyValue":"(deposits) Show your latest deposits. / (withdrawals) Show your latest withdrawals. / (payments) Show your latest payments.",
            "updateTitle":"+update || +u",
            "updateValue":"Update your username.",
            "donateTitle":"+donate",
            "donateValue":"Show the bot creators tip address.",
            "notifyTitle": "+notify <on/off>",
            "notifyValue": "Enable or disable to get mentioned by the bot.",
            "versionTitle": "+version || +v",
            "versionValue": "Get current bot and wallet information.",
            "admin": {
                "title":"Admin commands",
                "startStopTitle":"+start / +stop",
                "startStopValue":"Enable/Disable all bot commands while the bot is running.",
                "getDepositsTitle":"+getdeposits || +gd",
                "getDepositsValue":"Manually get latest transactions from wallet and update confirmations.",
                "creditDepositsTitle":"+creditdeposits || +cd",
                "creditDepositsValue":"Manually check confiramtions on database and credit deposits if they have min confirmations.",
                "getStakesTitle":"+getstakes || +gs",
                "getStakesValue":"Manually check transactions on database if they are stakes.",
                "creditStakesTitle":"+creditstakes || +cs",
                "creditStakesValue":"Manually credit stakes to users.",
                "clearTitle":"+clear || +c",
                "clearValue":"Delete all visible messages from chat."
            }
        },
        "title": {
            "warning":"Warning",
            "error":"Something went wrong"
        },
        "history": {
            "deposits": {
                "no":"No deposits to display. Please use **+deposit** to display your deposit address.",
                "view":"View transactions online",
                "title":"Deposit history (latest first)",
                "credited":"credited",
                "pending":"pending",
                "amount":"Amount",
                "status":"Status",
                "confirmations":"Confirmations",
                "description":"Deposits need",
                "description1":"confirmations to get credited. Confirmations get updated every",
                "description2":"seconds."
            },
            "withdrawals": {
                "no":"No withdrawals to display. Please use **+withdraw <address> <amount>** to withdraw your balance.",
                "title":"Withdrawal history (latest first)",
                "description":"Please be patient. It may take a few minutes until a new transaction appears in the blockexplorer."
            },
            "payments": {
                "no":"No payments to display.",
                "title":"Payment history (latest first)",
                "description":"History about your latest payments/tips.",
                "type":"Type",
                "amount":"Amount"
            }
        },
        "profile": {
            "title": "User profile",
            "userid": "User ID",
            "username": "Current username",
            "registered": "Register date",
            "description": "Your account related information."
        },
        "rain": {
            "private":"Please use the public chat to rain.",
            "big":"Rain amount",
            "big1":"is bigger as your balance",
            "big2":".",
            "minimum":"Failed to send rain. The minimum value is",
            "minimum1":"for the count of",
            "minimum2":"users.",
            "title":"Rain sent",
            "description":"Rain successfully sent.",
            "amount":"Amount",
            "rounded":"rounded to",
            "users":"Users",
            "each":"each",
            "randommax": "A maximum of",
            "randommax1": "users can receive a rain at once. Please use a lower number."
        },
        "register": {
            "already":"You are already registered. \nPlease type **+profile** to see your information.",
            "registered":"Please type **+profile** to see your information.",
            "title":"Successfully registered"
        },
        "tip": {
            "private":"Please use the public chat to tip.",
            "big":"Tip amount",
            "big1":"is bigger as your balance",
            "big2":".",
            "no":"Sorry, there is no user to tip.",
            "notvalid":"The username is not valid. Please use @username from Discord as name.",
            "self":"You can't tip yourself :)",
            "min":"The min value for a tip is",
            "title":"Tip sent",
            "description":"Tip successfully sent.",
            "amount":"Amount",
            "user":"User"
        },
        "update": {
            "title":"Username updated",
            "description":"Please type **+profile** to see your information.",
        },
        "withdraw": {
            "notvalid":"The specified payout address is not valid.",
            "big": "Withdraw amount",
            "big1": "+ withdraw fee",
            "big2": "=",
            "big3": "and its bigger as your balance",
            "big4": ". Maximal available value for withdrawal is",
            "big5": ".",
            "min":"The min value for a withdrawal is",
            "failDBsave":"Withdrawal done but an error came up. Please contact the admin about this problem!",
            "title":"Withdrawal sent",
            "description":"Withdrawal successfully sent.",
            "amount":"Amount",
            "transaction":"Transaction",
            "address":"Address"
        },
        "getstakes": {
            "manually":"Manually checked",
            "transactions":"Transactions",
            "cron":"Cron checked",
            "cron2":"stake transactions"
        },
        "creditstakes": {
            "manually":"Manually credited",
            "transactions":"Stake(s)",
            "cron":"Cron credited",
            "cron2":"stake transactions",
            "title":"Staking pool payout",
            "stakes":"Stake(s)",
            "amount":"Amount",
            "users":"Users",
            "description":"To check your pool payouts please use the history command."
        },
        "stake": {
            "big":"Stake amount",
            "big1":"is bigger as your balance",
            "big2":".",
            "title": "Stake balance updated (added)",
            "description": "Successfully updated stake balance.",
            "amount":"Amount added",
            "min":"The minimum value that has to be added to the stake balance is"
        },
        "unstake":{
            "big":"Unstake amount",
            "big1":"is bigger as your stake balance",
            "big2":".",
            "title": "Stake balance updated (reduced)",
            "description": "Successfully updated stake balance.",
            "amount":"Amount removed",
            "min":"The minimum value that must be subtracted from the stake balance is",
            "rest":"The remaining amount",
            "rest2":"would be below the min stake value of",
            "rest3":". The total stake value has been transferred.",
            "left":"Your balance is currently locked. We have implemented a freeze period and your next unstake is possible in",
            "left2":".",
            "leftdays":"DAYS",
            "lefthours":"HOURS",
            "leftminutes":"MINUTES",
            "leftseconds":"SECONDS",
            "locked":"Freeze period active"
        },
        "notify": {
          "title": "Notification setting updated",
          "enabled": "Mentions have been enabled.",
          "disabled": "Mentions have been disabled."
        },
        "version": {
            "title": "Bot and wallet information",
            "botversion": "Version (Bot)",
            "walletversion": "Version (Wallet)",
            "walletprotocolversion": "Protocolversion",
            "walletconnections": "Connections",
            "walletblocks": "Blocks",
            "walletdifficulty": "Difficulty"
          }
    }
};
