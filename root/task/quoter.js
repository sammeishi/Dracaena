/*
* 节点引用器
* 通过传入QC来引用指定的节点
* QCode = quote code 节点引用码，是一个字符串
* 最终返回引用节点列表的编号 [1,2,3,4]
* */
const _ = require('lodash');
const TYPE_REGEX = {
    "NO_BY_FIX":  /^#(\d+)(,\d+)*$/gi, //编号引用，通过固定编号
    "NO_BY_RANGE":  /^#\d+-\d+$/gi, //编号引用，通过范围
    "NO_BY_STEP":  /^#\((\w+)\)\^(\d)+$/gi, //编号引用，步进
    "NO_BY_RATIO":  /^#%(\d+),(\d+)$/gi, //编号引用,按比例分割
    "NAME":  /^@([0-9a-z]+)$/gi, //按名称直接引用
    "ALL":  /all/gi, //全部引用
};
const logger = require('log4js').getLogger("task-quoter");//日志组件
logger.level = 'debug';
let STEP_VAR_LIST = {}; //全局步进变量列表，记录变量对应的当前位置
/*
* MAIN CLASS
* */
module.exports = class{
    constructor( nodeList ){
        this.NODE_NO_LIST = []; //排序后的node编号列表
        this.NODE_NAME_MAP = {}; //节点名称映射表,名称映射编号
        _.forEach( nodeList,( nodeItem )=>{
            this.NODE_NO_LIST.push( nodeItem.no );
            ( _.has( nodeItem,"name" ) ) ? ( this.NODE_NAME_MAP[ nodeItem.name ] = nodeItem.no ) : null;
        } );
        //编号排序，从小到大
        this.NODE_NO_LIST = _.orderBy( this.NODE_NO_LIST,null,"asc" );
    }
    /*
    * 执行引用
    * 返回获取引用的节点编号
    * @param    array   QCodeList   引用码列表
    * @return   array
    * */
    execute( QCodeList ){
        let quoterNoList = [];
        _.forEach( _.isArray( QCodeList ) ? QCodeList : [QCodeList],( QCode )=>{
            let type = this.parseHandleType( QCode );
            if( !type ){
                throw new Error('can not parse quote code: ' + QCode);
            }
            else{
                quoterNoList = quoterNoList.concat( this["handle_" + type]( QCode ) );
            }
        } );
        return quoterNoList;
    }
    /*
    * 获取每个引用查询字符串的处理类型
    * */
    parseHandleType( QCode ){
        for(let type in TYPE_REGEX){
            TYPE_REGEX[type].lastIndex = 0;
            if( TYPE_REGEX[type].test( QCode ) ){
                return type;
            }
        }
        return null;
    }
    /*
    * 固定引用编号
    * 返回多个节点
    * 编号引用，指定编号
    * @return array
    * */
    handle_NO_BY_FIX( QCode ){
        let noList = [];
        _.forEach(QCode.replace('#',"").split(","),( no )=>{
            no = parseInt(no);
            if( this.NODE_NO_LIST.indexOf( no ) === -1 ){
                throw new Error(`handle_NO_BY_FIX fail. ${no} not exist!`);
            }
            else{
                noList.push( no );
            }
        });
        return noList;
    }
    /*
    * 按步进引用编号 返回1个节点
    * 格式： #(test)^1
    * 编号引用，步进方式
    * @throw error
    * */
    handle_NO_BY_STEP( QCode ) {
        TYPE_REGEX.NO_BY_STEP.lastIndex = 0;
        let res = TYPE_REGEX.NO_BY_STEP.exec( QCode );
        let name = "step_"+res[1];
        let offset = parseInt(res[2]);
        //如果步进变量不存在，初始化0
        if( !_.has(STEP_VAR_LIST, name) ){
            STEP_VAR_LIST[name] = 0;
        }
        //得到目标位置
        let pos = STEP_VAR_LIST[name] + offset;
        //是否越界，如果是则异常
        if( pos >= this.NODE_NO_LIST.length ){
            throw new Error(`handle_NO_BY_STEP fail. ${pos} pos over NODE_NO_LIST length`);
        }
        else{
            STEP_VAR_LIST[name] += offset;
            return [ this.NODE_NO_LIST[ pos ] ];
        }
    }
    /*
    * 按比例分割引用编号
    * 返回多个节点
    * 格式： #%5,1
    * 5=比例 1=返回分割后的哪个块，不能大于5
    * @return array
    * */
    handle_NO_BY_RATIO( QCode ) {
        TYPE_REGEX.NO_BY_RATIO.lastIndex = 0;
        let res = TYPE_REGEX.NO_BY_RATIO.exec( QCode );
        let ratio = parseInt(res[1]);
        let index = parseInt(res[2]);
        let cutLen = Math.ceil(this.NODE_NO_LIST.length / ratio);
        //index超出分割后的数组长度
        if( index >= cutLen ){
            throw new Error(`handle_NO_BY_RATIO fail, index: ${index} over cut length:${cutLen} !`);
        }
        //拾取no元素
        else{
            let start = index * ratio;
            let noList = [];
            for(let n = 0; n < ratio && start < this.NODE_NO_LIST.length; n++,start++){
                noList.push( this.NODE_NO_LIST[start] );
            }
            return noList;
        }
    }
    /*
    * 按范围引用编号
    * 是编号范围，不是编号所在数组的范围
    * 如果范围内的某个编号不存在，不会报错
    * @return array
    * */
    handle_NO_BY_RANGE( QCode ){
        let range = QCode.replace('#',"").split("-");
        let min = parseInt( range[0] );
        let max = parseInt( range[1] );
        let res = [];
        _.forEach(this.NODE_NO_LIST,( no )=>{
            if( no >= min && no <= max ){
                res.push( no )
            }
        });
        return res;
    }
    /*
    * 按名称引用,属于直接查找了
    * */
    handle_NAME( QCode ){
        TYPE_REGEX.NAME.lastIndex = 0;
        let name = (TYPE_REGEX.NAME.exec( QCode ))[1];
        if((typeof this.NODE_NAME_MAP[ name ]) === "undefined"){
            throw new Error(`handle_NAME fail. can not find ${ name } `);
        }
        else{
            return this.NODE_NAME_MAP[ name ];
        }
    }
    /*
    * 返回所有
    * */
    handle_ALL( QCode ){
        return this.NODE_NO_LIST;
    }
};