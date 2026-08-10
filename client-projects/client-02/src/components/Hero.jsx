import React, { useEffect, useMemo, useState } from 'react';
import { ArrowRight, MapPin, Star, Clock } from 'lucide-react';
import { images, heroBadges } from '../data/menu';

const getOpenStatus = () => {
  try {
    const nowStr = new Date().toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' });
    const now = new Date(nowStr);
    const day = now.getDay();
    const minutes = now.getHours() * 60 + now.getMinutes();
    const ranges = {
      0: [[11 * 60, 16 * 60]],
      1: [],
      2: [],
      3: [[11 * 60, 14 * 60 + 30]],
      4: [[11 * 60, 14 * 60 + 30]],
      5: [[11 * 60, 14 * 60 + 30]],
      6: [[11 * 60, 16 * 60], [18 * 60, 22 * 60]],
    };
    const todays = ranges[day] || [];
    return todays.some(([s, e]) => minutes >= s && minutes < e);
  } catch {
    return false;
  }
};

const Embers = () => {
  const embers = useMemo(
    () =>
      Array.from({ length: 16 }).map(() => ({
        left: 10 + Math.random() * 80,
        drift: Math.random() * 40 - 20,
        delay: Math.random() * 6,
        duration: 4 + Math.random() * 4,
      })),
    []
  );
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
      {embers.map((e, i) => (
        <span
          key={i}
          className="ember-particle"
          style={{
            left: `${e.left}%`,
            '--drift': `${e.drift}px`,
            animationDelay: `${e.delay}s`,
            animationDuration: `${e.duration}s`,
          }}
        />
      ))}
    </div>
  );
};

const Hero = () => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(getOpenStatus());
  }, []);

  return (
    <section
      id="topo"
      className="relative min-h-[100vh] overflow-hidden bg-[#1E1A16] text-[#F3E8D2] flex items-end pt-28 pb-16"
    >
      {/* Background image */}
      <div className="absolute inset-0 z-0">
        <img
          src={images.hero}
          alt="Picanha na brasa"
          className="w-full h-full object-cover animate-slow-zoom"
        />
        {/* Warm layered overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#1E1A16] via-[#1E1A16]/70 to-[#1E1A16]/40" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#1E1A16]/90 via-[#1E1A16]/40 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_800px_500px_at_15%_100%,rgba(200,85,29,0.35),transparent_60%)]" />
      </div>

      <Embers />

      <div className="relative z-20 w-full max-w-[1200px] mx-auto px-6 md:px-8">
        <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-12 items-end">
          <div className="animate-fade-up">
            {/* Status pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-[13px] font-bold mb-6">
              <span
                className={`relative w-2.5 h-2.5 rounded-full ${open ? 'bg-[#8FBF7A]' : 'bg-[#D8683E]'}`}
              >
                <span
                  className={`absolute inset-0 rounded-full animate-ping ${open ? 'bg-[#8FBF7A]' : 'bg-[#D8683E]'} opacity-60`}
                />
              </span>
              <Clock className="w-3.5 h-3.5 opacity-70" />
              <span>{open ? 'Aberto agora' : 'Fechado agora · confira os horários'}</span>
            </div>

            <span className="font-script text-[24px] md:text-[26px] text-[#E3A427] block mb-2 -rotate-2">
              churrasco no meio do mato
            </span>

            <h1 className="font-display font-black leading-[0.95] text-[52px] sm:text-[64px] md:text-[78px] lg:text-[88px] text-[#FBF5E7]">
              Comida da <br />
              <span className="italic text-[#E3A427]">roça</span>, no meio <br />
              da mata.
            </h1>

            <p className="font-script text-[24px] md:text-[28px] text-[#F3E8D2]/90 mt-6 -rotate-1 inline-block">
              — desde 2008, em Sousas, Campinas
            </p>

            <p className="mt-6 text-[16.5px] leading-[1.7] text-[#F3E8D2]/75 max-w-[48ch]">
              Entre árvores nativas, frango na brasa, costela no bafo e picanha saem
              da grelha direto pra mesa de toalha xadrez — com arroz, feijão, farofa
              e vinagrete sempre repondo, à vontade.
            </p>

            <div className="mt-9 flex flex-wrap gap-3">
              <a
                href="#cardapio"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-[#C8551D] hover:bg-[#E17D3E] text-[#FBF5E7] font-bold text-[15px] no-underline transition-all hover:-translate-y-1 shadow-[0_10px_30px_-8px_rgba(200,85,29,0.7)]"
              >
                Ver cardápio
                <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href="https://api.whatsapp.com/message/IJTWJ3E7IZUHP1?autoload=1&app_absent=0"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-transparent hover:bg-white/10 text-[#F3E8D2] hover:text-[#E3A427] font-bold text-[15px] no-underline border-2 border-white/30 hover:border-[#E3A427] transition-all hover:-translate-y-1"
              >
                Reservar no WhatsApp
              </a>
            </div>

            <div className="mt-10 flex flex-wrap gap-x-5 gap-y-2 text-[13px] text-[#F3E8D2]/60">
              {heroBadges.map((b) => (
                <span key={b} className="flex items-center gap-1.5">
                  <span className="text-[#E3A427] text-[10px]">✦</span>
                  {b}
                </span>
              ))}
            </div>
          </div>

          {/* Side info card */}
          <div className="hidden lg:block animate-fade-up" style={{ animationDelay: '0.2s' }}>
            <div className="backdrop-blur-md bg-white/5 border border-white/15 rounded-2xl p-6 space-y-5">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-[#E3A427]/20 flex items-center justify-center flex-shrink-0">
                  <Star className="w-5 h-5 text-[#E3A427]" fill="#E3A427" />
                </div>
                <div>
                  <div className="font-display font-black text-[24px] text-[#FBF5E7] leading-none">
                    4,2 <span className="text-[15px] font-normal text-[#F3E8D2]/60">/ 5</span>
                  </div>
                  <div className="text-[13px] text-[#F3E8D2]/60 mt-1">1.124 avaliações no Google</div>
                </div>
              </div>
              <div className="h-px bg-white/10" />
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-[#C8551D]/20 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-[#E17D3E]" />
                </div>
                <div>
                  <div className="font-display font-bold text-[15px] text-[#FBF5E7] leading-tight">
                    Av. Mário Garnero, 798
                  </div>
                  <div className="text-[13px] text-[#F3E8D2]/60 mt-0.5">
                    Parque Jatibaia, Sousas · Campinas — SP
                  </div>
                </div>
              </div>
              <div className="h-px bg-white/10" />
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-[#8FBF7A]/20 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5 text-[#8FBF7A]" />
                </div>
                <div>
                  <div className="font-display font-bold text-[15px] text-[#FBF5E7] leading-tight">
                    Almoço de qua a dom
                  </div>
                  <div className="text-[13px] text-[#F3E8D2]/60 mt-0.5">Sábado também no jantar</div>
                </div>
              </div>
            </div>

            {/* Small script note */}
            <p className="font-script text-[20px] text-[#E3A427] mt-6 text-center px-6">
              &ldquo;psiu… divide essa picanha?&rdquo; — sagui, provavelmente
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
