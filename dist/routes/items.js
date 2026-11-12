"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const todoItem_1 = require("../models/todoItem");
const router = express_1.default.Router({ mergeParams: true });
/**
 * Gets a list of Todo item within a list
 */
router.get("/", async (req, res) => {
    const query = todoItem_1.TodoItemModel.find({ listId: req.params.listId });
    const skip = req.query.skip ? parseInt(req.query.skip) : 0;
    const top = req.query.top ? parseInt(req.query.top) : 20;
    const lists = await query
        .skip(skip)
        .limit(top)
        .exec();
    res.json(lists);
});
/**
 * Creates a new Todo item within a list
 */
router.post("/", async (req, res) => {
    try {
        const item = {
            ...req.body,
            listId: req.params.listId
        };
        let newItem = new todoItem_1.TodoItemModel(item);
        newItem = await newItem.save();
        res.setHeader("location", `${req.protocol}://${req.get("Host")}/lists/${req.params.listId}/${newItem.id}`);
        res.status(201).json(newItem);
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
 * Gets a Todo item with the specified ID within a list
 */
router.get("/:itemId", async (req, res) => {
    try {
        const list = await todoItem_1.TodoItemModel
            .findOne({ _id: req.params.itemId, listId: req.params.listId })
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
 * Updates a Todo item with the specified ID within a list
 */
router.put("/:itemId", async (req, res) => {
    try {
        const item = {
            ...req.body,
            id: req.params.itemId,
            listId: req.params.listId
        };
        await todoItem_1.TodoItemModel.validate(item);
        const updated = await todoItem_1.TodoItemModel
            .findOneAndUpdate({ _id: item.id }, item, { new: true })
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
 * Deletes a Todo item with the specified ID within a list
 */
router.delete("/:itemId", async (req, res) => {
    try {
        await todoItem_1.TodoItemModel
            .findByIdAndDelete(req.params.itemId, {})
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
/**
 * Get a list of items by state
 */
router.get("/state/:state", async (req, res) => {
    const query = todoItem_1.TodoItemModel.find({ listId: req.params.listId, state: req.params.state });
    const skip = req.query.skip ? parseInt(req.query.skip) : 0;
    const top = req.query.top ? parseInt(req.query.top) : 20;
    const lists = await query
        .skip(skip)
        .limit(top)
        .exec();
    res.json(lists);
});
router.put("/state/:state", async (req, res) => {
    try {
        const completedDate = req.params.state === todoItem_1.TodoItemState.Done ? new Date() : undefined;
        const updateTasks = req.body.map(id => todoItem_1.TodoItemModel
            .findOneAndUpdate({ listId: req.params.listId, _id: id }, { state: req.params.state, completedDate: completedDate })
            .orFail()
            .exec());
        await Promise.all(updateTasks);
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
//# sourceMappingURL=items.js.map