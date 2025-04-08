import Database from "../models/Database.model.js";
import { executeQuery } from "../services/DatabaseService.js";

/**
 * Handles voice-based SQL queries by converting natural language to SQL.
 */
export const processQuery = async (req, res) => {
  try {
    const userId = req.user.id;
    const { databaseId } = req.params;
    const { transcript } = req.body;

    if (!transcript) {
      return res.status(400).json({ error: "Transcript is required." });
    }

    // Step 1: Verify user has access to the database
    const dbEntry = await Database.findOne({
      where: { id: databaseId, userId },
    });

    if (!dbEntry) {
      return res.status(403).json({ error: "You are not connected to this database." });
    }

    // Step 2: Get schema (ensure it's stored and structured correctly)
    const schema = dbEntry.schema;

    if (!schema || !Array.isArray(schema)) {
      return res.status(400).json({ error: "Database schema not available or invalid." });
    }

    // Step 3: Call FastAPI to get SQL
    const fastApiResponse = await axios.post(`${FASTAPI_BASE_URL}/process-query`, {
      query: transcript,
      schema: schema
    });

    const { query: sqlQuery, success, error } = fastApiResponse.data;

    if (!success || !sqlQuery) {
      return res.status(400).json({ error: error || "SQL generation failed." });
    }

    console.log("🔹 SQL from FastAPI:", sqlQuery);

    // Step 4: Execute the SQL query
    const result = await executeQuery(dbEntry, sqlQuery);

    // Step 5: Return results to frontend
    return res.status(200).json({
      success: true,
      sql: sqlQuery,
      data: result
    });

  } catch (error) {
    console.error("❌ NLP to SQL processing error:", error);
    return res.status(500).json({ error: "Failed to process the natural language query." });
  }
};
