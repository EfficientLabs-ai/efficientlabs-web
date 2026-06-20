"use client";
import React, { useRef, useEffect, useState } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

/**
 * TextHoverEffect — giant outlined wordmark that draws itself in (blue stroke),
 * then reveals a chrome→electric-blue gradient fill under the cursor on hover.
 * Adapted for Efficient Labs: brand blue #0a84ff, Michroma wordmark face.
 */
export const TextHoverEffect = ({
  text,
  duration,
  className,
}: {
  text: string;
  duration?: number;
  automatic?: boolean;
  className?: string;
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [cursor, setCursor] = useState({ x: 0, y: 0 });
  const [hovered, setHovered] = useState(false);
  const [maskPosition, setMaskPosition] = useState({ cx: "50%", cy: "50%" });

  useEffect(() => {
    if (svgRef.current && cursor.x !== null && cursor.y !== null) {
      const svgRect = svgRef.current.getBoundingClientRect();
      if (svgRect.width > 0 && svgRect.height > 0) {
        const cxPercentage = ((cursor.x - svgRect.left) / svgRect.width) * 100;
        const cyPercentage = ((cursor.y - svgRect.top) / svgRect.height) * 100;
        if (Number.isFinite(cxPercentage) && Number.isFinite(cyPercentage)) {
          setMaskPosition({ cx: `${cxPercentage}%`, cy: `${cyPercentage}%` });
        }
      }
    }
  }, [cursor]);

  return (
    <svg
      ref={svgRef}
      width="100%"
      height="100%"
      viewBox="0 0 320 100"
      xmlns="http://www.w3.org/2000/svg"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onMouseMove={(e) => setCursor({ x: e.clientX, y: e.clientY })}
      className={cn("select-none", className)}
    >
      <defs>
        <linearGradient id="el-textGradient" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="320" y2="0">
          {hovered && (
            <>
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="35%" stopColor="#cfd8e4" />
              <stop offset="55%" stopColor="#0a84ff" />
              <stop offset="80%" stopColor="#3d6cff" />
              <stop offset="100%" stopColor="#ffffff" />
            </>
          )}
        </linearGradient>

        <motion.radialGradient
          id="el-revealMask"
          gradientUnits="userSpaceOnUse"
          r="22%"
          initial={{ cx: "50%", cy: "50%" }}
          animate={maskPosition}
          transition={{ duration: duration ?? 0, ease: "easeOut" }}
        >
          <stop offset="0%" stopColor="white" />
          <stop offset="100%" stopColor="black" />
        </motion.radialGradient>
        <mask id="el-textMask">
          <rect x="0" y="0" width="100%" height="100%" fill="url(#el-revealMask)" />
        </mask>
      </defs>

      {/* faint base outline, shown on hover */}
      <text
        x="50%" y="50%" textAnchor="middle" dominantBaseline="middle"
        strokeWidth="0.3"
        className="fill-transparent stroke-neutral-700 text-[2.6rem] font-normal uppercase"
        style={{ opacity: hovered ? 0.5 : 0, fontFamily: "var(--font-wordmark), sans-serif" }}
      >
        {text}
      </text>

      {/* the blue self-drawing stroke */}
      <motion.text
        x="50%" y="50%" textAnchor="middle" dominantBaseline="middle"
        strokeWidth="0.4"
        className="fill-transparent stroke-[#0a84ff] text-[2.6rem] font-normal uppercase"
        style={{ fontFamily: "var(--font-wordmark), sans-serif" }}
        initial={{ strokeDashoffset: 1000, strokeDasharray: 1000 }}
        animate={{ strokeDashoffset: 0, strokeDasharray: 1000 }}
        transition={{ duration: 4, ease: "easeInOut" }}
      >
        {text}
      </motion.text>

      {/* chrome→blue gradient revealed under the cursor */}
      <text
        x="50%" y="50%" textAnchor="middle" dominantBaseline="middle"
        stroke="url(#el-textGradient)" strokeWidth="0.4" mask="url(#el-textMask)"
        className="fill-transparent text-[2.6rem] font-normal uppercase"
        style={{ fontFamily: "var(--font-wordmark), sans-serif" }}
      >
        {text}
      </text>
    </svg>
  );
};

export const FooterBackgroundGradient = () => {
  return (
    <div
      className="absolute inset-0 z-0"
      style={{
        background: "radial-gradient(125% 125% at 50% 12%, #0b0f1a00 45%, #0a84ff26 100%)",
      }}
    />
  );
};
