import React from 'react';
import { ArrowRight, Utensils } from 'lucide-react';
import { menuSections, images } from '../data/menu';

const Cardapio = () => {
  return (
    <section id="cardapio" className="bg-[#FBF5E7] py-24 md:py-32 relative overflow-hidden">
      {/* decorative background circle */}
      <div className="absolute top-40 -right-40 w-[500px] h-[500px] rounded-full bg-[#E3A427]/8 blur-3xl pointer-events-none" />
      <div className="absolute bottom-40 -left-40 w-[400px] h-[400px] rounded-full bg-[#C8551D]/8 blur-3xl pointer-events-none" />

      <div className="max-w-[1200px] mx-auto px-6 md:px-8 relative">
        <div className="max-w-[680px] mb-14 md:mb-20">
          <span className="font-script text-[24px] text-[#C8551D] inline-block -rotate-2 mb-2">
            o cardápio
          </span>
          <h2 className="font-display font-black text-[38px] md:text-[54px] leading-[1.02] text-[#241E17]">
            Prepara o bucho,<br />
            <span className="italic text-[#C8551D]">que a fartura vem aí.</span>
          </h2>
          <p className="mt-5 text-[17px] leading-[1.65] text-[#241E17]/65 max-w-[52ch]">
            Até os nomes das seções têm graça por aqui. À la carte, pensado para
            dividir — e voltar pra buscar mais guarnição quantas vezes quiser.
          </p>
        </div>

        {/* Highlight dish */}
        <div className="grid lg:grid-cols-[1.2fr_1fr] gap-10 mb-14 items-stretch">
          <div className="relative rounded-3xl overflow-hidden min-h-[380px] shadow-2xl group">
            <img
              src={images.costela}
              alt="Costela no bafo"
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1E1A16] via-[#1E1A16]/40 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-8 md:p-10 text-[#FBF5E7]">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E3A427] text-[#241E17] text-[11.5px] font-bold uppercase tracking-wider mb-4">
                O mais pedido
              </span>
              <h3 className="font-display font-black text-[36px] md:text-[44px] leading-none">
                Costela no bafo
              </h3>
              <p className="font-script text-[22px] text-[#E3A427] mt-2 -rotate-1 inline-block">
                desmancha no garfo
              </p>
              <p className="mt-3 text-[15.5px] text-[#F3E8D2]/85 max-w-[42ch] leading-relaxed">
                Cozida lentamente ao bafo, com o tempero da casa. Chega à mesa
                fumegando, acompanhada das nossas guarnições à vontade.
              </p>
            </div>
          </div>

          <div className="grid grid-rows-2 gap-6">
            <div className="relative rounded-3xl overflow-hidden group shadow-xl">
              <img
                src={images.picanha}
                alt="Picanha fatiada"
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1E1A16]/80 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 text-[#FBF5E7]">
                <h4 className="font-display font-bold text-[22px]">Picanha na brasa</h4>
                <p className="text-[13px] text-[#F3E8D2]/70">Sal grosso · fatiada na hora</p>
              </div>
            </div>
            <div className="relative rounded-3xl overflow-hidden group shadow-xl">
              <img
                src={images.churrascoPlate}
                alt="Guarnições da casa"
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1E1A16]/80 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 text-[#FBF5E7]">
                <h4 className="font-display font-bold text-[22px]">Guarnições à vontade</h4>
                <p className="text-[13px] text-[#F3E8D2]/70">Arroz, feijão, farofa, vinagrete…</p>
              </div>
            </div>
          </div>
        </div>

        {/* Menu sections */}
        <div className="grid md:grid-cols-2 gap-7">
          {menuSections.map((section) => (
            <div
              key={section.id}
              className="bg-[#F3E8D2] border border-[#241E17]/12 rounded-3xl p-8 md:p-9 relative overflow-hidden hover:border-[#C8551D]/40 transition-all hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="absolute top-5 right-5 w-10 h-10 rounded-full bg-[#C8551D]/15 flex items-center justify-center">
                <Utensils className="w-4 h-4 text-[#C8551D]" />
              </div>
              <span className="text-[11.5px] uppercase tracking-[0.09em] text-[#241E17]/50 font-bold">
                {section.subtitle}
              </span>
              <h3 className="font-script text-[36px] md:text-[40px] text-[#C8551D] font-bold -rotate-1 mt-1 leading-tight">
                {section.title}
              </h3>
              <p className="text-[13.5px] italic text-[#241E17]/60 mt-1">{section.tagline}</p>

              <ul className="mt-6 list-none p-0 m-0">
                {section.items.map((item, i) => (
                  <li
                    key={i}
                    className={`flex justify-between gap-4 py-3.5 ${
                      i > 0 ? 'border-t border-dashed border-[#241E17]/15' : ''
                    }`}
                  >
                    <div className="flex-1">
                      <span className="font-bold text-[15px] text-[#241E17] block">
                        {item.name}
                      </span>
                      <span className="block text-[13px] text-[#241E17]/60 mt-0.5 leading-snug">
                        {item.desc}
                      </span>
                    </div>
                    <span className="font-display font-bold text-[15px] text-[#241E17] whitespace-nowrap">
                      {item.price}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Price note */}
        <div className="mt-8 bg-[#1E1A16] text-[#F3E8D2] rounded-3xl p-7 md:p-9 flex flex-wrap items-center gap-6">
          <div className="flex-1 min-w-[240px]">
            <b className="block font-display text-[22px] text-[#E3A427]">Preço médio</b>
            <p className="mt-1.5 text-[14.5px] text-[#F3E8D2]/75 max-w-[64ch] leading-relaxed">
              De R$ 40 a R$ 140 por pessoa, dependendo da carne escolhida. Cardápio
              à la carte, sem rodízio. Para grupos e datas especiais, garanta sua mesa
              pelo WhatsApp.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a
              href="https://api.whatsapp.com/message/IJTWJ3E7IZUHP1?autoload=1&app_absent=0"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-[#C8551D] hover:bg-[#E17D3E] text-[#FBF5E7] font-bold text-[14px] no-underline transition-all hover:-translate-y-0.5"
            >
              Reservar mesa
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Cardapio;
