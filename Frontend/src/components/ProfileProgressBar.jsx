import React from 'react';
export function ProfileProgressBar({ progress, className = '' }) {
    // Determine color based on progress percentage
    const getColor = (value) => {
        if (value < 30)
            return 'bg-red-500';
        if (value < 70)
            return 'bg-amber-500';
        return 'bg-green-500';
    };
    return (<div className={`w-full ${className}`}>
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-slate-700">
          Profile Completion
        </span>
        <span className="text-sm font-bold text-slate-900">
          {Math.round(progress)}%
        </span>
      </div>
      <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
        <div className={`h-2.5 rounded-full transition-all duration-500 ease-out ${getColor(progress)}`} style={{
            width: `${progress}%`
        }} role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
        </div>
      </div>
    </div>);
}
