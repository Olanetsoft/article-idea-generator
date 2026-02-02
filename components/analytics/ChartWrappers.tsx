// @ts-nocheck - Recharts has type incompatibility with React 18
"use client";

import { useEffect, useState, ReactNode } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";

interface ChartWrapperProps {
  children?: ReactNode;
  data?: any[];
  [key: string]: any;
}

// Re-export with client-side only rendering
export function ClientAreaChart({
  data,
  children,
  ...props
}: ChartWrapperProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="h-full w-full animate-pulse bg-slate-700/30 rounded" />
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      {
        (
          <AreaChart data={data} {...props}>
            {children as any}
          </AreaChart>
        ) as any
      }
    </ResponsiveContainer>
  );
}

export function ClientPieChart({ children, ...props }: ChartWrapperProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="h-full w-full animate-pulse bg-slate-700/30 rounded-full" />
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      {(<PieChart {...props}>{children as any}</PieChart>) as any}
    </ResponsiveContainer>
  );
}

export function ClientBarChart({
  data,
  children,
  ...props
}: ChartWrapperProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="h-full w-full animate-pulse bg-slate-700/30 rounded" />
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      {
        (
          <BarChart data={data} {...props}>
            {children as any}
          </BarChart>
        ) as any
      }
    </ResponsiveContainer>
  );
}

// Re-export all components for convenience
export { Area, XAxis, YAxis, CartesianGrid, Tooltip, Pie, Cell, Bar };
