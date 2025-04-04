import { executeQuery } from "../services/DatabaseService.js";
import { determineChartType } from "../services/VisualizationEngine.js";

/**
 * Handles visualization requests by executing SQL and suggesting a chart type.
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
export const visualizeData = async (req, res) => {
    try {
        const { sqlQuery } = req.body;

        if (!sqlQuery) {
            return res.status(400).json({ error: "SQL query is required" });
        }

        // Step 1: Execute SQL Query to fetch data
        const queryResult = await executeSQLQuery(sqlQuery);
        
        if (!queryResult || queryResult.length === 0) {
            return res.status(404).json({ error: "No data found for the given query" });
        }

        // Step 2: Determine the best visualization type
        const visualizationType = determineChartType(queryResult);

        // Step 3: Return response with data and suggested chart type
        res.json({
            success: true,
            chartType: visualizationType,
            data: queryResult
        });

    } catch (error) {
        console.error("Visualization Error:", error);
        res.status(500).json({ error: "Failed to generate visualization" });
    }
};