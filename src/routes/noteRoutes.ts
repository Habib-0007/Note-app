import express, { Request, Response } from "express";
import { marked } from "marked";
import sanitizeHtml from "sanitize-html"

const router = express.Router();

interface Note {
	id: string;
	title: string;
	content: string;
}

let notes: Note[] = [];

marked.setOptions({
	async: false,
});

// List Notes
router.get("/", (req: Request, res: Response) => {
	res.render("index", { notes });
});

// New Note Form
router.get("/new", (req: Request, res: Response) => {
	res.render("new");
});

// Create Note
router.post("/", (req: Request, res: Response) => {
	const { title, content } = req.body;
	const id = Date.now().toString();
	notes.push({ id, title, content });
	res.redirect("/notes");
});

// View Note
router.get("/:id", async (req: Request, res: Response) => {
	const note = notes.find((note) => note.id === req.params.id);
	if (note) {
		const rawHtmlContent = await marked.parse(note.content);
		const sanitizeHtmlContent = sanitizeHtml(rawHtmlContent)
		res.render("show", { note, htmlContent: sanitizeHtmlContent });
	} else {
		res.status(404).send("Note not found");
	}
});

// Edit Note Form
router.get("/:id/edit", (req: Request, res: Response) => {
	const note = notes.find((note) => note.id === req.params.id);
	if (note) {
		res.render("edit", { note });
	} else {
		res.status(404).send("Note not found");
	}
});

// Update Note
router.put("/:id", (req: Request, res: Response) => {
	const { title, content } = req.body;
	const note = notes.find((note) => note.id === req.params.id);
	if (note) {
		note.title = title;
		note.content = content;
		res.redirect("/notes");
	} else {
		res.status(404).send("Note not found");
	}
});

// Delete Note
router.delete("/:id", (req: Request, res: Response) => {
	notes = notes.filter((note) => note.id !== req.params.id);
	res.redirect("/notes");
});

export default router;