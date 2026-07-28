// Validates the request body against a zod schema before letting the request continue
const validate = (schema) => (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({ success: false, message: result.error.issues[0]?.message || "Invalid input." });
    }
    req.body = result.data;
    next();
};

export default validate;
