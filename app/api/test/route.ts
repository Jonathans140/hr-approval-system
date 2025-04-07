import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

let pool: mysql.Pool;

export async function GET() {
  try {
    if (!pool) {
      pool = mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        port: parseInt(process.env.DB_PORT || '3306'),
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        waitForConnections: true,
        connectionLimit: 5,
        queueLimit: 0,
      });
    }

    const [rows] = await pool.query('SELECT 1 + 1 AS result');
    return NextResponse.json({ success: true, result: (rows as any)[0].result });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
