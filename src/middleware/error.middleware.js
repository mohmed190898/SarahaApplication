export const globalErrorHandeling = (error, req, res, next) => {
    return res.status(error.cause?.status ?? 500).json({
        error_message: error.message || 'server error',
        error,
        cause: error.cause,
        stack: process.env.NODE_ENV === "production" ? undefined : error.stack
    })
} 