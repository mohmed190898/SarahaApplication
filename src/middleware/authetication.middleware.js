import { TokenTypeEnum } from "../common/enum/token.security.js";
import { UnauthorizedException } from "../common/exception/error.exception.js";
import { decodeToken } from "../common/security/token.security.js";

export const bearerAuth = async ({ req, tokenType = TokenTypeEnum.ACCESS } = {}) => {
    const [key, credential] = req.headers["authorization"]?.split(" ") || []
    const { user, payload } = await decodeToken({ token: credential, tokenType: tokenType })
    req.user = user;
    req.payload = payload
}
export const authentication = (tokenType = TokenTypeEnum.ACCESS) => {
    return async (req, res, next) => {
        const { authorization } = req.headers;
        if (!authorization) throw UnauthorizedException("Unauthorized Account")

        const [prefix, token] = authorization.split(" ")

        switch (prefix) {
            case "Bearer":
                await bearerAuth({ req, tokenType })
                break;
            case "Basic":
            // const [email,password] = Buffer.from(payload,'base64').toString()?.split(":")
            // req.user = await basicAuth
            // break;
            default:
                break;
        }
        const { user, payload } = await decodeToken({ token, tokenType });
        req.user = user
        req.payload = payload
        next()
    }
}