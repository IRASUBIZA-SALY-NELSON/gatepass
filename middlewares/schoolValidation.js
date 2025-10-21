import { body, param, query, validationResult } from 'express-validator';

export function validate(rules) {
  return [
    ...rules,
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
      next();
    },
  ];
}

export const visitingDayCreate = validate([
  body('date').isISO8601().toDate(),
  body('description').optional().isString().trim().isLength({ max: 200 }),
]);

export const visitingDayUpdate = validate([
  param('id').isMongoId(),
  body('date').optional().isISO8601().toDate(),
  body('description').optional().isString().trim().isLength({ max: 200 }),
]);

export const idParam = validate([param('id').isMongoId()]);

export const visitsListQuery = validate([
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('status').optional().isIn(['pending_payment','confirmed','rejected','checked_in','cancelled']),
  query('studentId').optional().isString().trim(),
  query('from').optional().isISO8601().toDate(),
  query('to').optional().isISO8601().toDate(),
]);

export const approveVisitValidation = validate([
  param('visitId').isString().trim(),
  body('notes').optional().isString().isLength({ max: 500 }),
]);

export const rejectVisitValidation = validate([
  param('visitId').isString().trim(),
  body('reason').isString().isLength({ min: 3, max: 500 }),
]);

export const settingsUpdateValidation = validate([
  body('name').optional().isString().trim(),
  body('apiUrl').optional().isURL(),
  body('apiKey').optional().isString(),
  body('studentDataMethod').optional().isIn(['api','csv']),
]);

export const addSecurityUserValidation = validate([
  body('name').isString().trim().notEmpty(),
  body('email').isEmail().normalizeEmail(),
  body('phone').isString().trim().notEmpty(),
  body('password').isString().isLength({ min: 8 }),
]);

export const editSchoolUserValidation = validate([
  param('userId').isMongoId(),
  body('name').optional().isString().trim().notEmpty(),
  body('email').optional().isEmail().normalizeEmail(),
  body('phone').optional().isString().trim().notEmpty(),
]);

export const changePasswordValidation = validate([
  body('oldPassword').isString().notEmpty(),
  body('newPassword').isString().isLength({ min: 8 }),
]);
