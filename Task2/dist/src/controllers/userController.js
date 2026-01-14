"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const userModel_1 = __importDefault(require("../models/userModel"));
const baseController_1 = __importDefault(require("./baseController"));
class UserController extends baseController_1.default {
    constructor() {
        super(userModel_1.default);
    }
}
exports.default = new UserController();
//# sourceMappingURL=userController.js.map