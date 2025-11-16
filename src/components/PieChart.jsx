import React from 'react';
import { formatCurrency } from '../utils/dateUtils';
import './PieChart.css';

const PieChart = ({ data, title, size = 250 }) => {
  if (!data || data.length === 0) {
    return (
      <div className="pie-chart-container">
        {title && <h4>{title}</h4>}
        <div className="empty-chart">No data available</div>
      </div>
    );
  }

  // Calculate total and prepare data
  const total = data.reduce((sum, item) => {
    const value = parseFloat(item.value || item.total || 0);
    return sum + value;
  }, 0);

  // Get label from item (handles both primary and secondary categories)
  const getLabel = (item) => {
    return item.id || item.secondarycategory || 'Uncategorized';
  };

  if (total === 0) {
    return (
      <div className="pie-chart-container">
        {title && <h4>{title}</h4>}
        <div className="empty-chart">No data available</div>
      </div>
    );
  }

  // Calculate angles and create pie slices
  let currentAngle = -90; // Start from top
  const radius = size / 2 - 10;
  const centerX = size / 2;
  const centerY = size / 2;

  const slices = data.map((item, index) => {
    const value = parseFloat(item.value || item.total || 0);
    const percentage = (value / total) * 100;
    const angle = (value / total) * 360;
    
    // Generate color based on index
    const hue = (index * 137.508) % 360; // Golden angle for color distribution
    const color = `hsl(${hue}, 70%, 60%)`;
    
    // Calculate path for pie slice
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    
    const startAngleRad = (startAngle * Math.PI) / 180;
    const endAngleRad = (endAngle * Math.PI) / 180;
    
    const x1 = centerX + radius * Math.cos(startAngleRad);
    const y1 = centerY + radius * Math.sin(startAngleRad);
    const x2 = centerX + radius * Math.cos(endAngleRad);
    const y2 = centerY + radius * Math.sin(endAngleRad);
    
    const largeArcFlag = angle > 180 ? 1 : 0;
    
    const pathData = [
      `M ${centerX} ${centerY}`,
      `L ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
      'Z'
    ].join(' ');
    
    currentAngle += angle;
    
    return {
      pathData,
      color,
      percentage: percentage.toFixed(1),
      value,
      label: getLabel(item),
      count: item.count || 0,
    };
  });

  return (
    <div className="pie-chart-container">
      {title && <h4>{title}</h4>}
      <div className="pie-chart-wrapper">
        <svg width={size} height={size} className="pie-chart-svg">
          {slices.map((slice, index) => (
            <path
              key={index}
              d={slice.pathData}
              fill={slice.color}
              stroke="#fff"
              strokeWidth="2"
              className="pie-slice"
              data-label={slice.label}
              data-value={slice.value}
              data-percentage={slice.percentage}
            />
          ))}
        </svg>
        <div className="pie-chart-legend">
          {slices.map((slice, index) => (
            <div key={index} className="legend-item">
              <span 
                className="legend-color" 
                style={{ background: slice.color }}
              ></span>
              <div className="legend-content">
                <span className="legend-label">{slice.label}</span>
                <span className="legend-details">
                  {formatCurrency(slice.value)} ({slice.percentage}%)
                  {slice.count > 0 && ` • ${slice.count} expenses`}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PieChart;

