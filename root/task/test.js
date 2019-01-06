/*
* 任务脚本测试
* */
require('./../../common/constant');
const task = require('./task');

let nodeList = [
    { no:0,name:"test0" },
    { no:1,name:"test1" },
    { no:2,name:"test2" },
    { no:3,name:"test3" },
    { no:4,name:"test4" },
];

let t = task.fromFile( nodeList,`${SCRIPT_TASK_PATH}${OS_SEP}def${OS_SEP}`);

t.init().catch(( e )=>{
    console.error( e );
});