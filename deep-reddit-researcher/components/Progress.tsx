"use client";
import { motion } from "framer-motion";

export default function Progress({ pct }: { pct: number }) {
  return (
    <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
      <motion.div
        className="bg-white h-full rounded-full"
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      />
    </div>
  );
}