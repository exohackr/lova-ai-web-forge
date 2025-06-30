
import { Header } from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Wand2, Palette, Code, Zap, Globe, Shield } from "lucide-react";
import { AnimatedBackground } from "@/components/AnimatedBackground";

const Features = () => {
  const features = [
    {
      icon: <Wand2 className="w-8 h-8 text-purple-600" />,
      title: "AI-Powered Generation",
      description: "Transform your ideas into beautiful websites using cutting-edge AI technology."
    },
    {
      icon: <Palette className="w-8 h-8 text-blue-600" />,
      title: "Modern Design",
      description: "Get stunning, responsive designs that look great on all devices automatically."
    },
    {
      icon: <Code className="w-8 h-8 text-green-600" />,
      title: "Clean Code",
      description: "Receive well-structured, semantic HTML with modern CSS frameworks."
    },
    {
      icon: <Zap className="w-8 h-8 text-yellow-600" />,
      title: "Lightning Fast",
      description: "Generate complete websites in seconds, not hours or days."
    },
    {
      icon: <Globe className="w-8 h-8 text-indigo-600" />,
      title: "Production Ready",
      description: "Your generated sites are ready to deploy immediately to any hosting platform."
    },
    {
      icon: <Shield className="w-8 h-8 text-red-600" />,
      title: "Secure & Reliable",
      description: "Built with security best practices and reliable infrastructure."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      <AnimatedBackground />
      <Header />
      
      <div className="relative z-10 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-6">
              Powerful Features
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to create stunning websites with AI
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="p-8 bg-white/80 backdrop-blur-xl border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                <div className="flex items-center mb-4">
                  {feature.icon}
                  <h3 className="text-xl font-bold text-gray-900 ml-3">{feature.title}</h3>
                </div>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Features;
