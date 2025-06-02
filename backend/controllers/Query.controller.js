import Database from "../models/Database.model.js";
import { executeQuery } from "../services/DatabaseService.js";
import axios from "axios";
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Sequelize } from "sequelize";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// Cache schemas for multiple databases (keyed by databaseId)
const dbSchemaCache = {};
// Helper function to call Gemini API
export async function callGeminiAPI(prompt) {
  try {
    // gemini-1.5-flash
    const modelName = "gemini-2.0-flash";
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

    const { connectionURI, databaseName, dbType } = dbEntry;

    console.log("📡 Connecting to external DB:", databaseName);

    // Determine if SSL is required
    const isSSL = connectionURI.includes("avn") || connectionURI.includes("sslmode=require");
    console.log("🔍 DB:", databaseName, " | SSL Required:", isSSL, "| Type:", dbType);

    const tempSequelize = new Sequelize(connectionURI, {
      dialect: dbType.toLowerCase(), // 🟢 use dbType from the database
      logging: false,
      dialectOptions: isSSL
        ? {
            ssl: {
              require: true,
              rejectUnauthorized: false,
            },
          }
        : {},
    });

    let tablesResult, tablesQuery;

    if (dbType === "PostgreSQL") {
      // PostgreSQL-specific query
      tablesQuery = `
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
      `;
    } else if (dbType === "MySQL") {
      // MySQL-specific query
      tablesQuery = `
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = DATABASE()
      `;
    } else {
      throw new Error("Unsupported database type: " + dbType);
    }

    [tablesResult] = await tempSequelize.query(tablesQuery);
    const tables = tablesResult.map((row) => row.table_name);
    const schema = {};

    for (const table of tables) {
      let columnsQuery;
      if (dbType === "PostgreSQL") {
        columnsQuery = `
          SELECT column_name, data_type 
          FROM information_schema.columns 
          WHERE table_schema = 'public' AND table_name = :table
        `;
      } else if (dbType === "MySQL") {
        columnsQuery = `
          SELECT column_name, data_type 
          FROM information_schema.columns 
          WHERE table_schema = DATABASE() AND table_name = :table
        `;
      }

      const [columnsResult] = await tempSequelize.query(columnsQuery, {
        replacements: { table },
      });

      schema[table] = columnsResult.map((row) => ({
        name: row.column_name,
        type: row.data_type,
      }));
    }

    console.log("📦 Fetched schema for", databaseName, ":", schema);
    dbSchemaCache[databaseId] = schema;

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

   

    // Step 5: Generate SQL query using Gemini
    const queryGenerationPrompt = `
      Given the following database schema and the user's natural language query, generate an accurate Postgres SQL query.
      
      Schema: ${JSON.stringify(schema)}
      Query: "${transcript}"
      
      Only return the SQL query as plain text, without explanations or formatting.
    `;

    const geminiQueryResponse = await callGeminiAPI(queryGenerationPrompt);

    let sqlQuery = geminiQueryResponse.trim();

    console.log("🔹 SQL generated by LLM:", sqlQuery);
    // ✅ Remove Markdown code fences if they exist
    if (sqlQuery.startsWith("```sql") || sqlQuery.startsWith("```")) {
      sqlQuery = sqlQuery.replace(/```sql|```/g, '').trim();
    }

    console.log("🔹 Cleaned SQL generated by LLM:", sqlQuery);


    // crude fix example

    console.log("🔹 SQL generated by LLM:", sqlQuery);
    // ✅ Step 5: Get database description
    const descriptionPrompt = `
 Generate a natural language description of this PostgreSQL database schema:
 
 Database Name: ${dbEntry.databaseName}
 
 Schema:
 ${JSON.stringify(schema, null, 2)}
 
 
 Describe the database in plain English:
 1. Overview of what kind of data is stored.
 2. Summarize key tables and what they contain.
 3. Explain how the tables relate.
 Keep it under 300 words. Return only plain text.
     `;
    const naturalDescription = await callGeminiAPI(descriptionPrompt);

    // ✅ Step 6: Get reasoning behind the SQL
    const reasoningPrompt = `
 Given this SQL query:
 ${sqlQuery}
 
 Explain the logic and thought process used to generate this query from the user's question: "${transcript}"
 
 Include:
 - Which tables and columns were chosen and why
 - Any filters or joins applied
 - How the structure of the question led to the SQL logic
 
 Keep the explanation clear, concise, and under 150 words.
     `;
    const reasoning = await callGeminiAPI(reasoningPrompt);

    // Step 7: Execute SQL
    const result = await executeQuery(dbEntry, sqlQuery);

    return res.status(200).json({
      success: true,
      sql: sqlQuery,
      data: result,
      naturalDescription: naturalDescription.trim(),
      reasoning: reasoning.trim()
    });


    

  } catch (error) {
    console.error("❌ NLP to SQL processing error:", error.response?.data || error.message);
    return res.status(500).json({ error: "Failed to process the natural language query." });
  }
};
export { getDatabaseSchema }


