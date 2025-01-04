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
const express_1 = __importDefault(require("express"));
const marked_1 = require("marked");
const sanitize_html_1 = __importDefault(require("sanitize-html"));
const router = express_1.default.Router();
let notes = [];
marked_1.marked.setOptions({
    async: false,
});
// List Notes
router.get("/", (req, res) => {
    res.render("index", { notes });
});
// New Note Form
router.get("/new", (req, res) => {
    res.render("new");
});
// Create Note
router.post("/", (req, res) => {
    const { title, content } = req.body;
    const id = Date.now().toString();
    notes.push({ id, title, content });
    res.redirect("/notes");
});
// View Note
router.get("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const note = notes.find((note) => note.id === req.params.id);
    if (note) {
        const rawHtmlContent = yield marked_1.marked.parse(note.content);
        const sanitizeHtmlContent = (0, sanitize_html_1.default)(rawHtmlContent);
        res.render("show", { note, htmlContent: sanitizeHtmlContent });
    }
    else {
        res.status(404).send("Note not found");
    }
}));
// Edit Note Form
router.get("/:id/edit", (req, res) => {
    const note = notes.find((note) => note.id === req.params.id);
    if (note) {
        res.render("edit", { note });
    }
    else {
        res.status(404).send("Note not found");
    }
});
// Update Note
router.put("/:id", (req, res) => {
    const { title, content } = req.body;
    const note = notes.find((note) => note.id === req.params.id);
    if (note) {
        note.title = title;
        note.content = content;
        res.redirect("/notes");
    }
    else {
        res.status(404).send("Note not found");
    }
});
// Delete Note
router.delete("/:id", (req, res) => {
    notes = notes.filter((note) => note.id !== req.params.id);
    res.redirect("/notes");
});
exports.default = router;
