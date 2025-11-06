import React from "react";
import Header from "./Header";
import BottomTab from "./BottomTab";

type Props = React.PropsWithChildren<{
  className?: string;
}>;

const AppShell: React.FC<Props> = ({ children, className }) => {
  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 flex flex-col">
      <Header />
      <main className={["container mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-4 flex-1", className || ""].join(" ")}>
        {children}
      </main>
      <BottomTab />
    </div>
  );
};

export default AppShell;
