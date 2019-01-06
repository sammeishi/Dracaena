/*
* 脚本管理器
* 管理预定义任务脚本，以及运行的leaf脚本
* @全部返回promise
* @功能
* 1：按照文件夹层级枚举
* 2：压缩
* 3：解压
* 4：下载
* */
require('./../common/constant');
const NPATH = require('path');
const NFS = require('fs');
const glob = require("glob");
const archiver = require("archiver");
const extractZip = require('extract-zip');
const _ = require('lodash');
const shortid = require('shortid');
const logger = require('log4js').getLogger("script-mgr");//日志组件
const OS_SEP = NPATH.sep;
const SCRIPT_NAME_EN_DASH = ".";
logger.level = 'debug';
/*
* 本管理器支持的管理的类型
* */
const MGR_TYPES = ['leaf','task'];
const DEF_CONFIG_FILE_NAME = SCRIPT_TASK_DEF_CONFIG_FILE_NAME;
/*
* ==============================================================
* 枚举脚本
* @脚本
* 所有脚本存放在SCRIPT_PATH路径
* 每个脚本都是一个目录
* 如果目录包含DEF_CONFIG_FILE_NAME，他就是脚本
* 脚本名scriptName.取自所在目录路径，去掉当前目录，分隔符换成SCRIPT_NAME_EN_DASH
* 脚本名可以还原为完整路径
* @支持类型
* 只枚举MGR_TYPES指定的脚本，MGR_TYPES内元素是目录名
* @脚本示例
* 有个目录 SCRIPT_PATH\leaf\noky\test,包含了config.js
* 他就是一个脚本，scriptName = leaf.noky.test
* @param    string  type    枚举的管理类型
* @return   array
* ==============================================================
* */
class enumScripts{
    /*
    * 查找脚本目录
    * 返回查找到的路径,是绝对路径
    * 如果type为空，查找所有类型
    * @return   array
    * */
    async findFolder( type ){
        let findPath = SCRIPT_PATH + OS_SEP + ( ( type ) ? type : `?(${ MGR_TYPES.join("|") })` );
        let endFile = DEF_CONFIG_FILE_NAME;
        return new Promise((S,J)=>{
            glob(`${findPath}/**/${endFile}`, {}, function (er, files) {
                if (er) {
                    return J(er);
                }
                else {
                    files.forEach((file, index) => {
                        //去除endFile
                        files[index] = file.split( endFile ).shift();
                    });
                    return S(files);
                }
            });
        });
    }
    /*
    * 转换为scriptName
    * 传入的file元素是每个脚本路径，去掉SCRIPT_PATH，分隔符换成SCRIPT_NAME_EN_DASH即是scriptName
    * @return   array[ str,str ]
    * */
    async makeScriptName( files ){
        let res = [];
        return new Promise((S,J)=>{
            for(let file of files){
                let SCRIPT_ID_PATH = NPATH.normalize( NPATH.relative(SCRIPT_PATH, file) ).split(OS_SEP);
                if( SCRIPT_ID_PATH.length <= 1 ){
                    return J(new Error(`empty file: ${ file }`));
                }
                else{
                    res.push( SCRIPT_ID_PATH.join(SCRIPT_NAME_EN_DASH) );
                }
            }
            S( res );
        });
    }
    /*
    * 读取一个脚本的配置内容
    * @return   object
    * */
    async readConfig( scriptName ){
        return new Promise((S,J)=>{
            let fullPath = enumScripts.scriptNameToFullPath( scriptName ) + OS_SEP + DEF_CONFIG_FILE_NAME;
            let conf = require( fullPath );
            return S( _.isObject( conf ) ? conf : {} );
        });
    }
    /*
    * 获取某个类型的脚本列表
    * @return   obj{ x.y.z:{ conf } }
    * */
    async enum( type ){
        return new Promise(async (S,J)=>{
            try{
                let res = {};
                let scriptNames = await this.makeScriptName( await this.findFolder( type ) );
                for(let scriptName of scriptNames){
                    let conf = await this.readConfig( scriptName );
                    res[ scriptName ] = conf;
                }
                return S( res );
            }
            catch (e) {
                return J( e );
            }
        });
    }
    /*
    * 将scriptName转换为路径
    * */
    static scriptNameToFullPath( scriptName ){
        let ID_PATH = scriptName.split( SCRIPT_NAME_EN_DASH );
        return `${SCRIPT_PATH}${OS_SEP}${ ID_PATH.join(OS_SEP) }`;
    }
}
/*
* ==============================================================
* 包管理
* 打包指定脚本
* 解包脚本到位置
* @打包
* 每个包都是zip格式，按照脚本路径放置在zip内
* @解包
* 将zip解压到script目录内
* ==============================================================
* */
class pkg{
    /*
    * 打包
    * */
    static async make( scriptNameList ){
        return new Promise((S,J)=>{
            let fileName = shortid();
            let output = NFS.createWriteStream(SCRIPT_PKG_PATH + OS_SEP + fileName + '.zip');
            let archive = archiver('zip', {zlib: { level: 9 } });
            output.on('close', function() {
                return S( fileName );
            });
            archive.on('error', function(err) {
                return J( err );
            });
            archive.pipe(output);
            for( let scriptName of scriptNameList ){
                let folder = scriptName.split( SCRIPT_NAME_EN_DASH ).join("/");
                archive.directory(enumScripts.scriptNameToFullPath( scriptName ), folder);
            }
            archive.finalize();
        });
    }
    /*
    * 解包
    * */
    static async un( zipFile ){
        return new Promise(( S,J )=>{
            NFS.exists( zipFile ,( s )=> !s ? J( `un error,file not exist: ${zipFile}` ) : S() )
        })
            .then(()=>{
                extractZip( zipFile ,{dir: SCRIPT_PATH} ,( err )=>{
                    return err ? Promise.reject( err ) : Promise.resolve();
                });
            })
    }
}
/*
* 导出接口
* */
module.exports = {
    /*
    * 获取所有脚本
    * */
    allScripts: async function( type = null ){
        return (new enumScripts()).enum( type );
    }
};