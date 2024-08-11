const { Router } = require("express");
const router = Router();
const { signIn } = require("../helpers/jwtauth");

router.post("/api/auth/signin", signIn);

module.exports = router;
