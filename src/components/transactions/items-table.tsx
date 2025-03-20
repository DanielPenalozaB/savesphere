'use client';

import { TransactionCurrency, TransactionItem } from '@/interfaces/transactions';
import { useEffect, useRef, useState } from 'react';
import Input from '../form/input';
import Button from '../ui/button';
import { PlusIcon } from '../icons/plus';
import { MinusIcon } from '../icons/minus';
import { BackspaceIcon } from '../icons/backspace';
import Link from 'next/link';

const PRODUCTS = [
  { id: '1', name: 'Laptop', price: 1299.99 },
  { id: '2', name: 'Smartphone', price: 899.99 },
  { id: '3', name: 'Headphones', price: 199.99 },
  { id: '4', name: 'Monitor', price: 349.99 },
  { id: '5', name: 'Keyboard', price: 129.99 },
  { id: '6', name: 'Mouse', price: 59.99 },
  { id: '7', name: 'Tablet', price: 499.99 },
  { id: '8', name: 'Printer', price: 249.99 },
  { id: '9', name: 'Camera', price: 799.99 },
  { id: '10', name: 'Speaker', price: 149.99 }
];

export interface ItemsTableProps {
  items: TransactionItem[];
  setItems: (items: TransactionItem[]) => void;
  currencyCode: TransactionCurrency;
}

