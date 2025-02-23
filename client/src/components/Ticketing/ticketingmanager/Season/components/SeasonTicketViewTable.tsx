import React from 'react';
import {SeasonTicketValues} from './utils/seasonCommon';

interface SeasonTicketViewTableProps {
  seasonTicketTypeData: SeasonTicketValues[];
}

export const SeasonTicketViewTable = (props: SeasonTicketViewTableProps) => {
  const {seasonTicketTypeData} = props;

  return (
    <div className={'bg-gray-300 grid grid-cols-12 rounded-xl p-1 h-[100%]'}>
      <div className={'overflow-y-auto overflow-x-auto col-span-12 shadow-xl border border-white rounded-xl bg-white w-[100%] min-h-[100px]'}>
        <table className={'table table-fixed text-sm min-w-[100%]'}>
          <thead className={'text-left text-zinc-800 whitespace-nowrap bg-gray-300 top-0'}>
            <tr>
              <th className={'px-2 py-1 border border-white'}>Admission Type</th>
              <th className={'px-2 py-1 border border-white'}>Ticket Price</th>
              <th className={'px-2 py-1 border border-white'}>Concession Price</th>
            </tr>
          </thead>
          <tbody className={'whitespace-nowrap'}>
            {seasonTicketTypeData && seasonTicketTypeData.length > 0 ? (
              seasonTicketTypeData.map((ticketType, index) => (
                <tr key={index}>
                  <td className={'px-2'}>{ticketType.description}</td>
                  <td className={'px-2'}>${Number(ticketType.price).toFixed(2)}</td>
                  <td className={'px-2'}>${Number(ticketType.concessionprice).toFixed(2)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className={'px-2 text-center'}>No Current Ticket Types</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
