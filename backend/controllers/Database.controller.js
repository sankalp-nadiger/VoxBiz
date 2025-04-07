import Database from "../models/Database.model.js";
import User from "../models/User.model.js";
import { Sequelize } from "sequelize";
import db from '../config/Database.config.js'; // your pg client instance
import { differenceInDays } from 'date-fns';

// Create a new database entry
export const createDatabase = async (req, res) => {
    try {
        const { databaseName, host, port, username, password, connectionURI } = req.body;
        const userId = req.user.id; // Extracted from Auth middleware
        
        let finalURI = connectionURI;
        let finalDBName = databaseName;

        if (!finalURI && host && port && username && password && databaseName) {
            finalURI = `postgres://${username}:${password}@${host}:${port}/${databaseName}`;
        }

        if (!finalDBName && finalURI) {
            finalDBName = new URL(finalURI).pathname.slice(1);
        }

        // Assign 'owner' role when creating a new database
        const database = await Database.create({
            userId,
            databaseName: finalDBName,
            host,
            port,
            username,
            password,
            connectionURI: finalURI,
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
      console.log("route hit ->>", req.user);
      console.log("Body received ->", req.body);
      
      if (!req.user || !req.user.id) {
        return res.status(401).json({ error: "Unauthorized: Missing user information" });
      }
  
      const { databaseName, connectionURI } = req.body;
      const userId = req.user.id;
  
      if (!connectionURI) {
        return res.status(400).json({ error: "Missing connection URI" });
      }
  
      let finalName = databaseName;
      try {
        if (!finalName) {
          finalName = new URL(connectionURI).pathname.slice(1);
        }
      } catch (err) {
        return res.status(400).json({ error: "Invalid connection URI format" });
      }
  
      const existingDatabase = await Database.findOne({
        where: { userId, databaseName: finalName }
      });
  
      if (existingDatabase) {
        return res.status(400).json({ error: "You have already connected this database" });
      }
  
      const database = await Database.create({
        userId,
        databaseName: finalName,
        connectionURI,
        role: "read-only"
      });
  
      res.status(201).json({
        success: true,
        message: "Database connected successfully",
        database
      });
    } catch (error) {
      console.error("Failed to connect database:", error);
      res.status(500).json({ error: "Failed to connect database" });
    }
  };
// Get all databases for a user
export const listDatabases = async (req, res) => {
    try {
        const userId = req.user.id;
        console.log("Fetching databases for user:", userId);
        const databases = await Database.findAll({
            where: { userId: req.user.id }
          });
          
          const plainDatabases = databases.map(db => {
              const { id, databaseName, role, updatedAt } = db.get({ plain: true });
              return {
                  id,
                  name: databaseName,
                  accessLevel: role,
                  lastAccessed: updatedAt
              };
          });
         
        console.log("Databases found:", databases);
        res.status(200).json(plainDatabases);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch databases" });
    }
};



export const getDatabaseInfo = async (req, res) => {
  try {
    const { id } = req.params;

    // Basic validation (assuming UUID)
    if (!id || id.length < 8) {
      return res.status(400).json({ success: false, message: 'Invalid database ID' });
    }

    // Dates
    const now = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(now.getDate() - 7);

    // Fetch logs for this DB
    const { rows: logs } = await db.query(
      `SELECT success, response_time, timestamp 
       FROM query_logs 
       WHERE database_id = $1`,
      [id]
    );

    const totalQueries = logs.length;
    const successfulQueries = logs.filter(log => log.success).length;
    const avgResponseTime = totalQueries
      ? (logs.reduce((sum, log) => sum + parseFloat(log.response_time), 0) / totalQueries).toFixed(2)
      : 0;
    const successRate = totalQueries ? ((successfulQueries / totalQueries) * 100).toFixed(1) : 0;

    // Last 7 days logs only
    const last7DaysLogs = logs.filter(
      log => new Date(log.timestamp) >= sevenDaysAgo
    );

    const dailyCounts = Array(7).fill(0);
    last7DaysLogs.forEach(log => {
      const dayDiff = differenceInDays(now, new Date(log.timestamp));
      if (dayDiff < 7) {
        dailyCounts[6 - dayDiff] += 1;
      }
    });

    return res.status(200).json({
      success: true,
      data: {
        totalQueries,
        successRate,
        avgResponseTime: `${avgResponseTime}s`,
        queryFrequency: dailyCounts,
      },
    });
  } catch (error) {
    console.error('Error in getDatabaseInfo:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
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

