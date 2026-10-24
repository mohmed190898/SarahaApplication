import { ConflictException, NotFoundException, TooManyRequestsException } from "../../common/exception/error.exception.js"
import { create, findOne } from "../../common/repository/base.repository.js"
import { decryption, encryption } from "../../common/security/encryption.security.js"
import { compare, hash } from "../../common/security/index.js"
import { UserModel } from "../../DB/model/index.js"
import { createLoginCredentials, createToken, userBaseRevokeTokenKey } from "../../common/security/token.security.js"
import { WEB_CLIENT_IDS } from "../../config.js"

import { OAuth2Client } from 'google-auth-library';
import { ProviderEnum } from "../../common/enum/user.gender.js"
import { emailEvent } from "../../common/utils/email/email.event.js"
import { EmailSubjectEnum } from "../../common/enum/email.enum.js"
import { createOtp } from "../../common/utils/otps.js"
import { del, expire, get, incrBy, keys, set, ttl } from "../../common/services/cache.service.js"
import { UserEmailHashedKey, UserEmailHashedTrialsKey } from "../../common/utils/email/send.email.js"

const client = new OAuth2Client();
async function verifyGoogleAccount(idToken) {
    const ticket = await client.verifyIdToken({
        idToken,
        audience: WEB_CLIENT_IDS
    });
    const payload = ticket.getPayload();
    return payload
}
// 
const sendEmailOtp = async ({ email, subject, expiresIn = 120, maxTrials = 3, blockInSeconds = 300 }) => {
    const existOtp_TTL = await ttl({ key: UserEmailHashedKey({ email, subject }) })
    if (existOtp_TTL > 0) {
        throw ConflictException(`cannot send otp as the old one still alive and expires after ${existOtp_TTL}`)
    }
    const oldTrials = await get({ key: UserEmailHashedTrialsKey({ email, subject }) }) ?? 0
    if (oldTrials >= maxTrials) {
        throw TooManyRequestsException("Max OTP trials has been watched")
    }
    const code = createOtp();
    // save the OTP in cache with 2 min TTL
    await set({
        key: UserEmailHashedKey({
            email,
            subject
        }),
        value: await hash(code.toString()),
        ttl: expiresIn
    })
    const currentTrials = await incrBy({ key: UserEmailHashedTrialsKey({ email, subject }) })
    if (currentTrials == maxTrials) {
        await expire({ key: UserEmailHashedTrialsKey({ email, subject }), ttl: blockInSeconds })
    }
    // send the otp to the user email with subject confirm email and the otp code
    emailEvent.emit("sendEmail", {
        recieptions: { to: email },
        subject,
        data: { code }
    })
}
export const requestForgotPasswordCode = async ({ email }) => {
    // check if the account exist 
    const account = await findOne({
        filter: {
            email,
            provide: ProviderEnum.SYSTEM,
            confirmEmail: { $exists: true }
        },
        model: UserModel,
    })
    if (!account) {
        throw NotFoundException("Invalid Account")
    }
    await sendEmailOtp({ email, subject: EmailSubjectEnum.FORGOT_PASSWORD })
    return
}
export const verifyForogotPassword = async ({ email, otp }) => {
    // check if the account exist 
    const account = await findOne({
        filter: {
            email,
            provide: ProviderEnum.SYSTEM,
            confirmEmail: { $exists: true }
        },
        model: UserModel,
    })
    if (!account) {
        throw NotFoundException("Invalid Account")
    }
    // if the account exist get the OTP of the account from cache 
    const otpKey = UserEmailHashedKey({
        email,
        subject: EmailSubjectEnum.FORGOT_PASSWORD
    })
    const hashOtp = await get({ key: otpKey })
    // Compare hashOtp[saved in redis hashed] with the OTP sent by the user[plain text] 
    // if not match throw error
    if (!hashOtp || ! await compare(otp, hashOtp)) {
        throw ConflictException("Invalid Otp")
    }
    // account.confirmEmail = new Date();
    // await account.save();
    // await del({ key: otpKey })
    // await del({ key: UserEmailHashedKey({ email, subject: EmailSubjectEnum.CONFIRM_EMAIL }) })
    return account
}
export const resetPassword = async ({ email, otp, password }) => {
    const account = await verifyForogotPassword({ email, otp })
    account.password = await hash(password);
    account.changeCredentialsTime = new Date();
    await account.save()
    const result = await Promise.all([
        keys({ prefix: userBaseRevokeTokenKey({ userId: account._id }) }),
        keys({ prefix: UserEmailHashedKey({ email, subject: EmailSubjectEnum.FORGOT_PASSWORD }) })
    ])

    await del({
        key: [...result[0], ...result[1]]
    })
    return
}
export const confirmEmail = async ({ otp, email }) => {
    // check if the account exist 
    const account = await findOne({
        filter: {
            email,
            provide: ProviderEnum.SYSTEM,
            confirmEmail: { $exists: false }
        },
        model: UserModel,
    })
    if (!account) {
        throw NotFoundException("Invalid Account")
    }
    // if the account exist get the OTP of the account from cache 
    const otpKey = UserEmailHashedKey({
        email,
        subject: EmailSubjectEnum.CONFIRM_EMAIL
    })
    const hashOtp = await get({ key: otpKey })
    // Compare hashOtp[saved in redis hashed] with the OTP sent by the user[plain text] 
    // if not match throw error
    if (!hashOtp || ! await compare(otp, hashOtp)) {
        throw ConflictException("Invalid Otp")
    }
    account.confirmEmail = new Date();
    await account.save();

    // await del({ keys: otpKey })
    await del({
        key: await keys({ prefix: UserEmailHashedKey({ email, subject: EmailSubjectEnum.CONFIRM_EMAIL }) })
    })
    return
}
export const resendConfirmEmail = async ({ email }) => {
    // check if the account exist 
    const account = await findOne({
        filter: {
            email,
            provide: ProviderEnum.SYSTEM,
            confirmEmail: { $exists: false }
        },
        model: UserModel,
    })
    if (!account) {
        throw NotFoundException("Invalid Account")
    }
    await sendEmailOtp({ email, subject: EmailSubjectEnum.CONFIRM_EMAIL })
    return
}
export const signupWithGmail = async ({ idToken, }, issuer) => {
    const { name, email, picture } = await verifyGoogleAccount(idToken)
    const accountExist = await findOne({
        model: UserModel,
        filter: { email },
    })
    if (accountExist) {
        if (accountExist.provider != ProviderEnum.GOOGLE) {
            throw ConflictException(`Invalid Account Provider`)
        }
        return { status: 200, data: await createLoginCredentials({ user: accountExist, issuer }) }
    }
    const user = await create({
        model: UserModel,
        data: {
            email,
            username: name,
            confirmationMail: new Date(),
            provider: ProviderEnum.GOOGLE,
            image: picture,
        }
    })
    return { status: 201, data: await createLoginCredentials({ user, issuer }) }
}
export const signup = async ({ email, password, username, phone }) => {
    // check if the account exist before if exist throw error with dupliaction
    const duplicatedAccount = await findOne({
        filter: { email },
        model: UserModel,
    })
    if (duplicatedAccount)
        throw ConflictException("Email Exist")
    // if the account not exist create new user and create OTP
    const newUserAccount = await create({
        model: UserModel,
        data: {
            email,
            password: await hash(password),
            username,
            phone: await encryption(phone)
        }
    })
    // create random number As OTP
    sendEmailOtp();
    return newUserAccount
}
export const login = async ({ email, password }, issuer) => {
    const account = await findOne({
        filter: { email, provider: ProviderEnum.SYSTEM, confrimEmail: { $exists: true } },
        model: UserModel,
    })
    if (!account) throw NotFoundException("In-Valid User Credentials")
    const match = await compare(password, account.password)
    if (!match) throw NotFoundException("In-Valid User Credentials")
    account.phone = await decryption(account.phone)

    // create otp and send confiramtion email
    // const code = createOtp();
    // save the OTP in cache with 2 min TTL
    // await sendEmailOtp({ email, subject: EmailSubjectEnum.CONFIRM_EMAIL });
    return await createLoginCredentials({ user: account, issuer })
}
