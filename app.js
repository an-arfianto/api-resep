const express = require("express");
require("dotenv").config();
const bodyParser = require("body-parser");
const errorHandler = require("./middleware/error");
const app = express();
const PORT = process.env.PORT || 5000;

const userRouter = require("./routes/user-router");
const testRouter = require("./routes/testRouter");

// set body parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// set routing
app.use("/api/user", userRouter);
app.use("/api/test", testRouter);

// set error middleware
app.use(errorHandler);

// buat server nya
app.listen(PORT, () => console.log(`Server running at port: ${PORT}`));
