'use client';

import { Button, Checkbox, Input } from '@/components';
import { ArrowIcon, Doodle, GoogleIcon } from '@/icons';
import { signUpSchema } from '@/schemas';
import { useFormik } from 'formik';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useState } from 'react';

interface OnSubmitProps {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  terms: boolean;
}

const initialValue = {
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  terms: false
};

export default function SignUp() {
  const t = useTranslations('auth.signup');

  const [ isLoading, setIsLoading ] = useState(false);

  const onSubmit = (values: OnSubmitProps) => {
    setIsLoading(true);
    console.log(values);

    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  };

  const {
    handleSubmit,
    errors,
    touched,
    values,
    handleBlur,
    handleChange,
    submitForm,
    isValid
  } = useFormik({
    initialValues: initialValue,
    initialErrors: { ...initialValue, terms: 'true' },
    validationSchema: signUpSchema,
    validateOnChange: true,
    onSubmit
  });

  return (
    <>
      <title>{t('meta.title')}</title>
      <div className="relative flex min-h-screen items-center justify-center p-4">
        <div className="absolute -left-10 top-0 z-0 flex bg-blue-100 dark:bg-[#111111]">
          <div className='absolute inset-0 z-0 bg-gradient-to-l from-white from-20% to-transparent dark:from-dark' />
          <Doodle className="flex w-32 flex-col" />
          <Doodle className="flex w-32 flex-col-reverse" />
        </div>
        <div className="z-10 flex w-full max-w-md flex-col">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-extrabold text-neutral-900 dark:text-neutral-200">{t('title')}</h2>
            <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
              {t('message')}
            </p>
          </div>
          <form className="mt-8 flex flex-col gap-3" onSubmit={handleSubmit}>
            <Input
              id="name"
              name="name"
              type="text"
              placeholder={t('form.namePlaceholder')}
              className='disabled:select-none'
              value={values.name}
              onChange={handleChange}
              onBlur={handleBlur}
              label={t('form.name')}
              autoFocus
              required
              isInvalid={Boolean(errors.name) && Boolean(touched.name)}
            />
            <Input
              id="email"
              name="email"
              type="email"
              placeholder={t('form.emailPlaceholder')}
              className='disabled:select-none'
              value={values.email}
              onChange={handleChange}
              onBlur={handleBlur}
              label={t('form.email')}
              autoComplete="email"
              required
              isInvalid={Boolean(errors.email) && Boolean(touched.email)}
            />
            <Input
              id="password"
              name="password"
              type="password"
              placeholder={t('form.passwordPlaceholder')}
              className='disabled:select-none'
              value={values.password}
              onChange={handleChange}
              onBlur={handleBlur}
              label={t('form.password')}
              required
              isInvalid={Boolean(errors.password) && Boolean(touched.password)}
              message={Boolean(errors.password) && Boolean(touched.password) ? errors.password : undefined}
            />
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder={t('form.passwordPlaceholder')}
              className='disabled:select-none'
              value={values.confirmPassword}
              onChange={handleChange}
              onBlur={handleBlur}
              label={t('form.confirmPassword')}
              required
              isInvalid={Boolean(errors.confirmPassword) && Boolean(touched.confirmPassword)}
              message={Boolean(errors.confirmPassword) && Boolean(touched.confirmPassword) ? errors.confirmPassword : undefined}
            />
            <Checkbox
              id='terms'
              label={
                t.rich('form.terms', {
                  terms: (chunks) => <Link href='/legal/terms-of-service' className='text-blue-400 underline hover:text-blue-600'>{chunks}</Link>,
                  privacy: (chunks) => <Link href='/legal/privacy-policy' className='text-blue-400 underline hover:text-blue-600'>{chunks}</Link>
                })
              }
              isInvalid={Boolean(errors.terms) && Boolean(touched.terms)}
              checked={values.terms}
              onChange={handleChange}
              message={Boolean(errors.terms) && Boolean(touched.terms) ? errors.terms : undefined}
              size='sm'
            />
            <div className="flex items-center justify-end">
              <div className="text-sm">
                <p className="text-neutral-500">
                  {t.rich('form.signin', {
                    signin: (chunks) => <Link href="/auth/signin" className="font-medium text-blue-600 transition duration-150 ease-in-out hover:text-blue-500">{chunks}</Link>
                  })}
                </p>
              </div>
            </div>
            <Button
              type="submit"
              title={t('form.button.signup')}
              className='gap-4'
              icon={ArrowIcon}
              iconPosition='end'
              iconClassName={isValid ? 'ml-0 transition-all duration-150 ease-out group-hover:ml-2 group-focus:ml-2 group-active:ml-2' : ''}
              onClick={submitForm}
              disabled={!isValid || isLoading}
              isLoading={isLoading}
            >
              {isLoading ? t('form.button.signingUp') : t('form.button.signup')}
            </Button>
          </form>
          <div className="mt-6 flex flex-col gap-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-neutral-300 dark:border-neutral-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-light px-2 text-neutral-500 dark:bg-dark">{t('form.orContinueWith')}</span>
              </div>
            </div>
            <Button
              title='Continue with Google'
              className="inline-flex w-full justify-center gap-2 rounded-md border !border-neutral-300 bg-white px-4 py-2 text-sm font-medium !text-neutral-500 shadow-sm transition duration-150 ease-in-out hover:!bg-neutral-100 focus:!bg-neutral-100 dark:!border-neutral-700 dark:!bg-neutral-800 dark:!text-neutral-400"
              icon={GoogleIcon}
            >
              Google
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}