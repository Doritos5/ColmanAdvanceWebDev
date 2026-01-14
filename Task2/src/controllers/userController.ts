import { Request, Response } from "express";
import User from "../models/userModel";
import BaseController from "./baseController";

class UserController extends BaseController {
    constructor() {
        super(User);
    }
}

export default new UserController();