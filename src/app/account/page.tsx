"use client";
import { useConnectWallet } from "@src/hooks/useConnectWallet";
import { ButtonCustom as CustomButton } from "@src/components/DefuseSDK/components/Button/ButtonCustom";
import { useRouter } from "next/navigation";
import { navigation } from "@src/constants/routes";
import Paper from "@src/components/Paper";
import Image from "next/image";

export default function AccountPage() {
  const { state } = useConnectWallet();
  const address = state.isVerified ? state.address : null;
  const router = useRouter();
  
  return (
    <Paper>
      <div className="min-h-screen p-2 sm:p-4 space-y-4 sm:space-y-8 w-full">
        <div className="max-w-sm sm:max-w-xl mx-auto p-2 sm:p-4">
          <div className="w-full">
            {/* Main Account Card */}
            <div className="product-card w-full rounded-2xl sm:rounded-4xl shadow-xl overflow-hidden z-[100] relative cursor-pointer snap-start shrink-0 py-4 sm:py-8 px-3 sm:px-6 bg-white flex flex-col items-center justify-center gap-2 sm:gap-3 transition-all duration-300 group">
             
              {/* Circular Background Element */}
              <div className="absolute rounded-full bg-green-100 z-20 left-1/2 top-[44%] h-[110%] w-[110%] -translate-x-1/2 group-hover:top-[58%] transition-all duration-300"></div>
              
              {/* Account Title */}
              <div className="para uppercase text-center leading-none z-40">
                <p className="text-black font-semibold text-xs font-serif"></p>
                <p className="font-bold text-lg sm:text-xl tracking-wider text-gray-11">{address ? (address.length > 15 ? `${address.slice(0, 8)}...${address.slice(-4)}` : address) : "Not connected"}</p>
              </div>
              
              {/* Wallet Icon/Image */}
              <div className="img w-[120px] sm:w-[180px] aspect-square bg-gray-2 z-40 rounded-full flex items-center justify-center">
                <Image 
                  src="/static/icons/gift.png" 
                  alt="star" 
                  width={60} 
                  height={60}
                  className="sm:w-[100px] sm:h-[100px]"
                />
              </div>
              
              {/* Account Info */}
              <div className="btm-_container z-40 flex flex-col justify-between items-center gap-2 sm:gap-4 w-full">
               
                
                {/* Action Buttons */}
                <div className="w-full max-w-[200px] grid grid-cols-1 gap-2 sm:gap-3">
                  <CustomButton
                    onClick={() => router.push(navigation.deposit)}
                    variant="primary"
                    className="w-full"
                  >
                    Deposit
                  </CustomButton>
                  <CustomButton
                    onClick={() => router.push(navigation.withdraw)}
                    variant="secondary"
                    className="w-full"
                  >
                    Withdraw
                  </CustomButton>
                  <CustomButton
                    onClick={() => router.push(navigation.gift)}
                    variant="primary"
                    className="w-full"
                  >
                    Create Gift
                  </CustomButton>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Paper>
  );
}
