const express = require("express");
const cors = require("cors");
const recipesRouter = require("./routes/recipesRoutes");

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL }));
app.use(express.json());

app.use("/api/recipes", recipesRouter);

module.exports = app;