import React, { useRef, useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement, LineElement, PointElement,
  ArcElement, Filler, Tooltip, Legend,
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import { motion } from 'framer-motion';

ChartJS.register(
  CategoryScale, LinearScale, BarElement, LineElement, PointElement,
  ArcElement, Filler, Tooltip, Legend
);

const CHART_DEFAULTS = {
  responsive: true,
  maintainAspectRatio: false,
  animation: { duration: 800, easing: 'easeInOutQuart' as const },
  plugins: {
    legend: {
      labels: { color: '#B0B0C8', font: { family: 'Nunito', size: 12 }, boxWidth: 12, padding: 16 },
    },
    tooltip: {
      backgroundColor: '#1E1E30',
      borderColor: 'rgba(255,255,255,0.1)',
      borderWidth: 1,
      titleColor: '#fff',
      bodyColor: '#B0B0C8',
      cornerRadius: 10,
      padding: 10,
    },
  },
  scales: {
    x: {
      grid: { color: 'rgba(255,255,255,0.05)', drawTicks: false },
      ticks: { color: '#B0B0C8', font: { family: 'Nunito', size: 11 } },
    },
    y: {
      grid: { color: 'rgba(255,255,255,0.05)', drawTicks: false },
      ticks: { color: '#B0B0C8', font: { family: 'Nunito', size: 11 } },
    },
  },
};

type Range = '10days' | '1month' | '1year';

// ─── SalesChart ───────────────────────────────────────────────
const generateData = (range: Range) => {
  const days10 = ['21 Mar','22 Mar','23 Mar','24 Mar','25 Mar','26 Mar','27 Mar','28 Mar','29 Mar','30 Mar'];
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const labels = range === '10days' ? days10 : range === '1month'
    ? Array.from({length:30},(_,i)=>`${i+1} Mar`) : months;

  const rev = labels.map(() => Math.floor(3000 + Math.random() * 9000));
  const ord = labels.map(() => Math.floor(8 + Math.random() * 40));
  return { labels, rev, ord };
};

export const SalesChart: React.FC = () => {
  const [range, setRange] = useState<Range>('10days');
  const [view, setView] = useState<'revenue' | 'orders'>('revenue');
  const { labels, rev, ord } = generateData(range);

  const data = {
    labels,
    datasets: [{
      label: view === 'revenue' ? 'Revenue (₹)' : 'Orders',
      data: view === 'revenue' ? rev : ord,
      backgroundColor: 'rgba(255,59,48,0.15)',
      borderColor: '#FF3B30',
      borderWidth: 2,
      pointBackgroundColor: '#FF9500',
      pointRadius: 3,
      pointHoverRadius: 5,
      fill: true,
      tension: 0.4,
    }],
  };

  return (
    <div className="bg-card rounded-2xl p-5 border border-white/10">
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <h3 className="font-display font-bold text-white">
          {view === 'revenue' ? '💰 Revenue' : '📦 Orders'}
        </h3>
        <div className="flex gap-2 flex-wrap">
          {/* View toggle */}
          <div className="flex bg-white/10 rounded-full p-0.5">
            {(['revenue','orders'] as const).map(v => (
              <button key={v} onClick={() => setView(v)}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${view===v?'bg-primary text-white':'text-text-secondary'}`}>
                {v==='revenue'?'Revenue':'Orders'}
              </button>
            ))}
          </div>
          {/* Range */}
          <div className="flex bg-white/10 rounded-full p-0.5">
            {(['10days','1month','1year'] as const).map(r => (
              <button key={r} onClick={() => setRange(r)}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${range===r?'bg-primary text-white':'text-text-secondary'}`}>
                {r==='10days'?'10D':r==='1month'?'1M':'1Y'}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div style={{ height: 240 }}>
        <Line data={data} options={CHART_DEFAULTS} />
      </div>
    </div>
  );
};

// ─── CategoryPieChart ─────────────────────────────────────────
export const CategoryPieChart: React.FC = () => {
  const data = {
    labels: ['Bobba Drinks','Bingsu','Momos','Ramen','Wings','Fries','Others'],
    datasets: [{
      data: [34, 18, 22, 10, 7, 5, 4],
      backgroundColor: ['#FF3B30','#FF9500','#FFD600','#34C759','#5AC8FA','#AF52DE','#B0B0C8'],
      borderWidth: 0,
      hoverOffset: 6,
    }],
  };

  const options = {
    responsive: true, maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom' as const, labels: { color:'#B0B0C8', font:{family:'Nunito',size:11}, boxWidth:10, padding:12 } },
      tooltip: CHART_DEFAULTS.plugins.tooltip,
    },
  };

  return (
    <div className="bg-card rounded-2xl p-5 border border-white/10">
      <h3 className="font-display font-bold text-white mb-5">🍰 Sales by Category</h3>
      <div style={{ height: 220 }}>
        <Doughnut data={data} options={options} />
      </div>
    </div>
  );
};

// ─── PeakHoursHeatmap ─────────────────────────────────────────
const HOURS = ['11am','12pm','1pm','2pm','3pm','4pm','5pm','6pm','7pm','8pm','9pm','10pm'];
const DAYS  = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

const peakData: number[][] = DAYS.map(() =>
  HOURS.map(() => Math.floor(Math.random() * 40))
);

export const PeakHoursHeatmap: React.FC = () => {
  const max = Math.max(...peakData.flat());

  return (
    <div className="bg-card rounded-2xl p-5 border border-white/10">
      <h3 className="font-display font-bold text-white mb-5">🔥 Peak Hours</h3>
      <div className="overflow-x-auto">
        <div className="min-w-max">
          {/* Hour labels */}
          <div className="flex gap-1 mb-1 ml-10">
            {HOURS.map(h => (
              <div key={h} className="w-8 text-center text-[10px] text-text-secondary">{h}</div>
            ))}
          </div>
          {/* Grid */}
          {DAYS.map((day, di) => (
            <div key={day} className="flex items-center gap-1 mb-1">
              <div className="w-8 text-[10px] text-text-secondary text-right pr-1 shrink-0">{day}</div>
              {HOURS.map((_, hi) => {
                const val = peakData[di][hi];
                const intensity = val / max;
                return (
                  <motion.div
                    key={hi}
                    className="w-8 h-7 rounded-md flex items-center justify-center"
                    style={{
                      backgroundColor: `rgba(255,${Math.round(59 + (149-59)*(1-intensity))},48,${0.1 + intensity*0.8})`,
                    }}
                    title={`${day} ${HOURS[hi]}: ${val} orders`}
                    whileHover={{ scale: 1.2 }}
                  />
                );
              })}
            </div>
          ))}
          {/* Legend */}
          <div className="flex items-center gap-2 mt-3 ml-10">
            <span className="text-text-secondary text-[10px]">Low</span>
            <div className="flex gap-0.5">
              {[0.1,0.3,0.5,0.7,0.9].map(v => (
                <div key={v} className="w-5 h-3 rounded-sm"
                  style={{ backgroundColor: `rgba(255,${Math.round(59+(149-59)*(1-v))},48,${v})` }} />
              ))}
            </div>
            <span className="text-text-secondary text-[10px]">High</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── DailyOrdersChart ─────────────────────────────────────────
export const DailyOrdersChart: React.FC = () => {
  const labels = Array.from({length:14},(_,i)=>{
    const d = new Date(); d.setDate(d.getDate()-13+i);
    return d.toLocaleDateString('en-IN',{day:'numeric',month:'short'});
  });

  const data = {
    labels,
    datasets: [{
      label: 'Orders',
      data: labels.map(() => Math.floor(12 + Math.random() * 35)),
      backgroundColor: 'rgba(255,214,0,0.2)',
      borderColor: '#FFD600',
      borderWidth: 2,
      fill: true,
      tension: 0.4,
      pointRadius: 3,
      pointBackgroundColor: '#FFD600',
    }],
  };

  return (
    <div className="bg-card rounded-2xl p-5 border border-white/10">
      <h3 className="font-display font-bold text-white mb-5">📈 Daily Order Volume</h3>
      <div style={{ height: 200 }}>
        <Bar data={data} options={{ ...CHART_DEFAULTS, plugins: { ...CHART_DEFAULTS.plugins, legend: { display: false } } }} />
      </div>
    </div>
  );
};