import express, { Request, Response } from "express";
import { marked } from "marked";
import sanitizeHtml from "sanitize-html";
import { LocalStorage } from 'node-localstorage';

const router = express.Router();
const localStorage = new LocalStorage('./scratch'); // Specify a directory for local storage

interface Note {
	id: string;
	title: string;
	content: string;
}

// Load notes from local storage
const loadNotes = (): Note[] => {
	const notesData = localStorage.getItem('notes');
	return notesData ? JSON.parse(notesData) : [];
};

// Save notes to local storage
const saveNotes = (notes: Note[]) => {
	localStorage.setItem('notes', JSON.stringify(notes));
};

marked.setOptions({
	async: false,
});

// List Notes
router.get("/", (req: Request, res: Response) => {
	const notes = loadNotes();
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
	const notes = loadNotes();
	notes.push({ id, title, content });
	saveNotes(notes);
	res.redirect("/notes");
});

// View Note
router.get("/:id", async (req: Request, res: Response) => {
	const notes = loadNotes();
	const note = notes.find((note) => note.id === req.params.id);
	if (note) {
		const rawHtmlContent = await marked.parse(note.content);
		const sanitizeHtmlContent = sanitizeHtml(rawHtmlContent);
		res.render("show", { note, htmlContent: sanitizeHtmlContent });
	} else {
		res.status(404).send("Note not found");
	}
});

// Edit Note Form
router.get("/:id/edit", (req: Request, res: Response) => {
	const notes = loadNotes();
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
	let notes = loadNotes();
	const noteIndex = notes.findIndex((note) => note.id === req.params.id);
	if (noteIndex !== -1) {
		notes[noteIndex] = { id: req.params.id, title, content };
		saveNotes(notes);
		res.redirect("/notes");
	} else {
		res.status(404).send("Note not found");
	}
});

// Delete Note
router.delete("/:id", (req: Request, res: Response) => {
	let notes = loadNotes();
	notes = notes.filter((note) => note.id !== req.params.id);
	saveNotes(notes);
	res.redirect("/notes");
});

export default router;
