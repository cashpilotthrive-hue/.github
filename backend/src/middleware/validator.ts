import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain, body } from 'express-validator';

export const validate = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // Execute all validations
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    res.status(400).json({
      error: 'Validation failed',
      details: errors.array().map(err => ({
        field: err.type === 'field' ? err.path : undefined,
        message: err.msg,
      })),
    });
  };
};

// KYC submission validation
export const validateKYCSubmission = validate([
  body('documentType')
    .isIn(['passport', 'drivers_license', 'national_id'])
    .withMessage('Invalid document type'),
  body('documentFrontUrl')
    .isURL()
    .withMessage('Valid document front URL is required'),
  body('selfieUrl')
    .isURL()
    .withMessage('Valid selfie URL is required'),
  body('fullName')
    .trim()
    .notEmpty()
    .withMessage('Full name is required')
    .isLength({ min: 2, max: 200 })
    .withMessage('Full name must be between 2 and 200 characters'),
  body('dateOfBirth')
    .isDate()
    .withMessage('Valid date of birth is required'),
  body('country')
    .trim()
    .notEmpty()
    .withMessage('Country is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Country must be between 2 and 100 characters'),
  body('address')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Address must not exceed 500 characters'),
  body('city')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('City must not exceed 100 characters'),
  body('postalCode')
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage('Postal code must not exceed 20 characters'),
]);
