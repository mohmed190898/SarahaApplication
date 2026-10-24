import { Router } from "express";
import { successResponse } from "../../common/utils/success.response.js";
import { createMessage, deleteMessage, getAllMessages, getMessageById } from "./message.service.js";
import { uploadMiddleWare } from "../../middleware/multer.middleware.js";
import { fileValidation, localFileUpload } from "../../common/utils/multer/local.multer.js";
import { authentication, bearerAuth } from "../../middleware/authetication.middleware.js";
import { validation } from "../../middleware/validation.middleware.js";
import * as validators from './message.validation.js'

export const router = Router()
const messageFolderName = "messages"
router.post('/',
    async (req, res, next) => {
        if (req.headers['authorization']) {
            await bearerAuth({ req });
        }
        next()
    },
    uploadMiddleWare({
        multerMiddleWare: localFileUpload().any("attachments", 3),
        validation: fileValidation.image,
        customPath: messageFolderName,
        isRequired: false
    }),
    validation(validators.createMessage)
    ,
    async (req, res, next) => {
        const data = await createMessage(req.body, req.files, req.user)
        return successResponse({ res, status: 201, data })
    })


router.get('/',
    authentication(),
    validation(validators.allMessage),
    async (req, res, next) => {
        const data = await getAllMessages(req.validate.query, req.user)
        return successResponse({ res, status: 200, data })
    })
router.delete('/:messageId',
    authentication(),
    validation(validators.deleteMessage),
    async (req, res, next) => {
        const data = await deleteMessage(req.validate.params, req.user)
        return successResponse({ res, status: 200, data })
    })
router.get('/:messageId',
    authentication(),
    validation(validators.deleteMessage),
    async (req, res, next) => {
        const data = await getMessageById(req.validate.params, req.user)
        return successResponse({ res, status: 200, data })
    })

export default router