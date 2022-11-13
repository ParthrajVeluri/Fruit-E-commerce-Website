const express = require("express");
const db = require("../db/database");
const bcrypt = require("bcrypt");
const path = require("path");
const router = express.Router();
const passport = require("passport");

const initializePassport = require("../../passportconfig");
const e = require("express");

initializePassport(passport, db.getCustomerByUsername);

router.use(express.json());
router.use(express.urlencoded({ extended: true }));

//retrieve all customer info stored in database
router.get("/", async (req, res) => {
    try {
        let results = await db.getAll();
        res.json(results);
    } catch (error) {
        res.sendStatus(500);
        console.log(error);
    }
});

//Create a new customer and insert info into database
router.post("/register", async (req, res) => {
    try {
        //Password encryption
        const hashedPass = await bcrypt.hash(req.body.pass, 10);

        //sql entry for customer creation
        await db.createCustomer(req.body.user, hashedPass);

        console.log(
            `created customer with username ${req.body.user} and pass ${hashedPass}`
        );
        res.status(200);
        req.flash("registerMsg", "Success");
        res.redirect("/register");
    } catch (error) {
        //duplicate entry into sql 
        if (error.code === "ER_DUP_ENTRY") {
            req.flash("registerMsg", "Username already taken");
            res.status(401);
            res.redirect("/register");
        }
        //data exceeds sql field capacity
        else if (error.code === "ER_DATA_TOO_LONG") {
            req.flash(
                "registerMsg",
                "Character limit for username and password is 50 and 100 respectively"
            );
            res.status(401);
            res.redirect("/register");
        } else {
            req.flash("registerMsg", "Registration failed for unknown reasons");
            res.status(501);
            res.redirect("/register");
            console.log(error);
        }
    }
});

//logs user out of passport session
router.post("/logout", (req, res, next) => {
    req.logOut((err) => {
        if (err) {
            return next(err);
        }
        res.redirect("/login");
    });
});

//authenticates user into passport session
router.post(
    "/login",
    passport.authenticate("local", {
        failureRedirect: "/login",
        failureFlash: true,
    }),
    (req, res) => {
        if (req.user.role === "admin") {
            res.redirect("/admin");
        } else {
            res.redirect("/home");
        }
    }
);

//role authentication for any user (user/admin)
function executeIfAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    return res.redirect("/login");
}

//role authentication for any user (user/admin)
function executeIfNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect("/home");
    }
    return next();
}

module.exports = {
    router: router,
    executeIfNotAuthenticated: executeIfNotAuthenticated,
    executeIfAuthenticated: executeIfAuthenticated,
};
