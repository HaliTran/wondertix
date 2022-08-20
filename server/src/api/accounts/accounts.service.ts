// api/accounts/accounts.service.ts

import {response, buildResponse} from '../db';

/* NOTE -- currently uses old database, so accounts are users */

export const findAll = async (params: any): Promise<response> => {
  const myQuery = {
    text: `SELECT * FROM users
            WHERE ($1::text IS NULL OR LOWER(username) LIKE $1)
            AND ($2::boolean IS NULL OR is_superadmin = $2)`,
    values: [
      params.username !== undefined ?
        '%' + params.username + '%':
        params.username,
      params.is_superadmin,
    ],
  };

  /*if (Object.keys(params).length > 0) {
    let count = 0;
    myQuery.text += ' WHERE';
    for (const val of Object.keys(params)) {
      count += 1;
      if (count > 1) {
        myQuery.text += ' AND';
      }
      if (val === 'username') {
        myQuery.text += ` LOWER(username) LIKE $${count}`;
        myQuery.values.push('%' + params[val].toLowerCase() + '%');
      } else if (val === 'is_superadmin') {
        myQuery.text += ` is_superadmin = $${count}`;
        myQuery.values.push(params[val]);
      }
    }
  }*/

  return await buildResponse(myQuery, 'GET');
};

export const findByUsername = async (username: string): Promise<response> => {
  const myQuery = {
    text: `SELECT * FROM users WHERE username = $1`,
    values: [username],
  };
  return await buildResponse(myQuery, 'GET');
};

export const find = async (id: string): Promise<response> => {
  const myQuery = {
    text: 'SELECT * FROM users WHERE id = $1',
    values: [id],
  };
  return await buildResponse(myQuery, 'GET');
};

export const create = async (
    r: {username: string, auth0_id: string},
): Promise<response> => {
  const myQuery = {
    text: `
      INSERT INTO users
      VALUES (DEFAULT, $1, DEFAULT, $2)
      RETURNING *
      `,
    values: [r.username, r.auth0_id],
  };
  return await buildResponse(myQuery, 'POST');
};

export const remove = async (id: string): Promise<response> => {
  const myQuery = {
    text: 'DELETE FROM users WHERE id = $1',
    values: [id],
  };
  return buildResponse(myQuery, 'DELETE');
};

export const update = async (r: any): Promise<response> => {
  const myQuery = {
    text: `
      UPDATE users
      SET (username, pass_hash, is_superadmin) = ($1, $2, $3)
      WHERE id = $4
      RETURNING *
      `,
    values: [
      r.body.username,
      r.body.pass_hash,
      r.body.is_superadmin,
      r.params.id,
    ],
  };
  return buildResponse(myQuery, 'UPDATE');
};
