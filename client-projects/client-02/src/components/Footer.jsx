import React from 'react';
import { Flame, Instagram, ArrowUpRight } from 'lucide-react';

const badges = [
  'Liderado por mulheres',
  'LGBTQ+ friendly',
  'Pet friendly',
  'Espaço kids',
  'Estacionamento grátis',
];

const Footer = () => {
  return (
    <footer className="bg-[#171310] text-[#F3E8D2]/70 pt-16 pb-8 relative overflow-hidden">
      <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full bg-[#C8551D]/10 blur-3xl pointer-events-none" />

      <div className="max-w-[1200px] mx-auto px-6 md:px-8 relative">
        <div className="flex flex-wrap justify-between gap-8 pb-10 border-b border-[#F3E8D2]/12">
          <div className="max-w-[360px]">
            <div className="flex items-center gap-2 mb-3">
              <Flame className="w-6 h-6 text-[#E3A427]" />
              <div className="font-display font-black text-[22px] text-[#FBF5E7]">
                Assim Assim <span className="text-[#E3A427]">&</span> Assado
              </div>
            </div>
            <p className="text-[14px] leading-[1.65] text-[#F3E8D2]/60">
              Av. Mário Garnero, 798 — Sousas, Campinas/SP.<br />
              Churrasco no meio do mato, desde 2008.
            </p>
          </div>

          <div>
            <h4 className="font-display font-bold text-[15px] text-[#FBF5E7] mb-3 uppercase tracking-wide">
              Navegar
            </h4>
            <ul className="list-none p-0 m-0 space-y-2 text-[14px]">
              <li><a href="#cardapio" className="text-[#F3E8D2]/60 hover:text-[#E3A427] no-underline transition-colors">Cardápio</a></li>
              <li><a href="#sobre" className="text-[#F3E8D2]/60 hover:text-[#E3A427] no-underline transition-colors">A casa</a></li>
              <li><a href="#avaliacoes" className="text-[#F3E8D2]/60 hover:text-[#E3A427] no-underline transition-colors">Avaliações</a></li>
              <li><a href="#visite" className="text-[#F3E8D2]/60 hover:text-[#E3A427] no-underline transition-colors">Como chegar</a></li>
            </ul>
          </div>

          <div className="max-w-[320px]">
            <h4 className="font-display font-bold text-[15px] text-[#FBF5E7] mb-3 uppercase tracking-wide">
              A casa
            </h4>
            <div className="flex flex-wrap gap-2">
              {badges.map((b) => (
                <span
                  key={b}
                  className="text-[12px] px-3 py-1.5 rounded-full border border-[#F3E8D2]/22 text-[#F3E8D2]/70"
                >
                  {b}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap justify-between items-center gap-4 pt-6 text-[13px]">
          <span className="text-[#F3E8D2]/45">
            © {new Date().getFullYear()} Assim Assim & Assado · Feito com brasa em Sousas
          </span>
          <div className="flex items-center gap-5">
            <a
              href="https://www.instagram.com/assimassimeassado/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-[#E3A427] hover:text-[#EFC060] font-bold no-underline transition-colors"
            >
              <Instagram className="w-4 h-4" />
              @assimassimeassado
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
