import React, { useState, useEffect, useRef } from "react";
import dice1 from "../assets/dice/dice_1.webp";
import dice2 from "../assets/dice/dice_2.webp";
import dice3 from "../assets/dice/dice_3.webp";
import dice4 from "../assets/dice/dice_4.webp";
import dice5 from "../assets/dice/dice_5.webp";
import dice6 from "../assets/dice/dice_6.webp";
import dice7 from "../assets/dice/dice_7.webp";
import dice8 from "../assets/dice/dice_8.webp";
import dice9 from "../assets/dice/dice_9.webp";
import dice10 from "../assets/dice/dice_10.webp";
import dice11 from "../assets/dice/dice_11.webp";

const STATIC_FACES = {
  1: dice1,
  2: dice2,
  3: dice3,
  4: dice4,
  5: dice5,
  6: dice6,
};

const ROLLING_FRAMES = [dice7, dice8, dice9, dice10, dice11];

export default function AnimatedDie({
  value = 1,
  isRolling = false,
  size = 46,
  stagger = 0,
  style = {},
  className = "",
}) {
  const [frameIndex, setFrameIndex] = useState(stagger % ROLLING_FRAMES.length);
  const [bouncing, setBouncing] = useState(false);
  const prevRollingRef = useRef(isRolling);

  // Cycling tumbling animation while rolling
  useEffect(() => {
    let timer = null;
    if (isRolling) {
      setBouncing(false);
      timer = setInterval(() => {
        setFrameIndex((prev) => (prev + 1) % ROLLING_FRAMES.length);
      }, 70); // Smooth ~14 FPS tumbling frame rate matching reference app
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isRolling]);

  // Trigger subtle landing bounce when stopping
  useEffect(() => {
    if (prevRollingRef.current && !isRolling) {
      setBouncing(true);
      const timer = setTimeout(() => setBouncing(false), 350);
      return () => clearTimeout(timer);
    }
    prevRollingRef.current = isRolling;
  }, [isRolling]);

  const currentSrc = isRolling
    ? ROLLING_FRAMES[frameIndex]
    : STATIC_FACES[value] || STATIC_FACES[1];

  return (
    <div
      className={`animated-die-container ${isRolling ? "is-rolling" : ""} ${bouncing ? "die-landed" : ""} ${className}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        userSelect: "none",
        ...style,
      }}
    >
      <img
        src={currentSrc}
        alt={`Dice ${value}`}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
          filter: isRolling
            ? "drop-shadow(0 6px 12px rgba(0,0,0,0.45))"
            : "drop-shadow(0 3px 6px rgba(0,0,0,0.35))",
          transform: isRolling
            ? `scale(1.06) rotate(${(frameIndex * 18 - 36) * (stagger % 2 === 0 ? 1 : -1)}deg)`
            : bouncing
            ? "scale(1.12)"
            : "scale(1)",
          transition: isRolling ? "none" : "transform 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
          pointerEvents: "none",
        }}
        draggable={false}
      />
    </div>
  );
}
