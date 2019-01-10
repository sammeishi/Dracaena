/*
* 节点实例
* @节点状态
* 1：空闲 IDLE
* 2: 任务初始化 TASK_INIT
*   2.1：同步任务脚本 SYNC_TASK_SCRIPT
*   2.2：创建leaf CREATE_LEAF
* 3：初始化完成 TASK_READY
* 4：工作中 WORKING
* */
class ninstance{
    constructor(){
        this.socket = null;
        this.no = null;
        this.name = null;
        this.status = "IDLE";
    }
}