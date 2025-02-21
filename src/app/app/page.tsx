import { Button } from '@/components';
import { BellIcon, GridDoodle } from '@/icons';

export default function Home() {
  return (
    <>
      <div className='flex items-center justify-between p-4'>
        <h1 className='text-xl font-bold text-neutral-800 dark:text-neutral-200'>Welcome back, user</h1>
        <div className="flex items-center gap-4">
          <Button
            className='min-h-7 !rounded-lg !p-2 dark:bg-neutral-900 hover:dark:bg-neutral-800'
            title='Notifications'
            icon={BellIcon}
            size='sm'
          />
        </div>
      </div>
      <div className='flex items-center justify-between p-4'>
        <div className='relative flex w-full items-center justify-between overflow-hidden rounded-xl bg-blue-900'>
          <div className='z-10 flex w-full items-center justify-between gap-2 bg-gradient-to-br from-blue-900 from-15% via-blue-800/80 to-blue-700/50 p-6'>
            <div className='flex flex-col gap-2'>
              <h2 className='text-lg font-light text-blue-300'>Total Balance</h2>
              <div className='flex items-end gap-2'>
                <span className='text-4xl font-medium'>$ 2'000.000</span>
                <span className='text-sm text-emerald-500'>15.9%</span>
              </div>
            </div>
            <div className='flex gap-4'>
              <Button
                variant='filled'
                size='sm'
              >
                Add
              </Button>
              <Button
                variant='text'
                size='sm'
              >
                Send
              </Button>
              <Button
                variant='text'
                size='sm'
              >
                Save
              </Button>
            </div>
          </div>
          <GridDoodle className='absolute right-0 top-0' />
        </div>
      </div>
    </>
  );
}