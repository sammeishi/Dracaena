module.exports = {
    name: null,//任务名称
    save: false, //数据是否存储
    db: null, //数据库存储名称
    allocQueues:[ //需要分配的队列列表
        { type:"every", node: ["#1-3"], leaves: [
                { leaf: "leaf.test.1",save:"user_@nodeNo_@scriptIndex" },
                { leaf: "leaf.test.2" },
            ] },
        { type:"equal", node: ["#1-3"], scripts: [
                { leaf: "leaf.test.1",save:"user_@nodeNo"},
                { leaf: "leaf.test.2",save:"user_@nodeNo"},
            ] },
    ],
};