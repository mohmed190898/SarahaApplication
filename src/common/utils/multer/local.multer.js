import multer from "multer"
import { randomUUID } from 'node:crypto'
import { mkdir, writeFile } from "node:fs/promises"
import { resolve } from "node:path"
import { fileTypeFromBuffer } from 'file-type'
import { BadRequestException } from "../../exception/error.exception.js"
export const fileValidation = {
    image: ['image/jpeg', 'image/png', 'image/gif'],
    files: ['applictaion/pdf', 'applictaion/json']
}
export const localFileUpload = ({ maxSize = 5 } = {}) => {
    const storage = multer.memoryStorage({
    })
    return multer({ storage, limits: { fileSize: maxSize * 1024 * 1024 } })
}

export const processFile = async ({ customPath = "general", file, validation = [] }) => {
    const result = await fileTypeFromBuffer(file.buffer)
    if (!result || !validation.includes(result.mime)) {
        throw BadRequestException("Invalid File Format")
    } else {
        await mkdir(resolve(`./assets/${customPath}`), { recursive: true })
        const uniqeFilePath = `assets/${customPath}/${randomUUID()}.${result.ext}`
        await writeFile(resolve(`./${uniqeFilePath}`), file.buffer)
        file.path = uniqeFilePath
        return file
    }
}

export const processFiles = async ({ customPath, files = [], validation = [] }) => {
    const assets = []
    for (const file of files) {
        const uploadFile = await processFile({ customPath, file, validation })
        assets.push(uploadFile)
    }
    return assets
}

export const processFields = async ({ customPath, fields = [], validation = [] }) => {
    const assets = []
    for (const field of Object.keys(fields)) {
        const files = await processFiles({ customPath, files: fields[field] }, validation)
        assets.push({ field, files })

    }
    return assets
}
export const processMulterUpload = async ({ req, customPath = "general", validation = [] }) => {
    if (req.file) {
        await processFile({ customPath, file: req.file, validation })
    }
    else if (Array.isArray(req.files)) {
        await processFiles({ customPath, files: req.files, validation })
    }
    else if (typeof req.files == "object" && Object.keys(req.files ?? {})?.length) {
        await processFields({ customPath, fileds: req.files, validation })
    }
}




































// export const processFile = ({ validation = [] }) => {
//     const filePath = resolve(`./ ${ req.file.path }`)
//     const readFileBuffer = await readFile(filePath);
//     const fileType = await fileTypeFromBuffer(readFileBuffer)
//     if (!fileType || !validation.includes(fileType.mimeType)) {
//         await unlink(filePath)
//         next(new Error("Invalid Format ", cause: { status: 400 }))
//     }
//     next();
// }