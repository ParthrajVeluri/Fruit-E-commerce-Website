if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}
const express = require("express");
const admin = require("./routes/admin");
const users = require("./routes/users");
const passport = require("passport");
const override = require("method-override");
const flash = require("express-flash");
const session = require("express-session");
const db = require("./db/database");

//initialize express
const app = express();
app.set("view engine", "ejs");

//middleware stack
app.use(express.urlencoded({ extended: false }));
app.use(flash());
app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
    })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(express.json());
app.use("/admin", admin.router);
app.use("/users", users.router);
app.use(override("_method"));

//rendering pages
app.get("/home", (req, res) => {
    res.render("home", { user: getLoggedInUser(req) });
});

app.get("/register", users.executeIfNotAuthenticated, (req, res) => {
    res.render("register", { message: req.flash("registerMsg"), user: "" });
});

app.get("/login", users.executeIfNotAuthenticated, (req, res) => {
    res.render("login", { user: "" });
});

app.get("/products", async (req, res) => {
    allProducts = await db.getAllProducts();
    res.render("products", { user: getLoggedInUser(req), allProducts: allProducts });
});

app.get("/success", (req, res) => {
    res.render("success");
});

app.get(
    "/admin",
    admin.isAdmin,
    users.executeIfAuthenticated,
    async (req, res) => {
        getAll = await db.getAllUsers();
        res.render("admin", { allUsers: getAll });
    }
);

app.get(
    "/admin-products",
    admin.isAdmin,
    users.executeIfAuthenticated,
    async (req, res) => {
        allProducts = await db.getAllProducts();
        res.render("admin-products", {
            allProducts: allProducts,
            message: req.flash("productMsg"),
        });
    }
);

//returns the username of the user if logged in
function getLoggedInUser(req) {
    if (typeof req.session.passport != "undefined") {
        return req.session.passport.user.username;
    }
}

app.listen(process.env.PORT || "5500", () => {
    console.log(`Server is running on PORT: ${process.env.PORT || "5500"}`);
});
