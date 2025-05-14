const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const { authLimiter } = require('../middleware/rateLimiter');
const {
    registerValidation,
    loginValidation,
    refreshTokenValidation,
    requestPasswordResetValidation,
    resetPasswordValidation,
    changePasswordValidation
} = require('../validations/authValidations');

// Apply rate limiter to all auth routes
router.use(authLimiter);

// Public routes
router.post('/register', validate(registerValidation), authController.register);
router.post('/login', validate(loginValidation), authController.login);
router.post('/refresh-token', validate(refreshTokenValidation), authController.refreshToken);
router.post('/request-password-reset', validate(requestPasswordResetValidation), authController.requestPasswordReset);
router.post('/reset-password', validate(resetPasswordValidation), authController.resetPassword);

// Protected routes
router.get('/profile', verifyToken, authController.getProfile);
router.post('/change-password', verifyToken, validate(changePasswordValidation), authController.changePassword);

module.exports = router;
