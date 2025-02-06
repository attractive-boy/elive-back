// db.js
import knex from "knex";

const db = knex({
    client: 'mysql2',  // 默认为 mysql2
    connection: {
        host: '8.155.19.17',  // 从环境变量获取 IP 地址
        user: 'root',  // 从环境变量获取用户名
        password: '7ANp3xm33bxVQ',  // 从环境变量获取密码
        database: 'elive',  // 从环境变量获取数据库名
        port: 12001,  // 从环境变量获取端口
    },
    pool: { min: 0, max: 7 },  // 连接池配置
});

export default db;