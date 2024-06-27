import './App.css';
import React, { useState, useEffect, useRef } from 'react';

const BucketSVG = ({ size = 60, color = "#4d4d4d" }) => (
  <img src="/bucket.svg" alt="bucket" width={size} height={size} />
);
const WellSVG = ({ size = 60 }) => (
  <img src="/well.svg" alt="well" width={size} height={size} />
);

const BucketWellGame = () => {
  const [score, setScore] = useState(0);
  const [buckets, setBuckets] = useState([]);
  const [charging, setCharging] = useState(false);
  const [chargeTime, setChargeTime] = useState(0);
  const [wellPosition, setWellPosition] = useState({ x: 0, y: 0 });
  const gameAreaRef = useRef(null);
  const chargeInterval = useRef(null);

  useEffect(() => {
    if (gameAreaRef.current) {
      repositionWell();
    }
  }, [score]);

  useEffect(() => {
    const animationFrame = requestAnimationFrame(animateBuckets);
    return () => cancelAnimationFrame(animationFrame);
  }, [buckets, wellPosition]);

  const repositionWell = () => {
    const gameWidth = gameAreaRef.current.clientWidth;
    const gameHeight = gameAreaRef.current.clientHeight;
    setWellPosition({
      x: Math.random() * (gameWidth - 100) + 50,
      y: Math.random() * (gameHeight - 100) + 50,
    });
  };

  const startCharging = (e) => {
    if (e.button !== 0) return;
    setCharging(true);
    chargeInterval.current = setInterval(() => {
      setChargeTime(prev => Math.min(prev + 0.1, 6));
    }, 100);
  };

  const throwBucket = (e) => {
    if (e.button !== 0) return;
    if (charging) {
      setCharging(false);
      clearInterval(chargeInterval.current);
      const speed = Math.min(chargeTime * 3, 20); // Reduced speed
      const angle = Math.atan2(wellPosition.y - (gameAreaRef.current.clientHeight - 50), wellPosition.x - 50);
      const newBucket = {
        id: Date.now(),
        x: 50,
        y: gameAreaRef.current.clientHeight - 50,
        vx: speed * Math.cos(angle),
        vy: speed * Math.sin(angle),
      };
      setBuckets(prev => [...prev, newBucket]);
      setChargeTime(0);
    }
  };

  const animateBuckets = () => {
    if (!gameAreaRef.current) return;
    const gravity = 0.2; // Reduced gravity for slower fall

    setBuckets(prevBuckets =>
      prevBuckets.map(bucket => {
        let newVy = bucket.vy + gravity;
        let newY = bucket.y + newVy;
        let newX = bucket.x + bucket.vx;

        if (Math.abs(newX - wellPosition.x) < 30 && Math.abs(newY - wellPosition.y) < 30) {
          setScore(prev => prev + 1);
          return null;
        }

        if (newY >= gameAreaRef.current.clientHeight || newX >= gameAreaRef.current.clientWidth || newX < 0) {
          return null;
        }

        return { ...bucket, x: newX, y: newY, vy: newVy };
      }).filter(Boolean)
    );
  };

  return (
    <div
      className="flex flex-col items-center justify-center h-screen bg-green-200 overflow-hidden cursor-pointer relative"
      ref={gameAreaRef}
      onMouseDown={startCharging}
      onMouseUp={throwBucket}
      onMouseLeave={throwBucket}
    >
      <div className="absolute top-4 left-4 z-10 text-2xl font-bold bg-white bg-opacity-50 px-4 py-2 rounded">
        Score: {score}
      </div>

      <WellSVG size={60} />
      {/*/!* Well SVG *!/*/}
      {/*<svg width="60" height="60" viewBox="0 0 60 60" className="absolute" style={{ left: `${wellPosition.x}px`, top: `${wellPosition.y}px` }}>*/}
      {/*  <rect x="0" y="0" width="60" height="15" fill="#ff6b6b" />*/}
      {/*  <rect x="5" y="15" width="5" height="45" fill="#4d4d4d" />*/}
      {/*  <rect x="50" y="15" width="5" height="45" fill="#4d4d4d" />*/}
      {/*  <path d="M15 25 H45 Q50 25 50 30 H45 H15 Q10 30 10 25 Z" fill="#4d4d4d" />*/}
      {/*  <path d="M20 35 H40 V45 H35 H25 H20 Z" fill="#4d4d4d" />*/}
      {/*  <rect x="15" y="45" width="30" height="5" fill="#4d4d4d" />*/}
      {/*  <rect x="10" y="50" width="40" height="5" fill="#4d4d4d" />*/}
      {/*  <rect x="5" y="55" width="50" height="5" fill="#4d4d4d" />*/}
      {/*</svg>*/}

      {/* Flying Buckets */}
      {buckets.map(bucket => (
        <div key={bucket.id} className="absolute" style={{ left: `${bucket.x}px`, top: `${bucket.y}px`, transform: 'translate(-50%, -50%)' }}>
          <BucketSVG size={40} />
        </div>
      ))}

      {/* Thrower (now a bucket) */}
      <div className="absolute bottom-8 left-8">
        <BucketSVG size={60} color="#8B4513" />
      </div>

      {/* Power Up Indicator */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-64 h-8 bg-gray-300 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-green-500 to-red-500 transition-all duration-100 ease-linear"
          style={{ width: `${(chargeTime / 6) * 100}%` }}
        ></div>
      </div>

      {/* Power Up Text */}
      {charging && (
        <div className="absolute bottom-14 left-1/2 transform -translate-x-1/2 text-2xl font-bold text-white bg-black bg-opacity-50 px-4 py-2 rounded">
          Power: {((chargeTime / 6) * 100).toFixed(0)}%
        </div>
      )}
    </div>
  );
};

export default BucketWellGame;
