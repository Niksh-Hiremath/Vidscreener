import { FaStar, FaMedal, FaUserAlt } from 'react-icons/fa';

export default function EvaluatorMarketplace() {
  const evaluators = [
    {
      name: "Dr. Sarah Jenkins",
      role: "University Admissions Expert",
      rating: 4.9,
      reviews: 142,
      tags: ["STEM Submissions", "Fellowships"],
    },
    {
      name: "Marcus Vane",
      role: "Corporate Lead Recruiter",
      rating: 4.8,
      reviews: 89,
      tags: ["Tech Hiring", "Behavioral"],
    },
    {
      name: "Priya Sharma",
      role: "Design & Innovation Lead",
      rating: 5.0,
      reviews: 215,
      tags: ["Product Pitches", "Creativity"],
    }
  ];

  return (
    <div className="min-h-screen bg-[#FDFCF8] text-[#1D1D1F] flex flex-col items-center justify-center p-8 font-sans overflow-hidden">
      <div className="max-w-6xl w-full text-center mb-16 relative mt-6">
      <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-400 rounded-full blur-3xl opacity-20"></div>
        <h2 className="text-sm font-bold tracking-widest text-[#B3404A] uppercase mb-4">The Next Frontier</h2>
        <h1 className="text-5xl lg:text-7xl font-bold leading-tight tracking-tight mb-6 flex flex-col items-center">
          <span>Evaluator</span> 
          <span className="text-[#B3404A]">Marketplace.</span>
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed font-light">
          Organizations will have the freedom to hire external, verified, paid evaluators instantly. <strong className="font-semibold text-gray-800">Scale your evaluation bandwidth locally or globally</strong> without hiring full-time staff.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl z-10">
        {evaluators.map((ev, i) => (
          <div key={i} className="bg-white rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 hover:shadow-[0_8px_40px_rgb(0,0,0,0.08)] transition-all transform hover:-translate-y-2 group">
            <div className="flex justify-between items-start mb-6">
              <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-inner bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 flex items-center justify-center">
                <FaUserAlt className="text-4xl text-gray-300" />
              </div>
              <div className="bg-yellow-50 border border-yellow-100 text-yellow-700 font-bold px-3 py-1.5 rounded-full flex items-center shadow-sm text-sm">
                <FaStar className="mr-1.5 text-yellow-500" /> {ev.rating}
              </div>
            </div>
            
            <h3 className="text-2xl font-bold text-gray-900 group-hover:text-[#B3404A] transition-colors">{ev.name}</h3>
            <div className="text-gray-500 font-medium flex items-center mb-6 mt-2 text-sm">
                <FaMedal className="mr-2 text-gray-400 text-lg"/> {ev.role}
            </div>

            <div className="flex flex-wrap gap-2 mb-8 h-16">
              {ev.tags.map(t => (
                <span key={t} className="bg-gray-50 text-gray-600 text-xs font-bold px-3 py-1.5 rounded-lg border border-gray-200">
                  {t}
                </span>
              ))}
            </div>

            <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
              <div className="text-sm text-gray-400 font-semibold">{ev.reviews} verified reviews</div>
              <button className="bg-gray-900 hover:bg-[#B3404A] text-white px-6 py-2.5 rounded-xl font-bold transition-all hover:scale-105 active:scale-95 shadow-md">
                Hire Profile
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
