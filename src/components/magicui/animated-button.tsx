"use client";

import React, { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

export type ButtonStatus = "idle" | "success" | "error";

interface AnimatedButtonProps {
  buttonColor: string;
  buttonTextColor?: string;
  status: ButtonStatus;
  initialText: React.ReactElement | string;
  successText?: React.ReactElement | string;
  errorText?: React.ReactElement | string;
}

export const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  buttonColor,
  buttonTextColor = "#FFFFFF",
  status,
  initialText,
  successText = "Message Sent!",
  errorText = "Submission Failed",
}) => {
  return (
    <AnimatePresence mode="wait">
      {status === "success" ? (
        <motion.button
          key="success"
          className="relative flex w-full items-center justify-center overflow-hidden rounded-md bg-green-500 p-[10px] "
          disabled
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.span
            className="relative block font-semibold"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
          >
            {successText}
          </motion.span>
        </motion.button>
      ) : status === "error" ? (
        <motion.button
          key="error"
          className="relative flex w-full items-center justify-center overflow-hidden rounded-md bg-red-500 p-[10px] "
          disabled
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.span
            className="relative block font-semibold text-white"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
          >
            {errorText}
          </motion.span>
        </motion.button>
      ) : (
        <motion.button
          key="idle"
          className="relative flex w-full cursor-pointer items-center justify-center rounded-md border-none p-[10px]"
          style={{ backgroundColor: buttonColor, color: buttonTextColor }}
          type="submit"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.span
            className="relative block font-semibold"
            initial={{ x: 0 }}
            animate={{ x: 0 }}
          >
            {initialText}
          </motion.span>
        </motion.button>
      )}
    </AnimatePresence>
  );
};
