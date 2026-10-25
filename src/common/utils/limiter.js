import { ipKeyGenerator, rateLimit } from 'express-rate-limit'
import geoip from 'geoip-lite';
import { successResponse } from './success.response.js';
import { client } from '../../DB/redis.connection.js';
function fromWhere(ip) {
    try {
        return geoip.lookup(ip)
    } catch (error) {
        console.log(error)
    }
}
export const generateLimiter = ({
    ttl = 15,
    message = "Too Many Requsets",
    status = 429,
    legacyHeaders = true,
    standardHeaders = "draft-8",
    skipSuccessfulRequests,
    skipFailedRequests,
    limit = 1000
}) => {
    return rateLimit({
        windowMs: ttl * 60 * 1000,
        limit: function (req) {
            const data = fromWhere(req.ip);
            // if many countries use switch statemnets
            return data?.country == "EG" ? limit : 0
        },
        legacyHeaders,
        standardHeaders,
        skipSuccessfulRequests,
        skipFailedRequests,
        handler: function (req, res, next) {
            return successResponse({ res, message, status })
        },
        keyGenerator: function (req) {
            const ip = ipKeyGenerator(req.ip, 52)
            return `${ip}::${req.path}`
        },
        store: {
            async incr(key, cb) {
                try {
                    const count = await client.incr(key)
                    if (count == 1) {
                        await client.expire(key, ttl * 60)
                    }
                    cb(null, count)
                } catch (error) {
                    cb(error)
                }
            },
            async decrement(key) {
                if (await client.exists(key)) {
                    await client.decr(key)
                }
            },
        }
    })
} 