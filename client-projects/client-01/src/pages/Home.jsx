import React from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Marquee from '../components/Marquee';
import Sobre from '../components/Sobre';
import Cardapio from '../components/Cardapio';
import Testimonials from '../components/Testimonials';
import Visite from '../components/Visite';
import Footer from '../components/Footer';

const Home = () => {
  return (
    <div className="min-h-screen bg-[#FBF5E7]">
      <Navbar />
      <main>
        <Hero />
        <Marquee />
        <Sobre />
        <Cardapio />
        <Testimonials />
        <Visite />
      </main>
      <Footer />
    </div>
  );
};

export default Home;
