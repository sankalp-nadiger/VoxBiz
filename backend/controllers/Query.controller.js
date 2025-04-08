import Database from "../models/Database.model.js";
import { executeQuery } from "../services/DatabaseService.js";

/**
 * Handles voice-based SQL queries (currently using a hardcoded SQL query).
 */
export const processQuery = async (req, res) => {
  try {
    const  userId  = req.user.id;
    console.log("🔹 User ID:", userId);
    const { databaseId } = req.params;

    // Step 1: Check if the user is connected to the database
    const dbEntry = await Database.findOne({
      where: { id: databaseId, userId },
    });

    if (!dbEntry) {
      return res
        .status(403)
        .json({ error: "You are not connected to this database." });
    }

    // Step 2: Hardcoded SQL query for visualization (orders per category)
    const sqlQuery = `
  SELECT 
    p.category AS category, 
    COUNT(o.order_id) AS total_orders
  FROM 
    orders o
  JOIN 
    order_items oi ON o.order_id = oi.order_id
  JOIN 
    products p ON oi.product_id = p.product_id
  GROUP BY 
    p.category
  ORDER BY 
    total_orders DESC;
`;

    console.log("🔹 Running hardcoded SQL:", sqlQuery);

    // Step 3: Execute the SQL query
    const result = await executeQuery(dbEntry, sqlQuery);
    console.log("🔹 SQL query result:", result);

    // Step 4: Send response to frontend
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error("❌ Hardcoded query error:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
};