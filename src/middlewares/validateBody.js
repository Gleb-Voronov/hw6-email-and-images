

export const validateBody = (schema) => async (req, res, next) => {
    console.log('REQ.BODY:', req.body);
console.log('REQ.FILE:', req.file);
    try {
        await schema.validateAsync(req.body, { abortEarly: false });
        next();
    } catch (error) {
        return res.status(400).json({
            status: 400,
            message: 'Validation error',
            details: error.details.map(err => err.message),
        });
    }
};