export default function ItemsTable({ items, setItems, currencyCode }: ItemsTableProps) {
  const [ suggestions, setSuggestions ] = useState<typeof PRODUCTS>([]);
  const [ activeSuggestionIndex, setActiveSuggestionIndex ] = useState<number>(-1);
  const [ showSuggestions, setShowSuggestions ] = useState<{ [key: string]: boolean }>({});
  const suggestionRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // Handle changes to items
  const handleItemChange = (id: string, field: keyof TransactionItem, value: string | number) => {
    const newItems = items.map((item) => (item.id === id ? { ...item, [field]: value } : item));

    setItems(newItems);
  };

  // Add a new item
  const addItem = () => {
    const newItems = [
      ...items,
      { id: crypto.randomUUID(), concept: '', quantity: 1, price: 0 }
    ];

    setItems(newItems);
  };

  // Remove an item
  const removeItem = (id: string) => {
    if (items.length <= 1) return;

    const newItems = items.filter((item) => item.id !== id);
    setItems(newItems);
  };

  // Handle concept search and suggestions
  const handleConceptSearch = (id: string, value: string) => {
    handleItemChange(id, 'concept', value);

    if (value.length > 1) {
      const filtered = PRODUCTS.filter((product) => product.name.toLowerCase().includes(value.toLowerCase()));
      setSuggestions(filtered);
      setShowSuggestions({ ...showSuggestions, [id]: true });
    } else {
      setShowSuggestions({ ...showSuggestions, [id]: false });
    }
  };

  // Select a product from suggestions
  const selectProduct = (id: string, product: (typeof PRODUCTS)[0]) => {
    const newItem = {
      concept: product.name,
      price: product.price,
      productId: product.id
    };
    const newItems = items.map((item) => (item.id === id ? { ...item, ...newItem } : item));

    setItems(newItems);
    setShowSuggestions({ ...showSuggestions, [id]: false });
  };

  // Handle keyboard navigation for suggestions
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, id: string) => {
    if (!showSuggestions[id]) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveSuggestionIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveSuggestionIndex((prev) => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === 'Enter' && activeSuggestionIndex >= 0) {
      e.preventDefault();
      selectProduct(id, suggestions[activeSuggestionIndex]);
    } else if (e.key === 'Escape') {
      setShowSuggestions({ ...showSuggestions, [id]: false });
    }
  };

  // Scroll active suggestion into view
  useEffect(() => {
    if (activeSuggestionIndex >= 0) {
      Object.keys(suggestionRefs.current).forEach((key) => {
        const element = suggestionRefs.current[key];

        if (element) {
          element.scrollIntoView({ block: 'nearest' });
        }
      });
    }
  }, [ activeSuggestionIndex ]);

  // Calculate total amount
  const calculateTotal = () => items.reduce((sum, item) => sum + item.quantity * item.price, 0);

  return (
    <div className='flex flex-col gap-2'>
      <div className='flex items-center justify-between text-sm'>
        <h3 className='font-semibold text-neutral-600'>Items ({items.length})</h3>
        <button type='button' className='text-calypso-500'>
          Database
        </button>
      </div>
      <table>
        <thead>
          <tr className='text-left text-sm font-semibold text-neutral-600'>
            <th className='px-2 py-1'>Product/Service</th>
            <th className='w-44 px-2 py-1'>Quantity</th>
            <th className='w-36 px-2 py-1'>Price</th>
            <th className='w-9' />
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className='group'>
              <td className='px-2 py-1'>
                <div className="relative z-10">
                  <Input
                    id={`concept-${item.id}`}
                    value={item.concept}
                    onChange={(e) => handleConceptSearch(item.id, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, item.id)}
                    onFocus={() => {
                      if (item.concept.length > 1) {
                        setShowSuggestions({ ...showSuggestions, [item.id]: true });
                      }
                    }}
                    onBlur={() => {
                      setTimeout(() => {
                        setShowSuggestions({ ...showSuggestions, [item.id]: false });
                      }, 500);
                    }}
                    placeholder="Start typing to search products..."
                    className="pr-8"
                  />
                  {showSuggestions[item.id] && suggestions.length > 0 && (
                    <div className="absolute z-10 mt-1 max-h-[200px] w-full overflow-y-auto rounded-md border bg-white shadow-md">
                      {suggestions.map((product, idx) => (
                        <div
                          key={product.id}
                          ref={(el) => {
                            if (idx === activeSuggestionIndex) {
                              suggestionRefs.current[item.id] = el;
                            }
                          }}
                          className={`px-3 py-2 cursor-pointer hover:bg-muted ${idx === activeSuggestionIndex && 'bg-muted'}`}
                          onMouseDown={() => selectProduct(item.id, product)}
                        >
                          <div className='flex flex-wrap items-center gap-1'>
                            <span className="font-medium">{product.name}</span>
                            <Link href={'/database/d1'} className="text-xs font-medium text-calypso-600">/ D1</Link>
                          </div>
                          <span className="text-muted-foreground text-sm">${product.price.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </td>
              <td className='px-2 py-1'>
                <div className='flex items-center gap-1'>
                  <Button
                    title='Remove by 1'
                    variant='outline'
                    size='xs'
                    className='!hover:bg-neutral-100 !dark:focus-visible:border-red-500 !disabled:border-neutral-300 !disabled:text-neutral-300 h-9 !border-neutral-200 !px-2 !text-neutral-500 focus:bg-neutral-100 focus:outline-offset-[-1px] focus:outline-neutral-400 disabled:opacity-50 dark:hover:bg-neutral-100 dark:focus:bg-neutral-100'
                    onClick={() => handleItemChange(item.id, 'quantity', Math.max(1, item.quantity - 1))}
                    disabled={item.quantity === 1}
                  >
                    <MinusIcon className='h-4 w-4' />
                  </Button>
                  <Input
                    id={`quantity-${item.id}`}
                    type="number"
                    min="1"
                    step="1"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(item.id, 'quantity', Math.max(1, Number.parseInt(e.target.value) || 1))
                    }
                    className='max-w-20'
                  />
                  <Button
                    variant='outline'
                    size='sm'
                    title='Add by 1'
                    className='!hover:bg-neutral-100 !dark:focus-visible:border-red-500 !disabled:border-neutral-300 !disabled:text-neutral-300 h-9 !border-neutral-200 !px-2 !text-neutral-500 focus:bg-neutral-100 focus:outline-offset-[-1px] focus:outline-neutral-400 dark:hover:bg-neutral-100 dark:focus:bg-neutral-100'
                    onClick={() => handleItemChange(item.id, 'quantity', item.quantity + 1)}
                  >
                    <PlusIcon className='h-4 w-4' />
                  </Button>
                </div>
              </td>
              <td className='px-2 py-1'>
                <Input
                  name='amount'
                  type='currency'
                  value={item.price}
                  onChange={(e) => handleItemChange(item.id, 'price', Number.parseFloat(e.target.value) || 0)
                  }
                  placeholder='0.00'
                  error={undefined}
                  currencyCode={currencyCode}
                  required
                  showCurrencySelector={false}
                  className='max-w-32'
                />
              </td>
              <td>
                <Button
                  title='Remove item'
                  variant='outline'
                  size='sm'
                  className='h-9 !border-red-300 bg-red-50 !px-2 text-red-500 hover:!bg-red-50 focus:outline-offset-[-1px] focus:outline-red-400 disabled:!border-neutral-300 disabled:!text-neutral-500 disabled:opacity-50 dark:hover:bg-red-50 dark:focus:bg-red-50 dark:focus-visible:!border-red-400'
                  onClick={() => removeItem(item.id)}
                  disabled={items.length <= 1}
                >
                  <BackspaceIcon className='h-4 w-4' />
                </Button>
              </td>
            </tr>
          ))}
          <tr>
            <td colSpan={4}>
              <Button
                variant='outline'
                size='sm'
                title='Add item'
                className='!hover:bg-neutral-100 !dark:focus-visible:border-red-500 !disabled:border-neutral-300 !disabled:text-neutral-300 mt-2 h-9 w-full !border-neutral-200 !px-2 !text-neutral-500 focus:bg-neutral-100 focus:outline-offset-[-1px] focus:outline-neutral-400 dark:hover:bg-neutral-100 dark:focus:bg-neutral-100'
                onClick={() => addItem()}
              >
                Add item
                <PlusIcon className='h-4 w-4' />
              </Button>
            </td>
          </tr>
        </tbody>
      </table>
      <div className='flex flex-col items-end'>
        <span className='text-sm font-medium text-neutral-400'>Total</span>
        <span className='text-2xl font-semibold text-neutral-600'>${calculateTotal().toFixed(2)}</span>
      </div>
    </div>
  );
}