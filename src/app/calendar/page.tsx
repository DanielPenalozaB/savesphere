'use client';

import { useState, useEffect } from 'react';
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
import { Transaction, TransactionCurrency, TransactionRecurringInterval, TransactionType } from '@/interfaces/transactions';
import ItemsTable from '@/components/transactions/items-table';
import { CURRENCY_CONFIGS } from '@/components/form/currency-input';
import useDebounce from '@/hooks/useDebouce';
import { NumberUtils } from '@/utils/number-utils';
import { BackspaceIcon } from '@/components/icons/backspace';

export default function Calendar() {
  const [ currentDate, setCurrentDate ] = useState<Date>(new Date());
  const [ type, setType ] = useState<'day' | 'week' | 'month'>('month');
  const [ isModalOpen, setIsModalOpen ] = useState<boolean>(false);
  const [ editingEvent, setEditingEvent ] = useState<Transaction>();
  const [ events, setEvents ] = useState<Transaction[]>([]);
  const [ eventTitle, setEventTitle ] = useState('');
  const [ isSubmitting, setIsSubmitting ] = useState(false);
  const [ formKey, setFormKey ] = useState(0); // Used to trigger form reset

  const currencyOptions = Object.keys(CURRENCY_CONFIGS).map((key) => ({
    value: key,
    label: `${CURRENCY_CONFIGS[key as TransactionCurrency].name} (${key} - ${CURRENCY_CONFIGS[key as TransactionCurrency].symbol})`
  }));

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
          start: startOfWeek(startOfMonth(currentDate)),
          end: endOfWeek(endOfMonth(currentDate))
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
      id: '',
      type: TransactionType.EXPENSE,
      date: currentDate,
      recurring: TransactionRecurringInterval.NONE,
      amount: 0,
      amountCurrency: TransactionCurrency.USD,
      title: '',
      description: '',
      account: '',
      category: '',
      tags: [],
      image:'',
      items: []
    },
    validationSchema: createModalSchema,
    onSubmit: (eventData) => {
      if (editingEvent) {
        const updatedEvent = {
          ...eventData,
          id: editingEvent.id,
          date: formatDate(eventData.date, 'yyyy-MM-dd HH:mm:ss')
        };

        setEvents((prevEvents) => prevEvents.map((event) => (event.id === editingEvent.id ? updatedEvent : event)));
      } else {
        const newId = `${eventData.title}-${Date.now()}`;
        const newEvent = {
          ...eventData,
          id: newId,
          date: formatDate(eventData.date, 'yyyy-MM-dd HH:mm:ss')
        };
        setEvents((prevEvents) => [ ...prevEvents, newEvent ]);

        setFieldValue('id', newId);
      }
    },
    enableReinitialize: true
  });

  const debouncedValues = useDebounce(values, 1000);

  // Clear form and reset when modal is closed
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingEvent(undefined);
    setEventTitle('');
    // Force a form reset by changing the key
    setFormKey((prev) => prev + 1);
  };

  const handleCreateEvent = (date: Date) => {
    closeModal(); // Close any open modal first

    // Wait for the previous modal to fully close
    setTimeout(() => {
      setIsModalOpen(true);
      setCurrentDate(date);
      resetForm();
      setFieldValue('date', date);
      setFieldValue('id', '');
    }, 50);
  };

  const handleEditEvent = (event: Transaction) => {
    closeModal();

    setTimeout(() => {
      setEditingEvent(event);
      setIsModalOpen(true);
      setEventTitle(event.title);

      resetForm();
      setFieldValue('id', event.id);
      setFieldValue('type', event.type);
      setFieldValue('date', event.date);
      setFieldValue('recurring', event.recurring);
      setFieldValue('amount', event.amount);
      setFieldValue('amountCurrency', event.amountCurrency);
      setFieldValue('title', event.title);
      setFieldValue('description', event.description);
      setFieldValue('account', event.account);
      setFieldValue('category', event.category);
      setFieldValue('tags', event.tags);
      setFieldValue('image', event.image);
      setFieldValue('items', event.items);
    }, 50);
  };

  const handleRemoveEvent = (event: Transaction) => {
    setEvents((prevEvents) => prevEvents.filter((e) => e.id !== event.id));
    closeModal();
  };

  const modalOptions = [
    {
      label: 'Create template',
      onClick: () => console.log('Create template')
    }, {
      label: 'Delete',
      onClick: () => handleRemoveEvent(editingEvent!),
      className: 'text-red-400 hover:text-red-500 hover:bg-red-50 transition-all duration-150 ease-in-out',
      icon: <BackspaceIcon className="h-4 w-4" />
    }
  ];

  // Handle automatic form submission
  useEffect(() => {
    // Only submit when:
    // 1. The form is valid
    // 2. There's a non-empty title
    // 3. Not already submitting
    // 4. Modal is open
    // 5. We have a valid ID (for editing) or no ID (for creating new)
    if (isValid && debouncedValues.title && !isSubmitting && isModalOpen
        && (editingEvent ? debouncedValues.id === editingEvent.id : !debouncedValues.id)) {
      setIsSubmitting(true);
      submitForm().then(() => {
        setIsSubmitting(false);
      });
    }
  }, [ debouncedValues, isValid, isSubmitting, isModalOpen, submitForm, editingEvent ]);

  const getEventsForDate = (date: Date) => events.filter((event) => isSameDay(event.date, date));

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
                    <button
                      key={event.id}
                      type='button'
                      title='Edit event'
                      className="w-full rounded-md bg-calypso-50 p-2 text-left text-calypso-900 hover:bg-calypso-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditEvent(event);
                      }}
                    >
                      <div className="font-semibold">{event.title}</div>
                      <div className="font-normal text-calypso-800">{event.description}</div>
                      <div className="font-normal text-calypso-800">
                        {NumberUtils.formatCurrency(event.items.reduce((sum, item) => sum + item.quantity * item.price, 0), event.amountCurrency)}
                      </div>
                    </button>
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
                  <button
                    key={index}
                    type='button'
                    title='Edit event'
                    className={`flex flex-col rounded-lg p-2 text-sm ${
                      !isSameMonth(date, startOfMonth(currentDate))
                        ? 'text-neutral-400 bg-neutral-100/50'
                        : isSameDay(date, new Date())
                          ? 'bg-calypso-50 text-neutral-800 font-bold'
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
                            className="truncate rounded bg-calypso-100 px-1.5 py-0.5 text-left text-xs font-medium text-calypso-900 outline-none transition-all duration-150 ease-in-out hover:outline hover:outline-2 hover:outline-offset-1 hover:outline-calypso-200"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditEvent(event);
                            }}
                          >
                            <div className="font-semibold">{event.title}</div>
                            <div className="text-calypso-800">{NumberUtils.formatCurrency(event.items.reduce((sum, item) => sum + item.quantity * item.price, 0), event.amountCurrency)}</div>
                          </div>
                        ))}
                        {dateEvents.length > 2 && (
                          <div className="text-xs text-neutral-500">
                            +{dateEvents.length - 2} more
                          </div>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </>
        )}
        <Modal
          key={formKey} // Use the key to force re-render when needed
          isOpen={isModalOpen}
          onClose={closeModal}
          editableTitle={{
            value: eventTitle,
            onChange: (value) => {
              setEventTitle(value);
              setFieldValue('title', value);
            },
            placeholder: 'What\'s this transaction about?'
          }}
          className="!overflow-hidden !p-0"
          size="3xl"
          animation={{
            duration: 0.4,
            ease: 'back.out(1.5)'
          }}
          modalOptions={modalOptions}
        >
          <form onSubmit={handleSubmit} className='flex h-[70vh]'>
            <div className="flex-1">
              <div className="custom-scrollbar h-full overflow-y-auto pr-2">
                <div className="flex flex-col gap-4">
                  <Input
                    name='template'
                    type='select'
                    placeholder='Select a template'
                    value={values.category}
                    options={[
                      {
                        value: 'shopping-list',
                        label: 'Shopping List'
                      },
                      {
                        value: 'groceries',
                        label: 'Groceries'
                      }
                    ]}
                    onChange={handleChange}
                    error={undefined}
                    className='max-w-40'
                  >
                    Template
                  </Input>
                  <ItemsTable
                    items={values.items}
                    setItems={(items) => setFieldValue('items', items)}
                    currencyCode={values.amountCurrency}
                  />
                  <hr className='mt-4 border-neutral-200' />
                  <Input
                    name='description'
                    type='textarea'
                    value={values.description}
                    onChange={handleChange}
                    placeholder='Add a brief note about the transaction'
                    error={undefined}
                    optional
                  >
                    Description
                  </Input>
                </div>
              </div>
            </div>
            <div className="w-80 flex-shrink-0">
              <div className="custom-scrollbar h-full overflow-y-auto pl-2">
                <div className="flex flex-col gap-4">
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
                    required
                  >
                    Type
                  </Input>
                  <Input
                    name='date'
                    type='date'
                    placeholder='Date'
                    description='Choose the date of the transaction.'
                    value={values.date.toString()}
                    onChange={handleChange}
                    error={undefined}
                    showRecurringSelector
                    recurring={values.recurring}
                    onRecurringChange={(recurring) => setFieldValue('recurring', recurring)}
                    required
                  >
                    Date
                  </Input>
                  <Input
                    name='amountCurrency'
                    type='select'
                    description='Choose a currency for the transaction.'
                    placeholder='Select currency'
                    value={values.amountCurrency}
                    onChange={handleChange}
                    error={undefined}
                    options={currencyOptions}
                    required
                  >
                    Amount Currency
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
                    required
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
                    optional
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
                    required
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
                    optional
                  >
                    Image
                  </Input>
                  <div className="mt-4 flex justify-end">
                    <Button
                      variant="outline"
                      size="md"
                      onClick={closeModal}
                    >
                      Close
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </Modal>
      </div>
    </main>
  );
}