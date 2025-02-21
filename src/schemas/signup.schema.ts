import * as yup from 'yup';

export const signUpSchema = yup.object({
  name: yup
    .string()
    .min(2, 'Name must be at least 2 characters long')
    .max(50, 'Name cannot exceed 50 characters')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ' ]+$/, 'The name can contain letters and accents')
    .required('The name is required'),
  email: yup
    .string()
    .email('The email is not valid')
    .required('The email is required'),
  password: yup
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .max(100, 'Password cannot exceed 100 characters')
    .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
    .matches(/\d/, 'Password must contain at least one number')
    .matches(/[!@#$%^&*(),.?:{}|<>=]/, 'Password must contain at least one special character !@#$%^&*(),.?:{}|><=')
    .required('Password is required'),
  confirmPassword: yup
    .string()
    .oneOf([ yup.ref('password') ], 'Passwords must match')
    .required('Please confirm your password'),
  terms: yup
    .boolean()
    .oneOf([ true ], 'You must accept the terms and conditions')
});