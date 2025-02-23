import React from 'react';
import TaskForm from './TaskForm';

/**
 * @returns {React.ReactElement} React element representing task form
 */
const Tasks = (): React.ReactElement => {
  return (
    <div className='w-full h-screen overflow-x-hidden absolute'>
      <div className=' md:ml-[18rem] md:mt-40 md:mr-40
         md:mb-[11rem] tab:mx-[5rem] mx-[1.5rem] my-[9rem]'>
        <TaskForm />
      </div>
    </div>
  );
};

export default Tasks;
