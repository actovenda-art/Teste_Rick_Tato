import React, { useEffect, useState } from 'react';
import { Menu, X, Flame } from 'lucide-react';

const navItems = [
  { label: 'Cardápio', href: '#cardapio' },
  { label: 'A casa', href: '#sobre' },
  { label: 'Avaliações', href: '#avaliacoes' },
  { label: 'Como chegar', href: '#visite' },
];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'backdrop-blur-md bg-[#1E1A16]/95 border-b border-white/10 py-3'
          : 'bg-[#1E1A16]/60 backdrop-blur-sm py-5'
      }`}
    >
      <nav className="max-w-[1200px] mx-auto px-6 md:px-8 flex items-center justify-between">
        <a href="#topo" className="flex items-center gap-2 text-[#F3E8D2] no-underline">
          <Flame className="w-6 h-6 text-[#E3A427]" strokeWidth={2} />
          <span className="font-display font-black text-[19px] md:text-[20px] leading-none tracking-tight">
            Assim Assim <span className="text-[#E3A427]">&</span> Assado
          </span>
        </a>

        <ul className="hidden lg:flex items-center gap-8 list-none m-0 p-0">
          {navItems.map((n) => (
            <li key={n.href}>
              <a
                href={n.href}
                className="text-[#F3E8D2]/85 hover:text-[#E3A427] text-[14.5px] font-semibold no-underline transition-colors"
              >
                {n.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="hidden md:flex items-center gap-3">
          <a
            href="https://api.whatsapp.com/message/IJTWJ3E7IZUHP1?autoload=1&app_absent=0"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#C8551D] hover:bg-[#E17D3E] text-[#FBF5E7] font-bold text-[14px] no-underline transition-all hover:-translate-y-0.5 shadow-[0_6px_20px_-6px_rgba(200,85,29,0.7)]"
          >
            Reservar mesa
          </a>
        </div>

        <button
          onClick={() => setOpen(!open)}
          className="lg:hidden text-[#F3E8D2] p-2 hover:text-[#E3A427] transition-colors"
          aria-label="Menu"
        >
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </nav>

      {open && (
        <div className="lg:hidden bg-[#1E1A16] border-t border-white/10 px-6 py-4">
          <ul className="flex flex-col gap-3 list-none m-0 p-0">
            {navItems.map((n) => (
              <li key={n.href}>
                <a
                  href={n.href}
                  onClick={() => setOpen(false)}
                  className="block text-[#F3E8D2] hover:text-[#E3A427] font-semibold py-2 no-underline"
                >
                  {n.label}
                </a>
              </li>
            ))}
            <li className="pt-2">
              <a
                href="https://api.whatsapp.com/message/IJTWJ3E7IZUHP1?autoload=1&app_absent=0"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#C8551D] text-[#FBF5E7] font-bold text-[14px] no-underline"
              >
                Reservar mesa
              </a>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
};

export default Navbar;
