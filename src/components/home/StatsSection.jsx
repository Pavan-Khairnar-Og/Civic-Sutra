import React, { useState, useEffect } from 'react';

const AnimatedCounter = ({ end, suffix = "", duration = 2000, visible }) => {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    if (!visible) return;
    
    let start = 0;
    const increment = end / (duration / 16);
    
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    
    return () => clearInterval(timer);
  }, [end, duration, visible]);
  
  return <span>{count.toLocaleString()}{suffix}</span>;
};

const StatsSection = () => {
  const [visible, setVisible] = useState(false);
  const ref = React.useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  const stats = [
    { value: 12, label: "Departments" },
    { value: 1247, label: "Issues Reported" },
    { value: 89, label: "Resolution Rate", suffix: "%" },
    { value: 48, label: "Cities" }
  ];

  return (
    <section ref={ref} className="w-full bg-[#1C1917] py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="serif text-4xl font-bold text-white mb-2">
                <AnimatedCounter end={stat.value} suffix={stat.suffix || ""} visible={visible} />
              </div>
              <div className="text-[#6B6560] text-sm uppercase tracking-widest mt-1">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
