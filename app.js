const express = require("express");
const insightsRouter = require("./routes/insightsRoutes");

const app = express();

app.use(express.json());
app.use("/api/insights", insightsRouter);


module.exports = app;