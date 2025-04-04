import Database from "../models/Database.model.js";
import { convertToSQL } from "../services/FastAPIClient.js";
import { executeQuery } from "../services/DatabaseService.js";

/**
 * Handles voice-based SQL queries.
 */
export const processQuery = async (req, res) => {
    try {
        const { userId } = req.user; // Extract user ID from authentication
        const { databaseId, naturalQuery } = req.body; // User's selected DB & query

        // 🔹 Step 1: Check if the user is connected to the database
        const dbEntry = await Database.findOne({ where: { id: databaseId, userId } });

        if (!dbEntry) {
            return res.status(403).json({ error: "You are not connected to this database." });
        }

        // 🔹 Step 2: Convert natural language query to SQL
        const sqlQuery = await convertToSQL(naturalQuery, dbEntry.databaseName);

        if (!sqlQuery) {
            return res.status(400).json({ error: "Failed to generate SQL query." });
        }

        console.log(`🔹 Generated SQL: ${sqlQuery}`);

        // 🔹 Step 3: Restrict queries based on user role
        if (dbEntry.role === "read-only" && sqlQuery.toLowerCase().startsWith("insert")) {
            return res.status(403).json({ error: "You do not have permission to modify data." });
        }

        // 🔹 Step 4: Execute the SQL query
        const result = await executeQuery(dbEntry, sqlQuery);

        return res.status(200).json({ success: true, data: result });

    } catch (error) {
        console.error("❌ Query processing error:", error);
        return res.status(500).json({ error: "Internal server error." });
    }
};