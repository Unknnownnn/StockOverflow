import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import '../styles/HomeSections.css';

const Section = ({ title, description, icon, delay = 0 }) => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.8, delay }}
      className="section-card"
    >
      <div className="section-icon">{icon}</div>
      <h3>{title}</h3>
      <p>{description}</p>
    </motion.div>
  );
};

const HomeSections = () => {
  const sections = [
    {
      title: "Real-time Market Data",
      description: "Access live market data, stock prices, and trading volumes with our advanced analytics platform.",
      icon: "📊"
    },
    {
      title: "Advanced Analytics",
      description: "Powerful tools for technical analysis and market trend prediction to make informed decisions.",
      icon: "📈"
    },
    {
      title: "Portfolio Management",
      description: "Track and manage your investments with our intuitive portfolio tools and performance metrics.",
      icon: "💼"
    },
    {
      title: "Market News",
      description: "Stay updated with the latest market news and expert analysis from trusted sources.",
      icon: "📰"
    }
  ];

  return (
    <div className="home-sections">
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="sections-container"
      >
        <h2>Why Choose StockOverflow?</h2>
        <div className="sections-grid">
          {sections.map((section, index) => (
            <Section
              key={index}
              title={section.title}
              description={section.description}
              icon={section.icon}
              delay={index * 0.2}
            />
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="market-summary"
      >
        <h2>Market Overview</h2>
        <div className="market-cards">
          {[
            { name: "S&P 500", price: "4,185.81", change: "+23.42", percent: "0.56%", isPositive: true },
            { name: "NASDAQ", price: "12,888.28", change: "+100.63", percent: "0.78%", isPositive: true },
            { name: "DOW", price: "33,886.47", change: "-143.22", percent: "-0.42%", isPositive: false }
          ].map((market, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              className="market-card"
            >
              <h3>{market.name}</h3>
              <p className="price">{market.price}</p>
              <p className={`change ${market.isPositive ? 'positive' : 'negative'}`}>
                {market.change} ({market.percent})
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default HomeSections; 