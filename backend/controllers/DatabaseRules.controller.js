// controllers/DatabaseRules.controller.js
import DatabaseRule from "../models/DatabaseRule.model.js";
import { RuleService } from "../services/RuleService.js";
import { EnhancedQueryExecutionService } from "../services/EnhancedQueryExecutionService.js";
import Database from "../models/Database.model.js";

export class DatabaseRulesController {
  /**
   * Get all rules for a database
   */
  static async getRulesByDatabase(req, res) {
    try {
      const { dbId } = req.params;
      
      // Check database access
      const database = await Database.findOne({
        where: {
          id: dbId,
          userId: req.user.id
        }
      });
      
      if (!database) {
        return res.status(404).json({ message: "Database not found or access denied" });
      }
      
      const rules = await DatabaseRule.findAll({
        where: { databaseId: dbId }
      });
      
      return res.status(200).json(rules);
    } catch (error) {
      console.error("Error getting rules:", error);
      return res.status(500).json({ message: "Server error", error: error.message });
    }
  }
  
  /**
   * Get a single rule by ID
   */
  static async getRule(req, res) {
    try {
      const { id } = req.params;
      
      const rule = await DatabaseRule.findByPk(id);
      if (!rule) {
        return res.status(404).json({ message: "Rule not found" });
      }
      
      // Check database access
      const database = await Database.findOne({
        where: {
          id: rule.databaseId,
          userId: req.user.id
        }
      });
      
      if (!database) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      return res.status(200).json(rule);
    } catch (error) {
      console.error("Error getting rule:", error);
      return res.status(500).json({ message: "Server error", error: error.message });
    }
  }
  
  /**
   * Create a new rule
   */
  static async createRule(req, res) {
    try {
      const { databaseId, name, description, queryTypes, conditions, maskingPolicies } = req.body;
      
      // Check database access
      const database = await Database.findOne({
        where: {
          id: databaseId,
          userId: req.user.id
        }
      });
      
      if (!database) {
        return res.status(404).json({ message: "Database not found or access denied" });
      }
      
      // Check if user has write access
      if (database.role !== "owner") {
        return res.status(403).json({ message: "You need owner access to create rules" });
      }
      
      // Create rule
      const rule = await DatabaseRule.create({
        databaseId,
        name,
        description,
        queryTypes,
        conditions,
        maskingPolicies
      });
      
      // Apply masking policies if any
      await RuleService.applyMaskingPolicies(rule);
      
      return res.status(201).json(rule);
    } catch (error) {
      console.error("Error creating rule:", error);
      return res.status(500).json({ message: "Server error", error: error.message });
    }
  }
  
  /**
   * Update an existing rule
   */
  static async updateRule(req, res) {
    try {
      const { id } = req.params;
      const { name, description, queryTypes, conditions, maskingPolicies, active } = req.body;
      
      // Get rule
      const rule = await DatabaseRule.findByPk(id);
      if (!rule) {
        return res.status(404).json({ message: "Rule not found" });
      }
      
      // Check database access
      const database = await Database.findOne({
        where: {
          id: rule.databaseId,
          userId: req.user.id
        }
      });
      
      if (!database) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      // Check if user has write access
      if (database.role !== "owner") {
        return res.status(403).json({ message: "You need owner access to update rules" });
      }
      
      // Update rule
      await rule.update({
        name: name || rule.name,
        description: description !== undefined ? description : rule.description,
        queryTypes: queryTypes || rule.queryTypes,
        conditions: conditions !== undefined ? conditions : rule.conditions,
        maskingPolicies: maskingPolicies !== undefined ? maskingPolicies : rule.maskingPolicies,
        active: active !== undefined ? active : rule.active
      });
      
      // Apply masking policies if any
      await RuleService.applyMaskingPolicies(rule);
      
      return res.status(200).json(rule);
    } catch (error) {
      console.error("Error updating rule:", error);
      return res.status(500).json({ message: "Server error", error: error.message });
    }
  }
  
  /**
   * Delete a rule
   */
  static async deleteRule(req, res) {
    try {
      const { id } = req.params;
      
      // Get rule
      const rule = await DatabaseRule.findByPk(id);
      if (!rule) {
        return res.status(404).json({ message: "Rule not found" });
      }
      
      // Check database access
      const database = await Database.findOne({
        where: {
          id: rule.databaseId,
          userId: req.user.id
        }
      });
      
      if (!database) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      // Check if user has write access
      if (database.role !== "owner") {
        return res.status(403).json({ message: "You need owner access to delete rules" });
      }
      
      // Remove any masking policies
      if (rule.maskingPolicies && rule.maskingPolicies.length > 0) {
        for (const policy of rule.maskingPolicies) {
          const columnName = policy.column;
          const dropTriggerSQL = `
            DROP TRIGGER IF EXISTS mask_${columnName}_trigger ON "${database.databaseName}";
          `;
          await executeQuery(database, dropTriggerSQL);
        }
      }
      
      // Delete rule
      await rule.destroy();
      
      return res.status(200).json({ message: "Rule deleted successfully" });
    } catch (error) {
      console.error("Error deleting rule:", error);
      return res.status(500).json({ message: "Server error", error: error.message });
    }
  }
  
  /**
   * Test a rule against a query
   */
  static async testRule(req, res) {
    try {
      const { ruleId, query } = req.body;
      
      if (!ruleId || !query) {
        return res.status(400).json({ message: "Rule ID and query are required" });
      }
      
      // Get rule
      const rule = await DatabaseRule.findByPk(ruleId);
      if (!rule) {
        return res.status(404).json({ message: "Rule not found" });
      }
      
      // Check database access
      const database = await Database.findOne({
        where: {
          id: rule.databaseId,
          userId: req.user.id
        }
      });
      
      if (!database) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      // Test rule
      const testResult = RuleService.testRule(rule, query);
      
      return res.status(200).json(testResult);
    } catch (error) {
      console.error("Error testing rule:", error);
      return res.status(500).json({ message: "Server error", error: error.message });
    }
  }
  
  /**
   * Execute a query with rules applied
   */
  static async executeQuery(req, res) {
    try {
      const { dbId } = req.params;
      const { query } = req.body;
      
      if (!query) {
        return res.status(400).json({ message: "Query is required" });
      }
      
      // Check database access
      const database = await Database.findOne({
        where: {
          id: dbId,
          userId: req.user.id
        }
      });
      
      if (!database) {
        return res.status(404).json({ message: "Database not found or access denied" });
      }
      
      // Execute query with rules
      const result = await EnhancedQueryExecutionService.executeWithRules(dbId, query);
      
      return res.status(200).json(result);
    } catch (error) {
      console.error("Error executing query:", error);
      return res.status(500).json({ message: "Server error", error: error.message });
    }
  }
}