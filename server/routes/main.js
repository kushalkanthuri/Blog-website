const express = require("express");
const router = express.Router();
const Post = require("../models/Post");

// function insertPostData() {
//   Post.insertMany([
//     {
//       title: "Introduction to Node.js",
//       body: "Learn the basics of Node.js and why it's so popular.",
//     },
//     {
//       title: "Understanding Express.js",
//       body: "Express.js is a minimalist web framework for Node.js.",
//     },
//     {
//       title: "MongoDB Crash Course",
//       body: "Get started with MongoDB and perform basic operations.",
//     },
//     {
//       title: "What is REST API?",
//       body: "Understand RESTful architecture and API principles.",
//     },
//     {
//       title: "JavaScript ES6 Features",
//       body: "Explore new ES6 features like let, const, arrow functions, etc.",
//     },
//     {
//       title: "Frontend vs Backend",
//       body: "Understand the key differences between frontend and backend.",
//     },
//     {
//       title: "Deploying to Render",
//       body: "Learn how to deploy your Node app using Render.",
//     },
//     {
//       title: "EJS Templating Engine",
//       body: "How EJS helps in embedding JavaScript into HTML.",
//     },
//     {
//       title: "Mongoose Basics",
//       body: "Learn to define schemas and models with Mongoose.",
//     },
//     {
//       title: "CRUD with MongoDB",
//       body: "Create, Read, Update, and Delete data using MongoDB.",
//     },
//     {
//       title: "Middlewares in Express",
//       body: "Understand how middleware functions work in Express.js.",
//     },
//     {
//       title: "Promises vs Callbacks",
//       body: "Compare promises and callbacks in asynchronous JavaScript.",
//     },
//     {
//       title: "Async/Await Explained",
//       body: "Simplify asynchronous code using async/await.",
//     },
//     {
//       title: "JWT Authentication",
//       body: "Secure your routes using JSON Web Tokens.",
//     },
//     {
//       title: "How the Internet Works",
//       body: "An overview of how data flows across the internet.",
//     },
//     {
//       title: "CSS Grid vs Flexbox",
//       body: "Understand when to use CSS Grid and Flexbox.",
//     },
//     {
//       title: "Creating a Blog App",
//       body: "Build a full-stack blog using Node, Express, and MongoDB.",
//     },
//     {
//       title: "Git & GitHub Basics",
//       body: "Version control your code and collaborate with others.",
//     },
//     {
//       title: "Environment Variables",
//       body: "Secure sensitive data using .env files.",
//     },
//     {
//       title: "Nodemon vs Node",
//       body: "Nodemon auto-restarts your server on file changes.",
//     },
//   ]);
// }

// insertPostData();

router.get("/", async (req, res) => {
  try {
    const locals = {
      title: "Blogging",
      description: "Welcome to blogging website",
    };
    let perPage = 10;
    let page = req.query.page || 1;

    //to sort posts in desecending order new posts will appear at top
    const data = await Post.aggregate([{ $sort: { createdAt: -1 } }])
      .skip(perPage * page - perPage)
      .limit(perPage)
      .exec();

    const count = await Post.countDocuments();
    const nextPage = parseInt(page) + 1;
    //per page only 10 posts so its checks how many pages and next pages to!!
    const hasNextPage = nextPage <= Math.ceil(count / perPage);
    res.render("index", {
      locals,
      data,
      current: page,
      nextPage: hasNextPage ? nextPage : null,
      // currentRoute: "/",
    });
  } catch (error) {
    console.log(error);
  }
});

router.get("/post/:id", async (req, res) => {
  try {
    let slug = req.params.id;

    const data = await Post.findById({ _id: slug });

    const locals = {
      title: data.title,
      description: "Welcome to blogging website",
      // currentRoute: `/post:/${slug}`,
    };
    res.render("post", { locals, data });
  } catch (error) {
    console.log(error);
  }
});

//searching route
router.post("/search", async (req, res) => {
  try {
    let searchTerm = req.body.searchTerm;
    const searchNoSpecialChar = searchTerm.replace(/[^a-zA-Z0-9]/g, " ");

    let data = await Post.find({
      $or: [
        { title: { $regex: new RegExp(searchNoSpecialChar, "i") } },
        { body: { $regex: new RegExp(searchNoSpecialChar, "i") } },
      ],
    });

    const locals = {
      title: data.title,
      description: "Welcome to blogging website",
    };

    res.render("search", { data, locals });
  } catch (error) {
    console.log(error);
  }
});

router.get("/about", (req, res) => {
  res.render("about", {
    // ntRoute: "/about",curre
  });
});

//Home route - root page
router.get("/home", (req, res) => {
  res.redirect("/");
});

//contact-us  route - root page
router.get("/contact", (req, res) => {
  res.render("contact");
});

//post - contact us route
//Getting customer deatails
const Contact = require("../models/contact");
router.post("/contact", async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    const newContact = new Contact({
      name,
      email,
      subject,
      message,
    });

    await newContact.save();
    res.send("Message sent ");
  } catch (err) {
    console.error("Error saving contact:", err);
    res.status(500).send("Something went wrong. Please try again.");
  }
});

module.exports = router;
