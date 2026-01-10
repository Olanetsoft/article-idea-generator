/**
 * Common component prop types
 */
import { ReactNode } from "react";

export interface BaseComponentProps {
  className?: string;
  children?: ReactNode;
}

export interface WithChildrenProps {
  children: ReactNode;
}
