import { BadRequestException } from "../common/exception/error.exception.js"
import { processMulterUpload } from "../common/utils/multer/local.multer.js"

export const uploadMiddleWare = ({ isRequired = true, multerMiddleWare, customPath = "general", validation = [] }) => {
    return async (req, res, next) => {
        multerMiddleWare(req, res, async (error) => {
            if (error) {
                next(new Error(error.message, { cause: { status: 400 } }))
                return
            }
            if (isRequired
                && (
                    !req.file &&
                    !(Array.isArray(req.files) && req.files.length) &&
                    !(typeof req.files == "object" && Object.keys(req.files)?.length)
                )) {
                next (BadRequestException(`file is required`))
                return;
            }
            try {
                await processMulterUpload({ customPath, validation, req })
                next()
            } catch (error) {
                throw error
            }
        })
    }
}