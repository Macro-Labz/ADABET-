"use client";

import { motion, type AnimationProps } from "framer-motion";

import { cn } from "../../lib/utils";

const animationProps = {
  initial: { "--x": "100%", scale: 0.8 },
  animate: { "--x": "-100%", scale: 1 },
  whileTap: { scale: 0.95 },
  transition: {
    repeat: Infinity,
    repeatType: "loop",
    repeatDelay: 1,
    type: "spring",
    stiffness: 20,
    damping: 15,
    mass: 2,
    scale: {
      type: "spring",
      stiffness: 200,
      damping: 5,
      mass: 0.5,
    },
  },
} as AnimationProps;

interface ShinyButtonProps {
  text: string;
  className?: string;
  color?: string;
  textColor?: string;
  borderWidth?: string;
  onClick?: () => void;
  borderColor?: string;
}

const ShinyButton = ({
  text = "shiny-button",
  className,
  color = "primary",
  textColor = "rgb(255,255,255,90%)",
  borderWidth = "2px",
  onClick,
  borderColor = "black",
}: ShinyButtonProps) => {
  return (
    <motion.button
      {...animationProps}
      onClick={onClick}
      className={cn(
        `relative rounded-lg px-6 py-2 font-medium backdrop-blur-xl transition-[box-shadow] duration-300 ease-in-out hover:shadow dark:bg-[radial-gradient(circle_at_50%_0%,${color}/10%)_0%,transparent_60%)] dark:hover:shadow-[0_0_20px_${color}/10%)]`,
        className,
      )}
      style={{
        border: `${borderWidth} solid ${borderColor}`,
      }}
    >
      <span
        className="relative block h-full w-full text-sm uppercase tracking-wide dark:font-light"
        style={{
          color: textColor,
          maskImage:
            `linear-gradient(-75deg,${color} calc(var(--x) + 20%),transparent calc(var(--x) + 30%),${color} calc(var(--x) + 100%))`,
        }}
      >
        {text}
      </span>
      <span
        style={{
          mask: "linear-gradient(rgb(0,0,0), rgb(0,0,0)) content-box,linear-gradient(rgb(0,0,0), rgb(0,0,0))",
          maskComposite: "exclude",
        }}
        className={`absolute inset-0 z-10 block rounded-[inherit] bg-[linear-gradient(-75deg,${color}/10%)_calc(var(--x)+20%),${color}/50%)_calc(var(--x)+25%),${color}/10%)_calc(var(--x)+100%))] p-px`}
      ></span>
    </motion.button>
  );
};

export default ShinyButton;
