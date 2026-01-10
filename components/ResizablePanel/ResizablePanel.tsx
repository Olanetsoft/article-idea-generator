import { motion } from "framer-motion";
import useMeasure from "react-use-measure";
import type { WithChildrenProps } from "@/types";

export default function ResizablePanel({ children }: WithChildrenProps) {
  const [ref, { height }] = useMeasure();

  return (
    <motion.div
      animate={height ? { height } : {}}
      style={height ? { height } : {}}
      className="relative w-full overflow-y-hidden"
      transition={{ type: "tween", duration: 0.5 }}
    >
      <div ref={ref} className={height ? "absolute inset-x-0" : "relative"}>
        {children}
      </div>
    </motion.div>
  );
}
