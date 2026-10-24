import jwt from 'jsonwebtoken'
import { ACCESS_ADMIN_TOKEN_SIGNATURE, ACCESS_TOKEN_EXPIRES_IN, ACCESS_USER_TOKEN_SIGNATURE, REFRESH_ADMIN_TOKEN_SIGNATURE, REFRESH_TOKEN_EXPIRES_IN, REFRESH_USER_TOKEN_SIGNATURE } from '../../config.js'
import { BadRequestException, NotFoundException, UnauthorizedException } from '../exception/error.exception.js'
import { findById } from '../repository/base.repository.js'
import { UserModel } from '../../DB/model/user.model.js'
import { TokenTypeEnum } from '../enum/token.security.js'
import { RoleEnum } from '../enum/user.gender.js'
import { exist, set } from '../services/index.js'
import { randomUUID } from 'node:crypto'
import { client } from '../../DB/redis.connection.js'
export const userBaseRevokeTokenKey = ({ userId }) => {
    return `User::${userId.toString()}::RevokeToken`
}
export const userRevokeTokenKey = ({ userId, jti }) => {
    return `${userBaseRevokeTokenKey({ userId })}::${jti}`
}
export const createToken = async ({
    payload = {},
    options = {},
    secret = ACCESS_USER_TOKEN_SIGNATURE
} = {}) => {
    return jwt.sign(payload, secret, options)
}

export const verifyToken = async ({
    authorization = "",
    secret = ACCESS_USER_TOKEN_SIGNATURE
} = {}) => {
    return jwt.verify(authorization, secret)
}

export const getSignatureByType = async ({ role = RoleEnum.USER } = {}) => {
    let signatures;
    switch (role) {
        case RoleEnum.ADMIN:
            signatures = { accessSingature: ACCESS_ADMIN_TOKEN_SIGNATURE, refreshSignature: REFRESH_ADMIN_TOKEN_SIGNATURE };
            break;
        default:
            signatures = { accessSingature: ACCESS_USER_TOKEN_SIGNATURE, refreshSignature: REFRESH_USER_TOKEN_SIGNATURE };
            break;
    }

    return signatures
}

export const getTokenSignature = async ({ tokenType = TokenTypeEnum.ACCESS, role = RoleEnum.USER } = {}) => {


    const signatures = await getSignatureByType({ role })

    const result = tokenType === TokenTypeEnum.ACCESS ? signatures.accessSingature : signatures.refreshSignature

    return result
}

export const decodeToken = async (
    {
        token = "",
        tokenType = TokenTypeEnum.ACCESS
    } = {}) => {

    const decoded = jwt.decode(token)

    if (!decoded?.aud?.length) {
        throw BadRequestException("missing token payload")
    }

    const payload = await verifyToken({
        authorization: token,
        secret: await getTokenSignature({ tokenType, role: decoded.aud[0] })
    })

    if (!payload.sub) {
        throw BadRequestException("missing token payload")
    }

    if (await exist({ key: userRevokeTokenKey({ userId: payload.sub, jti: payload.jti }) })) {
        throw UnauthorizedException("Token has been revoked")
    }

    const user = await findById({
        model: UserModel,
        id: payload.sub
    })
    if (!user) {
        throw NotFoundException("Invalid user")
    }
    if ((user.changeCredentialsTime?.getTime() ?? 0) > payload.iat * 1000) {
        throw UnauthorizedException("Token has been revoked")
    }
    return { user, payload }
}
export const createLoginCredentials = async ({
    user,
    issuer,
    options = {}
} = {}) => {
    const { accessSingature, refreshSignature } = await getSignatureByType({ role: user.role })
    const jwtid = randomUUID()
    const accessToken = await createToken({
        payload: { sub: user._id, jti: jwtid },
        secret: accessSingature,
        options: {
            ...options,
            issuer,
            audience: [user.role],
            expiresIn: ACCESS_TOKEN_EXPIRES_IN
        }
    })
    const refereshToken = await createToken({
        payload: { sub: user._id, jti: jwtid },
        options: {
            ...options,
            issuer,
            audience: [user.role],
            expiresIn: REFRESH_TOKEN_EXPIRES_IN
        },
        secret: refreshSignature
    })
    const userId = user._id
    return { accessToken, refereshToken, userId }
}

export const createRevokeToken = async ({ payload }) => {
    const consumedTime = (Math.ceil(Date.now() / 1000))
    // const refreshExpiresIn = payload.iat + REFRESH_TOKEN_EXPIRES_IN
    const ttl = payload.exp - consumedTime
    // const ttl = refreshExpiresIn - consumedTime
    const key = userRevokeTokenKey({
        userId: payload.sub,
        jti: payload.jti
    })
    await set({ key, value: payload.jti, ttl })
    return;
}