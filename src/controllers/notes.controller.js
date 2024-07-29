const notesCtrl = {};
const Note = require("../models/Note");
const validations = require("../helpers/validations");
const testUser = "64a32b4cb1645f00fa913e73";

notesCtrl.renderNoteForm = (req, res) => {
  res.render("notes/new-note");
};
notesCtrl.createNewNote = async (req, res) => {
  const { title, description } = req.body;
  const errors = validations.validateNote(title, description);

  if (errors.length > 0) {
    return res.render("notes/new-note", {
      errors,
      title,
      description,
    });
  }
  const newNote = new Note({ title, description });
  newNote.user = req.user.id;
  await newNote.save();
  req.flash("success_msg", "Note Added Successfully");
  res.redirect("/notes");
};

notesCtrl.renderNotes = async (req, res) => {
  const notes = await Note.find({ user: req.user.id })
    .sort({ createdAt: "desc" })
    .lean();
  res.render("notes/all-notes", { notes });
};

notesCtrl.renderEditForm = async (req, res) => {
  const note = await Note.findById(req.params.id).lean();
  console.log(note.user, req.user.id);
  if (note.user != req.user.id) {
    req.flash("error_msg", "Not Authorized");
    return res.redirect("/notes");
  }
  res.render("notes/edit-note", { note });
};

notesCtrl.updateNote = async (req, res) => {
  const { title, description } = req.body;
  const errors = validations.validateNote(title, description);

  if (errors.length > 0) {
    const note = await Note.findById(req.params.id).lean();
    return res.render("notes/edit-note", {
      errors,
      note: { _id: req.params.id, title, description },
    });
  }

  await Note.findByIdAndUpdate(req.params.id, { title, description });
  req.flash("success_msg", "Note Updated Successfully");
  res.redirect("/notes");
};

notesCtrl.deleteNote = async (req, res) => {
  await Note.findByIdAndDelete(req.params.id);
  req.flash("success_msg", "Note Deleted Succesfully");
  res.redirect("/notes");
};

notesCtrl.allNotes = async (req, res) => {
  const notes = await Note.find({ user: req.user?.id ?? testUser })
    .sort({ createdAt: "desc" })
    .lean();

  res.json({ notes });
};

notesCtrl.noteById = async (req, res) => {
  const note = await Note.findById(req.params.id);
  res.json(note);
};

notesCtrl.apiCreateNewNote = async (req, res) => {
  const { title, description } = req.body;
  const errors = validations.validateNote(title, description);

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  const newNote = new Note({ title, description });
  newNote.user = req.user?.id ?? testUser;
  await newNote.save();
  res.status(201).json(newNote);
};

notesCtrl.apiAllNotes = async (req, res) => {
  try {
    const notes = await Note.find({ user: req.user?.id ?? testUser })
      .sort({ createdAt: "desc" })
      .lean();
    res.status(200).json({ notes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

notesCtrl.apiNoteById = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ error: "Note not found" });
    }
    res.status(200).json(note);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

notesCtrl.apiUpdateNote = async (req, res) => {
  const { title, description } = req.body;
  const errors = validations.validateNote(title, description);

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  try {
    const updatedNote = await Note.findByIdAndUpdate(
      req.params.id,
      { title, description },
      { new: true }
    );
    if (!updatedNote) {
      return res.status(404).json({ error: "Note not found" });
    }
    res.status(200).json(updatedNote);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

notesCtrl.apiDeleteNote = async (req, res) => {
  try {
    const deletedNote = await Note.findByIdAndDelete(req.params.id);
    if (!deletedNote) {
      return res.status(404).json({ error: "Note not found" });
    }
    res.status(200).json({ message: "Note Deleted Successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = notesCtrl;
