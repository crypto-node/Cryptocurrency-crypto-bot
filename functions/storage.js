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

// https://github.com/typicode/lowdb
// lowdb for content that is not as important but needs to be queried fast
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const adapter = new FileSync(process.cwd()+'/lowdb/lowdb.json')
const db = low(adapter);

/* ------------------------------------------------------------------------------ */
// // // // // // // // // // // // // // // // // // // // // // // // // // // //
/* ------------------------------------------------------------------------------ */

module.exports = {

    /* ------------------------------------------------------------------------------ */
    // Write to local storage
    /* ------------------------------------------------------------------------------ */

    storage_write_local_storage: function(userID,valueName,value) {
        return new Promise((resolve, reject)=>{
            try{
                var storage_write = db.set(userID+'.'+valueName, value).write();
                resolve(true);
            }catch (error){
                var errorMessage = "storage_write_local_storage: Can't write to local storage.";
                if(config.bot.errorLogging){
                    log.log_write_file(errorMessage);
                    log.log_write_file(error);
                }
                log.log_write_console(errorMessage);
                log.log_write_console(error);
                resolve(false);
            };
        });
    },

    /* ------------------------------------------------------------------------------ */
    // Delete from local storage
    /* ------------------------------------------------------------------------------ */

    storage_delete_local_storage: function(userID,valueName) {
        return new Promise((resolve, reject)=>{
            try{
                var storage_delete = db.unset(userID+'.'+valueName).write();
                resolve(true);
            }catch (error){
                var errorMessage = "storage_delte_local_storage: Can't delete from local storage.";
                if(config.bot.errorLogging){
                    log.log_write_file(errorMessage);
                    log.log_write_file(error);
                }
                log.log_write_console(errorMessage);
                log.log_write_console(error);
                resolve(false);
            };
        });
    },

    /* ------------------------------------------------------------------------------ */
    // Read from local storage
    /* ------------------------------------------------------------------------------ */

    storage_read_local_storage: function(userID,valueName) {    
        return new Promise((resolve, reject)=>{
            try{
                var storage_read = db.get(userID+'.'+valueName).value();
                resolve(storage_read);
            }catch (error){
                var errorMessage = "storage_read_local_storage: Can't read from local storage.";
                if(config.bot.errorLogging){
                    log.log_write_file(errorMessage);
                    log.log_write_file(error);
                }
                log.log_write_console(errorMessage);
                log.log_write_console(error);
                resolve(false);
            };
        });
    }

};