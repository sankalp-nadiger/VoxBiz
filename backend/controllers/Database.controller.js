import Database from "../models/Database.model.js";
import User from "../models/User.model.js";
import { Sequelize } from "sequelize";

// Create a new database entry
export const createDatabase = async (req, res) => {
    try {
        const { databaseName, host, port, username, password, connectionURI } = req.body;
        const userId = req.user.id; // Extracted from Auth middleware
        
        // Assign 'owner' role when creating a new database
        const database = await Database.create({
            userId,
            databaseName,
            host,
            port,
            username,
            password,
            connectionURI,
            role: "owner"
        });

        res.status(201).json({ message: "Database created successfully", database });
    } catch (error) {
        res.status(500).json({ error: "Failed to create database" });
    }
};

// Connect to an existing database (read-only role)
export const connectDatabase = async (req, res) => {
    try {
        const { databaseName, connectionURI } = req.body;
        const userId = req.user.id;

        // Check if the user already has access to this database
        const existingDatabase = await Database.findOne({
            where: { userId, databaseName }
        });

        if (existingDatabase) {
            return res.status(400).json({ error: "You have already connected this database" });
        }

        // Assign 'read-only' role for connected databases
        const database = await Database.create({
            userId,
            databaseName,
            connectionURI,
            role: "read-only"
        });

        res.status(201).json({ message: "Database connected successfully", database });
    } catch (error) {
        res.status(500).json({ error: "Failed to connect database" });
    }
};

// Get all databases for a user
export const listDatabases = async (req, res) => {
    try {
        const userId = req.user.id;
        const databases = await Database.findAll({ where: { userId } });
        res.status(200).json({ databases });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch databases" });
    }
};

// Disconnect a database (only if it's not owned by the user)
export const disconnectDatabase = async (req, res) => {
    try {
        const { databaseId } = req.params;
        const userId = req.user.id;

        const database = await Database.findOne({ where: { id: databaseId, userId } });
        
        if (!database) {
            return res.status(404).json({ error: "Database not found" });
        }

        if (database.role === "owner") {
            return res.status(403).json({ error: "Owners cannot disconnect their own database" });
        }

        await database.destroy();
        res.status(200).json({ message: "Database disconnected successfully" });
    } catch (error) {
        res.status(500).json({ error: "Failed to disconnect database" });
    }
};
