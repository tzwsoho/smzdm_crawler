/*
Navicat MySQL Data Transfer

Source Server         : 182.254.229.133
Source Server Version : 50173
Source Host           : 182.254.229.133:30306
Source Database       : smzdm

Target Server Type    : MYSQL
Target Server Version : 50173
File Encoding         : 65001

Date: 2017-08-26 17:54:42
*/

SET FOREIGN_KEY_CHECKS=0;

-- ----------------------------
-- Table structure for articles
-- ----------------------------
DROP TABLE IF EXISTS `articles`;
CREATE TABLE `articles` (
  `post_id` bigint(20) unsigned NOT NULL DEFAULT '0' COMMENT '爆料帖子 ID',
  `mall` varchar(100) NOT NULL DEFAULT '' COMMENT '商城',
  `title` varchar(2000) NOT NULL DEFAULT '' COMMENT '标题',
  `price` varchar(100) NOT NULL DEFAULT '' COMMENT '价格',
  `comments` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '评论数',
  PRIMARY KEY (`post_id`),
  UNIQUE KEY `post_id` (`post_id`) USING BTREE
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

-- ----------------------------
-- Table structure for baoliao
-- ----------------------------
DROP TABLE IF EXISTS `baoliao`;
CREATE TABLE `baoliao` (
  `user_smzdm_id` bigint(20) unsigned NOT NULL DEFAULT '0' COMMENT '用户 ID',
  `display_name` varchar(255) NOT NULL DEFAULT '' COMMENT '爆料人昵称',
  `post_id` bigint(20) unsigned NOT NULL DEFAULT '0' COMMENT '爆料帖子 ID',
  `mall` varchar(100) NOT NULL DEFAULT '' COMMENT '商城',
  `title` varchar(2000) NOT NULL DEFAULT '' COMMENT '标题',
  `price` varchar(100) NOT NULL DEFAULT '' COMMENT '价格',
  PRIMARY KEY (`user_smzdm_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

-- ----------------------------
-- Table structure for users
-- ----------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `user_smzdm_id` bigint(20) unsigned NOT NULL DEFAULT '0' COMMENT '用户 ID',
  `display_name` varchar(255) NOT NULL DEFAULT '' COMMENT '用户昵称',
  `baoliao` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '爆料数量',
  PRIMARY KEY (`user_smzdm_id`),
  UNIQUE KEY `user_smzdm_id` (`user_smzdm_id`) USING BTREE
) ENGINE=MyISAM DEFAULT CHARSET=utf8;
