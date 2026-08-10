import React from 'react';
import { Trees, Users, Flame, Car, Leaf } from 'lucide-react';
import { images } from '../data/menu';

const facts = [
  { icon: Flame, value: '2008', label: 'ano de fundação, em Sousas' },
  { icon: Users, value: '3', label: 'ambientes: salão, quiosque e área externa' },
  { icon: Trees, value: 'À vontade', label: 'arroz, feijão, farofa e vinagrete' },
  { icon: Car, value: 'Livre', label: 'estacionamento próprio e gratuito' },
];

const Sobre = () => {
  return (
    <section id="sobre" className="bg-[#33502F] text-[#F3E8D2] py-24 md:py-32 relative overflow-hidden">
      {/* subtle texture */}
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, #F3E8D2 1px, transparent 0)',
          backgroundSize: '24px 24px',
        }}
      />

      <div className="max-w-[1200px] mx-auto px-6 md:px-8 relative z-10">
        <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-14 lg:gap-20 items-center">
          <div>
            <span className="font-script text-[24px] text-[#E3A427] inline-block -rotate-2 mb-2">
              a casa
            </span>
            <h2 className="font-display font-black text-[36px] md:text-[48px] leading-[1.05] text-[#FBF5E7]">
              Uma faixa de mata nativa <span className="italic text-[#E3A427]">virou sala de jantar.</span>
            </h2>
            <p className="mt-6 text-[17px] leading-[1.75] text-[#F3E8D2]/80 max-w-[54ch]">
              Salão, quiosque e área externa dividem o mesmo pedaço de mato. Toalhas
              xadrez de vermelho e branco, caldeirões de ferro carregando o feijão até
              a mesa — clima de casa de avó, sotaque do interior de São Paulo.
            </p>
            <p className="mt-5 text-[17px] leading-[1.75] text-[#F3E8D2]/80 max-w-[54ch]">
              Pássaros sobrevoam o almoço e uma família de saguis, já acostumada à casa,
              costuma aparecer perto das mesas — um dos motivos pelos quais quem visita
              uma vez, sempre volta.
            </p>

            <div className="mt-10 grid sm:grid-cols-2 gap-5">
              {facts.map(({ icon: Icon, value, label }, i) => (
                <div
                  key={i}
                  className="border-t border-[#F3E8D2]/25 pt-4 group hover:border-[#E3A427]/60 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <Icon className="w-5 h-5 text-[#E3A427] mt-1 flex-shrink-0" strokeWidth={2} />
                    <div>
                      <b className="block font-display text-[22px] text-[#E3A427] leading-none">
                        {value}
                      </b>
                      <span className="text-[13.5px] text-[#F3E8D2]/70 block mt-1.5">{label}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Image collage */}
          <div className="relative">
            <div className="grid grid-cols-2 gap-3 md:gap-4">
              <div className="col-span-2 rounded-3xl overflow-hidden shadow-2xl relative aspect-[16/10]">
                <img
                  src={images.forestGazebo}
                  alt="Restaurante em meio à mata"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1E1A16]/70 via-transparent to-transparent" />
                <div className="absolute bottom-5 left-5 font-script text-[24px] text-white drop-shadow-lg -rotate-2">
                  salão + quiosque
                </div>
              </div>
              <div className="rounded-3xl overflow-hidden shadow-xl aspect-square">
                <img
                  src={images.sagui}
                  alt="Sagui na árvore"
                  className="w-full h-full object-cover hover:scale-110 transition-transform duration-700"
                />
              </div>
              <div className="rounded-3xl overflow-hidden shadow-xl aspect-square">
                <img
                  src={images.outdoorTable}
                  alt="Mesa ao ar livre"
                  className="w-full h-full object-cover hover:scale-110 transition-transform duration-700"
                />
              </div>
              <div className="col-span-2 rounded-3xl overflow-hidden shadow-xl relative aspect-[16/6]">
                <img
                  src={images.wineBottles}
                  alt="Cachaças e barril"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#1E1A16]/85 via-[#1E1A16]/40 to-transparent flex items-center px-6 md:px-10">
                  <span className="font-display italic text-[#FBF5E7] text-[18px] md:text-[22px] max-w-[24ch] leading-tight">
                    &ldquo;A coleção de cachaças de barril que enfeita o salão.&rdquo;
                  </span>
                </div>
              </div>
            </div>

            {/* Signature caption */}
            <div className="mt-6 md:absolute md:-bottom-5 md:left-8 bg-[#1E1A16] text-[#E3A427] font-script text-[20px] px-5 py-2.5 rounded-full shadow-xl -rotate-3 inline-flex items-center gap-2 whitespace-nowrap">
              <Leaf className="w-4 h-4" />
              sim, os saguis moram aqui
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Sobre;
