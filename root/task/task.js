/*
* 任务对象
* 用于创建或者从指定脚本文件构造出一个任务对象
* =======================================================
* @节点引用
* =======================================================
*   @@按编号
*   每个节点会按照连接顺序，分配一个从1开始叠加的数字序号，#开头的是按编号引用
*   编号引用方式分为
*       1：单个编号 返回指定的多个节点
*           #1，#2，#3
*           #1,2,3,4
*       2：范围编号 返回多个节点
*           #1-3，包含#1，#2，#3
*           #3-4 包含#3，#4
*       3: 步进编号 返回1个或者多个节点
*           内部维护一个基数，每次引用时步进一次，不同步进名称基数互不影响
*           #(name)^n  name=步进名 n=步进数量
*           #(user)^1, 当前user基数=0，得到 #1，步进=1
*           #(user)^0 ,当前user基数=1，得到 #1，步进=0
*           #(user)^2, 当前user基数=1，得到 #3，步进=2
*       4: 比例分割 返回多个节点
*           根据比例n，划分为n个，c指定当前比例下标
*           #(name)%n,c
*           #(user)%5,1  #1,#2,#3,#4,#5
*           #(user)%5,2  #6,#7,#8,#9,#10
*   @@按名称
*       返回单个节点
*       使用@name引用 如@pc1 @pc2 @pc3
*   @@全部引用
*       返回多个节点
*       all = 全部引用
* =======================================================
* @分配方式
* =======================================================
* 将Y个脚本分配给引用的N节点。分为2类。
* @every
*   N个节点中的每个节点，都拥有Y个脚本
* @equal
*   N个节点，与Y个脚本，下标一一对应 N0=Y0，N1=Y1，N2=Y2
*   如果Y>N,判断allow_overstep=1忽略，allow_overstep=0报错
* */
const _ = require('lodash');
const alloter = require('./alloter'); //leaf分配器
const quoter = require('./quoter'); //节点引用器
const logger = require('log4js').getLogger("task");//日志组件
logger.level = 'debug';
/*
* 导出任务类
* */
module.exports = class task{
    /*
    * 构造
    * 初始化属性
    * */
    constructor( taskConf,nodeList ){
        //赋值属性,优先从taskConf得到，否则使用初始化值
        _.forEach({
            name: Date.now(),//任务名称
            save: true,//数据是否存储,默认是
            db: Date.now(),//数据库存储名称
            allocQueue: [], //分配队列，用于将任务分配给节点
            allocRes: [], //分配结果
            nodeList, //当前的节点列表
        },(v,k)=>{
            this[k] = _.has(taskConf,k) ? taskConf[k] : v;
        });
        //检查任务属性是否正确
        if( this.save && !this.db ) {
            throw new Error('task missing db!');
        }
        //创建节点引用器,整个任务公用一个
        this.nodeQuoter = new quoter( nodeList );
    }
    /*
    * 分配leaf
    * 将配置中leaf，分配给node
    * */
    async alloc(){
        //检查配置中，leaf分配队列是否正确
        let AQConf =  this.allocQueue || [];
        if( !_.isArray( AQConf ) || AQConf.length === 0 ){
            throw new Error('allocQueues wrong!');
        }
        //遍历队列项，挨个进行分配
        this.allocRes = [];
        for(let AQConfItem of AQConf){
            this.allocRes.push(await alloter( this.nodeQuoter,AQConfItem ) );
        }
        //返回结果
        return this.allocRes;
    }
    /*
    * 从文件构建任务
    * */
    static fromFile( nodeList, taskScriptPath ){
        let taskConf = require( taskScriptPath + OS_SEP + "config.js" );
        return new task( taskConf,nodeList );
    }
};