// old processQuery that included  fastAPI and Gemini calls
// export const processQuery = async (req, res) => {
//   try {
//     console.log("🔍 Processing NLP to SQL query...");
//     const userId = req.user.id;
//     const { databaseId } = req.params;
//     const { transcript } = req.body;
//     console.log(transcript);

//     if (!transcript) {
//       return res.status(400).json({ error: "Transcript is required." });
//     }

//     // Step 1: Check DB access
//     const dbEntry = await Database.findOne({
//       where: { id: databaseId, userId },
//     });

//     if (!dbEntry) {
//       return res.status(403).json({ error: "You are not connected to this database." });
//     }

//     // Step 2: Get schema
//     const schema = await getDatabaseSchema(databaseId);
//     console.log("🔹 Database schema:", schema);

//     if (!schema || typeof schema !== "object") {
//       return res.status(400).json({ error: "Database schema not available or invalid." });
//     }

//     // Step 3: Extract table relationships
//     const tables = Object.keys(schema);
//     const relationships = {};

//     // Improved relationship detection
//     for (const sourceTable of tables) {
//       // Get columns for this table
//       const columns = schema[sourceTable];

//       // Check each column for potential foreign key patterns
//       for (const column of columns) {
//         if (column.name.endsWith('_id')) { // Access the 'name' property
//           // Extract the referenced entity name from the column
//           const potentialEntity = column.name.replace('_id', '');

//           // Check if this matches or is related to any table name
//           for (const targetTable of tables) {
//             const singularTarget = targetTable.endsWith('s') ? targetTable.slice(0, -1) : targetTable;

//             if (potentialEntity === targetTable || potentialEntity === singularTarget) {
//               const relationKey = JSON.stringify([targetTable, sourceTable]);
//               if (!relationships[relationKey]) {
//                 relationships[relationKey] = {
//                   [`${targetTable}.id`]: `${sourceTable}.${column.name}` // Use 'name' here as well
//                 };
//                 console.log(`Found relationship: ${targetTable}.id -> ${sourceTable}.${column.name}`);
//               }
//             }
//           }
//         }
//       }
//     }

//     console.log("🔹 Identified relationships:", relationships);

//     // Step 4: Use Gemini to generate table and column aliases based on schema
//     const tableAliasesPrompt = `
//       Given this database schema: ${JSON.stringify(schema)}
//       Generate a mapping of natural language terms to table names. 
//       For example, if there's a 'customers' table, include aliases like 'customer', 'client', 'user', etc.
//       Return only JSON in this format: {"natural_term": "table_name", ...}
//     `;

//     const columnAliasesPrompt = `
//       Given this database schema: ${JSON.stringify(schema)}
//       Generate a mapping of column names to their natural language aliases.
//       For example, if there's a column 'customer_id', include aliases like 'customer id', 'client id', etc.
//       Return only JSON in this format: {"column_name": ["alias1", "alias2", ...], ...}
//     `;

//     const businessMetricsPrompt = `
//       Given this database schema: ${JSON.stringify(schema)} and these relationships: ${JSON.stringify(relationships)}
//       Generate common business metrics and their SQL representations.
//       For example: "revenue": "SUM(orders.total_amount)"
//       Consider metrics like revenue, counts, averages, etc. that make sense for this schema.
//       Return only JSON in this format: {"metric_name": "SQL_expression", ...}
//     `;

//     // Call Gemini API for each prompt
//     const [tableAliasesResponse, columnAliasesResponse, businessMetricsResponse] = await Promise.all([
//       callGeminiAPI(tableAliasesPrompt),
//       callGeminiAPI(columnAliasesPrompt),
//       callGeminiAPI(businessMetricsPrompt)
//     ]);

