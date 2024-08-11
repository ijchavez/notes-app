const { Router } = require("express");
const router = Router();
const {
  apiRegisterUser,
} = require("../../controllers/api/users.api.controller");

router.post("/register", apiRegisterUser);

module.exports = router;
