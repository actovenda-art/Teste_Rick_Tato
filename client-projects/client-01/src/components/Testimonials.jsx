import React from 'react';
import { Star, Quote } from 'lucide-react';
import { testimonials, ratings } from '../data/menu';

const Testimonials = () => {
  return (
    <section id="avaliacoes" className="bg-[#1E1A16] text-[#F3E8D2] py-24 md:py-32 relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, #E3A427 1px, transparent 0)',
          backgroundSize: '32px 32px',
        }}
      />

      <div className="max-w-[1200px] mx-auto px-6 md:px-8 relative z-10">
        <div className="max-w-[720px] mb-14">
          <span className="font-script text-[24px] text-[#E3A427] inline-block -rotate-2 mb-2">
            quem já foi conta
          </span>
          <h2 className="font-display font-black text-[36px] md:text-[52px] leading-[1.02] text-[#FBF5E7]">
            Mais de mil avaliações,<br />
            <span className="italic text-[#E3A427]">um clima só.</span>
          </h2>
        </div>

        {/* Rating scores */}
        <div className="flex flex-wrap gap-6 md:gap-10 mb-14 pb-14 border-b border-[#F3E8D2]/12">
          {ratings.map((r) => (
            <div key={r.platform} className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-[#E3A427]/15 flex items-center justify-center flex-shrink-0">
                <Star className="w-6 h-6 text-[#E3A427]" fill="#E3A427" />
              </div>
              <div>
                <div className="font-display font-black text-[30px] text-[#E3A427] leading-none">
                  {r.score}
                  <span className="text-[16px] font-normal text-[#F3E8D2]/50 ml-1">/5</span>
                </div>
                <div className="text-[12.5px] text-[#F3E8D2]/60 mt-1">
                  <b className="text-[#F3E8D2]/85">{r.platform}</b> · {r.count}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Reviews */}
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <div
              key={i}
              className="bg-[#F3E8D2]/6 backdrop-blur-sm border border-[#F3E8D2]/12 rounded-3xl p-7 md:p-8 relative hover:border-[#E3A427]/40 transition-all hover:-translate-y-1"
            >
              <Quote className="w-8 h-8 text-[#E3A427]/40 mb-4" />
              <p className="text-[15px] leading-[1.7] text-[#F3E8D2]/88 italic font-body">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="mt-6 flex items-center justify-between">
                <div>
                  <div className="font-bold text-[14px] text-[#E3A427]">{t.author}</div>
                  <div className="text-[12px] text-[#F3E8D2]/50 mt-0.5">{t.source}</div>
                </div>
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, k) => (
                    <Star
                      key={k}
                      className={`w-3.5 h-3.5 ${
                        k < t.rating ? 'text-[#E3A427]' : 'text-[#F3E8D2]/20'
                      }`}
                      fill={k < t.rating ? '#E3A427' : 'transparent'}
                    />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
