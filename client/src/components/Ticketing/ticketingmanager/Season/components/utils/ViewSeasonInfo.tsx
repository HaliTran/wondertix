import React from 'react';
import {SeasonInfo, SeasonTicketValues} from './seasonCommon';
import {SeasonImage} from '../../seasonUtils';
import {FormControlLabel, Switch} from '@mui/material';
import Tooltip from '@mui/material/Tooltip';
import {SeasonTicketViewTable} from '../SeasonTicketViewTable';

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

interface ViewSeasonInfoProps extends SeasonInfo {
  activeSeasonSwitch: boolean;
  someActiveEvents: boolean;
  setIsFormEditing: (value) => void;
  handleUpdateSeasonEvents: (value) => void;
  setActiveSeasonSwitch: (value) => void;
  setSomeActiveEvents: (value) => void;
  deleteConfirmationHandler: (event) => void;
  seasonTicketTypeData: SeasonTicketValues[];
}

const ViewSeasonInfo = (props: ViewSeasonInfoProps) => {
  const {
    name,
    startdate,
    enddate,
    imageurl,
    activeSeasonSwitch,
    someActiveEvents,
    setIsFormEditing,
    handleUpdateSeasonEvents,
    setActiveSeasonSwitch,
    setSomeActiveEvents,
    deleteConfirmationHandler,
    seasonTicketTypeData,
  } = props;

  const getLongDateFormat = (date: string) => {
    const year: string = date.slice(0, 4);
    const month = Number(date.slice(5, 7));
    const day = date.slice(8);

    return `${MONTHS[month - 1]} ${day}, ${year}`;
  };

  return (
    <header className='rounded-xl bg-white p-7 text-lg shadow-xl'>
      <section className='flex flex-col gap-3 text-center mb-5 justify-between min-[750px]:flex-row min-[750px]:flex-wrap'>
        <h1 className='text-4xl font-semibold'>Season Information</h1>
        <div className='flex flex-col gap-2 min-[750px]:flex-row'>
          <p
            className={`${
              activeSeasonSwitch ? 'bg-green-100' : 'bg-red-100'
            } py-2 px-2 md:px-7 rounded-lg font-medium`}
          >
            {activeSeasonSwitch ? 'ACTIVE' : 'INACTIVE'}
          </p>
          <Tooltip title='Edit' placement='top' arrow>
            <button
              data-testid='season-edit'
              className='flex justify-center items-center bg-gray-400 hover:bg-gray-500 disabled:bg-gray-500 text-white font-bold px-2 py-2 rounded-xl'
              onClick={() => setIsFormEditing(true)}
            >
              <svg
                xmlns='http://www.w3.org/2000/svg'
                className='h-6 w-6'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
                strokeWidth={2}
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  d='M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z'
                />
              </svg>
            </button>
          </Tooltip>
          <Tooltip title='Delete' placement='top' arrow>
            <button
              data-testid='season-delete'
              className='flex justify-center items-center bg-red-500 hover:bg-red-600 disabled:bg-gray-500 text-white font-bold px-2 py-2 rounded-xl'
              onClick={deleteConfirmationHandler}
            >
              <svg
                xmlns='http://www.w3.org/2000/svg'
                className='h-6 w-6'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
                strokeWidth={2}
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16'
                />
              </svg>
            </button>
          </Tooltip>
        </div>
      </section>
      <div className='grid grid-cols-12'>
        <article className='flex flex-col col-span-6 mb-5 text-center sm:text-start lg:col-span-2'>
          <h3 className='font-semibold'>Season Name</h3>
          <p className='mb-3 text-base'>{name}</p>

          <h3 className='font-semibold'>Start Date</h3>
          <p className='mb-3 text-base'>{getLongDateFormat(startdate)}</p>

          <h3 className='font-semibold'>End Date</h3>
          <p className='mb-3 text-base'>{getLongDateFormat(enddate)}</p>

          <div className='flex items-center'>
            <FormControlLabel
              control={<Switch checked={activeSeasonSwitch} />}
              onChange={() => {
                setActiveSeasonSwitch((checked) => !checked);
                setSomeActiveEvents((someActiveEvents) => !someActiveEvents);
                void handleUpdateSeasonEvents(!activeSeasonSwitch);
              }}
              sx={{margin: 0}}
              label={
                <p className='text-zinc-800 font-semibold pr-2'>
                  Active:
                </p>
              }
              labelPlacement='start'
            />
            {!activeSeasonSwitch && someActiveEvents && (
              <Tooltip
                title='One or more events within this season are active'
                placement='top-start'
                arrow
              >
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  className='h-5 w-5 text-zinc-400'
                  fill='currentColor'
                  viewBox='0 0 20 20'
                >
                  <path
                    fillRule='evenodd'
                    d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z'
                    clipRule='evenodd'
                  />
                </svg>
              </Tooltip>
            )}
          </div>
        </article>
        <div className='col-span-6 lg:col-span-2'>
          <SeasonImage
            className='h-auto max-w-[150px] object-cover mx-1 mt-3'
            src={imageurl}
            alt={`Cover photo for ${name} season`}
          />
        </div>
        <div className='lg:ml-2 col-span-12 lg:col-span-8 h-[100%] w-[100%] pt-3 md:p-3 rounded-lg'>
          <SeasonTicketViewTable
            seasonTicketTypeData={seasonTicketTypeData}
          />
        </div>
      </div>
    </header>
  );
};

export default ViewSeasonInfo;
