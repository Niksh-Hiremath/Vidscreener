import { FaGraduationCap, FaGlobeAmericas, FaBuilding, FaChalkboardTeacher, FaRegBuilding } from 'react-icons/fa';

export default function MarketExpansion() {
  return (
    <div className="min-h-screen bg-[#FDFCF8] text-[#1D1D1F] flex flex-col items-center justify-center p-8 font-sans overflow-hidden relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-100/50 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-6xl w-full z-10 text-center mb-16 mt-8">
        <h2 className="text-sm font-bold tracking-widest text-indigo-600 uppercase mb-4">Beyond Expected Scope</h2>
        <h1 className="text-5xl lg:text-7xl font-bold leading-tight tracking-tight mb-6 flex flex-col items-center">
          <span className="text-gray-900">A Vision</span> 
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-500">Far Bigger.</span>
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto font-light leading-relaxed">
          We are not restricting ourselves to closed, organization-level tools. Our broader market encompasses <strong className="text-gray-900 font-bold">any institution</strong> handling asynchronous video screening today.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl z-10">
        <div className="bg-white/80 backdrop-blur-md border border-indigo-50 p-8 rounded-[2rem] hover:bg-white transition duration-500 hover:-translate-y-2 group shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgba(79,70,229,0.1)]">
          <div className="w-16 h-16 bg-indigo-50 border border-indigo-100 text-indigo-500 rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 group-hover:bg-indigo-100 transition-all">
            <FaGraduationCap />
          </div>
          <h3 className="text-2xl font-bold mb-4 text-gray-900">University Admissions</h3>
          <p className="text-gray-500 leading-relaxed font-medium">
            Screening thousands of student applications, assessing qualitative traits through structured video essays beyond standard testing.
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur-md border border-emerald-50 p-8 rounded-[2rem] hover:bg-white transition duration-500 hover:-translate-y-2 group shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgba(16,185,129,0.1)]">
          <div className="w-16 h-16 bg-emerald-50 border border-emerald-100 text-emerald-500 rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 group-hover:bg-emerald-100 transition-all">
            <FaGlobeAmericas />
          </div>
          <h3 className="text-2xl font-bold mb-4 text-gray-900">Global Fellowships</h3>
          <p className="text-gray-500 leading-relaxed font-medium">
            Identifying exceptional talent worldwide, standardizing the subjective evaluation process across diverse linguistic backgrounds.
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur-md border border-cyan-50 p-8 rounded-[2rem] hover:bg-white transition duration-500 hover:-translate-y-2 group shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgba(6,182,212,0.1)]">
          <div className="w-16 h-16 bg-cyan-50 border border-cyan-100 text-cyan-500 rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 group-hover:bg-cyan-100 transition-all">
            <FaBuilding />
          </div>
          <h3 className="text-2xl font-bold mb-4 text-gray-900">Corporate HR</h3>
          <p className="text-gray-500 leading-relaxed font-medium">
            Handling massive pipelines of asynchronous interviews. Speeding up first-round automated screening to secure top talent.
          </p>
        </div>
      </div>

      <div className="mt-20 z-10 w-full max-w-6xl flex justify-center mb-8">
        <div className="inline-flex items-center space-x-6 bg-white border border-gray-100 px-10 py-5 rounded-full shadow-2xl hover:border-gray-200 transition-colors">
            <FaChalkboardTeacher className="text-3xl text-indigo-500 opacity-90" />
            <div className="text-2xl font-bold tracking-tight text-gray-800">One Unified Platform for All</div>
            <FaRegBuilding className="text-3xl text-cyan-500 opacity-90" />
        </div>
      </div>
    </div>
  )
}
