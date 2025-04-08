// routes/queryLog.routes.js
import express from 'express';
import { getQueryHistory, clearQueryHistory } from '../controllers/QueryLog.controller.js';
// import { authenticateUser } from '../middleware/AuthUser.js'; // Adjust path as needed

const router = express.Router();

// // Apply authentication middleware to all routes
// router.use(authenticateUser);

// Get query history for a database
router.get('/databases/:databaseId/history', getQueryHistory);

// Clear query history for a database
router.delete('/databases/:databaseId/history', clearQueryHistory);

export default router;