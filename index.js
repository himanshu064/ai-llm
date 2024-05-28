require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const queryRouter = require("./router/query");
app.use(express.urlencoded({ extended: false }));

const PORT = 3000;
app.use(cors());
app.use(express.json());
app.use("/", queryRouter);
app.use((req, res) => {
  res.send("invalid endpoint please check http method and url");
});
app.listen(PORT, () => {
  console.log(`Listening to port ${PORT}`);
});
