const express = require("express");
const { body, validationResult } = require("express-validator");
const router = express.Router();
const fetchuser = require("../middleware/fetchuser");
const Notes = require("../models/Notes");

// Routes 1 => fetch all notes using post "/api/notes/fetchallnotes" login required
router.get("/fetchallnotes", fetchuser, async (req, res) => {
  try {
    const notes = await Notes.find({ user: req.user.id });
    res.status(200).send(notes);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Routes 2 => Add a new notes using POST : '/api/notes/addnotes" login required
router.post(
  "/addnotes",
  fetchuser,
  [
    body("title", "enter a valid title").isLength({ min: 5 }),
    body("description", "description must atleast of 5 character").isLength({
      min: 5,
    }),
  ],
  async (req, res) => {
    try {
      const { title, description, tag } = req.body;
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const newNotes = new Notes({
        title,
        description,
        tag,
        user: req.user.id,
      });
      const savedNote = await newNotes.save();
      res.status(200).json(savedNote);
    } catch (error) {
      res.status(401).json("internal" + error.message);
    }
  }
);

// Route 3 => update notes using PUT : '/api/notes/updatenote/:id"
router.put("/updatenote/:id", fetchuser, async (req, res) => {
  //create a newnote object
  try {
    const { title, description, tag } = req.body;
    const newNote = {};
    if (title) {
      newNote.title = title;
    }
    if (description) {
      newNote.description = description;
    }
    if (tag) {
      newNote.title = tag;
    }

    let note = await Notes.findById(req.params.id);
    if (!note) {
      console.log("not found");
      return res.status(404).json("not found");
    }
    if (note.user.toString() !== req.user.id) {
      console.log("not found");
      return res.status(401).json("not allowed");
    }
    //Find the note to be updated
    note = await Notes.findByIdAndUpdate(
      req.params.id,
      { $set: newNote },
      { new: true }
    );
    console.log(note);
    res.json(note);
  } catch (error) {
    console.log(error.message);
    res.status(500).json(error.message);
  }
});

//Route 4 => Delete the doc using DELETE "/api/notes/deletenote" login required
router.delete("/deletenote/:id", fetchuser, async (req, res) => {
  try {
    
    //Find the note to be delete and delete it
    let note = await Notes.findById(req.params.id);
    if (!note) {
      return res.status(404).send('not found');
    }
    
    //Allow deledtion only if user owns this Note
    if (note.user.toString() !== req.user.id)
    {
      return res.status(401).send('not allowed');
    }
    note = await Notes.findByIdAndDelete(req.params.id);
    res.status(200).json({"sucess" : "sucess" , note})
  }
  catch (err)
  {
    res.status(500).json('rejection');
  }
});

module.exports = router;
