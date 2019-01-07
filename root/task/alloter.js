/*
* 分配器
* 将传入的leaf列表,按照nodeQuoter引用器 分配到node列表
* */
require('./../../common/constant');
const _ = require('lodash');
const scriptMgr = require( SCRIPT_PATH + "/mgr" );
const logger = require('log4js').getLogger("task-alloter");//日志组件
const ALLOC_MODES = ['equal','every']; //分配模式
const DEF_ALLOC_CONF = { //alloc默认配置
    mode: null , //分配方式
    node: null , //引用节点
    leaves: [] , //leaf 列表
};
const DEF_LEAF_CONF = { //leaf默认配置
    script: null, //leaf脚本
    show: null, //leaf显示名称
    save: null, //保存名称，表名
};
/*
* debug
* */
logger.level = 'debug';
/*
* 执行分配
* 遍历leaves每个leaf项，获取引用节点，并分配到节点上
* @环境变量
* currNodeNo 当前循环到的节点编号
* currIndex 当前循环下标
* */
async function alloter(nodeQuoter, conf ){
    let allocConf = await resolveConf( conf );
    let res = []; //分配结果
    /*
    * 以节点列表，进行循环,
    * 以leaves列表，进行子循环
    * */
    _.forEach( nodeQuoter.execute( allocConf.node ),( nodeNo ) => {
        //leaves子循环
        _.forEach( allocConf.leaves,( leaf,index )=>{
            //构造环境变量
            let ENV_VAR = {
                "currNodeNo": nodeNo,
                "currLeafIndex": index,
            };
            //替换变量
            let cLeaf = _.cloneDeep( leaf );
            cLeaf.show ? (cLeaf.show = replaceEnvVar( ENV_VAR,cLeaf.show )) : null;
            cLeaf.save ? (cLeaf.save = replaceEnvVar( ENV_VAR,cLeaf.save )) : null;
            //存储到结果上
            res.push({
                nodeNo,
                leaf: cLeaf
            })
        });
    });
    return res;
}
/*
* 变量替换
* */
function replaceEnvVar( ENV_VAR,str ){
    _.forEach( ENV_VAR,(val,vname)=>{
        str = str.replace(new RegExp(`@${vname}`,"gi"),val);
    });
    return str;
}
/*
* 解析，并检查alloc配置
* */
async function resolveConf( conf ){
    let allocConf = _.merge({},DEF_ALLOC_CONF,conf);
    let allScripts = await scriptMgr.allScripts();
    //检查分配模式是否支持
    if( ALLOC_MODES.indexOf( allocConf.mode ) === -1 ){
        throw new Error('alloter mode error: ' + allocConf.mode);
    }
    //每个leaf合并默认配置
    _.forEach(allocConf.leaves,(leaf,index)=>{
        allocConf.leaves[index] = _.merge({},DEF_LEAF_CONF,leaf);
        //检查leaf存在性
        if( !_.has(allScripts,leaf.script) ){
            throw new Error(`leaf script not exist ${ leaf.script }`);
        }
    });
    return allocConf;
}

/*
* 导出分配接口
* */
module.exports = alloter;