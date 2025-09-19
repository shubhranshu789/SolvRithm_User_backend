const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();

const Project = mongoose.model("PROJECT");
const Student = mongoose.model("STUDENT");
const requireLogin = require("../middlewares/requireLogin");

// 👉 Create new project
router.post("/projects", requireLogin, async (req, res) => {
  try {
    const { name, img, desc, bigDesc, priority, dueDate, googleForm } = req.body;

    if (!name || !img || !desc || !bigDesc || !priority || !googleForm) {
      return res.status(422).json({ error: "Please fill all required fields" });
    }

    const project = new Project({
      name,
      img, // Cloudinary URL
      desc,
      bigDesc,
      priority,
      dueDate,
      googleForm,
      user: req.user._id
    });

    await project.save();
    res.status(201).json({ message: "Project created successfully", project });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

// 👉 Get all projects
router.get("/projects", async (req, res) => {
  try {
    const projects = await Project.find().sort({ createdAt: -1 }); // latest first
    res.json(projects);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

// 👉 Get single project by ID
router.get("/projects/:id", async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ error: "Project not found" });
    res.json(project);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});


// DELETE /projects/:id
router.delete('/projects/:id', async (req, res) => {
  try {
    const deleted = await Project.findByIdAndDelete(req.params.id)
    if (!deleted) {
      return res.status(404).json({ error: 'Project not found' })
    }
    // Option A: no body
    return res.status(204).end()
    // Option B: return deleted doc (choose one style)
    // return res.status(200).json({ message: 'Deleted', project: deleted })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Server error' })
  }
})




// -----------------------------------------------------------------------------------------------------------------------------

// router.post("/projects/:projectId/add-student", async (req, res) => {
//   try {
//     const { studentId } = req.body; 

//     if (!studentId) {
//       return res.status(400).json({ error: "studentId is required" });
//     }

//     const project = await Project.findByIdAndUpdate(
//       req.params.projectId,
//       {
//         $addToSet: { students: studentId }, // avoids duplicate entries
//       },
//       { new: true } // returns the updated document
//     ).populate("students"); // optional: populate student details

//     if (!project) {
//       return res.status(404).json({ error: "Project not found" });
//     }

//     res.json({ message: "Student added successfully", project });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Server error" });
//   }
// });


// router.post("/projects/:projectId/add-student", async (req, res) => {
//   try {
//     const { studentId } = req.body;

//     if (!studentId) {
//       return res.status(400).json({ error: "studentId is required" });
//     }

//     // ✅ Add student to project
//     const project = await Project.findByIdAndUpdate(
//       req.params.projectId,
//       { $addToSet: { students: studentId } }, // avoids duplicate entries
//       { new: true }
//     ).populate("students");

//     if (!project) {
//       return res.status(404).json({ error: "Project not found" });
//     }

//     // ✅ Add project to student
//     await Student.findByIdAndUpdate(
//       studentId,
//       { $addToSet: { projects: req.params.projectId } }, // avoids duplicate projects
//       { new: true }
//     );

//     res.json({ message: "Student enrolled successfully", project });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Server error" });
//   }
// });

router.post("/projects/:projectId/add-student", async (req, res) => {
  try {
    const { studentId, githubLink } = req.body;

    if (!studentId) {
      return res.status(400).json({ error: "studentId is required" });
    }

    // ✅ Add student to project (with optional githubLink)
    const project = await Project.findByIdAndUpdate(
      req.params.projectId,
      { $addToSet: { students: { student: studentId, githubLink } } },
      { new: true }
    ).populate("students.student");

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    // ✅ Add project to student
    await Student.findByIdAndUpdate(
      studentId,
      { $addToSet: { projects: req.params.projectId } },
      { new: true }
    );

    res.json({ message: "Student enrolled successfully", project });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});



router.get("/students/:studentId/projects", async (req, res) => {
  try {
    const { studentId } = req.params;

    const student = await Student.findById(studentId).populate("projects");

    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    res.json(student.projects); // only projects linked to this student
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});


router.get("/students/:studentId", async (req, res) => {
  try {
    const { studentId } = req.params;

    const student = await Student.findById(studentId).populate("projects");

    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    res.json(student);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});



// POST or PATCH: update student GitHub link for a project
router.patch("/projects/:projectId/student/:studentId/github2", async (req, res) => {
  try {
    const { projectId, studentId } = req.params;
    const { githubLink } = req.body;

    if (!githubLink) {
      return res.status(400).json({ error: "GitHub link is required" });
    }

    // Find project
    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ error: "Project not found" });

    // Find student entry inside project
    const studentEntry = project.students.find(
      (s) => s.student?.toString() === studentId
    );


    if (studentEntry) {
      // Update existing entry
      studentEntry.githubLink = githubLink;
    } else {
      // Add new entry
      project.students.push({ student: studentId, githubLink });
    }

    await project.save();

    res.json({ message: "GitHub link updated successfully", project });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});


// GET: check if a student has uploaded GitHub link
router.get("/projects/:projectId/student/:studentId/github", async (req, res) => {
  try {
    const { projectId, studentId } = req.params;

    // Find project
    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ error: "Project not found" });

    // Find student entry
    const studentEntry = project.students.find(
      (s) => s.student?.toString() === studentId
    );

    if (studentEntry && studentEntry.githubLink) {
      return res.json({
        message: "You already uploaded it",
        githubLink: studentEntry.githubLink,
      });
    }

    return res.json({
      // message: "No GitHub link uploaded yet",
      githubLink: null,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});



module.exports = router;
