import Database from "../models/Database.model.js";
import { executeQuery } from "../services/DatabaseService.js";
import axios from "axios";
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Sequelize } from "sequelize";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// Cache schemas for multiple databases (keyed by databaseId)
const dbSchemaCache = {};
// Helper function to call Gemini API
async function callGeminiAPI(prompt) {
  try {
    const modelName = "gemini-1.5-flash";
    const model = genAI.getGenerativeModel({ model: modelName });
    
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
      },
    });
    
    return result.response.text();
  } catch (error) {
    console.error("Gemini API error:", error);
    throw new Error("Failed to generate mappings with Gemini API");
  }
}

// Helper function to parse Gemini response
function parseGeminiResponse(response) {
  try {
    // Find JSON content in the response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error("No valid JSON found in response");
  } catch (error) {
    console.error("Failed to parse Gemini response:", error);
    return {};
  }
}
async function getDatabaseSchema(databaseId) {
  if (dbSchemaCache[databaseId]) {
    console.log("📦 Using cached DB schema for:", databaseId);
    return dbSchemaCache[databaseId];
  }

  try {
    const dbEntry = await Database.findByPk(databaseId);

    if (!dbEntry || !dbEntry.connectionURI) {
      throw new Error("Invalid database ID or missing connection URI.");
    }

    console.log("📡 Connecting to external DB:", dbEntry.databaseName);

    // Temporary Sequelize instance
    const tempSequelize = new Sequelize(dbEntry.connectionURI, {
      dialect: "postgres",
      logging: false,
    });

    const [tablesResult] = await tempSequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);

    const tables = tablesResult.map((row) => row.table_name);
    const schema = {};

    for (const table of tables) {
      const [columnsResult] = await tempSequelize.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = :table
      `, {
        replacements: { table },
      });

      schema[table] = columnsResult.map((row) => ({
        name: row.column_name,
        type: row.data_type,
      }));
    }

    dbSchemaCache[databaseId] = schema;
    console.log("✅ Fetched schema for", dbEntry.databaseName);
    return schema;
  } catch (error) {
    console.error("❌ Error fetching schema for DB ID:", databaseId, error.message);
    throw error;
  }
}

const FASTAPI_BASE_URL = "http://127.0.0.1:8000";

// ✅ Controller to process voice → SQL → DB
// Node.js Controller - processQuery
export const processQuery = async (req, res) => {
  try {
    console.log("🔍 Processing NLP to SQL query...");
    const userId = req.user.id;
    const { databaseId } = req.params;
    const { transcript } = req.body;
    console.log(transcript);

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
    const schema = await getDatabaseSchema(databaseId);
    console.log("🔹 Database schema:", schema);

    if (!schema || typeof schema !== "object") {
      return res.status(400).json({ error: "Database schema not available or invalid." });
    }

    // Step 3: Extract table relationships
    const tables = Object.keys(schema);
const relationships = {};

// Improved relationship detection
for (const sourceTable of tables) {
  // Get columns for this table
  const columns = schema[sourceTable];
  
  // Check each column for potential foreign key patterns
  for (const column of columns) {
    if (column.name.endsWith('_id')) { // Access the 'name' property
      // Extract the referenced entity name from the column
      const potentialEntity = column.name.replace('_id', '');
      
      // Check if this matches or is related to any table name
      for (const targetTable of tables) {
        const singularTarget = targetTable.endsWith('s') ? targetTable.slice(0, -1) : targetTable;
        
        if (potentialEntity === targetTable || potentialEntity === singularTarget) {
          const relationKey = JSON.stringify([targetTable, sourceTable]);
          if (!relationships[relationKey]) {
            relationships[relationKey] = {
              [`${targetTable}.id`]: `${sourceTable}.${column.name}` // Use 'name' here as well
            };
            console.log(`Found relationship: ${targetTable}.id -> ${sourceTable}.${column.name}`);
          }
        }
      }
    }
  }
}

console.log("🔹 Identified relationships:", relationships);

    // Step 4: Use Gemini to generate table and column aliases based on schema
    const tableAliasesPrompt = `
      Given this database schema: ${JSON.stringify(schema)}
      Generate a mapping of natural language terms to table names. 
      For example, if there's a 'customers' table, include aliases like 'customer', 'client', 'user', etc.
      Return only JSON in this format: {"natural_term": "table_name", ...}
    `;
    
    const columnAliasesPrompt = `
      Given this database schema: ${JSON.stringify(schema)}
      Generate a mapping of column names to their natural language aliases.
      For example, if there's a column 'customer_id', include aliases like 'customer id', 'client id', etc.
      Return only JSON in this format: {"column_name": ["alias1", "alias2", ...], ...}
    `;
    
    const businessMetricsPrompt = `
      Given this database schema: ${JSON.stringify(schema)} and these relationships: ${JSON.stringify(relationships)}
      Generate common business metrics and their SQL representations.
      For example: "revenue": "SUM(orders.total_amount)"
      Consider metrics like revenue, counts, averages, etc. that make sense for this schema.
      Return only JSON in this format: {"metric_name": "SQL_expression", ...}
    `;

    // Call Gemini API for each prompt
    const [tableAliasesResponse, columnAliasesResponse, businessMetricsResponse] = await Promise.all([
      callGeminiAPI(tableAliasesPrompt),
      callGeminiAPI(columnAliasesPrompt),
      callGeminiAPI(businessMetricsPrompt)
    ]);

    const tableAliases = parseGeminiResponse(tableAliasesResponse);
    const columnAliases = parseGeminiResponse(columnAliasesResponse);
    const businessMetrics = parseGeminiResponse(businessMetricsResponse);

    console.log("🔹 Generated table aliases:", tableAliases);
    console.log("🔹 Generated column aliases:", columnAliases);
    console.log("🔹 Generated business metrics:", businessMetrics);
    const fastApiResponse = await axios.post(`${FASTAPI_BASE_URL}/process-query`, {
      query: transcript,
      schema: Object.entries(schema).map(([table, columns]) => ({ [table]: columns })),
      relationships: Object.entries(relationships).map(([key, value]) => ({
        tables: JSON.parse(key),
        joinCondition: value
      })),
      tableAliases,
      columnAliases,
      businessMetrics
    });

    const { query: nlpquery, success, error } = fastApiResponse.data;
console.log("🔷 FastAPI response:", fastApiResponse.data);

    // Step 5: Generate SQL query using Gemini
    const queryGenerationPrompt = `
      Given the following database schema and the user's natural language query, generate an accurate Postgres SQL query.
      
      Schema: ${JSON.stringify(schema)}
      Query: "${transcript}"
      
      Only return the SQL query as plain text, without explanations or formatting.
    `;

    const geminiQueryResponse = await callGeminiAPI(queryGenerationPrompt);

     let sqlQuery = geminiQueryResponse.trim();
    // crude fix example

    console.log("🔹 SQL generated by LLM:", sqlQuery);

    const result = await executeQuery(dbEntry, sqlQuery);

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
export { getDatabaseSchema}
