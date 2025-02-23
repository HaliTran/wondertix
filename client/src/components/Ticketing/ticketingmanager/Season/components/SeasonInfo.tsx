import React, {useEffect, useState} from 'react';
import {getSeasonImage, SeasonImage} from '../seasonUtils';
import {useNavigate} from 'react-router';
import {
  createNewSeason,
  getSeasonInfo,
  updateSeasonInfo,
  RequestBody,
  deleteSeasonInfo,
  updateEventSeason,
} from './utils/apiRequest';
import {
  seasonDefaultValues,
  SeasonProps,
  SeasonTicketValues,
} from './utils/seasonCommon';
import ViewSeasonInfo from './utils/ViewSeasonInfo';
import {LoadingScreen} from '../../../mainpage/LoadingScreen';
import {SeasonTicketTypeUpdateTable} from './utils/SeasonTicketTypeUpdateTable';

const SeasonInfo = (
  props: SeasonProps & {
    onUpdateSeasonTicketType: (
      requestData: any,
      seasonId: number,
    ) => Promise<void>;
  },
) => {
  const {
    seasonId,
    isFormEditing,
    eventsInSeason,
    setEventsInSeason,
    setSeasonId,
    setShowPopUp,
    setPopUpMessage,
    setIsFormEditing,
    token,
    seasonTicketTypeData,
    onUpdateSeasonTicketType,
  } = props;
  const [seasonValues, setSeasonValues] = useState(seasonDefaultValues);
  const [tempImageUrl, setTempImageUrl] = useState('');
  const [activeSeasonSwitch, setActiveSeasonSwitch] = useState<
    boolean | undefined
  >();
  const [someActiveEvents, setSomeActiveEvents] = useState(false);
  const [updatedTicketData, setUpdatedTicketData] = useState<
    SeasonTicketValues[]
  >([]);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const {name, startdate, enddate, imageurl} = seasonValues;
  const navigate = useNavigate();

  const handleGetSeasonInfo = async () => {
    const fetchedSeasonInfo = await getSeasonInfo(seasonId, token);
    const {imageurl: fetchedImage} = fetchedSeasonInfo;

    if (fetchedSeasonInfo) {
      if (fetchedImage === 'Default Season Image') {
        setSeasonValues({
          ...fetchedSeasonInfo,
          imageurl: '',
        });
        return;
      }
      setSeasonValues(fetchedSeasonInfo);
      setTempImageUrl(getSeasonImage(fetchedImage));
    }
  };

  const handleTicketTypeUpdate = (
    updatedTicketTypeData: SeasonTicketValues[],
  ) => {
    setUpdatedTicketData(updatedTicketTypeData);
  };

  const handleCreateNewSeason = async (reqObject: RequestBody, ticketTypes) => {
    const createdSeasonId = await createNewSeason(reqObject, token);
    await onUpdateSeasonTicketType(ticketTypes, createdSeasonId);
    if (createdSeasonId) {
      setPopUpMessage({
        title: 'Success',
        message: 'Season created successfully!',
        success: true,
        handleClose: () => setShowPopUp(false),
        handleProceed: () => setShowPopUp(false),
      });
      setShowPopUp(true);
      setSeasonId(createdSeasonId);
      navigate(`/ticketing/seasons/${createdSeasonId}`);
    }
  };

  const handleUpdateSeasonEvents = async (isSeasonActive: boolean) => {
    for (const event of eventsInSeason) {
      const eventReqBody = {...event, active: isSeasonActive};
      delete eventReqBody['deletedat'];
      const updateSingleEvent = await updateEventSeason(eventReqBody, token);
      if (!updateSingleEvent) return;
    }
    setEventsInSeason((allEventsInSeason) => {
      return allEventsInSeason.map((singleEvent) => {
        return {...singleEvent, active: isSeasonActive};
      });
    });
  };

  const handleUpdateSeason = async (reqObject: RequestBody, ticketTypes) => {
    const updateSeason = await updateSeasonInfo(reqObject, seasonId, token);
    await onUpdateSeasonTicketType(ticketTypes, seasonId);
    const {imageurl} = reqObject;
    if (updateSeason) {
      setPopUpMessage({
        title: 'Success',
        message: 'Season update successful!',
        success: true,
        handleClose: () => setShowPopUp(false),
        handleProceed: () => setShowPopUp(false),
      });
      setShowPopUp(true);
      setTempImageUrl(imageurl === 'Default Season Image' ? '' : imageurl);
    }
  };

  const handleDeleteSeason = async (seasonId: number) => {
    const deleteSeason = await deleteSeasonInfo(seasonId, token);
    if (deleteSeason) {
      navigate('/ticketing/seasons');
    }
  };

  const onSubmit = async (event) => {
    event.preventDefault();

    // Validate Table Data
    const isTableDataValid = updatedTicketData.every(
      (ticketType) =>
        String(ticketType.price) !== '' &&
        String(ticketType.concessionprice) !== '' &&
        Number(ticketType.price) >= 0 &&
        Number(ticketType.concessionprice) >= 0,
    );

    if (!isTableDataValid) {
      handleInvalidTicketTypeValue(event);
      return;
    }

    // Round Table Data to 2 decimal places
    const roundedTicketData = updatedTicketData.map((ticketType) => ({
      ...ticketType,
      price: Number(ticketType.price).toFixed(2),
      concessionprice: Number(ticketType.concessionprice).toFixed(2),
    }));

    // formatting request body for POST and PUT request
    const reqObject = {
      ...seasonValues,
      startdate: Number(startdate.replaceAll('-', '')),
      enddate: Number(enddate.replaceAll('-', '')),
      imageurl: imageurl === '' ? 'Default Season Image' : imageurl,
    };

    if (seasonId === 0) {
      await handleCreateNewSeason(reqObject, roundedTicketData);
    } else {
      await handleUpdateSeason(reqObject, roundedTicketData);
    }
    setIsFormEditing(false);
  };

  const onChangeHandler = (event) => {
    setTouched((prev) => ({
      ...prev,
      [event.target.name]: true,
    }));
    const currentValues = {
      ...seasonValues,
      [event.target.name]: event.target.value,
    };
    validateSeasonInformation(currentValues);
    setSeasonValues(currentValues);
  };

  const validateSeasonInformation = (currentValues) => {
    const errors = {};
    Object.keys(currentValues).forEach((key) => {
      switch (key) {
        case 'startdate' || 'enddate': {
          const date = new Date(currentValues[key]);
          if (date.toString() === 'Invalid Date') {
            errors[key] = 'Invalid Date';
          }
          break;
        }
        case 'name': {
          if (!currentValues[key] || currentValues[key].trim() === '') {
            errors[key] = 'Required';
          }
          break;
        }
        case 'imageurl': {
          if (currentValues[key] && currentValues[key].length > 255) {
            errors[key] = 'Image URL must be no greater than 255 characters';
          }
        }
      }
    });

    if (
      !errors['startdate'] &&
      !errors['enddate'] &&
      new Date(currentValues.enddate).getTime() <
        new Date(currentValues.startdate).getTime()
    ) {
      errors['enddate'] = 'End date can not occur before start date';
    }

    setErrors(errors);
  };

  const handleCancelButton = (event) => {
    event.preventDefault();
    if (seasonId === 0) {
      navigate('/ticketing/seasons/');
    } else {
      setIsFormEditing(false);
      setSeasonValues({...seasonValues, imageurl: tempImageUrl});
    }
  };

  const handleInvalidTicketTypeValue = (event) => {
    event.preventDefault();
    setPopUpMessage({
      title: 'Invalid Ticket Type Value',
      message: 'Please enter a valid Ticket Price & Concession Price',
      success: false,
      handleClose: () => setShowPopUp(false),
      handleProceed: () => setShowPopUp(false),
      showSecondary: false,
    });
    setShowPopUp(true);
  };

  const deleteConfirmationHandler = (event) => {
    event.preventDefault();
    setPopUpMessage({
      title: 'Delete Season',
      message:
        'Are you sure you want to delete this season? All events currently in the season will be unassigned.',
      success: false,
      handleClose: () => setShowPopUp(false),
      handleProceed: () => handleDeleteSeason(seasonId),
    });
    setShowPopUp(true);
  };

  useEffect(() => {
    void handleGetSeasonInfo();
  }, [seasonId]);

  useEffect(() => {
    let isSeasonActive = true;
    let isActiveEvents = false;
    eventsInSeason.forEach((event) => {
      isSeasonActive = isSeasonActive && event.active;
      isActiveEvents = isActiveEvents || event.active;
    });

    setActiveSeasonSwitch(isSeasonActive);
    setSomeActiveEvents(isActiveEvents);
  }, [eventsInSeason]);

  if (activeSeasonSwitch === undefined) return <LoadingScreen />;

  return seasonId === 0 || isFormEditing ? (
    <form onSubmit={onSubmit} className='rounded-xl p-7 bg-white text-lg'>
      <section className='flex flex-col gap-3 text-center tab:flex-row tab:text-start tab:justify-between tab:flex-wrap tab:mb-5'>
        <h1 className='text-4xl font-semibold'>Edit Season</h1>
        <article className='flex flex-wrap justify-center gap-2 mb-3 tab:mb-0'>
          <button
            disabled={Object.keys(errors).length !== 0}
            type='submit'
            className='bg-green-500 hover:bg-green-700 disabled:bg-gray-500 text-white font-bold py-2 px-7 rounded-xl'
          >
            Save
          </button>
          <button
            className='bg-blue-500 hover:bg-blue-700 disabled:bg-gray-500 text-white font-bold py-2 px-7 rounded-xl'
            onClick={handleCancelButton}
          >
            Cancel
          </button>
        </article>
      </section>
      <div className='grid grid-cols-12'>
        <div className='flex flex-col gap-3 col-span-12 mb-5 text-center tab:text-start lg:col-span-2'>
          <label htmlFor='seasonName'>
            Season Name:
            <input
              type='text'
              id='seasonName'
              name='name'
              value={name}
              onChange={onChangeHandler}
              className='text-sm w-full rounded-lg p-1 border border-zinc-400'
              required
            />
            {touched['name'] && errors['name'] && (
              <p className='text-xs text-red-500 text-center'>
                {errors['name']}
              </p>
            )}
          </label>
          <label htmlFor='startDate'>
            Start Date:
            <input
              type='date'
              id='startDate'
              name='startdate'
              value={startdate}
              onChange={onChangeHandler}
              className='text-sm w-full rounded-lg p-1 border border-zinc-400'
              required
            />
            {touched['startdate'] && errors['startdate'] && (
              <p className='text-xs text-red-500 text-center'>
                {errors['startdate']}
              </p>
            )}
          </label>
          <label htmlFor='endDate'>
            End Date:
            <input
              type='date'
              id='endDate'
              name='enddate'
              value={enddate}
              onChange={onChangeHandler}
              className='text-sm w-full rounded-lg p-1 border border-zinc-400'
              required
            />
            {(touched['enddate'] || touched['startdate'])&& errors['enddate'] && (
              <p className='text-xs text-red-500 text-center'>
                {errors['enddate']}
              </p>
            )}
          </label>
          <label htmlFor='imageUrl'>
            Image URL:
            <div className='flex gap-2'>
              <input
                type='text'
                id='imageUrl'
                name='imageurl'
                value={imageurl}
                onChange={onChangeHandler}
                className='text-sm w-full rounded-lg p-1 border border-zinc-400 disabled:bg-gray-200'
              />
              {seasonValues.imageurl !== '' && (
                <button
                  className='bg-blue-500 hover:bg-blue-700 disabled:bg-gray-500 text-white font-bold px-4 py-1 rounded-xl'
                  onClick={() => {
                    setSeasonValues((seasonValues) => ({
                      ...seasonValues,
                      imageurl: '',
                    }));
                    setErrors((prev) => {
                      // @ts-ignore
                      const {imageurl, ...rest} = prev;
                      return rest;
                    });
                  }}
                >
                  Default
                </button>
              )}
            </div>
            {touched['imageurl'] && errors['imageurl'] && (
              <p className='text-xs text-red-500 text-center'>
                {errors['imageurl']}
              </p>
            )}
          </label>
        </div>
        <article className='col-span-12 lg:col-span-2 pl-2'>
          <SeasonImage
            className='h-auto max-w-[175px] mx-auto mt-5'
            src={imageurl}
            alt={`Cover photo for ${name} season`}
          />
        </article>
        <div className='lg:ml-2 col-span-12 lg:col-span-8 h-[100%] w-[100%] pt-3 md:p-3 rounded-lg'>
          <SeasonTicketTypeUpdateTable
            seasonTicketTypeData={seasonTicketTypeData}
            onUpdate={handleTicketTypeUpdate}
          />
        </div>
      </div>
    </form>
  ) : (
    <ViewSeasonInfo
      {...seasonValues}
      activeSeasonSwitch={activeSeasonSwitch}
      someActiveEvents={someActiveEvents}
      setIsFormEditing={setIsFormEditing}
      seasonTicketTypeData={seasonTicketTypeData}
      setActiveSeasonSwitch={setActiveSeasonSwitch}
      setSomeActiveEvents={setSomeActiveEvents}
      handleUpdateSeasonEvents={handleUpdateSeasonEvents}
      deleteConfirmationHandler={deleteConfirmationHandler}
    />
  );
};

export default SeasonInfo;
