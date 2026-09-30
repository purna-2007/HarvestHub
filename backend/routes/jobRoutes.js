const express = require("express");
const router = express.Router();
const jobController = require("../controllers/jobController");

router.post("/create", jobController.createJob);
router.get("/feed", jobController.getNearbyJobs);

module.exports = router;
