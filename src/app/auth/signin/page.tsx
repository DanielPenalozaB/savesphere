'use client';

import { Button, Input } from '@/components';
import { ArrowIcon, Doodle, GoogleIcon } from '@/icons';
import { signInSchema } from '@/schemas';
import { useFormik } from 'formik';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface OnSubmitProps {
  email: string;
  password?: string;
}

export default function SignIn() {
  const t = useTranslations('auth.signin');

  const router = useRouter();

  const [ isLoading, setIsLoading ] = useState(false);
  const [ enabledPassword, setEnabledPassword ] = useState(false);
  const [ showButton, setShowButton ] = useState(true);

  const onSubmit = (values: OnSubmitProps) => {
    setIsLoading(true);
    console.log(values);

    if (values.password) {
      setTimeout(() => {
        setShowButton(false);
        setIsLoading(false);
        router.push('/app');
      }, 2000);
    } else {
      setTimeout(() => {
        setIsLoading(false);
        setFieldValue('email', values.email);
        setEnabledPassword(true);
      }, 2000);
    }
  };

  const validateFunction = async () => {
    try {
      await signInSchema.validate(values, { context: { enabledPassword } });
    } catch (err: any) {
      return { [err.path]: err.message }; // Return the validation errors
    }

    return {};
  };

  const {
    handleSubmit,
    errors,
    touched,
    values,
    handleBlur,
    handleChange,
    submitForm,
    isValid,
    setFieldValue
  } = useFormik({
    initialValues: {
      email: '',
      password: ''
    },
    initialErrors: {
      email: '',
      password: ''
    },
    validationSchema: signInSchema,
    validate: validateFunction,
    enableReinitialize: true,
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit
  });

  return (
    <>
      <title>{t('meta.title')}</title>
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden p-4">
        <div className='absolute -left-5 -top-10 z-0 bg-blue-100 dark:bg-[#111111]'>
          <div className='absolute inset-0 z-0 bg-gradient-to-t from-light to-transparent dark:from-dark' />
          <Doodle className="flex" />
          <Doodle className="mr-20 flex flex-row-reverse" />
        </div>
        <div className="flex w-full max-w-md flex-col">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-extrabold text-neutral-900 dark:text-neutral-200">{t('title')}</h2>
            <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
              {t('message')}
            </p>
          </div>
          <form className="mt-8 flex flex-col gap-3" onSubmit={handleSubmit}>
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
              autoFocus
              required
              isInvalid={Boolean(errors.email) && Boolean(touched.email)}
              disabled={enabledPassword}
              message={Boolean(errors.email) && Boolean(touched.email) ? errors.email : undefined}
            />
            {enabledPassword && (
              <Input
                id="password"
                name="password"
                type="password"
                placeholder={t('form.passwordPlaceholder')}
                value={values.password}
                onChange={handleChange}
                onBlur={handleBlur}
                label={t('form.password')}
                autoComplete="password"
                autoFocus
                required
                isInvalid={Boolean(errors.password) && Boolean(touched.password)}
                disabled={!showButton}
              />
            )}
            <div className="flex items-center justify-between">
              <div className="text-sm">
                <Link href="#" className="font-medium text-blue-600 transition duration-150 ease-in-out hover:text-blue-500">
                  {t('form.forgotPassword')}
                </Link>
              </div>
              <div className="text-sm">
                <Link href="/auth/signup" className="font-medium text-blue-600 transition duration-150 ease-in-out hover:text-blue-500">
                  {t('form.createAccount')}
                </Link>
              </div>
            </div>
            {showButton && (
              <Button
                type="submit"
                title={enabledPassword ? t('form.button.continueWithPassword') : t('form.button.continue')}
                className='gap-4'
                icon={ArrowIcon}
                iconPosition='end'
                iconClassName={isValid ? 'ml-0 transition-all duration-150 ease-out group-hover:ml-2 group-focus:ml-2 group-active:ml-2' : ''}
                onClick={submitForm}
                disabled={!isValid || isLoading}
                isLoading={isLoading}
              >
                {isLoading
                  ? t('form.button.signingIn')
                  : enabledPassword
                    ? t('form.button.continueWithPassword')
                    : t('form.button.continue')
                }
              </Button>
            )}
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