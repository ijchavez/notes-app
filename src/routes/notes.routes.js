const { Router } = require("express");
const router = Router();

const {
  renderNoteForm,
  createNewNote,
  renderNotes,
  renderEditForm,
  updateNote,
  deleteNote,
  allNotes,
  noteById,
} = require("../controllers/notes.controller");

const { isAuthenticated } = require("../helpers/auth");

router.get(
  "/notes/add",
  isAuthenticated,
  (req, res, next) => {
    console.log("GET /notes/add");
    next();
  },
  renderNoteForm
);

router.post(
  "/notes/new-note",
  isAuthenticated,
  (req, res, next) => {
    console.log("POST /notes/new-note");
    next();
  },
  createNewNote
);

router.get(
  "/notes",
  isAuthenticated,
  (req, res, next) => {
    console.log("GET /notes");
    next();
  },
  renderNotes
);

router.get(
  "/notes/edit/:id",
  isAuthenticated,
  (req, res, next) => {
    console.log("GET /notes/edit/:id");
    next();
  },
  renderEditForm
);

router.put(
  "/notes/edit/:id",
  isAuthenticated,
  (req, res, next) => {
    console.log("PUT /notes/edit/:id");
    next();
  },
  updateNote
);

router.delete(
  "/notes/delete/:id",
  isAuthenticated,
  (req, res, next) => {
    console.log("DELETE /notes/delete/:id");
    next();
  },
  deleteNote
);

router.get(
  "/notes/all",
  (req, res, next) => {
    console.log("GET /notes/all");
    next();
  },
  allNotes
);

router.get(
  "/notes/:id",
  (req, res, next) => {
    console.log("GET /notes/:id");
    next();
  },
  noteById
);

module.exports = router;
