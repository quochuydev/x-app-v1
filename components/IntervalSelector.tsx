'use client';

interface IntervalSelectorProps {
  interval: string;
  onIntervalChange: (interval: string) => void;
}

export default function IntervalSelector({ interval, onIntervalChange }: IntervalSelectorProps) {
  const intervals = [
    { value: '1m', label: '1 Minute' },
    { value: '5m', label: '5 Minutes' },
    { value: '1h', label: '1 Hour' },
  ];

  return (
    <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
      <span className="text-sm font-medium text-gray-700">Interval:</span>
      <div className="flex space-x-2">
        {intervals.map((int) => (
          <button
            key={int.value}
            onClick={() => onIntervalChange(int.value)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              interval === int.value
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            {int.label}
          </button>
        ))}
      </div>
    </div>
  );
}