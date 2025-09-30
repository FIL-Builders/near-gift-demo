import { type PropsWithChildren } from "react";

const Main = ({ children }: PropsWithChildren) => {
  return <main className="flex md:flex-1 min-h-screen">{children}</main>;
};

export default Main;
