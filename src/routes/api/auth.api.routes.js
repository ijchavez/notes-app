const { Router } = require("express");
const router = Router();
const { signin } = require("../../controllers/api/auth.api.controller");

router.post("/signin", signin);

module.exports = router;
