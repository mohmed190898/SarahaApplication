import { z } from "zod";
import { Gender_Enum } from "./enum/user.gender.js";
import { languageeEnum } from "./enum/token.security.js";
import mongoose from "mongoose";

const validationMessages = {
    102: {
        ar: "عفوا يجب ادخال ما لا يقل عن حرفين اثنين",
        en: "min length is 2 charachters"
    }
}
const getValidationMessages = (lang, code) => {
    return lang == languageeEnum.AR ? validationMessages[code].ar : validationMessages[code].en
}

const matchFileds = ({ original, copy, data, ctx, lang }) => {
    if (data[original] != data[copy]) {
        ctx.addIssue({
            code: "custom",
            path: [copy],
            message: lang == languageeEnum.AR ? `فشل التطابق بين كلا من ${original} و ${copy}` : `${original} mismatch with ${copy}`
        })
    }
}

export const generalValidation = {
    email: (lang) => z.email({ message: "Invalid email foramte please insert valid data like example@gmail.com" }),
    password: (lang) => z.string().min(8).max(16),
    username: (lang) => z.string().min(2, { message: getValidationMessages(lang, 102) }),
    phone: (lang) => z.e164(),
    confirmPassword: (lang) => z.string().min(8).max(16),
    gender: (lang) => z.union([z.literal(Gender_Enum.MALE), z.literal(Gender_Enum.FEMALE)]),
    matchFileds,
    otp: (lang) => z.string().regex(/^\d{6}$/, { error: "Invalid Code" }),
    id: (lang) => z.string().refine((data) => { return mongoose.Types.ObjectId.isValid(data) }, { message: "Invalid format" }),
    file: (lang) => z.strictObject({
        fieldname: z.string(),
        originalname: z.string(),
        encoding: z.string(),
        mimetype: z.string(),
        buffer: z.instanceof(Buffer),
        size: z.number(),
        path: z.string(),
    })
}