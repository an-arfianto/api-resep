const express = require("express");
require("dotenv").config();
const bodyParser = require("body-parser");
const userRouter = require("./routes/user-router");
const errorHandler = require("./middleware/error");
const app = express();
const PORT = process.env.PORT || 5000;

// set body parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// set routing
app.use("/api/user", userRouter);

// set error middleware
app.use(errorHandler);

// buat server nya
app.listen(PORT, () => console.log(`Server running at port: ${PORT}`));
