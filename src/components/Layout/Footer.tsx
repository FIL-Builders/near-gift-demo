import NearLogo from "../../../public/static/logos/blockchain-strips/near.svg";

const Footer = () => {
  return (
    <footer className="hidden md:block w-full justify-center items-center py-7">
      <div className="flex justify-center items-center gap-1.5 text-sm font-medium bg-white px-3 py-1.5 rounded-full">
        <span className="text-secondary">Powered by</span>
        <NearLogo className="text-black" />
      </div>
    </footer>
  );
};

export default Footer;
