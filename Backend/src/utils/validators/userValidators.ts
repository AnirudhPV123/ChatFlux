import Joi from 'joi';

const email = Joi.string().email().required();
const password = Joi.string()
  .min(8)
  .message('Password must be at least 8 characters')
  .pattern(/[0-9!@#$%^&*(),.?":{}|<>]/)
  .message('Password must contain at least one number or symbol')
  .pattern(/[a-zA-Z]/)
  .message('Password must contain at least one letter')
  .required()
  .messages({
    'any.required': 'Password is required',
  });

  // const password = Yup.string()
  //   .min(8, 'Password must be at least 8 characters')
  //   .matches(/[0-9!@#$%^&*(),.?":{}|<>]/, 'Password must contain at least one number or symbol')
  //   .matches(/[a-zA-Z]/, 'Password must contain at least one letter')
  //   .required('Password is required');

const signUpGenerateOtpValidator = Joi.object({
  username: Joi.string().min(4).required(),
  email,
  password,
  dateOfBirth: Joi.date().iso().required(),
  gender: Joi.string().valid('male', 'female', 'other').required(),
});

const emailAndPasswordValidator = Joi.object({
  email,
  password,
});

const emailAndOtpValidator = Joi.object({
  email,
  otp: Joi.string().length(6).required(),
});

const forgotPasswordGenerateOtpValidator = Joi.object({
  email,
});


export {
  emailAndPasswordValidator,
  signUpGenerateOtpValidator,
  emailAndOtpValidator,
  forgotPasswordGenerateOtpValidator,
};
