import express from "express";
import userController from "../controllers/userController";

const router = express.Router();

/**
 * @route   GET /users
 * @desc    Get all users (Optional - dependent on privacy requirements)
 * @access  Public/Private
 */
router.get("/", userController.get.bind(userController));

/**
 * @route   GET /users/:id
 * @desc    Get a specific user by their ID
 * @access  Public
 */
router.get("/:id", userController.getById.bind(userController));

/**
 * @route   PUT /users/:id
 * @desc    Update a user's details
 * @access  Private (Owner only)
 */
router.put("/:id", userController.put.bind(userController));

/**
 * @route   DELETE /users/:id
 * @desc    Delete a user account
 * @access  Private (Owner/Admin only)
 */
router.delete("/:id", userController.del.bind(userController));

export default router;