/* eslint-disable react/react-in-jsx-scope */
import Navigation from '../Navigation';
import Contacts from './Contacts';

const ContactMain = () => {
  return (
    <div className='flex flex-row'>
      <Navigation/>
      <Contacts/>
    </div>
  );
};
export default ContactMain;
