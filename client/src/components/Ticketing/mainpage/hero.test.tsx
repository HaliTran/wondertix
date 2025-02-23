import {unmountComponentAtNode} from 'react-dom';
import * as ReactDOM from 'react-dom';
import React from 'react';
import userEvent from '@testing-library/user-event';
import {BrowserRouter, Route, Routes} from 'react-router-dom';
import {Provider} from 'react-redux';
import configureStore from 'redux-mock-store';

import Hero from './Hero';
import {ListComponent} from './EventCard';
import thunk from 'redux-thunk';

let container : HTMLDivElement;
let list : HTMLDivElement;

const mockStore = configureStore([thunk]);

const event = {
  title: 'Test Title',
  description: 'Test description',
  imageurl: 'https://test.com/image.jpg',
  id: 0,
};

let store: any;

beforeEach(() => {
  store = mockStore({
    ticketing: {
      events: [],
    },
  });

  container = document.createElement('div');
  list = document.createElement('div');
  document.body.appendChild(container);
  document.body.appendChild(list);

  ReactDOM.render(
    <BrowserRouter>
      <Provider store={store}>
        <Routes>
          <Route path="*" element={<Hero />} />
        </Routes>
      </Provider>
    </BrowserRouter>,
    container,
  );

  ReactDOM.render(
    <BrowserRouter>
      <Routes>
        <Route path="*" element={<ListComponent key={0} {...event} />} />
      </Routes>
    </BrowserRouter>,
    list,
  );
});

afterEach(() => {
  unmountComponentAtNode(container);
  container.remove();
  container = null;
});

it('Hero section renders with all text', () => {
  const check = container.querySelectorAll('div');
  expect(check).toHaveLength(8);
});


it('Add ticket success', () => {
  const button = list.querySelector('button');
  let check = list.querySelectorAll('div');
  expect(check).toHaveLength(4);

  userEvent.click(button);

  check = container.querySelectorAll('div');
  expect(check).toHaveLength(8);
});
