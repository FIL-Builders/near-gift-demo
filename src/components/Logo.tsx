import Image from "next/image";
import Link from "next/link";

import { navigation } from "@src/constants/routes";

const Logo = () => {
  return (
    <Link href={navigation.home}>
      <Image
        src="/static/templates/near-intents/logo.svg"
        alt="Near Intent Logo"
        width={100}
        height={24}
      />
    </Link>
  );
};

export default Logo;
