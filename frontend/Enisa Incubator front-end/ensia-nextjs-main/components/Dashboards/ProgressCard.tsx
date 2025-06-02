import React from "react";
import { ArrowRightCircle, Clock } from "lucide-react";

type Stage = {
  name: string;
  status: "done" | "current" | "pending";
  description: string;
};

type Props = {
  percentage: number;
  stages: Stage[];
  ideaName: string;
};

const ProgressCard: React.FC<Props> = ({ percentage, stages, ideaName }) => {
  const radius = 84;
  const stroke = 11;
  const circumference = Math.PI * radius;
  const offset = circumference * (1 - percentage / 100);

  return (
    <div className=" min-h-140  w-full rounded-2xl border border-gray-300 bg-white p-6 shadow-lg"> {/* max-w-[500px] to standardize width */}
      {/* Idea Name */}
      <div className="mb-2 text-sm font-semibold text-blue-400">{ideaName}</div>
      <div className="text-lg font-bold text-black">Startup Status</div>

      {/* Semi-Circle Progress Bar */}
      <div className="relative mt-6 mb-6 flex justify-center">
        <svg width="180" height="90">
          <circle
            cx="90"
            cy="90"
            r={radius}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth={stroke}
            strokeDasharray={circumference}
            strokeDashoffset={0}
            strokeLinecap="round"
            transform="rotate(-180 90 90)"
          />
          <circle
            cx="90"
            cy="90"
            r={radius}
            fill="none"
            stroke="#4ade80"
            strokeWidth={stroke}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            transform="rotate(-180 90 90)"
          />
        </svg>
        <div className="absolute top-10 text-center">
          <div className="text-2xl font-bold text-black">{percentage}%</div>
          <div className="text-xs text-gray-500">my achievements</div>
        </div>
      </div>

      {/* Stages */}
      <div className="space-y-4">
        {stages.map((stage, idx) => (
          <div key={idx}>
            <div className="flex items-center space-x-2">
              {stage.status === "done" && <ArrowRightCircle className="h-5 w-5 text-green-500" fill="#22c55e" />}
              {stage.status === "current" && <Clock className="h-5 w-5 text-yellow-500" />}
              {stage.status === "pending" && <div className="w-5" />} {/* placeholder for alignment */}
              <span className="text-base font-semibold text-black">{stage.name}</span>
            </div>
            <div className="ml-7 text-sm text-gray-600">{stage.description}</div>
          </div>
        ))}
      </div>

      {/* View All */}
      {/*}
      <div className="mt-6 flex justify-center">
        <button className="text-blue-500 hover:underline text-sm">View all</button>
      </div>*/}
    </div>

  );
};

export default ProgressCard;