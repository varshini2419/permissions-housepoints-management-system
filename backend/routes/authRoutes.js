const express = require("express");
const router = express.Router();

const {
  loginStudent,
  loginFaculty,
  loginHod,
  register,
} = require("../controllers/authController");

router.post("/login/student", loginStudent);
router.post("/login/faculty", loginFaculty);
router.post("/login/hod", loginHod);
router.post("/register", register);

module.exports = router;