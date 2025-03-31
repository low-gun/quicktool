// backend/routes/cloudUpload/index.js
const express = require("express");
const router = express.Router();

const cloudDropbox = require("./cloudUploadDropbox");
const cloudGoogle = require("./cloudUploadGoogleDrive");
const cloudOneDrive = require("./cloudUploadOneDrive");

// /api/cloud/dropbox
router.use("/dropbox", cloudDropbox);
// /api/cloud/google-drive
router.use("/google-drive", cloudGoogle);
// /api/cloud/one-drive
router.use("/one-drive", cloudOneDrive);

module.exports = router;
