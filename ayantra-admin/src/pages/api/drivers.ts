import { NextApiRequest, NextApiResponse } from "next";
import { Pool } from "@neondatabase/serverless";

const pool = new Pool({ connectionString: process.env.NEON_DATABASE_URL });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const result = await pool.query("SELECT * FROM drivers");
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Database query error:", error);
    res.status(500).json({ error: "Database connection failed" });
  }
}
