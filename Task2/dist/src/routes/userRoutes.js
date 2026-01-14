"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userController_1 = __importDefault(require("../controllers/userController"));
const router = express_1.default.Router();
/**
 * @route   GET /users
 * @desc    Get all users (Optional - dependent on privacy requirements)
 * @access  Public/Private
 */
router.get("/", userController_1.default.get.bind(userController_1.default));
/**
 * @route   GET /users/:id
 * @desc    Get a specific user by their ID
 * @access  Public
 */
router.get("/:id", userController_1.default.getById.bind(userController_1.default));
/**
 * @route   PUT /users/:id
 * @desc    Update a user's details
 * @access  Private (Owner only)
 */
router.put("/:id", userController_1.default.put.bind(userController_1.default));
/**
 * @route   DELETE /users/:id
 * @desc    Delete a user account
 * @access  Private (Owner/Admin only)
 */
router.delete("/:id", userController_1.default.del.bind(userController_1.default));
exports.default = router;
//# sourceMappingURL=userRoutes.js.map