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
      then: (schema) => schema.required('The password is required'),
      otherwise: (schema) => schema
    })
});