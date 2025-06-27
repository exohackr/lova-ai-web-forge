
import { Sparkles, Zap, Code, Palette } from "lucide-react";

export const Hero = () => {
  return (
    <div className="relative py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto text-center">
        <div className="mb-8">
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Build Beautiful Sites
            </span>
            <br />
            <span className="text-gray-900">with AI Magic</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Describe your vision and watch as our AI creates stunning, responsive websites in seconds. 
            No coding required, just pure creativity.
          </p>
        </div>

        {/* Feature highlights */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16">
          {[
            { icon: Sparkles, label: "AI Powered", color: "from-purple-500 to-pink-500" },
            { icon: Zap, label: "Lightning Fast", color: "from-yellow-500 to-orange-500" },
            { icon: Code, label: "Clean Code", color: "from-green-500 to-blue-500" },
            { icon: Palette, label: "Beautiful Design", color: "from-blue-500 to-purple-500" }
          ].map((feature, index) => (
            <div key={index} className="group">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white shadow-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${feature.color} flex items-center justify-center`}>
                  <feature.icon className="w-4 h-4 text-white" />
                </div>
              </div>
              <p className="text-sm font-semibold text-gray-700">{feature.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
