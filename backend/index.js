import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/Auth.route.js";
import databaseRoutes from "./routes/Database.route.js";
import queryRoutes from "./routes/Query.route.js";
import visualizationRoutes from "./routes/Visualization.route.js";
import sequelize from "./config/Database.config.js";

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors()); // Handle CORS policy
app.use(express.json()); // Parse JSON bodies

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/database", databaseRoutes);
app.use("/api/query", queryRoutes);
app.use("/api/visualization", visualizationRoutes);

// Database connection
sequelize.sync({ alter: true }) // Ensure DB is in sync
    .then(() => console.log("✅ Database connected successfully"))
    .catch((err) => console.error("❌ Database connection error:", err));

// Start the server
const PORT = process.env.PORT  ;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});