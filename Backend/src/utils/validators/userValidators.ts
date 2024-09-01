import Joi from 'joi';

const email = Joi.string().email().required();
const password = Joi.string()
  .min(6)
  .regex(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[\W_]).*$/) // regex for uppercase, lowercase, number, and special character
  .required()
  .messages({
    'string.min': 'Password must be at least 6 characters long',
    'string.pattern.base':
      'Password must contain at least one uppercase letter, one number, and one special character',
    'any.required': 'Password is required',
  });

const registerValidatorSchema = Joi.object({
  username: Joi.string().min(3).required(),
  email,
  password,
});

const loginValidatorSchema = Joi.object({
  email,
  password,
});

export { registerValidatorSchema, loginValidatorSchema };
