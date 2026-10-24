import { BadRequestException } from "../common/exception/error.exception.js";

export const validation = (schema) => {
    return (req, res, next) => {
        const lang = req.headers["accept-language"]
        const validationResult = schema(lang).safeParse({
            body: req.body,
            query: req.query,
            params: req.params,
            files: req.files,
            file: req.file
        });
        
        
        if (!validationResult.success) {
            throw BadRequestException({ message: "Validaiton Error", extra: validationResult.error.issues })
        }
        req.validate = validationResult.data
        next()
    }
}