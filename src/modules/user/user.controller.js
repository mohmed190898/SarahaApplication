import { Router } from "express";
import { successResponse } from "../../common/utils/success.response.js";
import { logout, profile, rotateToken, update } from "./user.services.js";
import { authentication } from "../../middleware/authetication.middleware.js";
import { TokenTypeEnum } from "../../common/enum/token.security.js";
import { fileValidation, localFileUpload, } from "../../common/utils/multer/local.multer.js"
import { uploadMiddleWare } from "../../middleware/multer.middleware.js";
const router = Router();
router.patch(
    "/profile-image",
    authentication(),
    uploadMiddleWare({
        isRequired: false,
        multerMiddleWare: localFileUpload({ maxSize: 5 }).single("attachment"),
        customPath: "users",
        validation: fileValidation.image
    }),
    async (req, res, next) => {
        req.user.image = req.file.finalPath;
        await req.user.save()
        return successResponse({ res, data: { user: req.user } })
    })
router.get('/', authentication(), async (req, res, next) => {
    const data = await profile(req.user)
    return successResponse({ res, data })
})
router.patch('/', authentication(), async (req, res, next) => {
    const data = await update(req.user, req.body)
    return successResponse({ res, data })
})

router.post('/rotate-token', authentication(TokenTypeEnum.REFRESH), async (req, res, next) => {
    const data = await rotateToken(req.payload, req.user, `${req.protocol}://${req.host}`)
    return successResponse({ res, data })
})
router.post('/logout', authentication(), async (req, res, next) => {
    const data = await logout(req.payload, req.user, req.body)
    return successResponse({ res, data })
})


export default router;