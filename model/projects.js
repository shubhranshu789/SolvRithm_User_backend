const mongoose = require('mongoose');


const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true, 
    trim: true,
  },
  img: {
    type: String,
    required: true,
  },
  desc: {
    type: String,
    required: true,
  },
  googleForm: {
    type: String,
    required: true,
  },
  bigDesc: {
    type: String,
    required: true,
  },
  priority: {
    type: String,
    required: true,
  },
  dueDate: {
    type: Date,
    required: false, 
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "USER", 
    required: true,
  },

  students: [
    {
      student: { type: mongoose.Schema.Types.ObjectId, ref: "STUDENT" },
      githubLink: { type: String }  // 🔥 link per student per project
    }
  ]
}, { timestamps: true }); 

mongoose.model("PROJECT" ,projectSchema )
