require("dotenv").config()
const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const path = require("path")
const hbs = require("hbs")
const logger = require("morgan");
const connectDB = require("./configs/database");


const port = process.env.PORT || 5000

const app = express();

app.use(express.json());
app.use(cookieParser())
app.use(
    express.urlencoded({
        extended: false,
    })
);

app.use(logger("dev"));

app.set('views', path.join(__dirname, "views"))
app.set('view engine', 'hbs')
hbs.registerPartials(path.join(__dirname, "views/partials"))

connectDB()

app.use("/", require("./routes/home"))
app.use("/auth", require("./routes/auth"))

mongoose.connection.once("open", () => {
    console.log("connected to database");
    app.listen(port, () => {
        console.log(`server started on ${port}`);
    });
})

mongoose.connection.on("error", (error) => {
    console.log(error);
})
