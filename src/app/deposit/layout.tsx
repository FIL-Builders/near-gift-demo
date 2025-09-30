import type { Metadata } from "next";
import type React from "react";
import type { PropsWithChildren } from "react";

import Layout from "@src/components/Layout";
import { PreloadFeatureFlags } from "@src/components/PreloadFeatureFlags";
import { settings } from "@src/config/settings";

export async function generateMetadata(): Promise<Metadata> {
  return settings.metadata.deposit;
}

const DepositLayout: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <PreloadFeatureFlags>
      <Layout>{children}</Layout>
    </PreloadFeatureFlags>
  );
};

export default DepositLayout;
