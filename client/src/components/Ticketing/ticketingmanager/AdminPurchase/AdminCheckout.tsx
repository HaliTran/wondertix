import {
  removeAllTicketsFromCart,
} from '../ticketingSlice';
import {useAppDispatch} from '../../app/hooks';
import {loadStripe} from '@stripe/stripe-js';
import React, {ReactElement, useState} from 'react';
import AdminCompleteOrderForm, {
  CheckoutFormInfo,
} from './AdminCompleteOrderForm';
import {emptyDiscountCode} from './utils/adminCommon';
import {useNavigate, useLocation} from 'react-router-dom';
import AdminCart from './AdminCart';

const pk = `${process.env.REACT_APP_PUBLIC_STRIPE_KEY}`;
const stripePromise = loadStripe(pk);

/**
 * Displays Checkout Page
 *
 * @returns {ReactElement}
 */
export default function AdminCheckout(): ReactElement {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [appliedDiscount, setAppliedDiscount] = useState(null);

  const eventDataFromPurchase = location.state?.eventData || [];
  const cartItems = location.state?.cartItems || [];

  const doCheckout = async (checkoutFormInfo: CheckoutFormInfo) => {
    try {
      const formData = {...checkoutFormInfo};
      if (formData.seatingAcc === 'Other') {
        formData.seatingAcc = formData.otherSeatingAcc;
      }

      const donation = +formData.donation;
      const discount = appliedDiscount ? appliedDiscount : emptyDiscountCode;

      const stripe = await stripePromise;
      if (!stripe) return;

      const response = await fetch(
        process.env.REACT_APP_API_2_URL + `/events/checkout`,
        {
          credentials: 'include',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({cartItems, formData, donation, discount}),
        },
      );
      if (!response.ok) {
        throw response;
      }
      const session = await response.json();
      if (session.id === 'comp') {
        dispatch(removeAllTicketsFromCart());
        navigate(`/success`);
      }
      const result = await stripe.redirectToCheckout({sessionId: session.id});
      if (result.error) {
        console.error(result.error.message);
      }
    } catch (error) {
      console.error('Error response status: ', error.status);
      if (error.json) {
        const errorMessage = await error.json();
        console.error('Error message from server: ', errorMessage);
      }
    }
  };

  return (
    <div className='w-full h-screen overflow-x-hidden absolute'>
      <div className='flex flex-col lg:ml-[15rem] lg:mx-[5rem] md:ml-[13rem] tab:mx-[2rem] mx-[0.5rem] mt=[5rem] mb-[9rem]'>
        <div className='flex flex-col mt-[6rem] items-center md:flex-row rounded-[1rem] md:items-stretch md:bg-white w-full h-full'>
          <div className='min-w-414 w-full h-full md:m-[2rem] md:mr-5 mt-10 bg-zinc-100 p-2 md:p-[1rem] flex flex-col gap-5 items-start rounded-xl overflow-auto'>
            <div className='flex flex-col items-center h-auto w-full'>
              <h1 className='text-3xl font-bold mb-5'>
                Complete Order
              </h1>
              <AdminCompleteOrderForm
                onSubmit={doCheckout}
                backButtonRoute='../ticketing/purchaseticket'
                eventDataFromPurchase={eventDataFromPurchase}
              />
            </div>
          </div>
          <div
            className='md:w-[30rem] w-full mt-10
              md:ml-5 md:m-[2rem] bg-zinc-900 p-9 flex
              flex-col items-center rounded-xl justify-between'
          >
            <AdminCart
              backButtonRoute='../ticketing/purchaseticket'
              eventDataFromPurchase={eventDataFromPurchase}
              onDiscountChange={setAppliedDiscount}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
