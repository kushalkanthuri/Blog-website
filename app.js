require("dotenv").config();

const express = require("express");
const app = express();
const expressLayout = require("express-ejs-layouts");
const path = require("path");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const methodOverride = require("method-override");
const { isActiveRoute } = require("./server/helpers/routerHelpers");

const connectDB = require("./server/config/db");

const port = process.env.port || 5000; //for deployment

//connect to Db
connectDB();

//middlewarers
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(methodOverride("_method"));

//session management set up
app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
    }),
  })
);
//To use public folder for styling
app.use(express.static("public"));
app.use(express.static(path.join(__dirname, "public")));

//Templating engine
app.use(expressLayout);
app.set("layout", "./layouts/main");
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.locals.isActiveRoute = isActiveRoute;
//navitage to main file  in server/routes folder
app.use("/", require("./server/routes/main"));
app.use("/", require("./server/routes/admin"));

//listening port
app.listen(port, () => {
  console.log(`App is listening in port ${port}`);
});
