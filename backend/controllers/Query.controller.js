import Database from "../models/Database.model.js";
import { executeQuery } from "../services/DatabaseService.js";
import axios from "axios";
import sequelize from "../config/Database.config.js"; // Using Sequelize instance

let dbSchemaCache = null;

// ✅ Function to get database schema using Sequelize
async function getDatabaseSchema() {
  if (dbSchemaCache) {
    console.log("📦 Using cached DB schema");
    return dbSchemaCache;
  }

  try {
    console.log("📡 Fetching fresh DB schema...");
    const [tablesResult] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);

    console.log("📋 Tables fetched:", tablesResult);

    const tables = tablesResult.map(row => row.table_name);
    const schema = {};

    for (const table of tables) {
      const [columnsResult] = await sequelize.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = :table
      `, {
        replacements: { table }
      });

      schema[table] = columnsResult.map(row => ({
        name: row.column_name,
        type: row.data_type
      }));
    }

    dbSchemaCache = schema;
    console.log("✅ Final Schema:", schema);
    return schema;
  } catch (error) {
    console.error("❌ Error fetching database schema:", error);
    throw error;
  }
}

const FASTAPI_BASE_URL = "http://127.0.0.1:8000";

// ✅ Controller to process voice → SQL → DB
export const processQuery = async (req, res) => {
  try {
    console.log("🔍 Processing NLP to SQL query...");
    const userId = req.user.id;
    const { databaseId } = req.params;
    const { transcript } = req.body;
    console.log(transcript)

    if (!transcript) {
      return res.status(400).json({ error: "Transcript is required." });
    }

    // Step 1: Check DB access
    const dbEntry = await Database.findOne({
      where: { id: databaseId, userId },
    });

    if (!dbEntry) {
      return res.status(403).json({ error: "You are not connected to this database." });
    }

    // Step 2: Get schema
    const schema = await getDatabaseSchema();
    console.log("🔹 Database schema:", schema);

    if (!schema || typeof schema !== "object") {
      return res.status(400).json({ error: "Database schema not available or invalid." });
    }

    // Step 3: Send transcript + schema to FastAPI
    const fastApiResponse = await axios.post(`${FASTAPI_BASE_URL}/process-query`, {
      query: transcript,
      schema: schema
    });

    const { query: sqlQuery, success, error } = fastApiResponse.data;

    if (!success || !sqlQuery) {
      return res.status(400).json({ error: error || "SQL generation failed." });
    }

    console.log("🔹 SQL from FastAPI:", sqlQuery);

    // Step 4: Execute query using DatabaseService
    const result = await executeQuery(dbEntry, sqlQuery);

    // Step 5: Return the result
    return res.status(200).json({
      success: true,
      sql: sqlQuery,
      data: result
    });

  } catch (error) {
    console.error("❌ NLP to SQL processing error:", error.response?.data || error.message);
    return res.status(500).json({ error: "Failed to process the natural language query." });
  }
};