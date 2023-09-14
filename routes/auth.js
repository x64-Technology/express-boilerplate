const express = require("express");
const authModel = require("../schemas/auth")
const jwt = require("jsonwebtoken");
const bcryptjs = require('bcryptjs');

const router = express.Router()

router
    .get("/signin", async (req, res) => {
        res.render("signin", { message: req.query.message })
    })
    .post("/signin", async (req, res) => {
        const { email, password } = req.body;

        if (email == "" || password == "")
            return res.redirect("/auth/signin?message=" + encodeURIComponent("email and password required")) // send query parameters of error

        const exist = await authModel.findOne({ email: email })
            .select("password").lean().exec()

        if (!exist) return res.redirect("/auth/signin?message=" + encodeURIComponent("account didn't exists")) // error with no account

        if (await bcryptjs.compare(password, exist.password)) {

            const token = jwt.sign({ _id: exist._id }, process.env.TOKEN_SECRET)

            res.cookie(process.env.COOKIES_NAME, token,
                {
                    expires: new Date(Date.now() + 1800000),
                    httpOnly: true
                })
            res.redirect("/")
        } else res.redirect("/auth/signin?message=" + encodeURIComponent("wrong password")) // error with wrong password
    });


router
    .get("/signup", async (req, res) => {
        res.render("signup")
    })
    .post("/signup", async (req, res) => {
        const cread = { name, email, password } = req.body;

        if (name == "" || email == "" || password == "")
            return res.redirect("/auth/signup?message=" + encodeURIComponent("all fields are required")) // send query parameters of error

        const exist = await authModel.findOne({ email: email }).lean().exec()

        if (exist) return res.redirect("/auth/signup?message=" + encodeURIComponent("email alredy taken")) // send query parameters of error

        cread.password = await bcryptjs.hash(cread.password, 1); // change salt rounds acordingly 

        const newUser = await authModel.create(cread)

        console.log(newUser);

        if (newUser) {
            const token = jwt.sign({ _id: newUser._id }, process.env.TOKEN_SECRET)

            res.cookie(process.env.COOKIES_NAME, token,
                {
                    expires: new Date(Date.now() + 1800000),
                    httpOnly: true
                })
            res.redirect("/")
        } else res.redirect("/auth/signup?message=" + encodeURIComponent("something went wrong"))
    })

    .get("/signup", async (req, res) => {
        res.clearCookie(process.env.COOKIES_NAME)
    })


module.exports = router;