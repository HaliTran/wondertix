// api/db.ts

import dotenv from 'dotenv';
import path from 'path';
import {Pool} from 'pg';

dotenv.config({path: path.join(__dirname, '../../../.env')});
// console.log(path.join(__dirname, '../../.env'));

/**
 * define database configuration from .env environment file
 *
 * @typedef {Object} Config
 * @property {string} user - db username
 * @property {string} database - db name
 * @property {string} password - db password
 * @property {number} port - server tcp port
 * @property {string} host - server fqdn or ip address
 */

const config = {
  user: process.env.DB_USER,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT ?
      +process.env.DB_PORT : 5432,
  host: process.env.DB_HOST,
};

console.log('DB_HOST: ' + process.env.DB_HOST);

/**
 * create pool object from configuration
 *
 * @type {?}
 */

export const pool = new Pool(config);

/**
 * connect pool to database host
 */

pool.on('connect', () => {
  console.log(
      `
      [database]: Connected to ${config.database}/${config.user}@${config.host}
      `,
  );
});

/**
 * define response for pool queries
 *
 * @typedef {Object} Response
 * @property {Array<any>} data - array of rows in query response
 * @property {{success: boolean, message: string}} status - success indicator and result message(s)
 */

export type response = {
  data: Array<any>,
  status: {
    success: boolean,
    message: string,
  }
};

/**
 * builds a response message for a query result
 *
 * @type {Promise<response>}
 */

export const buildResponse = async (
    query: any,
    type: string,
): Promise<response> => {
  let resp: response = {
    data: <any[]>([]),
    status: {
      success: false,
      message: '',
    },
  };
  try {
    const res = await pool.query(query);
    console.log(res);
    let verificationString;
    switch (type) {
      case 'UPDATE':
        verificationString = 'updated';
        break;
      case 'GET':
        verificationString = 'returned';
        break;
      case 'DELETE':
        verificationString = 'deleted';
        break;
      case 'POST':
        verificationString = 'inserted';
        break;
    }
    resp = {
      data: res.rows,
      status: {
        success: true,
        message: `${res.rowCount} ${res.rowCount === 1 ?
          'row' :
          'rows'
        } ${verificationString}.`,
      },
    };
  } catch (error: any) {
    resp.status.message = error.message;
  }
  return resp;
};


// converts the databases integer representation of a date into a JS date object
// 20220512 -> 2022-05-12 == May 12 2022
export const parseIntToDate = (d : number) => {
  const year = d / 10000 | 0;
  d -= year *10000;
  const month = d / 100 | 0;
  const day = d - month*100;
  // month-1 because the month field is 0-indexed in JS
  return new Date(year, month-1, day);
};

// converts a JS date object to the databases integer representation of the date
// May 12 2022 -> 20220512
export const parseDateToInt = (d : Date) => {
  return d.getFullYear()*10000 + (d.getMonth()+1)*100 + d.getDate();
};