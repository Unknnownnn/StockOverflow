import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import '../styles/HomeSections.css';

const Section = ({ title, description, icon, imageUrl, index }) => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });

  const isEven = index % 2 === 0;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: isEven ? -50 : 50 }}
      animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: isEven ? -50 : 50 }}
      transition={{ duration: 0.8, delay: 0.2 }}
      className={`section-card ${isEven ? 'section-right' : 'section-left'}`}
    >
      <div className="section-content">
        <div className={`section-text ${isEven ? 'text-right' : 'text-left'}`}>
          <div className="section-icon">{icon}</div>
          <h3>{title}</h3>
          <p>{description}</p>
        </div>
        <div className={`section-image ${isEven ? 'image-left' : 'image-right'}`}>
          <img src={imageUrl} alt={title} />
        </div>
      </div>
    </motion.div>
  );
};

const HomeSections = () => {
  const sections = [
    {
      title: "Real-time Market Data",
      description: "Access live market data, stock prices, and trading volumes with our advanced analytics platform. Stay ahead of market trends with instant updates and comprehensive financial information.",
      icon: "📊",
      imageUrl: "/images/real-time-data.svg"
    },
    {
      title: "Advanced Analytics",
      description: "Powerful tools for technical analysis and market trend prediction to make informed decisions. Utilize sophisticated algorithms and indicators to analyze market patterns.",
      icon: "📈",
      imageUrl: "/images/advanced-analytics.svg"
    },
    {
      title: "Portfolio Management",
      description: "Track and manage your investments with our intuitive portfolio tools and performance metrics. Monitor your assets, analyze returns, and optimize your investment strategy.",
      icon: "💼",
      imageUrl: "/images/portfolio-management.svg"
    },
    {
      title: "Market News",
      description: "Stay updated with the latest market news and expert analysis from trusted sources. Get real-time notifications about market events affecting your portfolio.",
      icon: "📰",
      imageUrl: "/images/market-news.svg"
    }
  ];

  return (
    <div className="home-sections">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        viewport={{ once: true }}
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
              imageUrl={section.imageUrl}
              index={index}
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