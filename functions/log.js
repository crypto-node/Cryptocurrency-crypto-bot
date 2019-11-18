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

const log4js = require('log4js');
log4js.configure({
  appenders: { discordbot: { type: 'file', filename: 'discordbot.log' } },
  categories: { default: { appenders: ['discordbot'], level: 'error' } }
});
const logger = log4js.getLogger('discordbot');

/* ------------------------------------------------------------------------------ */
// // // // // // // // // // // // // // // // // // // // // // // // // // // //
/* ------------------------------------------------------------------------------ */

module.exports = {

    /* ------------------------------------------------------------------------------ */
    // Log: Message to database
    /* ------------------------------------------------------------------------------ */

    log_write_database: function(UserID,logDescription = '',logValue = 0) {
        var self = this;
        mysqlPool.getConnection(function(error, connection){
            if(error){
                try
                    {
                    mysqlPool.releaseConnection(connection);
                    }
                catch (e){}
                var errorMessage = "log_write_database: MySQL connection problem.";
                if(config.bot.errorLogging){
                    self.log_write_file(errorMessage);
                    self.log_write_file(error);
                }
                self.log_write_console(errorMessage);
                self.log_write_console(error);
            }
            connection.execute("INSERT INTO log (discord_id,description,value,coin_price) VALUES (?,?,?,?)",[UserID,logDescription,logValue,coinPrice],function (error, results, fields){
                mysqlPool.releaseConnection(connection);
                if(error)
                {
                    var errorMessage = "log_write_database: MySQL query problem. (INSERT INTO log (discord_id,description,value,coin_price) VALUES (?,?,?,?))";
                    if(config.bot.errorLogging){
                        self.log_write_file(errorMessage);
                        self.log_write_file(error);
                    }
                    self.log_write_console(errorMessage);
                    self.log_write_console(error);
                }
            });
        });
    },

    /* ------------------------------------------------------------------------------ */
    // Log: Message to file
    /* ------------------------------------------------------------------------------ */

    log_write_file: function(message) {
        logger.error(message);
    },

    /* ------------------------------------------------------------------------------ */
    // Log: Message to console
    /* ------------------------------------------------------------------------------ */

    log_write_console: function(message) {
        console.error(message);
    },

};