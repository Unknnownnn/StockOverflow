import React from 'react';
import HeroSection from '../components/HeroSection';
import HomeSections from '../components/HomeSections';
import '../styles/Home.css';

const Home = () => {
  return (
    <div className="home">
      <HeroSection />
      <HomeSections />
    </div>
  );
};

export default Home; 