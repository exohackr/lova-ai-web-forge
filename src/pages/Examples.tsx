
import { Header } from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { AnimatedBackground } from "@/components/AnimatedBackground";

const Examples = () => {
  const examples = [
    {
      title: "E-commerce Store",
      description: "Modern online store with product catalog, shopping cart, and checkout",
      image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=500&h=300&fit=crop",
      tags: ["E-commerce", "Modern", "Responsive"]
    },
    {
      title: "Portfolio Website",
      description: "Creative portfolio showcasing work with elegant design and smooth animations",
      image: "https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=500&h=300&fit=crop",
      tags: ["Portfolio", "Creative", "Professional"]
    },
    {
      title: "Restaurant Website",
      description: "Appetizing restaurant site with menu, reservations, and location info",
      image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500&h=300&fit=crop",
      tags: ["Restaurant", "Menu", "Bookings"]
    },
    {
      title: "SaaS Landing Page",
      description: "High-converting landing page for software products with clear CTAs",
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=500&h=300&fit=crop",
      tags: ["SaaS", "Landing", "Conversion"]
    },
    {
      title: "Blog Website",
      description: "Clean and readable blog layout with categories and search functionality",
      image: "https://images.unsplash.com/photo-1486312338219-ce68e2c4c6f2?w=500&h=300&fit=crop",
      tags: ["Blog", "Content", "SEO"]
    },
    {
      title: "Real Estate Site",
      description: "Property listing website with filters, maps, and detailed property pages",
      image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=500&h=300&fit=crop",
      tags: ["Real Estate", "Listings", "Maps"]
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
              Example Websites
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              See what our AI can create for you - from simple landing pages to complex applications
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {examples.map((example, index) => (
              <Card key={index} className="bg-white/80 backdrop-blur-xl border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 overflow-hidden">
                <div className="relative">
                  <img 
                    src={example.image} 
                    alt={example.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{example.title}</h3>
                  <p className="text-gray-600 mb-4">{example.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {example.tags.map((tag, tagIndex) => (
                      <span 
                        key={tagIndex}
                        className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className="text-center mt-16">
            <Card className="p-8 bg-white/80 backdrop-blur-xl border-white/20 shadow-xl max-w-2xl mx-auto">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Ready to Create Your Own?</h3>
              <p className="text-gray-600 mb-6">
                Join thousands of users who have already created amazing websites with our AI
              </p>
              <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white">
                Get Started Now
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Examples;
