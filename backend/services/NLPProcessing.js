import { convertToSQL } from "../services/FastAPIClient.js";

/**
 * Processes a natural language query and converts it into an SQL query.
 * @param {string} naturalQuery - The user's natural language query.
 * @param {string} databaseName - The name of the database.
 * @returns {Promise<string>} - The generated SQL query.
 */
export const processNaturalQuery = async (naturalQuery, databaseName) => {
    try {
        if (!naturalQuery || !databaseName) {
            throw new Error("Missing query or database name.");
        }

        console.log(`🔍 Processing NLP Query: "${naturalQuery}" for DB: ${databaseName}`);

        // 🔹 Call FastAPI to generate SQL query
        const sqlQuery = await convertToSQL(naturalQuery, databaseName);

        if (!sqlQuery) {
            throw new Error("Failed to generate SQL query.");
        }

        console.log(`✅ Generated SQL Query: ${sqlQuery}`);
        return sqlQuery;
    } catch (error) {
        console.error("❌ NLP Processing Error:", error.message);
        throw new Error("Error processing NLP query.");
    }
};