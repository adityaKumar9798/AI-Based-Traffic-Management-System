import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { Clock, ArrowLeft } from 'lucide-react';
import { Intersection } from '../types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface WaitTimeAnalyticsProps {
  intersections: Intersection[];
  onClose: () => void;
}

const WaitTimeAnalytics: React.FC<WaitTimeAnalyticsProps> = ({ intersections, onClose }) => {
  const sortedByWaitTime = [...intersections].sort((a, b) => b.trafficData.waitTime - a.trafficData.waitTime);
  const averageWaitTime = Math.round(
    intersections.reduce((sum, intersection) => sum + intersection.trafficData.waitTime, 0) /
    intersections.length
  );

  const lineChartData = {
    labels: intersections.map(i => i.name),
    datasets: [
      {
        label: 'Wait Time (seconds)',
        data: intersections.map(i => i.trafficData.waitTime),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        tension: 0.4,
      },
    ],
  };

  const barChartData = {
    labels: ['Low', 'Medium', 'High'].map(level => `${level} Congestion`),
    datasets: [
      {
        label: 'Average Wait Time (seconds)',
        data: ['Low', 'Medium', 'High'].map(level => {
          const intersectionsWithLevel = intersections.filter(
            i => i.trafficData.congestionLevel === level
          );
          return intersectionsWithLevel.length
            ? Math.round(
                intersectionsWithLevel.reduce((sum, i) => sum + i.trafficData.waitTime, 0) /
                intersectionsWithLevel.length
              )
            : 0;
        }),
        backgroundColor: [
          'rgba(34, 197, 94, 0.6)',
          'rgba(234, 179, 8, 0.6)',
          'rgba(239, 68, 68, 0.6)',
        ],
        borderColor: [
          'rgb(34, 197, 94)',
          'rgb(234, 179, 8)',
          'rgb(239, 68, 68)',
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[1000] flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-4 border-b flex justify-between items-center bg-blue-50">
          <div className="flex items-center">
            <Clock className="w-6 h-6 text-blue-500 mr-2" />
            <h2 className="text-2xl font-bold text-gray-800">Wait Time Analytics</h2>
          </div>
          <button
            onClick={onClose}
            className="flex items-center text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="w-5 h-5 mr-1" />
            Back to Dashboard
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-700">Average Wait Time</h3>
              <p className="text-3xl font-bold text-blue-600">{averageWaitTime}s</p>
              <p className="text-sm text-gray-500">Across all intersections</p>
            </div>
            
            <div className="bg-yellow-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-700">Highest Wait Time</h3>
              <p className="text-3xl font-bold text-yellow-600">{sortedByWaitTime[0]?.trafficData.waitTime}s</p>
              <p className="text-sm text-gray-500">{sortedByWaitTime[0]?.name}</p>
            </div>

            <div className="bg-green-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-700">Lowest Wait Time</h3>
              <p className="text-3xl font-bold text-green-600">
                {sortedByWaitTime[sortedByWaitTime.length - 1]?.trafficData.waitTime}s
              </p>
              <p className="text-sm text-gray-500">
                {sortedByWaitTime[sortedByWaitTime.length - 1]?.name}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Wait Time by Intersection</h3>
              <Line
                data={lineChartData}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: 'top' as const,
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      title: {
                        display: true,
                        text: 'Seconds',
                      },
                    },
                  },
                }}
              />
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Average Wait Time by Congestion Level</h3>
              <Bar
                data={barChartData}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: 'top' as const,
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      title: {
                        display: true,
                        text: 'Seconds',
                      },
                    },
                  },
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WaitTimeAnalytics;