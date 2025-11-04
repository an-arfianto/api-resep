import express from "express";
import { json, urlencoded } from "body-parser";
const app = express();
const PORT = process.env.PORT || 5000;

require("dotenv").config();

import errorHandler from "./middleware/error";
import userRouter from "./routes/user-router";
import testRouter from "./routes/testRouter";

// set body parser
app.use(json());
app.use(urlencoded({ extended: false }));

// set routing
app.use("/api/user", userRouter);
app.use("/api/test", testRouter);

// set error middleware
app.use(errorHandler);

// buat server nya
app.listen(PORT, () => console.log(`Server running at port: ${PORT}`));
