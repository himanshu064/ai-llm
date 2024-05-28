const express = require("express");
const router = new express.Router();
const queryController = require("../controller/query");

router.post("/train", queryController.train);
router.get("/query", queryController.predict);
router.put("/loaddata", queryController.updateCSVFile);

module.exports = router;
