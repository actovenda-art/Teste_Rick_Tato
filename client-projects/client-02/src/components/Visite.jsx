import React from 'react';
import { MapPin, Phone, Instagram, ArrowRight, Navigation } from 'lucide-react';
import { hours } from '../data/menu';

const Visite = () => {
  return (
    <section id="visite" className="bg-[#FBF5E7] py-24 md:py-32 relative">
      <div className="max-w-[1200px] mx-auto px-6 md:px-8">
        <div className="max-w-[720px] mb-14">
          <span className="font-script text-[24px] text-[#C8551D] inline-block -rotate-2 mb-2">
            como chegar
          </span>
          <h2 className="font-display font-black text-[36px] md:text-[52px] leading-[1.02] text-[#241E17]">
            Te esperamos <span className="italic text-[#C8551D]">em Sousas.</span>
          </h2>
          <p className="mt-5 text-[17px] leading-[1.65] text-[#241E17]/65 max-w-[52ch]">
            Uma curva depois do centro de Sousas, entrando a Parque Jatibaia. Se ouvir
            passarinho, chegou.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left: info */}
          <div className="space-y-6">
            <div className="bg-[#F3E8D2] border border-[#241E17]/12 rounded-3xl p-8">
              <h3 className="font-display font-black text-[22px] text-[#241E17] mb-5">
                Horário de funcionamento
              </h3>
              <table className="w-full border-collapse text-[15px]">
                <tbody>
                  {hours.map((h, i) => (
                    <tr key={h.day}>
                      <td
                        className={`py-3 font-bold ${
                          i > 0 ? 'border-t border-dashed border-[#241E17]/15' : ''
                        } ${h.closed ? 'text-[#241E17]/50' : 'text-[#241E17]'}`}
                      >
                        {h.day}
                      </td>
                      <td
                        className={`py-3 text-right ${
                          i > 0 ? 'border-t border-dashed border-[#241E17]/15' : ''
                        } ${h.closed ? 'text-[#C8551D] font-bold' : 'text-[#241E17]/70'}`}
                      >
                        {h.time}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="bg-[#F3E8D2] border border-[#241E17]/12 rounded-3xl p-8 space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-[#C8551D]/15 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-[#C8551D]" />
                </div>
                <div>
                  <div className="font-bold text-[15px] text-[#241E17]">
                    Av. Mário Garnero, 798
                  </div>
                  <div className="text-[14px] text-[#241E17]/65 mt-0.5">
                    Parque Jatibaia (Sousas) · Campinas — SP, 13104-006
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-[#33502F]/15 flex items-center justify-center flex-shrink-0">
                  <Phone className="w-5 h-5 text-[#33502F]" />
                </div>
                <div className="flex-1">
                  <a
                    href="tel:+551932588367"
                    className="block font-bold text-[15px] text-[#241E17] no-underline hover:text-[#C8551D] transition-colors"
                  >
                    (19) 3258-8367
                  </a>
                  <a
                    href="https://wa.me/5519974207710"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-[14px] text-[#241E17]/70 hover:text-[#33502F] no-underline mt-0.5 transition-colors"
                  >
                    WhatsApp · (19) 97420-7710
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-[#E3A427]/20 flex items-center justify-center flex-shrink-0">
                  <Instagram className="w-5 h-5 text-[#C8551D]" />
                </div>
                <a
                  href="https://www.instagram.com/assimassimeassado/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-[15px] text-[#241E17] no-underline hover:text-[#C8551D] transition-colors"
                >
                  @assimassimeassado
                </a>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <a
                href="https://api.whatsapp.com/message/IJTWJ3E7IZUHP1?autoload=1&app_absent=0"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-[#C8551D] hover:bg-[#E17D3E] text-[#FBF5E7] font-bold text-[15px] no-underline transition-all hover:-translate-y-0.5 shadow-[0_10px_24px_-8px_rgba(200,85,29,0.5)]"
              >
                Reservar no WhatsApp
                <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href="https://www.google.com/maps/dir/?api=1&destination=Av.+M%C3%A1rio+Garnero+798+Sousas+Campinas+SP"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-transparent text-[#241E17] font-bold text-[15px] no-underline border-2 border-[#241E17] hover:bg-[#241E17] hover:text-[#FBF5E7] transition-all"
              >
                <Navigation className="w-4 h-4" />
                Traçar rota
              </a>
            </div>
          </div>

          {/* Right: map */}
          <div className="rounded-3xl overflow-hidden border border-[#241E17]/12 min-h-[540px] shadow-xl relative">
            <iframe
              src="https://www.google.com/maps?q=Av.+M%C3%A1rio+Garnero+798+Parque+Jatibaia+Sousas+Campinas+SP&output=embed"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Mapa até o Assim Assim & Assado"
              className="w-full h-full border-0 block absolute inset-0"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Visite;
