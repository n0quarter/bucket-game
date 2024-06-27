import './App.css';
import React, { useState, useEffect, useRef } from 'react';


const BucketSVG = ({ size = 60, color = "#4d4d4d" }) => (
  <img src="/bucket.svg" alt="bucket" width={size} height={size}/>
);

const WellSVG = ({ size = 60 }) => (
  <img src="/well.svg" alt="well" width={size} height={size}/>
);
const BucketWellGame = () => {
  const [score, setScore] = useState(0);
  const [buckets, setBuckets] = useState([]);
  const [charging, setCharging] = useState(false);
  const [chargeTime, setChargeTime] = useState(1.8); // Start at 30% power (6 * 0.3)
  const [wellPosition, setWellPosition] = useState({ x: 0, y: 0 });
  const [showAnimation, setShowAnimation] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const gameAreaRef = useRef(null);
  const chargeInterval = useRef(null);
  const animationFrameRef = useRef(null);

  useEffect(() => {
    if (gameAreaRef.current) {
      repositionWell();
    }
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  useEffect(() => {
    animationFrameRef.current = requestAnimationFrame(animateBuckets);
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [buckets, wellPosition]);

  useEffect(() => {
    if (score >= 3) {
      setGameWon(true);
    }
  }, [score]);

  const repositionWell = () => {
    const gameWidth = gameAreaRef.current.clientWidth;
    const gameHeight = gameAreaRef.current.clientHeight;
    setWellPosition({
      x: Math.random() * (gameWidth - 200) + 100,
      y: Math.random() * (gameHeight / 2 - 100) + gameHeight / 2,
    });
  };

  const startCharging = (e) => {
    if (gameWon) return;
    setCharging(true);
    chargeInterval.current = setInterval(() => {
      setChargeTime(prev => Math.min(prev + 0.1, 6));
    }, 100);
  };

  const throwBucket = () => {
    if (gameWon) return;
    if (charging) {
      setCharging(false);
      clearInterval(chargeInterval.current);
      const speed = Math.min(chargeTime * 5, 30);
      const angle = -Math.PI / 4;
      const newBucket = {
        id: Date.now(),
        x: 70,
        y: gameAreaRef.current.clientHeight - 70,
        vx: speed * Math.cos(angle),
        vy: speed * Math.sin(angle),
      };
      setBuckets(prev => [...prev, newBucket]);
      setChargeTime(1.8); // Reset to 30% power
    }
  };

  const animateBuckets = () => {
    if (!gameAreaRef.current || gameWon) return;
    const gravity = 0.5;

    setBuckets(prevBuckets =>
      prevBuckets.map(bucket => {
        let newVy = bucket.vy + gravity;
        let newX = bucket.x + bucket.vx;
        let newY = bucket.y + newVy;

        const wellSize = 60;
        if (newX + 25 > wellPosition.x &&
          newX - 25 < wellPosition.x + wellSize &&
          newY + 25 > wellPosition.y &&
          newY - 25 < wellPosition.y + wellSize) {
          setScore(prev => prev + 1);
          setShowAnimation(true);
          setTimeout(() => {
            setShowAnimation(false);
            repositionWell();
          }, 1000);
          return null;
        }

        if (newY >= gameAreaRef.current.clientHeight || newX >= gameAreaRef.current.clientWidth || newX < 0) {
          return null;
        }

        return { ...bucket, x: newX, y: newY, vy: newVy };
      }).filter(Boolean)
    );

    animationFrameRef.current = requestAnimationFrame(animateBuckets);
  };

  const resetGame = () => {
    setScore(0);
    setBuckets([]);
    setGameWon(false);
    repositionWell();
  };

  return (
    <div
      className="flex flex-col items-center justify-center h-screen w-full bg-green-200 overflow-hidden relative touch-none"
      ref={gameAreaRef}
      onMouseDown={startCharging}
      onMouseUp={throwBucket}
      onMouseLeave={throwBucket}
      onTouchStart={startCharging}
      onTouchEnd={throwBucket}
    >
      <div className="absolute top-4 left-4 z-10 text-xl md:text-2xl font-bold bg-white bg-opacity-50 px-4 py-2 rounded">
        Score: {score}
      </div>

      {/* Well SVG */}
      <div className="absolute" style={{ left: `${wellPosition.x}px`, top: `${wellPosition.y}px` }}>
        <WellSVG width={60} height={60} />
      </div>

      {/* Flying Buckets */}
      {buckets.map(bucket => (
        <div key={bucket.id} style={{ position: 'absolute', left: `${bucket.x}px`, top: `${bucket.y}px`, transform: 'translate(-25px, -25px)' }}>
          <BucketSVG width={50} height={50} color="#ff6b6b" />
        </div>
      ))}

      {/* Thrower (Bucket) */}
      <div className="absolute bottom-8 left-8">
        <BucketSVG width={60} height={60} color="#feca57" />
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
        <div className="absolute bottom-14 left-1/2 transform -translate-x-1/2 text-xl md:text-2xl font-bold text-white bg-black bg-opacity-50 px-4 py-2 rounded">
          Power: {((chargeTime / 6) * 100).toFixed(0)}%
        </div>
      )}

      {/* Scoring Animation */}
      {showAnimation && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-4xl md:text-6xl font-bold text-yellow-400 animate-bounce">
          +1
        </div>
      )}

      {/* Win Screen */}
      {gameWon && (
        <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center">
          <div className="bg-white p-6 md:p-8 rounded-lg text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-green-600">You Won!</h2>
            <p className="text-lg md:text-xl mb-4">Congratulations! You scored 3 points!</p>
            <button
              onClick={resetGame}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-lg md:text-xl"
            >
              Play Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BucketWellGame;