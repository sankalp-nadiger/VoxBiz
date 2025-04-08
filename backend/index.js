import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/Auth.route.js";
import databaseRoutes from "./routes/Database.route.js";
import queryRoutes from "./routes/Query.route.js";
import visualizationRoutes from "./routes/Visualization.route.js";
import sequelize from "./config/Database.config.js";
import cookieParser from "cookie-parser";
import QueryLog from "./models/QueryLog.model.js"; // <-- important to import!
import ChatBotRoutes from "./routes/ChatBot.route.js";

// sequelize.sync({ alter: true })
//   .then(() => console.log("DB synced with altered schema"))
//   .catch((err) => console.error("DB sync error:", err));

// Load environment variables
sequelize.sync();
dotenv.config();

const app = express();

app.use(cors({
  origin: "http://localhost:5175", // ✅ Your frontend origin
  credentials: true                // ✅ Required to send/receive cookies
}));
app.use(express.json()); // Parse JSON bodies
app.use(cookieParser()); // If using cookies (like JWTs)

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/database", databaseRoutes);
app.use("/api/query", queryRoutes);
app.use("/api/visualization", visualizationRoutes);
app.use('/api', ChatBotRoutes);



// Start the server
const PORT = process.env.PORT  ;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});