const express = require("express");
const router = express.Router();
const Post = require("../models/Post");
const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const adminLayout = "../views/layouts/admin";
const jwtSecret = process.env.JWT_SECRET;

// Admin Login
router.get("/admin", async (req, res) => {
  try {
    const locals = {
      title: "Admin",
      description: "Welcome to blogging website",
    };
    res.render("admin/index", {
      ...locals,
      layout: adminLayout,
    });
  } catch (error) {
    console.log(error);
  }
});

//using middleware for token
const authMiddleware = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ messsage: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, jwtSecret);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({ messsage: "Unauthorized" });
  }
};

//check login
router.post("/admin", async (req, res) => {
  try {
    let { username, password } = req.body;
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(401).json({ message: "Invalid Credentials" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid Credentials" });
    }
    //cookie creation
    const token = jwt.sign({ userId: user._id }, jwtSecret);
    res.cookie("token", token, { httpOnly: true });
    res.redirect("/dashboard");
  } catch (error) {
    console.log(error);
  }
});

//Admin Register check
router.post("/register", async (req, res) => {
  try {
    let { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
      const user = await User.create({ username, password: hashedPassword });
      res.status(201).json({ message: "User created succesfully", user });
    } catch (error) {
      if (error.code == 11000) {
        res.status(409).json({ message: "User Already in use" });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  } catch (error) {
    console.log(error);
  }
});

//This is only for user so using middleware
router.get("/dashboard", authMiddleware, async (req, res) => {
  try {
    const locals = {
      title: "Admin",
      description: "Welcome to blogging website",
    };
    const data = await Post.find();
    res.render("admin/dashboard", {
      locals,
      data,
      layout: "layouts/admin",
    });
  } catch (error) {
    console.log(error);
  }
});

// GET
// Admin - Create New Post
router.get("/add-post", authMiddleware, async (req, res) => {
  try {
    const locals = {
      title: "Add post",
      description: "Welcome to blogging website",
    };
    const data = await Post.find();
    res.render("admin/add-post", {
      locals,
      data,
      layout: adminLayout,
    });
  } catch (error) {
    console.log(error);
  }
});

// POST
// Admin - Create New Post
router.post("/add-post", authMiddleware, async (req, res) => {
  try {
    try {
      const newPost = new Post({
        title: req.body.title,
        body: req.body.body,
      });
      await Post.create(newPost);
      res.redirect("/dashboard");
    } catch (error) {
      console.log(error);
    }
  } catch (error) {
    console.log(error);
  }
});

// GET
// Admin - Create New Post
router.get("/edit-post/:id", authMiddleware, async (req, res) => {
  try {
    const locals = {
      title: "Add post",
      description: "Welcome to blogging website",
    };

    const data = await Post.findOne({ _id: req.params.id });

    res.render("admin/edit-post", {
      data,
      locals,
    });
  } catch (error) {
    console.log("Error updating post:", error);
  }
});

// PUT
// Admin - Create New Post
router.put("/edit-post/:id", authMiddleware, async (req, res) => {
  try {
    await Post.findByIdAndUpdate(req.params.id, {
      title: req.body.title,
      body: req.body.body,
      updatedAt: Date.now(),
    });

    // res.redirect(`/edit-post/${req.params.id}`);
    res.redirect("/dashboard");
  } catch (error) {
    console.log("Error updating post:", error);
    res.status(500).send("Internal Server Error");
  }
});

// DELETE
// Admin - Delete New Post
router.delete("/delete-post/:id", authMiddleware, async (req, res) => {
  try {
    await Post.deleteOne({ _id: req.params.id });
    res.redirect("/dashboard");
  } catch (error) {
    console.log(error);
  }
});

// Get
// Admin Logout
router.get("/logout", (req, res) => {
  res.clearCookie("token");
  res.redirect("/");
});

module.exports = router;
