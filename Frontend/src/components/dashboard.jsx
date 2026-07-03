import React from 'react';

const Dashboard = ({ total, solved, difficultyCounts }) => {
  const completionPercentage = total === 0 ? 0 : Math.round((solved / total) * 100);

  return (
    <div className="card bg-gradient-to-br from-violet-600 to-pink-500 text-white rounded-xl shadow-md">
      <div className="card-body p-5">
        {/* Title */}
        <h2 className="text-xl font-bold mb-3 text-white">📈 Your Progress</h2>

        {/* Completion Progress */}
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span>Completed</span>
            <span>{completionPercentage}%</span>
          </div>
          <progress
            className="progress progress-info w-full"
            value={completionPercentage}
            max="100"
          ></progress>
        </div>

        {/* Stats Summary */}
        <div className="text-sm space-y-1 mb-4">
          <div>Total Problems: {total}</div>
          <div>Solved Problems: {solved}</div>
        </div>

        {/* Difficulty Breakdown */}
        <div className="mt-3">
          <h3 className="font-semibold mb-2">🧠 Difficulty Breakdown</h3>
          <ul className="space-y-2 text-sm">
            <li className="flex justify-between items-center">
              <span className="badge badge-success text-white">Easy</span>
              <span>{difficultyCounts.easy.solved}/{difficultyCounts.easy.total}</span>
            </li>
            <li className="flex justify-between items-center">
              <span className="badge badge-warning text-white">Medium</span>
              <span>{difficultyCounts.medium.solved}/{difficultyCounts.medium.total}</span>
            </li>
            <li className="flex justify-between items-center">
              <span className="badge badge-error text-white">Hard</span>
              <span>{difficultyCounts.hard.solved}/{difficultyCounts.hard.total}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
