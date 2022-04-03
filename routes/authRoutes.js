const { Router } = require('express');

const authController = require('../controller/authController.js')

const router = Router();

router.post('/login',  authController.login);
router.get('/logout',  authController.logout);
router.post('/signup', authController.signup)

module.exports = router;