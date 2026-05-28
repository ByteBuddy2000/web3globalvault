import Dashboardnavbar from '@/components/navbar/dashboard-navbar';
import ConnectWallet from "./ConnectWallet";

export default function Page(){
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white pb-8">
      <Dashboardnavbar />
      
      <div className="max-w-5xl mx-auto px-4">
        <ConnectWallet />
      </div>
    </div>
  );
}