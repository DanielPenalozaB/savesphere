import * as yup from 'yup';

export const createModalSchema = yup.object({
  type: yup.string().oneOf([ 'expense', 'income' ]).required('Type is required'),
  date: yup.string().required('Date is required'),
  recurring: yup.string().oneOf([ 'none', 'daily', 'weekly', 'monthly', 'yearly' ]).required('Recurring is required'),
  amount: yup.number().required('Amount is required'),
  amountCurrency: yup.string().required('Amount currency is required'),
  title: yup.string().required('Title is required'),
  description: yup.string().required('Description is required'),
  category: yup.string().required('Category is required'),
  tags: yup.array().required('Tags are required'),
  account: yup.string().required('Account is required'),
  image: yup.string().required('Image is required')
});