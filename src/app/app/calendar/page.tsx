import { Button } from '@/components';
import { FunnelIcon, PlusIcon } from '@/icons';

export default function Calendar() {
  return (
    <div className="flex h-full w-full">
      <aside>
        Calendar sidebar
      </aside>
      <div className="flex w-full flex-col">
        <div className="flex items-center justify-between gap-4 p-4 pb-0">
          <h2 className='text-lg font-semibold'>February 2025</h2>
          <div className="flex items-center gap-2">
            <Button
              variant='outline'
              size='sm'
            >
              Today
            </Button>
            <Button
              variant='outline'
              size='sm'
              className='!w-fit'
              icon={FunnelIcon}
              iconPosition='only'
            />
            <Button
              variant='filled'
              size='sm'
              className='!min-w-fit'
              icon={PlusIcon}
              iconClassName='ml-2'
            >
              Add event
            </Button>
          </div>
        </div>
        <div className='h-full w-full p-4'>
          <div className='flex h-full flex-col rounded-lg border border-neutral-200 bg-light dark:border-neutral-800 dark:bg-dark'>
            <div className='grid h-full grid-cols-7 grid-rows-[auto_1fr_1fr_1fr_1fr_1fr_1fr] divide-x divide-y divide-neutral-200 border-b border-neutral-200 text-sm *:p-2 dark:divide-neutral-800 dark:border-neutral-800'>
              <span>Mo</span>
              <span>Tu</span>
              <span>We</span>
              <span>Th</span>
              <span>Fr</span>
              <span>Sa</span>
              <span>Su</span>
              <div className='h-full'>26</div>
              <div className='h-full'>27</div>
              <div className='h-full'>28</div>
              <div className='h-full'>29</div>
              <div className='h-full'>30</div>
              <div className='h-full'>31</div>
              <div className='h-full'>1</div>
              <div className='h-full'>2</div>
              <div className='h-full'>3</div>
              <div className='h-full'>4</div>
              <div className='h-full'>5</div>
              <div className='h-full'>6</div>
              <div className='h-full'>7</div>
              <div className='h-full'>8</div>
              <div className='h-full'>9</div>
              <div className='h-full'>10</div>
              <div className='h-full'>11</div>
              <div className='h-full'>12</div>
              <div className='h-full'>13</div>
              <div className='h-full'>14</div>
              <div className='h-full'>15</div>
              <div className='h-full'>16</div>
              <div className='h-full'>17</div>
              <div className='h-full'>18</div>
              <div className='h-full'>19</div>
              <div className='h-full'>20</div>
              <div className='h-full'>21</div>
              <div className='h-full'>22</div>
              <div className='h-full'>23</div>
              <div className='h-full'>24</div>
              <div className='h-full'>25</div>
              <div className='h-full'>26</div>
              <div className='h-full'>27</div>
              <div className='h-full'>28</div>
              <div className='h-full'>1</div>
              <div className='h-full'>2</div>
              <div className='h-full'>3</div>
              <div className='h-full'>4</div>
              <div className='h-full'>5</div>
              <div className='h-full'>6</div>
              <div className='h-full'>7</div>
              <div className='h-full'>8</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}