//     const tableAliases = parseGeminiResponse(tableAliasesResponse);
//     const columnAliases = parseGeminiResponse(columnAliasesResponse);
//     const businessMetrics = parseGeminiResponse(businessMetricsResponse);

//     console.log("🔹 Generated table aliases:", tableAliases);
//     console.log("🔹 Generated column aliases:", columnAliases);
//     console.log("🔹 Generated business metrics:", businessMetrics);
//     const fastApiResponse = await axios.post(`${FASTAPI_BASE_URL}/process-query`, {
//       query: transcript,
//       schema_: Object.entries(schema).map(([table, columns]) => ({ [table]: columns })),
//       relationships: Object.entries(relationships).map(([key, value]) => ({
//         tables: JSON.parse(key),
//         joinCondition: value
//       })),
//       tableAliases,
//       columnAliases,
//       businessMetrics
//     });

//     const { query: nlpquery, success, error } = fastApiResponse.data;
//     // console.log("🔷 FastAPI response:", fastApiResponse.data);

//     // Step 5: Generate SQL query using Gemini
//     const queryGenerationPrompt = `
//       Given the following database schema and the user's natural language query, generate an accurate Postgres SQL query.
      
//       Schema: ${JSON.stringify(schema)}
//       Query: "${transcript}"
      
//       Only return the SQL query as plain text, without explanations or formatting.
//     `;

//     const geminiQueryResponse = await callGeminiAPI(queryGenerationPrompt);

//     let sqlQuery = geminiQueryResponse.trim();

//     console.log("🔹 SQL generated by LLM:", sqlQuery);
//     // ✅ Remove Markdown code fences if they exist
//     if (sqlQuery.startsWith("```sql") || sqlQuery.startsWith("```")) {
//       sqlQuery = sqlQuery.replace(/```sql|```/g, '').trim();
//     }

//     console.log("🔹 Cleaned SQL generated by LLM:", sqlQuery);

//     // 🔁 Use FastAPI Text2SQL model (T5/BART)
//     const t5ApiResponse = await axios.post(`${FASTAPI_BASE_URL}/generate-sql`, {
//       query: transcript,
//       schema: schema
//     });

//     let SQLQuery = t5ApiResponse.data.sql?.trim();
//     console.log("🔷 T5 API response:", SQLQuery);

//     if (!sqlQuery) {
//       return res.status(500).json({ error: "Text2SQL model failed to generate a SQL query." });
//     }
//     // crude fix example

//     console.log("🔹 SQL generated by LLM:", sqlQuery);
//     // ✅ Step 5: Get database description
//     const descriptionPrompt = `
//  Generate a natural language description of this PostgreSQL database schema:
 
//  Database Name: ${dbEntry.databaseName}
 
//  Schema:
//  ${JSON.stringify(schema, null, 2)}
 
//  Relationships:
//  ${JSON.stringify(relationships, null, 2)}
 
//  Describe the database in plain English:
//  1. Overview of what kind of data is stored.
//  2. Summarize key tables and what they contain.
//  3. Explain how the tables relate.
//  Keep it under 300 words. Return only plain text.
//      `;
//     const naturalDescription = await callGeminiAPI(descriptionPrompt);

//     // ✅ Step 6: Get reasoning behind the SQL
//     const reasoningPrompt = `
//  Given this SQL query:
//  ${sqlQuery}
 
//  Explain the logic and thought process used to generate this query from the user's question: "${transcript}"
 
//  Include:
//  - Which tables and columns were chosen and why
//  - Any filters or joins applied
//  - How the structure of the question led to the SQL logic
 
//  Keep the explanation clear, concise, and under 150 words.
//      `;
//     const reasoning = await callGeminiAPI(reasoningPrompt);

//     // Step 7: Execute SQL
//     const result = await executeQuery(dbEntry, sqlQuery);

//     return res.status(200).json({
//       success: true,
//       sql: sqlQuery,
//       data: result,
//       naturalDescription: naturalDescription.trim(),
//       reasoning: reasoning.trim()
//     });

//   } catch (error) {
//     console.error("❌ NLP to SQL processing error:", error.response?.data || error.message);
//     return res.status(500).json({ error: "Failed to process the natural language query." });
//   }
// };
