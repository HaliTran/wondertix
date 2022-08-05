/* eslint-disable no-unused-vars */
/* eslint-disable max-len */
import React, {useEffect} from 'react';
import {FieldArray} from 'react-final-form-arrays';
import {useState} from 'react';

// import {useDisaptch} from 'react-redux';
interface TicketType {
    id: number,
    name: string,
    price: number,
    concessions: number,
}

interface Showing {
    id?: number,
    starttime: string,
    eventdate: string,
    ticketTypeId: string,
    totalseats: number,
}
// eslint-disable-next-line react/prop-types
const ShowingInputContainer = ({id, addShow, deleteShow, editMode}) => {
  const [starttime, setStarttime] = useState('');
  const [eventdate, setEventdate] = useState('');
  const [ticketTypeId, setTicketTypeId] = useState('');
  const [totalseats, setTotalseats] = useState(Number);
  const [ticketTypes, setTicketTypes] = useState([]);
  const fetchTicketTypes = async () => {
    const res = await fetch(process.env.REACT_APP_ROOT_URL + '/api/tickets/types');
    setTicketTypes(await res.json());
  };

  useEffect(() => {
    fetchTicketTypes();
  }, []);

  // Generate the showing object to submit to parent component
  const createShowObject = (id) => {
    const showing: Showing = {id: id,
      starttime: starttime,
      eventdate: eventdate,
      ticketTypeId: ticketTypeId,
      totalseats: totalseats};
    return showing;
  };

  // Send callback to parent
  const handleClick = (event) => {
    event.preventDefault();
    //  use call back to get to parent state
    addShow(createShowObject(id));
  };

  const handleDelete = (event) => {
    event.preventDefault();
    deleteShow(id);
  };

  return (
    <div className='bg-violet-200 rounded-xl p-10 shadow-md mb-4' key={id}>
      <FieldArray name='showings'>
        {({fields}) =>
          fields.map((name, i) => (
            <div key={name} className='shadow-xl p-5 rounded-xl mb-9 bg-violet-700'>
              <label className='font-semibold text-white mb-7 mt-7  '>Show # {id + 1}</label>
              <div className='flex flex-col gap-5 mt-5 pr-20'>
                <input
                  className='input rounded-lg p-2 bg-violet-100'
                  name={`${name}.totalseats`}
                  type='number'
                  required
                  placeholder='# of Seats'
                  disabled={editMode}
                  onChange={(ev: React.ChangeEvent<HTMLInputElement>): void =>
                    setTotalseats(parseInt(ev.target.value))
                  }
                />
                <select
                  className='p-2 rounded-lg bg-violet-100'
                  name={`${name}.ticketTypeId`}
                  required
                  placeholder={'Select Ticket Type'}
                  onChange={(ev: React.ChangeEvent<HTMLSelectElement>): void =>
                    setTicketTypeId(ev.target.value)
                  }
                >
                  <option className='text-sm text-zinc-700 '>Select Ticket Type</option>
                  {ticketTypes.map((t) =>
                    <option key={t.id} value={t.id}>
                      {`${t.name}: ${t.price} (+ ${t.concessions} concessions)`}
                    </option >,
                  )}
                </select>
                <div className="flex flex-row gap-10">
                  <div>
                    <h3 className='font-semibold text-white'>Enter Date</h3>
                    <input type="date" name={`${name}.DateTime`} className='input w-full p-2 rounded-lg bg-violet-100 mb-7 '
                      onChange={(ev: React.ChangeEvent<HTMLInputElement>): void => {
                        const date = new Date().toISOString().slice(0, 19).replace('T', ' ');

                        setEventdate(date);
                      } }/>
                  </div>
                  <div >
                    <h3 className='font-semibold text-white'>Enter time</h3>
                    <input type="time" name="eventtime" placeholder='00:00:00'className='w-full p-2 rounded-lg bg-violet-100  mb-7 '
                      onChange={(ev: React.ChangeEvent<HTMLInputElement>): void =>{
                        setStarttime(ev.target.value + ':00');
                      }
                      }/>
                  </div>
                </div>
              </div>
              <button
                className='px-2 py-1 bg-blue-500 disabled:opacity-30  mt-2 mb-4 text-white rounded-lg text-sm'
                onClick={handleClick}
                disabled={editMode}
              >
                    Save
              </button>
              <button
                className='px-2 py-1 bg-red-500 disabled:opacity-30 ml-9 mt-2 mb-4 text-white rounded-lg text-sm'
                onClick={handleDelete}
                disabled={editMode}
              >
                        Delete
              </button>
            </div>
          ))
        }
      </FieldArray>
    </div>
  );
};

export default ShowingInputContainer;
