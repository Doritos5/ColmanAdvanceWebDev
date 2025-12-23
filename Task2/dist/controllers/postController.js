"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const postModel_1 = __importDefault(require("../models/postModel"));
const commentModel_1 = __importDefault(require("../models/commentModel"));
const baseController_1 = __importDefault(require("./baseController"));
const mongoose_1 = __importDefault(require("mongoose"));
class PostController extends baseController_1.default {
    constructor() {
        super(postModel_1.default);
    }
    post(req, res) {
        const _super = Object.create(null, {
            post: { get: () => super.post }
        });
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            req.body.senderId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
            return _super.post.call(this, req, res);
        });
    }
    put(req, res) {
        const _super = Object.create(null, {
            put: { get: () => super.put }
        });
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
            const post = yield postModel_1.default.findById(req.params.id);
            if ((post === null || post === void 0 ? void 0 : post.senderId.toString()) !== userId) {
                res.status(403).json({ error: "Forbidden" });
                return;
            }
            return _super.put.call(this, req, res);
        });
    }
    del(req, res) {
        const _super = Object.create(null, {
            del: { get: () => super.del }
        });
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
            const post = yield postModel_1.default.findById(req.params.id);
            if ((post === null || post === void 0 ? void 0 : post.senderId.toString()) !== userId) {
                res.status(403).json({ error: "Forbidden" });
                return;
            }
            if (post) {
                // Delete all comments associated with the post
                yield commentModel_1.default.deleteMany({ postId: post._id });
                // Call parent deletion method
                return _super.del.call(this, req, res);
            }
            else {
                res.status(404).json({ error: "Post not found" });
            }
        });
    }
    getCommentsByPostId(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
            const post = yield postModel_1.default.findById(req.params.id);
            if ((post === null || post === void 0 ? void 0 : post.senderId.toString()) !== userId) {
                res.status(403).json({ error: "Forbidden" });
                return;
            }
            try {
                const { postId } = req.params;
                if (!mongoose_1.default.isValidObjectId(postId)) {
                    return res.status(400).json({ error: 'Invalid postId' });
                }
                const comments = yield commentModel_1.default.find({ postId });
                res.json(comments);
            }
            catch (error) {
                res.status(500).json({ error: error instanceof Error ? error.message : 'An unknown error occurred' });
            }
        });
    }
}
exports.default = new PostController();
//# sourceMappingURL=postController.js.map