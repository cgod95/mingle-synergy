import React from 'react';

interface ExpiredMatchNoticeProps {
  name: string;
}

const ExpiredMatchNotice: React.FC<ExpiredMatchNoticeProps> = ({ name }) => {
  return (
    <div className="p-4 border border-red-200 rounded-2xl bg-red-50 shadow max-w-md mx-auto mt-4">
      <h3 className="text-lg font-semibold text-red-800 mb-2">Expired Match</h3>
      <p className="text-sm text-red-700">
        Your match with <span className="font-medium">{name}</span> has expired. You can reconnect if you both check in again.
      </p>
    </div>
  );
};

export default ExpiredMatchNotice; 