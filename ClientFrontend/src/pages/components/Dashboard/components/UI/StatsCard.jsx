import React from 'react';


const StatsCard = ({
  title,
  value,
  icon,
  description
}) => {
  return <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-100">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <h3 className="text-xl font-bold text-gray-800 mt-1">{value}</h3>
          {description && <p className="text-xs text-gray-500 mt-1">{description}</p>}
        </div>
        <div className="p-2 bg-gray-50 rounded-md">{icon}</div>
      </div>
    </div>;
};
export default StatsCard;