-- `ms-api-prod`.product_usage_record 定义

CREATE TABLE `product_usage_record` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `product_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '产品名称',
  `response_time` float DEFAULT NULL COMMENT '响应时间',
  `status` int DEFAULT NULL COMMENT '状态，0：失败，1：成功',
  `request_text` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci COMMENT '接口请求文本',
  `response_text` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci COMMENT '接口响应文本',
  `apikey` varchar(5000) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT 'API KEY | Token',
  `user_id` int DEFAULT NULL COMMENT '用户ID',
  `user_no` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT '用户编号',
  `company_name` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT '公司名称【个人用户为空】',
  `product_id` int DEFAULT NULL COMMENT '产品ID',
  `server_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '服务名称',
  `consumption_amount` decimal(10,3) DEFAULT NULL COMMENT '消耗金额',
  `create_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '更新时间',
  `delete_datetime` datetime DEFAULT NULL COMMENT '删除时间',
  `is_delete` tinyint(1) NOT NULL COMMENT '是否软删除',
  PRIMARY KEY (`id`) USING BTREE,
  KEY `product_id` (`product_id`) USING BTREE,
  KEY `user_id` (`user_id`) USING BTREE,
  KEY `create_at` (`create_at`) USING BTREE,
  KEY `user_no` (`user_no`) USING BTREE,
  KEY `product_name` (`product_name`) USING BTREE,
  KEY `company_name` (`company_name`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=151620 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci ROW_FORMAT=DYNAMIC COMMENT='产品使用统计表';


-- `ms-api-prod`.`user` 定义

CREATE TABLE `user` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `user_no` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '用户编号',
  `username` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '用户名',
  `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '密码',
  `phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '手机号码',
  `avatar` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT '头像',
  `gender` int(1) unsigned zerofill NOT NULL COMMENT '性别，0：未知，1：男，2：女',
  `delete_datetime` datetime DEFAULT NULL COMMENT '删除时间',
  `is_delete` tinyint(1) NOT NULL COMMENT '是否软删除',
  `is_active` tinyint(1) NOT NULL COMMENT '是否可用',
  `nickname` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT '昵称',
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT '邮箱',
  `is_new_user` tinyint(1) DEFAULT NULL COMMENT '是否是新用户',
  `is_reset_password` tinyint(1) DEFAULT NULL COMMENT '是否重置密码',
  `last_ip` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT '最后一次登录IP',
  `last_login` datetime DEFAULT NULL COMMENT '最近一次登录时间',
  `wx_server_openid` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT '服务端微信平台openid',
  `is_wx_server_openid` tinyint(1) DEFAULT NULL COMMENT '是否已有服务端微信平台openid',
  `create_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '更新时间',
  `balance` decimal(18,5) DEFAULT NULL COMMENT '账户余额',
  `h5_link` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT 'H5链接',
  `access_method` int DEFAULT '0' COMMENT '接入方式：0-H5嵌入，1-API, 2-SDK，3-其他',
  `is_trial` int DEFAULT '1' COMMENT '是否试用：0-否，1-是',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE KEY `ix_user_phone` (`phone`) USING BTREE,
  UNIQUE KEY `ix_user_username` (`username`) USING BTREE,
  KEY `ix_user_password` (`password`) USING BTREE,
  KEY `ix_user_user_no` (`user_no`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=11002561 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci ROW_FORMAT=DYNAMIC COMMENT='用户信息表';


-- `ms-api-prod`.`order` 定义

CREATE TABLE `order` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `order_number` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '订单编号',
  `order_date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '订单日期',
  `total_amount` decimal(18,5) NOT NULL COMMENT '订单总金额',
  `gift_amount` decimal(18,5) DEFAULT NULL COMMENT '赠送金额',
  `status` int NOT NULL COMMENT '订单状态: 0:待支付，1:已支付，2:已取消，3:已退款，4:已关闭，5:已完成',
  `create_user_id` int DEFAULT NULL COMMENT '创建人',
  `delete_datetime` datetime DEFAULT NULL COMMENT '删除时间',
  `is_delete` tinyint(1) NOT NULL COMMENT '是否软删除',
  `create_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '更新时间',
  `order_type` int NOT NULL COMMENT '订单类型：0:充值，1:套餐，2:产品，3:升级，4:续费，5：试用订单',
  `subjet_name` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT '账号主体名称',
  `username` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '用户账号',
  `contract_id` int DEFAULT NULL COMMENT '合同编号',
  `user_id` int NOT NULL COMMENT '用户ID',
  `business_owners` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT '业务负责人',
  `payment_method` int DEFAULT '0' COMMENT '付款方式：0:微信支付，3:对公转账户，5:先用后付',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE KEY `order_number` (`order_number`) USING BTREE,
  KEY `create_user_id` (`create_user_id`) USING BTREE,
  KEY `ix_order_id` (`id`) USING BTREE,
  KEY `user_id` (`user_id`) USING BTREE,
  KEY `order_ibfk_3` (`contract_id`) USING BTREE,
  CONSTRAINT `order_ibfk_1` FOREIGN KEY (`create_user_id`) REFERENCES `admin_auth_user` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `order_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `order_ibfk_3` FOREIGN KEY (`contract_id`) REFERENCES `contract` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=382 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci ROW_FORMAT=DYNAMIC;


-- `ms-api-prod`.order_detail 定义

CREATE TABLE `order_detail` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_id` int NOT NULL,
  `quantity` int DEFAULT NULL COMMENT '数量',
  `price` decimal(18,5) NOT NULL COMMENT '价格',
  `access_method` int DEFAULT NULL COMMENT '接入方式: 1-H5嵌入，2-API, 3-H5+API, 4-SDK',
  `discount` float DEFAULT NULL COMMENT '折扣, 0.9表示9折',
  `delete_datetime` datetime DEFAULT NULL COMMENT '删除时间',
  `is_delete` tinyint(1) NOT NULL COMMENT '是否软删除',
  `create_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '更新时间',
  `product_name` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '产品名称',
  `server_name` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT '服务名称',
  `server_url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT '服务地址',
  `preferential_price` decimal(18,5) DEFAULT NULL COMMENT '优惠价',
  `package_id` int DEFAULT NULL COMMENT '套餐ID：如果订单类型为套餐，则该字段为套餐ID，否则为空',
  PRIMARY KEY (`id`) USING BTREE,
  KEY `order_id` (`order_id`) USING BTREE,
  KEY `ix_order_detail_id` (`id`) USING BTREE,
  CONSTRAINT `order_detail_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `order` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=11016 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci ROW_FORMAT=DYNAMIC;


-- `ms-api-prod`.product_trial 定义

CREATE TABLE `product_trial` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `product_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '产品名称',
  `trial_number` int DEFAULT NULL COMMENT '试用次数',
  `trial_total` int DEFAULT NULL COMMENT '试用总次数',
  `trial_days` int DEFAULT NULL COMMENT '试用天数',
  `trial_start_time` datetime DEFAULT NULL COMMENT '开始试用时间',
  `trial_end_time` datetime DEFAULT NULL COMMENT '结束试用时间',
  `is_expired` int DEFAULT NULL COMMENT '是否过期，0：未过期，1：已过期',
  `user_id` int NOT NULL COMMENT '用户ID',
  `product_id` int NOT NULL COMMENT '产品ID',
  `create_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '更新时间',
  `delete_datetime` datetime DEFAULT NULL COMMENT '删除时间',
  `is_delete` tinyint(1) NOT NULL COMMENT '是否软删除',
  PRIMARY KEY (`id`) USING BTREE,
  KEY `user_id` (`user_id`) USING BTREE,
  KEY `product_id` (`product_id`) USING BTREE,
  CONSTRAINT `product_trial_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `product` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `product_trial_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=24841 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci ROW_FORMAT=DYNAMIC COMMENT='产品试用表';