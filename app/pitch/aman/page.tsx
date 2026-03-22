import { FaLinkedin, FaVideo, FaArrowUp, FaUsers } from 'react-icons/fa';

export default function AmanStory() {
  return (
    <div className="min-h-screen bg-[#FDFCF8] text-[#1D1D1F] flex flex-col items-center justify-center p-8 font-sans overflow-hidden relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-50 translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-yellow-100 rounded-full blur-3xl opacity-50 -translate-x-1/2 translate-y-1/2" />
        
        <div className="max-w-6xl w-full z-10 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
                <div className="inline-flex items-center space-x-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full font-semibold text-sm">
                    <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
                    <span>The Origin Story</span>
                </div>
                <h1 className="text-5xl lg:text-7xl font-bold leading-tight tracking-tight">
                    Meet <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Aman.</span>
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed font-light border-l-4 border-yellow-400 pl-6">
                    Head of the <strong className="font-semibold text-gray-900">Young Creators League (YCL)</strong>—a national tech-innovation challenge hosted by Plaksha University.
                </p>

                <div className="flex items-center space-x-4 pt-6 mt-8">
                    <div className="w-14 h-14 bg-[#0A66C2] rounded-xl flex flex-shrink-0 items-center justify-center shadow-lg shadow-blue-200">
                        <FaLinkedin className="text-white text-3xl" />
                    </div>
                    <div className="text-lg text-gray-700 leading-snug">
                       Aman posted the application call <br/> and went to sleep expecting <strong className="text-gray-900 font-bold bg-yellow-100 px-1">~10 responses</strong>.
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-[2rem] p-10 shadow-[0_20px_50px_rgb(0,0,0,0.05)] border border-gray-50 relative overflow-hidden group">
                <div className="absolute -right-10 -top-10 w-40 h-40 bg-gradient-to-br from-yellow-200 to-orange-100 rounded-full blur-2xl opacity-50 group-hover:scale-150 transition-transform duration-700" />
                <h3 className="text-2xl font-bold mb-8 relative z-10 text-gray-800">The Reality Check</h3>

                <div className="space-y-6 relative z-10">
                    <div className="flex items-center w-full bg-gray-50 rounded-2xl p-4 transition-all hover:bg-white hover:shadow-lg">
                        <div className="w-16 text-center text-gray-400 font-mono text-sm font-bold">1st Day</div>
                        <div className="flex-1 px-4">
                            <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                                <div className="h-full bg-yellow-400 w-1/4 rounded-full" />
                            </div>
                        </div>
                        <div className="w-20 text-right font-bold text-xl text-gray-700">10</div>
                    </div>

                    <div className="flex items-center w-full bg-gray-50 rounded-2xl p-4 transition-all hover:bg-white hover:shadow-lg">
                        <div className="w-16 text-center text-gray-400 font-mono text-sm font-bold">2nd Day</div>
                        <div className="flex-1 px-4">
                            <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                                <div className="h-full bg-orange-400 w-1/2 rounded-full" />
                            </div>
                        </div>
                        <div className="w-20 text-right font-bold text-2xl text-orange-600">50</div>
                    </div>

                    <div className="flex items-center w-full bg-blue-50/50 rounded-2xl p-6 border border-blue-100 transition-all hover:bg-white hover:shadow-xl scale-[1.03] transform origin-left shadow-md mt-6">
                        <div className="w-16 text-center text-blue-600 font-mono font-bold text-xs uppercase tracking-wider">Deadline <br/> Close</div>
                        <div className="flex-1 px-4 relative">
                            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 text-[10px] text-blue-600 font-bold bg-blue-100 px-2 rounded-full border border-blue-200"><FaArrowUp className="inline mr-1 mb-0.5 text-[8px]"/>Boom!</div>
                            <div className="h-6 bg-blue-100 rounded-full overflow-hidden shadow-inner">
                                <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 w-full rounded-full" />
                            </div>
                        </div>
                        <div className="w-24 text-right font-black text-4xl text-blue-600 flex items-center justify-end">
                            500<span className="text-xl ml-1 text-blue-400">+</span>
                        </div>
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-between text-gray-500 font-medium">
                    <div className="flex items-center"><FaVideo className="mr-2 text-red-400 text-xl"/> Submissions</div>
                    <div className="flex items-center"><FaUsers className="mr-2 text-green-500 text-xl"/> Across India</div>
                </div>
            </div>
        </div>
    </div>
  )
}
