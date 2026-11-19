"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const todoList_1 = require("../models/todoList");
const router = express_1.default.Router();
/**
 * Gets a list of Todo list
 */
router.get("/", async (req, res) => {
    const query = todoList_1.TodoListModel.find();
    const skip = req.query.skip ? parseInt(req.query.skip) : 0;
    const top = req.query.top ? parseInt(req.query.top) : 20;
    const lists = await query
        .skip(skip)
        .limit(top)
        .exec();
    res.json(lists);
});
/**
 * Creates a new Todo list
 */
router.post("/", async (req, res) => {
    try {
        let list = new todoList_1.TodoListModel(req.body);
        list = await list.save();
        res.setHeader("location", `${req.protocol}://${req.get("Host")}/lists/${list.id}`);
        res.status(201).json(list);
    }
    catch (err) {
        switch (err.constructor) {
            case mongoose_1.default.Error.CastError:
            case mongoose_1.default.Error.ValidationError:
                return res.status(400).json(err.errors);
            default:
                throw err;
        }
    }
});
/**
 * Gets a Todo list with the specified ID
 */
router.get("/:listId", async (req, res) => {
    try {
        const list = await todoList_1.TodoListModel
            .findById(req.params.listId)
            .orFail()
            .exec();
        res.json(list);
    }
    catch (err) {
        switch (err.constructor) {
            case mongoose_1.default.Error.CastError:
            case mongoose_1.default.Error.DocumentNotFoundError:
                return res.status(404).send();
            default:
                throw err;
        }
    }
});
/**
 * Updates a Todo list with the specified ID
 */
router.put("/:listId", async (req, res) => {
    try {
        const list = {
            ...req.body,
            id: req.params.listId
        };
        await todoList_1.TodoListModel.validate(list);
        const updated = await todoList_1.TodoListModel
            .findOneAndUpdate({ _id: list.id }, list, { new: true })
            .orFail()
            .exec();
        res.json(updated);
    }
    catch (err) {
        switch (err.constructor) {
            case mongoose_1.default.Error.ValidationError:
                return res.status(400).json(err.errors);
            case mongoose_1.default.Error.CastError:
            case mongoose_1.default.Error.DocumentNotFoundError:
                return res.status(404).send();
            default:
                throw err;
        }
    }
});
/**
 * Deletes a Todo list with the specified ID
 */
router.delete("/:listId", async (req, res) => {
    try {
        await todoList_1.TodoListModel
            .findByIdAndDelete(req.params.listId, {})
            .orFail()
            .exec();
        res.status(204).send();
    }
    catch (err) {
        switch (err.constructor) {
            case mongoose_1.default.Error.CastError:
            case mongoose_1.default.Error.DocumentNotFoundError:
                return res.status(404).send();
            default:
                throw err;
        }
    }
});
exports.default = router;
//# sourceMappingURL=lists.js.map