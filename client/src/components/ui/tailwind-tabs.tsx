import React, { createContext, useContext, useMemo, useState } from "react";

interface TabsContextValue {
  value: string;
  setValue: (value: string) => void;
}

const TabsContext = createContext<TabsContextValue | null>(null);

interface TabsProps {
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  className?: string;
  children: React.ReactNode;
}

export function Tabs({ defaultValue, value, onValueChange, className, children }: TabsProps) {
  const isControlled = typeof value === "string" && typeof onValueChange === "function";
  const [internalValue, setInternalValue] = useState<string>(defaultValue || "");

  const currentValue = isControlled ? (value as string) : internalValue;
  const setValue = (next: string) => {
    if (isControlled) {
      (onValueChange as (v: string) => void)(next);
    } else {
      setInternalValue(next);
    }
  };

  const ctx = useMemo(() => ({ value: currentValue, setValue }), [currentValue]);

  return (
    <TabsContext.Provider value={ctx}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
}

interface TabsListProps {
  className?: string;
  children: React.ReactNode;
}

export function TabsList({ className, children }: TabsListProps) {
  return (
    <div className="border-b border-gray-200 dark:border-gray-700">
      <ul className={[
        "flex flex-wrap -mb-px text-sm font-medium text-center text-gray-500 dark:text-gray-400",
        className || "",
      ].join(" ")}
      >
        {children}
      </ul>
    </div>
  );
}

interface TabsTriggerProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

export function TabsTrigger({ value, children, className }: TabsTriggerProps) {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error("TabsTrigger must be used within Tabs");
  const isActive = ctx.value === value;
  return (
    <li className="me-2">
      <button
        type="button"
        onClick={() => ctx.setValue(value)}
        className={[
          "inline-flex items-center justify-center p-4 border-b-2 rounded-t-lg group",
          isActive
            ? "text-blue-600 border-blue-600 active dark:text-blue-500 dark:border-blue-500"
            : "border-transparent hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300",
          className || "",
        ].join(" ")}
      >
        {children}
      </button>
    </li>
  );
}

interface TabsContentProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

export function TabsContent({ value, children, className }: TabsContentProps) {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error("TabsContent must be used within Tabs");
  if (ctx.value !== value) return null;
  return <div className={className}>{children}</div>;
}

// Pill-style tabs matching the requested markup
interface PillTabsListProps {
  className?: string;
  children: React.ReactNode;
}

export function PillTabsList({ className, children }: PillTabsListProps) {
  return (
    <ul
      className={[
        "flex flex-wrap text-sm font-medium text-center text-gray-500 dark:text-gray-400",
        className || "",
      ].join(" ")}
    >
      {children}
    </ul>
  );
}

interface PillTabsTriggerProps {
  value: string;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

export function PillTabsTrigger({ value, children, className, disabled }: PillTabsTriggerProps) {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error("PillTabsTrigger must be used within Tabs");
  const isActive = ctx.value === value;
  return (
    <li className="me-2">
      <button
        type="button"
        onClick={() => !disabled && ctx.setValue(value)}
        disabled={disabled}
        className={[
          "inline-block px-4 py-3 rounded-lg",
          disabled
            ? "text-gray-400 cursor-not-allowed dark:text-gray-500"
            : isActive
              ? "text-white bg-blue-600 active"
              : "hover:text-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 dark:hover:text-white",
          className || "",
        ].join(" ")}
        aria-current={isActive ? "page" : undefined}
      >
        {children}
      </button>
    </li>
  );
}


