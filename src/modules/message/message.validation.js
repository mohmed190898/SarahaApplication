import { z } from 'zod'
import mongoose from 'mongoose'
import { generalValidation } from '../../common/validation.js'

export const createMessage = (lang) => {
    return z.object({
        body: z.strictObject({
            content: z.string().min(2).max(50000),
            receiverId: generalValidation.id(lang)
        }),
        files: z.array(generalValidation.file(lang)).max(3)
    }).superRefine((data, ctx) => {
        if (!data.body.content && !data.files?.length) {
            ctx.addIssue({
                code: "custom",
                path: ['content'],
                message: "missing message content"
            })
        }
    })
}

export const allMessage = (lang) => {
    return z.object({
        query: z.strictObject({
            type: z.enum(["0", "1", "2"]).default("0"),
            search: z.string().optional(),
            page:z.coerce.number().default(1),
            limit:z.coerce.number().default(5),
            
        }),
    })
}
export const deleteMessage = (lang) => {
    return z.object({
        params: z.strictObject({
            messageId: generalValidation.id(lang) 
        }),
    })
}