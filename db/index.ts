import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

// 创建 PostgreSQL 连接池
const pool = new Pool({
    // connectionString: process.env.DATABASE_URL,
    host: process.env.DATABASE_HOST,
    port: Number(process.env.DATABASE_PORT || 5432),
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    // 连接池配置
    max: 20, // 最大连接数
    idleTimeoutMillis: 30000, // 空闲连接超时时间
    connectionTimeoutMillis: 2000, // 连接超时时间
    ssl:
        process.env.DATABASE_SSL === "true" ? { rejectUnauthorized: false } : false, // 通过环境变量控制SSL
});

// 创建 Drizzle 数据库实例
export const db = drizzle(pool, { schema });

// 导出数据库连接池实例（如果需要直接使用 pg 操作）
export { pool };

// 数据库连接状态检查函数
export async function checkDatabaseConnection(): Promise<boolean> {
    try {
        const client = await pool.connect();
        await client.query("SELECT 1");
        client.release();
        return true;
    } catch (error) {
        console.error("数据库连接失败:", error);
        return false;
    }
}

// 优雅关闭数据库连接的函数
export async function closeDatabaseConnection(): Promise<void> {
    try {
        await pool.end();
        console.log("数据库连接已关闭");
    } catch (error) {
        console.error("关闭数据库连接时发生错误:", error);
    }
}

// 类型导出
export type Database = typeof db;
