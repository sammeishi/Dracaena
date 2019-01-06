/*
* 分配器
* 将传入的leaf列表,按照nodeQuoter引用器 分配到node列表
* */
require('./../../common/constant');
const _ = require('lodash');
const scriptMgr = require( SCRIPT_PATH + "/mgr" );
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
* 执行分配
* 遍历leaves每个leaf项，获取引用节点，并分配到节点上
* */
async function alloc( nodeQuoter,conf ){
    let allocConf = await resolveConf( conf );
    let nodeNoList = nodeQuoter.execute( allocConf.node );
    console.log( nodeNoList );
    // _.forEach(allocConf,( allocItem )=>{
    //     console.log( allocItem );
    // });
}
/*
* 解析，并检查alloc配置
* */
async function resolveConf( conf ){
    let allocConf = _.merge({},DEF_ALLOC_CONF,conf);
    let allScripts = await scriptMgr.allScripts();
    //检查分配模式
    if( ALLOC_MODES.indexOf( allocConf.mode ) === -1 ){
        throw new Error('alloc type error: ' + allocConf.mode);
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
module.exports = alloc;