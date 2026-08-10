import React from 'react';
import { marqueeItems } from '../data/menu';

const Marquee = () => {
  const list = [...marqueeItems, ...marqueeItems, ...marqueeItems];
  return (
    <div className="bg-[#E3A427] text-[#241E17] overflow-hidden border-y border-black/10 relative">
      <div className="flex whitespace-nowrap animate-marquee py-3">
        {list.map((item, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-6 mx-6 font-bold text-[13.5px] uppercase tracking-[0.05em]"
          >
            {item}
            <span className="opacity-40">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
};

export default Marquee;
