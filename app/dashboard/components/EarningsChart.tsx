"use client";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const labels = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

export const data = {
  labels,
  datasets: [
    {
      label: "Profit",
      data: [900, 700, 500, 600, 850, 650, 700, 600, 500, 650, 700, 800],
      backgroundColor: "#FFF8DC" // light blue
    },
    {
      label: "Growth",
      data: [650, 300, 700, 800, 600, 720, 750, 670, 600, 700, 720, 740],
      backgroundColor: "#FFD700" // medium blue
    },
    {
      label: "Savings",
      data: [600, 200, 450, 700, 300, 580, 630, 540, 400, 500, 480, 520],
      backgroundColor: "#B8860B" // deep blue
    }
  ]
};

export const options = {
  responsive: true,
  plugins: {
    legend: {
      position: "bottom" as const
    },
    title: {
      display: true,
      text: "Earnings Overview"
    }
  }
};

export default function EarningsChart() {
  return (
    <div className="bg-white p-6 rounded-xl shadow w-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Earnings</h2>
        <a href="#" className="text-sm text-yellow-500 hover:underline">View More</a>
      </div>
      <Bar options={options} data={data} />
    </div>
  );
}
