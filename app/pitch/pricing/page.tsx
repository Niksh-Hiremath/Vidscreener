import { FaCheckCircle, FaRobot, FaBuilding, FaRocket } from 'react-icons/fa';

export default function PricingModel() {
  return (
    <div className="min-h-screen bg-zinc-50 text-[#1D1D1F] flex flex-col items-center justify-center p-8 font-sans relative overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-200 rounded-full blur-[100px] opacity-40"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-200 rounded-full blur-[100px] opacity-40"></div>

      <div className="max-w-6xl w-full text-center mb-16 z-10 mt-4">
        <h1 className="text-5xl lg:text-7xl font-bold leading-tight tracking-tight mb-4">
          Scalable SaaS Strategy
        </h1>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto font-medium">
          Usage-based pricing aligned natively with the value we deliver.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl z-10 items-stretch">
        {/* Tier 1 */}
        <div className="bg-white rounded-[2rem] p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-xl transition-all border border-gray-100 relative flex flex-col group">
          <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform"><FaRocket className="text-3xl" /></div>
          <h3 className="text-3xl font-bold mb-2">Free Tier</h3>
          <p className="text-gray-500 font-medium mb-6">Our seamless adoption layer.</p>
          <div className="text-5xl font-black mb-8">₹0 <span className="text-base text-gray-400 font-semibold tracking-normal block mt-2 uppercase tracking-wider">Up to 150 videos</span></div>
          
          <ul className="space-y-4 mb-10 flex-1">
            <li className="flex items-start"><FaCheckCircle className="text-blue-500 mt-1 mr-3 flex-shrink-0 text-lg" /><span className="text-gray-700 font-medium">Full manual evaluation features</span></li>
            <li className="flex items-start"><FaCheckCircle className="text-blue-500 mt-1 mr-3 flex-shrink-0 text-lg" /><span className="text-gray-700 font-medium">Custom rubrics & submission forms</span></li>
            <li className="flex items-start bg-blue-50/50 p-4 rounded-xl border border-blue-100 mt-2"><FaRobot className="text-purple-500 mt-0.5 mr-3 flex-shrink-0 text-xl" /><span className="text-blue-900 font-bold leading-tight">AI Trial <br/><span className="text-sm text-blue-700 font-medium">Evaluate 2-3 videos free</span></span></li>
          </ul>
        </div>

        {/* Tier 2 */}
        <div className="bg-gray-900 text-white rounded-[2rem] p-10 shadow-2xl relative flex flex-col transform md:-translate-y-6 md:scale-105 border border-gray-800 ring-4 ring-gray-900/5 group">
          <div className="absolute top-0 right-10 bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xs font-bold px-4 py-1.5 rounded-b-xl shadow-lg uppercase tracking-wider">The Upsell</div>
          <div className="w-16 h-16 bg-gray-800 text-purple-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform"><FaRobot className="text-3xl" /></div>
          <h3 className="text-3xl font-bold mb-2 text-white">Pro Tier</h3>
          <p className="text-gray-400 font-medium mb-6">Unleash full analytical capabilities.</p>
          <div className="text-5xl font-black mb-8">Usage <span className="text-base text-gray-400 font-semibold tracking-normal block mt-2 uppercase tracking-wider">Per Video Pricing</span></div>
          
          <ul className="space-y-4 mb-10 flex-1">
            <li className="flex items-start"><FaCheckCircle className="text-purple-400 mt-1 mr-3 flex-shrink-0 text-lg" /><span className="text-gray-200 font-medium">AI rating on ALL submissions</span></li>
            <li className="flex items-start"><FaCheckCircle className="text-purple-400 mt-1 mr-3 flex-shrink-0 text-lg" /><span className="text-gray-200 font-medium">Drastically expanded storage</span></li>
            <li className="flex items-start"><FaCheckCircle className="text-purple-400 mt-1 mr-3 flex-shrink-0 text-lg" /><span className="text-gray-200 font-medium">Human vs. AI Calibration Data</span></li>
            <li className="flex items-start"><FaCheckCircle className="text-purple-400 mt-1 mr-3 flex-shrink-0 text-lg" /><span className="text-gray-200 font-medium">Bias detection & analytics</span></li>
          </ul>
        </div>

        {/* Tier 3 */}
        <div className="bg-white rounded-[2rem] p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-xl transition-all border border-gray-100 relative flex flex-col group">
          <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform"><FaBuilding className="text-3xl" /></div>
          <h3 className="text-3xl font-bold mb-2">Enterprise</h3>
          <p className="text-gray-500 font-medium mb-6">Massive scale, absolute control.</p>
          <div className="text-5xl font-black mb-8">Contracts <span className="text-base text-gray-400 font-semibold tracking-normal block mt-2 uppercase tracking-wider">Annual Billing</span></div>
          
          <ul className="space-y-4 mb-10 flex-1">
            <li className="flex items-start"><FaCheckCircle className="text-amber-500 mt-1 mr-3 flex-shrink-0 text-lg" /><span className="text-gray-700 font-medium">Unlimited upload potential</span></li>
            <li className="flex items-start"><FaCheckCircle className="text-amber-500 mt-1 mr-3 flex-shrink-0 text-lg" /><span className="text-gray-700 font-medium">Custom AI tuned on company data</span></li>
            <li className="flex items-start border-l-4 border-amber-300 pl-4 ml-1.5 py-2 bg-amber-50/50 rounded-r-xl mt-4"><span className="text-gray-900 font-bold block">Developer APIs <span className="text-gray-500 font-medium text-sm block mt-1">Direct inject to ATS / Workday</span></span></li>
          </ul>
        </div>
      </div>
    </div>
  )
}
