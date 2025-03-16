'use client';

import { useState } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameMonth,
  isSameDay,
  startOfDay,
  addWeeks,
  subWeeks,
  addMonths,
  subMonths,
  formatDate
} from 'date-fns';
import { ChevronIcon } from '@/components/icons/chevron';
import Button from '@/components/ui/button';
import Modal from '@/components/ui/modal';
import Input from '@/components/form/input';
import { useFormik } from 'formik';
import { createModalSchema } from '@/schemas/transactions/create-modal-schema';
import { CreateTransactionModal, Transaction, TransactionCurrency, TransactionRecurringInterval, TransactionType } from '@/interfaces/transactions';

export default function Calendar() {
  const [ currentDate, setCurrentDate ] = useState<Date>(new Date());
  const [ type, setType ] = useState<'day' | 'week' | 'month'>('month');
  const [ isModalOpen, setIsModalOpen ] = useState<boolean>(false);
  const [ editingEvent, setEditingEvent ] = useState<Transaction>();
  const [ events, setEvents ] = useState<Transaction[]>([]);

  const getViewRange = () => {
    switch (type) {
      case 'day':
        return {
          start: startOfDay(currentDate),
          end: startOfDay(currentDate)
        };
      case 'week':
        return {
          start: startOfWeek(currentDate),
          end: endOfWeek(currentDate)
        };

      case 'month':
      default:
        return {
          start: startOfWeek(startOfMonth(currentDate)), // Start from the beginning of the week
          end: endOfWeek(endOfMonth(currentDate)) // End at the end of the week
        };
    }
  };

  const { start, end } = getViewRange();

  const dates = [];
  let currentDay = start;

  while (currentDay <= end) {
    dates.push(currentDay);
    currentDay = addDays(currentDay, 1);
  }

  const goToPrevious = () => {
    switch (type) {
      case 'day':
        setCurrentDate((prevDate) => addDays(prevDate, -1));
        break;
      case 'week':
        setCurrentDate((prevDate) => subWeeks(prevDate, 1));
        break;
      case 'month':
        setCurrentDate((prevDate) => subMonths(prevDate, 1));
        break;
      default:
        break;
    }
  };

  const goToNext = () => {
    switch (type) {
      case 'day':
        setCurrentDate((prevDate) => addDays(prevDate, 1));
        break;
      case 'week':
        setCurrentDate((prevDate) => addWeeks(prevDate, 1));
        break;
      case 'month':
        setCurrentDate((prevDate) => addMonths(prevDate, 1));
        break;
      default:
        break;
    }
  };

  const getHeaderText = () => {
    switch (type) {
      case 'day':
        return format(currentDate, 'MMMM d, yyyy');
      case 'week':
        return `${format(start, 'MMM d')} - ${format(end, 'MMM d, yyyy')}`;
      case 'month':
      default:
        return format(currentDate, 'MMMM yyyy');
    }
  };

  const getCurrentDayOfWeek = () => format(currentDate, 'EEE').toLowerCase();

  const handleCreateEvent = (date: Date) => {
    setEditingEvent(undefined);
    setIsModalOpen(true);
    setCurrentDate(date);
    setFieldValue('date', date);
  };

  // Open modal to edit an existing event
  const handleEditEvent = (event: Transaction) => {
    setEditingEvent(event);
    setIsModalOpen(true);
  };

  // Handle event form submission
  const onSubmit = (eventData: CreateTransactionModal) => {
    if (editingEvent) {
      // Update existing event
      setEvents(events.map((event) => (event.id === editingEvent.id ? { ...eventData, id: event.id } : event)));
    } else {
      // Create new event
      const newEvent = {
        ...eventData,
        id: Date.now().toString() // Simple ID generation
      };
      setEvents([ ...events, newEvent ]);
    }

    setIsModalOpen(false);
  };

  // Get events for a specific date
  const getEventsForDate = (date: Date) => events.filter((event) => isSameDay(event.date, date));

  const {
    handleSubmit,
    errors,
    touched,
    values,
    handleBlur,
    handleChange,
    resetForm,
    submitForm,
    isValid,
    setFieldValue
  } = useFormik({
    initialValues: {
      type: TransactionType.EXPENSE,
      date: editingEvent ? editingEvent.date : formatDate(currentDate, 'yyyy-MM-dd'),
      recurring: TransactionRecurringInterval.NONE,
      amount: 0,
      amountCurrency: TransactionCurrency.USD,
      title: '',
      description: '',
      account: '',
      category: '',
      tags: [],
      image: ''
    },
    validationSchema: createModalSchema,
    isInitialValid: false,
    onSubmit
  });

  return (
    <main className="z-0 flex h-full w-full p-4">
      <div className="flex h-full w-full flex-col rounded-2xl bg-white p-4">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex w-fit items-center justify-between gap-2">
            <button
              onClick={goToPrevious}
              className="rounded-md px-1.5 py-1.5 text-neutral-600 hover:bg-neutral-100"
            >
              <ChevronIcon className="h-4 w-4 -rotate-90" />
            </button>
            <h2 className="text-base font-medium text-neutral-600">
              {getHeaderText()}
            </h2>
            <button
              onClick={goToNext}
              className="rounded-md px-1.5 py-1.5 text-neutral-600 hover:bg-neutral-100"
            >
              <ChevronIcon className="h-4 w-4 rotate-90" />
            </button>
          </div>
          <div className="flex items-center gap-4">
            {!isSameMonth(currentDate, new Date()) && (
              <Button
                variant="fill"
                size="sm"
                className="h-8 border border-neutral-200 bg-transparent !text-neutral-500 hover:bg-neutral-100 focus:bg-transparent"
                onClick={() => setCurrentDate(new Date())}
              >
              Today
              </Button>
            )}
            <div className="flex items-center gap-1 rounded-xl bg-neutral-100 p-1">
              <button
                type="button"
                title="Day"
                className={`rounded-lg px-3 py-1 text-sm transition duration-100 ease-in-out ${
                  type === 'day' ? 'bg-white text-neutral-800' : 'hover:bg-white text-neutral-500'
                }`}
                onClick={() => setType('day')}
              >
                Day
              </button>
              <button
                type="button"
                title="Week"
                className={`rounded-lg px-3 py-1 text-sm transition duration-100 ease-in-out ${
                  type === 'week' ? 'bg-white text-neutral-800' : 'hover:bg-white text-neutral-500'
                }`}
                onClick={() => setType('week')}
              >
                Week
              </button>
              <button
                type="button"
                title="Month"
                className={`rounded-lg px-3 py-1 text-sm transition duration-100 ease-in-out ${
                  type === 'month' ? 'bg-white text-neutral-800' : 'hover:bg-white text-neutral-500'
                }`}
                onClick={() => setType('month')}
              >
                Month
              </button>
            </div>
            <Button
              variant="fill"
              size="sm"
              className="h-8"
              onClick={() => handleCreateEvent(new Date())}
            >
              Create
            </Button>
          </div>
        </div>
        <hr className='mb-4 border-neutral-300' />
        {type === 'day' ? (
          <>
            <div className="mb-2 grid grid-cols-1 gap-2">
              <div className="h-min text-sm font-semibold text-neutral-500">
                {getCurrentDayOfWeek()}
              </div>
            </div>
            <div className="grid flex-1 grid-cols-1 gap-2">
              <div
                className="flex h-full flex-col rounded-lg p-2 text-sm font-bold text-neutral-800"
                onClick={() => handleCreateEvent(currentDate)}
              >
                <div className="flex items-center justify-between">
                  <span>{format(currentDate, 'd')}</span>
                  {isSameDay(currentDate, new Date()) && (
                    <span className="rounded-full bg-calypso-100 px-2 py-0.5 text-xs">Today</span>
                  )}
                </div>

                <div className="mt-4 space-y-2">
                  {getEventsForDate(currentDate).map((event) => (
                    <div
                      key={event.id}
                      className="rounded-md bg-calypso-50 p-2 hover:bg-calypso-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditEvent(event);
                      }}
                    >
                      <div className="font-semibold">{event.title}</div>
                      <div className="font-semibold">{event.description}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="mb-2 grid grid-cols-7 gap-2">
              {[ 'sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat' ].map((day) => (
                <div
                  key={day}
                  className="h-min text-sm font-semibold text-neutral-500"
                >
                  {day}
                </div>
              ))}
            </div>
            <div className="grid flex-1 grid-cols-7 gap-2">
              {dates.map((date, index) => {
                const dateEvents = getEventsForDate(date);
                const hasEvents = dateEvents.length > 0;

                return (
                  <div
                    key={index}
                    className={`flex flex-col rounded-lg p-2 text-sm ${
                      !isSameMonth(date, startOfMonth(currentDate))
                        ? 'text-neutral-400 bg-neutral-100/50'
                        : isSameDay(date, new Date())
                          ? 'bg-calypso-100 text-neutral-800 font-bold'
                          : 'text-neutral-600 hover:bg-neutral-100'
                    }`}
                    onClick={() => handleCreateEvent(date)}
                  >
                    <div className="flex items-center justify-between">
                      <span>{format(date, 'd')}</span>
                      {hasEvents && (
                        <span className="h-1.5 w-1.5 rounded-full bg-calypso-500"></span>
                      )}
                    </div>

                    {hasEvents && (
                      <div className="mt-1 space-y-1">
                        {dateEvents.slice(0, 2).map((event) => (
                          <div
                            key={event.id}
                            className="truncate rounded bg-calypso-50 px-1.5 py-0.5 text-xs font-medium"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditEvent(event);
                            }}
                          >
                            <div className="font-semibold">{event.title}</div>
                            <div className="font-semibold">{event.description}</div>
                          </div>
                        ))}
                        {dateEvents.length > 2 && (
                          <div className="text-xs text-neutral-500">
                            +{dateEvents.length - 2} more
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingEvent ? 'Edit Transaction' : 'Create Transaction'}
          primaryButton={{
            type: 'submit',
            children: editingEvent ? 'Update' : 'Create',
            className: 'focus:outline-offset-[-1px] focus:outline-calypso-400 h-9',
            disabled: !isValid,
            onClick: submitForm,
            size: 'sm'
          }}
          secondaryButton={{
            children: 'Cancel',
            onClick: () => setIsModalOpen(false),
            variant: 'outline',
            className: '!hover:bg-neutral-100 !border-neutral-200 !dark:focus-visible:border-red-500 !disabled:border-neutral-300 !disabled:text-neutral-300 !text-neutral-500 focus:bg-neutral-100 focus:outline-offset-[-1px] focus:outline-neutral-400 dark:hover:bg-neutral-100 dark:focus:bg-neutral-100 h-9',
            size: 'sm'
          }}
          animation={{
            duration: 0.4,
            ease: 'back.out(1.5)'
          }}
        >
          <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
            <Input
              name='type'
              type='radioCard'
              className='grid-cols-2'
              value={values.type}
              options={[
                {
                  value: 'expense',
                  label: 'Expense',
                  description: 'Track spending and outgoing funds.'
                },
                {
                  value: 'income',
                  label: 'Income',
                  description: 'Monitor earnings and incoming funds.'
                }
              ]}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.type && touched.type ? errors.type : undefined}
            >
              Type
            </Input>
            <Input
              name='date'
              type='date'
              placeholder='Date'
              description='Choose the date of the transaction.'
              value={values.date}
              onChange={handleChange}
              error={undefined}
              showRecurringSelector
              recurring={values.recurring}
              onRecurringChange={(recurring) => setFieldValue('recurring', recurring)}
            >
              Date
            </Input>
            <Input
              name='amount'
              type='currency'
              description='Enter the transaction amount.'
              value={values.amount}
              onChange={handleChange}
              placeholder='0.00'
              error={undefined}
              currencyCode={values.amountCurrency}
              onCurrencyChange={(currency) => setFieldValue('amountCurrency', currency)}
            >
              Amount
            </Input>
            <Input
              name='title'
              type='text'
              description='Add a title for the transaction.'
              value={values.title}
              onChange={handleChange}
              placeholder='Groceries'
              error={undefined}
            >
              Title
            </Input>
            <Input
              name='description'
              type='text'
              description='Add a brief note about the transaction.'
              value={values.description}
              onChange={handleChange}
              placeholder='Groceries or Salary'
              error={undefined}
              optional
            >
              Description
            </Input>
            <Input
              name='category'
              type='select'
              description='Choose a category for the transaction.'
              placeholder='Select category'
              value={values.category}
              options={[
                {
                  value: 'groceries',
                  label: 'Groceries'
                },
                {
                  value: 'entertainment',
                  label: 'Entertainment'
                }
              ]}
              onChange={handleChange}
              error={undefined}
            >
              Category
            </Input>
            <Input
              name='tags'
              type='select'
              description='Add tags to organize your transaction.'
              placeholder='"Food", "Work"'
              error={undefined}
              value={values.tags}
              options={[
                {
                  value: 'groceries',
                  label: 'Groceries'
                },
                {
                  value: 'entertainment',
                  label: 'Entertainment'
                }
              ]}
              multiple
              onChange={handleChange}
            >
              Tags
            </Input>
            <Input
              name='account'
              type='select'
              description='Choose the account or account used.'
              placeholder='Choose account'
              error={undefined}
              value={values.account}
              options={[
                {
                  value: '1',
                  label: 'Cash'
                },
                {
                  value: '2',
                  label: 'Credit Card'
                }
              ]}
              onChange={handleChange}
            >
              Account
            </Input>
            <Input
              name='image'
              type='file'
              description='Upload a receipt or document (optional).'
              value={values.image}
              onChange={handleChange}
              error={undefined}
            >
              Image
            </Input>
          </form>
        </Modal>
      </div>
    </main>
  );
}