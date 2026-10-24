import { LogoutEnum } from "../../common/enum/token.security.js"
import { ConflictException } from "../../common/exception/error.exception.js"
import { findById, findByIdAndUpdate, findOne, updateOne } from "../../common/repository/base.repository.js"
import { createLoginCredentials, createRevokeToken, createToken, userBaseRevokeTokenKey, userRevokeTokenKey } from "../../common/security/token.security.js"
import { del, keys } from "../../common/services/index.js"
import { ACCESS_TOKEN_EXPIRES_IN, REFRESH_TOKEN_EXPIRES_IN, } from "../../config.js"
import { UserModel } from "../../DB/model/user.model.js"
import { client } from "../../DB/redis.connection.js"

export const profile = async (account) => {
    return account
}
export const update = async (user, data) => {
    const account = await findByIdAndUpdate({
        model: UserModel,
        id: user._id,
        update: data
    })
    return account
}

export const rotateToken = async (payload, user, issuer) => {
    const accessExpiresIn = (payload.iat + ACCESS_TOKEN_EXPIRES_IN) * 1000
    const currentTime = Date.now() + (30 * 60000)

    if (currentTime < accessExpiresIn) {
        throw ConflictException("Sorry we can't create new login credentials while the old one is already not expired")
    }
    const data = await createLoginCredentials({ user, issuer })
    await createRevokeToken({ payload })
    return data;
}
export const logout = async (payload, user, { action = LogoutEnum.DEVICE }) => {
    switch (action) {
        case LogoutEnum.ALL:
            user.changeCredentialsTime = new Date()
            await user.save()

            const prefix = userBaseRevokeTokenKey({ userId: payload.sub })

            await del({ key: await keys({ prefix }) })
            break;
        default:
            await createRevokeToken({ payload })
            break;
    }
    return;
}