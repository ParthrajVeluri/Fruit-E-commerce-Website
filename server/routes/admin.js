const express = require("express");
const db = require("../db/database");
const multer = require("multer");
const s3 = require("../db/s3");
const { v4: uuidv4 } = require("uuid");
const { MulterError } = require("multer");
const router = express.Router();

//initialize multer storage to store img into directory
/* const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads");
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    },
}); */

//Initialize multer storage to store img into memory
const memStorage = multer.memoryStorage();

//initialize multer for image uplonodads
const imgUpload = multer({
    storage: memStorage,
    limits: {
        fileSize: 5242880,
    },
    fileFilter: (req, file, cb) => {
        const filetypes = ["image/png", "image/jpg", "image/jpeg"];
        if (!filetypes.includes(file.mimetype)) {
            return cb(new Error("Invalid Filetype"));
        }
        return cb(null, true);
    },
}).single("productImg");

router.post("/makeNewProduct", isAdmin, (req, res) => {
    imgUpload(req, res, async (err) => {
        //handle error if something goes wrong with multer
        if (err) {
            if (err.code == "LIMIT_FILE_SIZE") {
                req.flash("productMsg", "File too large!");
            } else {
                req.flash("productMsg", "Only jpeg and png formats allowed");
            }
            res.status(400);
            res.redirect("/admin-products");
        } else {
            const randomImgIdentifier = uuidv4();
            try {
                await s3.uploadToS3(req.file, randomImgIdentifier);
                //if no error, continue to create sql entry
                await db.createNewProduct(
                    req.body.productName,
                    req.body.productPrice,
                    req.body.productQuantity,
                    randomImgIdentifier
                );
                res.status(200);
                req.flash("productMsg", "Success");
                res.redirect("/admin-products");
            } catch (e) {
                console.log(e);
                res.status(400);
                req.flash("productMsg", "Unable to create product entry");
                res.redirect("/admin-products");
            }
        }
    });
});

router.get("/images/:Key", async (req, res) => {
    const imageName = req.params.Key;
    //create readstream to read from s3 bucket

    const readStream = await s3.retrieveFromS3(imageName);
    //send readstream directly to client
    if (readStream) {
        readStream
            .createReadStream()
            .on("error", (e) => {
                console.log(e);
                res.sendStatus(404);
            })
            .pipe(res);
    }
});

router.delete("/deleteProduct/:id", async (req, res) => {
    const productId = req.params.id;
    console.log("Works");
    await db.deleteProduct(productId);
    res.status(200);
    res.send("Success");
});

//route aunthenticator for admin role
function isAdmin(req, res, next) {
    passSess = req.session.passport;
    if (typeof passSess != "undefined") {
        if (passSess.user.role == "admin") {
            return next();
        }
    }
    res.status(403);
    res.redirect(403, "/home");
}

module.exports = { router: router, isAdmin: isAdmin };
