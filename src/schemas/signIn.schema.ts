import * as yup from 'yup';

export const signInSchema = yup.object({
  email: yup
    .string()
    .email('The email is not valid')
    .required('The email is required'),
  password: yup
    .string()
    .when('$enabledPassword', {
      is: true,
      then: (schema) => schema
        .min(8, 'Password must be at least 8 characters long')
        .max(100, 'Password cannot exceed 100 characters')
        .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
        .matches(/\d/, 'Password must contain at least one number')
        .matches(/[!@#$%^&*(),.?:{}|<>=]/, 'Password must contain at least one special character !@#$%^&*(),.?:{}|><=')
        .required('The password is required'),
      otherwise: (schema) => schema
    })
});