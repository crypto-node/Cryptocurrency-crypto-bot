# ************************************************************
# Sequel Pro SQL dump
# Version 4541
#
# http://www.sequelpro.com/
# https://github.com/sequelpro/sequelpro
#
# Host: 35.205.165.129 (MySQL 5.7.14-google)
# Datenbank: galilel
# Erstellt am: 2019-11-18 20:35:27 +0000
# ************************************************************


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


# Export von Tabelle coin_price_history
# ------------------------------------------------------------

DROP TABLE IF EXISTS `coin_price_history`;

CREATE TABLE `coin_price_history` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `price` decimal(32,8) DEFAULT NULL,
  `currency` varchar(10) DEFAULT NULL,
  `datetime` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `api_service` tinytext CHARACTER SET utf8mb4 NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;



# Export von Tabelle deposits
# ------------------------------------------------------------

DROP TABLE IF EXISTS `deposits`;

CREATE TABLE `deposits` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `address` varchar(60) NOT NULL,
  `amount` decimal(32,8) NOT NULL,
  `txid` varchar(64) NOT NULL,
  `confirmations` int(11) NOT NULL,
  `credited` tinyint(1) unsigned NOT NULL,
  `datetime` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `coin_price` decimal(32,8) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `txid` (`txid`),
  KEY `address` (`address`),
  KEY `credited` (`credited`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;



# Export von Tabelle log
# ------------------------------------------------------------

DROP TABLE IF EXISTS `log`;

CREATE TABLE `log` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `discord_id` varchar(60) NOT NULL,
  `description` text NOT NULL,
  `value` decimal(32,8) DEFAULT NULL,
  `datetime` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `coin_price` decimal(32,8) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;



# Export von Tabelle payments
# ------------------------------------------------------------

DROP TABLE IF EXISTS `payments`;

CREATE TABLE `payments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `amount` double(32,8) NOT NULL,
  `from_discord_id` varchar(60) NOT NULL,
  `to_discord_id` varchar(60) NOT NULL,
  `type` tinytext NOT NULL,
  `datetime` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `coin_price` decimal(32,8) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `from_discord_id` (`from_discord_id`),
  KEY `to_discord_id` (`to_discord_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;



# Export von Tabelle transactions
# ------------------------------------------------------------

DROP TABLE IF EXISTS `transactions`;

CREATE TABLE `transactions` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `txid` varchar(64) NOT NULL,
  `amount` decimal(32,8) NOT NULL DEFAULT '0.00000000',
  `credited` tinyint(1) unsigned NOT NULL DEFAULT '0',
  `stake` tinyint(1) unsigned NOT NULL DEFAULT '0',
  `checked` tinyint(1) unsigned NOT NULL DEFAULT '0',
  `datetime` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `coin_price` decimal(32,8) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `txid` (`txid`),
  KEY `credited` (`credited`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;



# Export von Tabelle user
# ------------------------------------------------------------

DROP TABLE IF EXISTS `user`;

CREATE TABLE `user` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `username` varchar(60) NOT NULL,
  `balance` decimal(32,8) NOT NULL DEFAULT '0.00000000',
  `stake_balance` decimal(32,8) NOT NULL DEFAULT '0.00000000',
  `deposit_address` varchar(60) DEFAULT NULL,
  `discord_id` varchar(60) NOT NULL,
  `register_datetime` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `unstake_datetime` datetime NOT NULL DEFAULT '2000-01-01 00:00:00',
  PRIMARY KEY (`id`),
  UNIQUE KEY `discord_id` (`discord_id`),
  UNIQUE KEY `deposit_address` (`deposit_address`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;



# Export von Tabelle withdrawals
# ------------------------------------------------------------

DROP TABLE IF EXISTS `withdrawals`;

CREATE TABLE `withdrawals` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `discord_id` varchar(60) NOT NULL,
  `address` varchar(60) NOT NULL,
  `amount` decimal(32,8) NOT NULL,
  `txid` varchar(64) NOT NULL,
  `datetime` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `coin_price` decimal(32,8) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `discord_id` (`discord_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;




/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
