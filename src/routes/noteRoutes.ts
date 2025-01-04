import express from "express";
import { marked } from "marked";

const router = express.Router();

interface Note {
  id: string;
  title: string;
  content: string;
}

let notes: Note[] = [];

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
router.get("/:id", (req, res) => {
  const note = notes.find((note) => note.id === req.params.id);
  if (note) {
    const htmlContent = marked(note.content);
    res.render("show", { note, htmlContent });
  } else {
    res.status(404).send("Note not found");
  }
});

// Edit Note Form
router.get("/:id/edit", (req, res) => {
  const note = notes.find((note) => note.id === req.params.id);
  if (note) {
    res.render("edit", { note });
  } else {
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
  } else {
    res.status(404).send("Note not found");
  }
});

// Delete Note
router.delete("/:id", (req, res) => {
  notes = notes.filter((note) => note.id !== req.params.id);
  res.redirect("/notes");
});

export default router;