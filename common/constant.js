/*
* 常量
* */
const GLOBAL = global || {};
/*
* 路径
* */
const NPATH = require('path');
GLOBAL.OS_SEP = NPATH.sep;
GLOBAL.PROJECT_PATH = NPATH.dirname(NPATH.resolve( __dirname )); //项目目录
GLOBAL.COMMON_PATH = NPATH.dirname( PROJECT_PATH + OS_SEP + "common" ); //组件目录
//脚本相关
GLOBAL.SCRIPT_PATH = NPATH.resolve( PROJECT_PATH + OS_SEP + "scripts" ); //脚本根目录
GLOBAL.SCRIPT_PKG_PATH = NPATH.resolve(SCRIPT_PATH + OS_SEP + "pkg"); //包存放路径
GLOBAL.SCRIPT_LEAF_PATH = NPATH.resolve(SCRIPT_PATH + OS_SEP + "leaf"); //leaf路径
GLOBAL.SCRIPT_TASK_PATH = NPATH.resolve(SCRIPT_PATH + OS_SEP + "task"); //task路径
GLOBAL.SCRIPT_LEAF_DEF_CONFIG_FILE_NAME = "config.js"; //leaf默认配置文件
GLOBAL.SCRIPT_TASK_DEF_CONFIG_FILE_NAME = GLOBAL.SCRIPT_LEAF_DEF_CONFIG_FILE_NAME; //task默认配置文件
//根端
GLOBAL.ROOT_SIDE_PATH = NPATH.resolve( PROJECT_PATH + OS_SEP + "root" ); //根端目录
GLOBAL.ROOT_SIDE_TASK_PATH = NPATH.resolve( ROOT_SIDE_PATH + OS_SEP + "task" ); //根端内任务模块目录
GLOBAL.ROOT_SIDE_NPOOL_PATH = NPATH.resolve( ROOT_SIDE_PATH + OS_SEP + "npool" ); //根端内节点池模块目录
//节点端
GLOBAL.NODE_SIDE_PATH = NPATH.resolve( PROJECT_PATH + OS_SEP + "node" ); //节点端目录