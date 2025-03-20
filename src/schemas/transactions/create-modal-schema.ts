import * as yup from 'yup';

export const createModalSchema = yup.object({
  type: yup.string().oneOf([ 'expense', 'income' ]).required('Type is required'),
  date: yup.string().required('Date is required'),
  recurring: yup.string().oneOf([ 'none', 'daily', 'weekly', 'monthly', 'yearly' ]).required('Recurring is required'),
  amount: yup.number().optional(),
  amountCurrency: yup.string().required('Amount currency is required'),
  title: yup.string().required('Title is required'),
  description: yup.string().optional(),
  category: yup.string().optional(),
  tags: yup.array().optional(),
  account: yup.string().optional(),
  image: yup.string().optional(),
  items: yup.array().optional()
});