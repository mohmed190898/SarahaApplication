import { EventEmitter } from 'node:events'
import { sendEmail } from './send.email.js';
import { verifyEmailTemplate } from './email.templates.js';

export const emailEvent = new EventEmitter();

emailEvent.on("sendEmail", async ({recieptions , subject , data}) => {
    try {
        await sendEmail({
            ...recieptions,
            subject,
            html:verifyEmailTemplate({code:data.code , title:subject})
        })
    } catch (error) {
    }
})
