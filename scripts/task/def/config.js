module.exports = {
    name: "测试任务",//任务名称
    save: false, //数据是否存储
    db: null, //数据库存储名称,null当前时间戳
    allocQueue:[ //需要分配的队列列表
        { mode:"every", node: ["#1,100","#%2,2","#%2,1"], leaves: [
                { script: "leaf.test.noky1",save:"user_@nodeNo_@scriptIndex" },
                { script: "leaf.test.noky2.client" },
            ] },
        // { type:"equal", node: ["#1-3"], scripts: [
        //         { leaf: "leaf.test.1",save:"user_@nodeNo"},
        //         { leaf: "leaf.test.2",save:"user_@nodeNo"},
        //     ] },
    ],
};