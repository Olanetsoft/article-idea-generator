import { motion } from "framer-motion";
import useMeasure from "react-use-measure";

import React, { useEffect, useRef } from "react";

interface Props {
  children: React.ReactNode;
}

const ResizablePanel: React.FC<Props> = ({ children }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [height, setHeight] = React.useState<number | null>(null);

  useEffect(() => {
    if (ref.current) {
      setHeight(ref.current.getBoundingClientRect().height);
    }
  }, [ref]);

  return (
    <motion.div
      animate={height ? { height } : {}}
      style={height ? { height } : {}}
      className="relative w-full overflow-hidden"
      transition={{ type: "tween", duration: 0.5 }}
    >
      <div ref={ref} className={height ? "absolute inset-x-0" : "relative"}>
        {children}
      </div>
    </motion.div>
  );
};

export default ResizablePanel;

// export default function ResizablePanel({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   let [ref, { height }] = useMeasure();

//   return (
//     <motion.div
//       animate={height ? { height } : {}}
//       style={height ? { height } : {}}
//       className="relative w-full overflow-hidden"
//       transition={{ type: "tween", duration: 0.5 }}
//     >
//       <div ref={ref} className={height ? "absolute inset-x-0" : "relative"}>
//         {children}
//       </div>
//     </motion.div>
//   );
// }
