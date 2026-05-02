import { Badge } from '$lib/components/ui/badge';
import { Checkbox } from '$lib/components/ui/checkbox/index.js';
import { renderComponent, renderSnippet } from '$lib/components/ui/data-table';
import type { ColumnDef } from '@tanstack/table-core';
import { createRawSnippet } from 'svelte';
import DataTableActions from './data-table-actions.svelte';
import { WalletStatusEnum, type Wallet } from './types';
import { formatCurrency } from '$lib/utils/format.js';

export const columns: ColumnDef<Wallet>[] = [
  {
    id: 'select',
    header: ({ table }) =>
      renderComponent(Checkbox, {
        checked: table.getIsAllPageRowsSelected(),
        indeterminate: table.getIsSomePageRowsSelected() && !table.getIsAllPageRowsSelected(),
        onCheckedChange: (value) => table.toggleAllPageRowsSelected(!!value),
        'aria-label': 'Select all'
      }),
    cell: ({ row }) =>
      renderComponent(Checkbox, {
        checked: row.getIsSelected(),
        onCheckedChange: (value) => row.toggleSelected(!!value),
        'aria-label': 'Select row'
      }),
    enableSorting: false,
    enableHiding: false
  },
  {
    accessorKey: 'name',
    header: 'Name'
  },
  {
    accessorKey: 'type',
    header: 'Type',
    cell: ({ row }) => {
      return renderComponent(Badge, {
        variant: 'outline',
        children: createRawSnippet(() => ({
          render: () => `<span class="capitalize">${row.original.type}</span>`
        }))
      });
    }
  },
  {
    accessorKey: 'balance',
    header: 'Balance',
    cell: ({ row }) => {
      return formatCurrency(row.original.balance, row.original.currency);
    }
  },
  {
    accessorKey: 'currency',
    header: 'Currency',
    cell: ({ row }) => {
      return renderComponent(Badge, {
        variant: 'secondary',
        children: createRawSnippet(() => ({
          render: () => `<span>${row.original.currency.toUpperCase()}</span>`
        }))
      });
    }
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const statusClasses: Record<WalletStatusEnum, string> = {
        [WalletStatusEnum.ACTIVE]:
          'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
        [WalletStatusEnum.INACTIVE]:
          'bg-gray-100 text-gray-600 dark:bg-gray-800/50 dark:text-gray-400',
        [WalletStatusEnum.DUE]:
          'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
      };

      const statusCellSnippet = createRawSnippet<[{ status: WalletStatusEnum }]>((getStatus) => {
        const { status } = getStatus();
        const classes = statusClasses[status] ?? statusClasses[WalletStatusEnum.INACTIVE];

        return {
          render: () =>
            `<span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${classes}">
              ${status}
            </span>`
        };
      });

      return renderSnippet(statusCellSnippet, { status: row.original.status });
    }
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      return renderComponent(DataTableActions, { id: row.original.id });
    }
  }
];
