import React from "react";

export function Container({ children }: { children: React.ReactNode }): JSX.Element {
  return <div className="mx-auto w-full max-w-6xl px-4">{children}</div>;
}
