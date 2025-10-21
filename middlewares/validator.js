import { body, validationResult, param, query } from 'express-validator';

export function validate(rules) {
    return [
        ...rules,
        (req, res, next) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ success: false, errors: errors.array() });
            }
            next();
        },
    ];
}

const USER_TYPES = ['parent', 'school_admin', 'security', 'system_admin'];

export const registerValidation = validate([
    body('userType').isString().isIn(USER_TYPES).withMessage('Invalid userType'),
    body('name').isString().trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('phone').isString().trim().notEmpty().withMessage('Phone is required'),
    body('password').isString().isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('schoolId').optional().isMongoId().withMessage('schoolId must be a valid ObjectId'),
    body('linkedStudents').custom((value, { req }) => {
        if (req.body.userType === 'parent') {
            if (value === undefined) return true; // optional
            if (!Array.isArray(value)) throw new Error('linkedStudents must be an array');
            const allStrings = value.every((s) => typeof s === 'string');
            if (!allStrings) throw new Error('linkedStudents must be an array of strings');
        } else if (value !== undefined) {
            throw new Error('linkedStudents is only allowed for parent userType');
        }
        return true;
    }),
]);

export const loginValidation = validate([
    body('identifier')
        .isString()
        .trim()
        .notEmpty()
        .withMessage('identifier (email or phone) is required'),
    body('password').isString().notEmpty().withMessage('Password is required'),
]);

// Users: list query validation
export const listUsersValidation = validate([
    query('page').optional().isInt({ min: 1 }).withMessage('page must be integer >= 1'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit must be between 1 and 100'),
    query('userType').optional().isIn(USER_TYPES).withMessage('invalid userType'),
]);

// Users: id param validation
export const idParamValidation = validate([
    param('id').isMongoId().withMessage('Invalid user id'),
]);

// Users: update body validation
export const updateUserValidation = validate([
    body('userType').optional().isIn(USER_TYPES).withMessage('Invalid userType'),
    body('name').optional().isString().trim().notEmpty().withMessage('Name must be non-empty string'),
    body('email').optional().isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('phone').optional().isString().trim().notEmpty().withMessage('Phone must be non-empty string'),
    body('schoolId').optional({ nullable: true }).custom((v) => v === null || /^[a-f\d]{24}$/i.test(v)).withMessage('schoolId must be ObjectId or null'),
    body('linkedStudents').optional().custom((value, { req }) => {
        if (value === undefined) return true;
        if (!Array.isArray(value)) throw new Error('linkedStudents must be an array');
        const allStrings = value.every((s) => typeof s === 'string');
        if (!allStrings) throw new Error('linkedStudents must be an array of strings');
        return true;
    }),
]);

// Users: bulk delete validation
export const bulkDeleteValidation = validate([
    body('ids').isArray({ min: 1 }).withMessage('ids must be a non-empty array'),
    body('ids.*').isMongoId().withMessage('each id must be a valid ObjectId'),
]);
