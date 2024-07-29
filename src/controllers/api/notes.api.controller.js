const Note = require("../../models/Note");
const validations = require("../../helpers/validations");

const notesApiCtrl = {};

notesApiCtrl.apiCreateNewNote = async (req, res) => {
  const { title, description } = req.body;
  const errors = validations.validateNote(title, description);

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  const newNote = new Note({ title, description });
  newNote.user = req.user?.id;
  await newNote.save();
  res.status(201).json(newNote);
};

notesApiCtrl.apiAllNotes = async (req, res) => {
  try {
    const notes = await Note.find({ user: req.user?.id })
      .sort({ createdAt: "desc" })
      .lean();
    res.status(200).json({ notes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

notesApiCtrl.apiNoteById = async (req, res) => {
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

notesApiCtrl.apiUpdateNote = async (req, res) => {
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

notesApiCtrl.apiDeleteNote = async (req, res) => {
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

module.exports = notesApiCtrl;
