import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/Auth.route.js";
import databaseRoutes from "./routes/Database.route.js";
import queryRoutes from "./routes/Query.route.js";
import visualizationRoutes from "./routes/Visualization.route.js";
import sequelize from "./config/database.js";

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors()); // Handle CORS policy
app.use(express.json()); // Parse JSON bodies

// Routes
app.use("/auth", authRoutes);
app.use("/database", databaseRoutes);
app.use("/query", queryRoutes);
app.use("/visualization", visualizationRoutes);

// Database connection
sequelize.sync({ alter: true }) // Ensure DB is in sync
    .then(() => console.log("✅ Database connected successfully"))
    .catch((err) => console.error("❌ Database connection error:", err));

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});,