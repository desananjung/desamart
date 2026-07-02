import React from 'react';

const LocalRewardBadge = ({ points, level }) => {
  const levels = {
    PEMULA: { icon: '🌱', color: 'bg-green-100 text-green-700' },
    PELANGGAN: { icon: '🌿', color: 'bg-blue-100 text-blue-700' },
    PELANGGAN_SETIA: { icon: '🌳', color: 'bg-purple-100 text-purple-700' },
    AMBASSADOR: { icon: '🏅', color: 'bg-yellow-100 text-yellow-700' }
  };

  const currentLevel = levels[level] || levels.PEMULA;

  return (
    <div className="flex items-center gap-2 bg-white rounded-full px-3 py-1 shadow-sm">
      <span className="text-lg">{currentLevel.icon}</span>
      <span className={`text-xs font-medium ${currentLevel.color}`}>
        {level.replace('_', ' ')}
      </span>
      <span className="text-xs text-gray-500">• {points} poin</span>
    </div>
  );
};

export default LocalRewardBadge;