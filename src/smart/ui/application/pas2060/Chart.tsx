/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { jsx } from '@emotion/react';
import MGDLabel from '../../../MGDComponents/MGDLabel';

const path =
  'M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831';

const ChartItem: React.FC<{
  color: string;
  percentage: string;
  textcolor: string;
  title: string;
}> = function ({ color, percentage, textcolor, title }) {
  return (
    <div
      style={{
        width: '40%',
        textAlign: 'center',
      }}
    >
      <MGDLabel>{title}</MGDLabel>
      <Chart color={color} percentage={percentage} textcolor={textcolor} />
    </div>
  );
};

const Chart: React.FC<{
  color: string;
  percentage: string;
  textcolor: string;
}> = function ({ color, percentage, textcolor }) {
  return (
    <svg viewBox="0 0 36 36">
      <path
        style={{
          fill: 'none',
          stroke: 'lightgray',
          strokeWidth: 3.8,
        }}
        d={path}
      />
      <path
        style={{
          fill: 'none',
          stroke: color,
          strokeWidth: 2.8,
          strokeLinecap: 'round',
        }}
        stroke-dasharray={`${percentage}, 100`}
        d={path}
      />
      <text
        style={{
          fill: textcolor,
          fontSize: '0.5em',
          textAnchor: 'middle',
        }}
        x="18"
        y="20.35"
      >
        {`${percentage}%`}
      </text>
    </svg>
  );
};

export default ChartItem;