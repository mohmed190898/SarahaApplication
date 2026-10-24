import { Router } from "express";
import { confirmEmail, login, requestForgotPasswordCode, resendConfirmEmail, resetPassword, signup, signupWithGmail, verifyForogotPassword } from "./authentication.service.js";
import * as validators from './authentication.validation.js'
import { successResponse } from "../../common/utils/success.response.js";
import { validation } from "../../middleware/validation.middleware.js";
import { generateLimiter } from "../../common/utils/limiter.js";
import { del } from "../../common/services/cache.service.js";
const router = Router();


router.post("/signup", validation(validators.signupSchema), async (req, res, next) => {
    
    const data = await signup(req.validate.body)
    return successResponse({ res, status: 201, data })
})
router.patch("/confirm-email", validation(validators.confirmEmail), async (req, res, next) => {
    const data = await confirmEmail(req.validate.body)
    return successResponse({ res, status: 201, data })
})
router.post("/request-forogot-password-code", validation(validators.resendConfirmEmail), async (req, res, next) => {
    const data = await requestForgotPasswordCode(req.validate.body)
    return successResponse({ res, status: 201, data })
})
router.post("/verify-forogot-password", validation(validators.confirmEmail), async (req, res, next) => {
    const data = await verifyForogotPassword(req.validate.body)
    return successResponse({ res, status: 200, data })
})
router.patch("/reset-password", validation(validators.resetPassword), async (req, res, next) => {
    const data = await resetPassword(req.validate.body)
    return successResponse({ res, status: 200, data })
})
router.patch("/resend-confirm-email", validation(validators.resendConfirmEmail), async (req, res, next) => {
    const data = await resendConfirmEmail(req.validate.body)
    return successResponse({ res, status: 200, data })
})
const loginLimiter = generateLimiter({ttl:15,limit:5,skipSuccessfulRequests:true})
router.get("/login",loginLimiter ,validation(validators.login), async (req, res, next) => {
    const data = await login(req.validate.body, `${req.protocol}://${req.host}`)
    await del({key:req.rateLimit.key})
    return successResponse({ res, status: 200, data })
})
router.post("/signup-with-gmail", async (req, res, next) => {

    const { status, data } = await signupWithGmail(req.body, `${req.protocol}://${req.host}`)
    return successResponse({ res, status, data })
})


export default router;