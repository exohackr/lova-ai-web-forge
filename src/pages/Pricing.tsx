
import { Header } from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Star, Crown, Mail } from "lucide-react";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const Pricing = () => {
  const [paypalLinks, setPaypalLinks] = useState({
    basic: '',
    premium: '',
    business: ''
  });

  useEffect(() => {
    loadPaypalLinks();
  }, []);

  const loadPaypalLinks = async () => {
    try {
      const { data } = await supabase
        .from('system_settings')
        .select('setting_name, setting_value')
        .in('setting_name', ['paypal_link_basic', 'paypal_link_premium', 'paypal_link_business']);

      if (data) {
        const links = data.reduce((acc, setting) => {
          const key = setting.setting_name.replace('paypal_link_', '');
          acc[key] = setting.setting_value || '';
          return acc;
        }, {} as any);
        setPaypalLinks(links);
      }
    } catch (error) {
      console.error('Error loading PayPal links:', error);
    }
  };

  const handlePurchase = (link: string, plan: string) => {
    if (!link) {
      alert('Payment link not configured yet. Please contact admin.');
      return;
    }
    
    const confirmation = confirm(`Make sure to put your username in the PayPal note when purchasing the ${plan} plan!`);
    if (confirmation) {
      window.open(link, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      <AnimatedBackground />
      <Header />
      
      <div className="relative z-10 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-6">
              Choose Your Plan
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Unlock the full potential of AI-powered website generation
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Basic Plan */}
            <Card className="p-8 bg-white/80 backdrop-blur-xl border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Basic Plan</h3>
                <div className="flex items-center justify-center mb-6">
                  <span className="text-4xl font-bold text-purple-600">$8.99</span>
                  <span className="text-gray-500 ml-2">/month</span>
                </div>
                <ul className="space-y-4 mb-8 text-left">
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                    <span>50 website generations per day</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                    <span>High-quality AI generation</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                    <span>Standard support</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                    <span>Basic templates</span>
                  </li>
                </ul>
                <Button 
                  className="w-full bg-purple-600 hover:bg-purple-700"
                  onClick={() => handlePurchase(paypalLinks.basic, 'Basic')}
                >
                  Upgrade Now
                </Button>
              </div>
            </Card>

            {/* Premium Plan */}
            <Card className="p-8 bg-white/80 backdrop-blur-xl border-2 border-purple-300 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center">
                  <Star className="w-4 h-4 mr-1" />
                  MOST POPULAR
                </div>
              </div>
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Premium Plan</h3>
                <div className="flex items-center justify-center mb-6">
                  <span className="text-4xl font-bold text-purple-600">$12.99</span>
                  <span className="text-gray-500 ml-2">/month</span>
                </div>
                <ul className="space-y-4 mb-8 text-left">
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className="font-semibold">200 website generations per day</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className="font-semibold">Premium AI model</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                    <span>Priority support</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                    <span>Advanced templates & customization</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                    <span>Export source code</span>
                  </li>
                </ul>
                <Button 
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  onClick={() => handlePurchase(paypalLinks.premium, 'Premium')}
                >
                  Upgrade Now
                </Button>
              </div>
            </Card>

            {/* Business Plan */}
            <Card className="p-8 bg-white/80 backdrop-blur-xl border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center justify-center">
                  <Crown className="w-6 h-6 text-yellow-500 mr-2" />
                  Business Plan
                </h3>
                <div className="flex items-center justify-center mb-6">
                  <span className="text-4xl font-bold text-yellow-600">???</span>
                  <span className="text-gray-500 ml-2">Contact us</span>
                </div>
                <ul className="space-y-4 mb-8 text-left">
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className="font-semibold">Unlimited generations</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className="font-semibold">Top AI model access</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                    <span>Dedicated support team</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                    <span>Team collaboration features</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                    <span>White-label options</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                    <span>Custom integrations</span>
                  </li>
                </ul>
                <Button 
                  variant="outline" 
                  className="w-full border-yellow-500 text-yellow-600 hover:bg-yellow-50"
                  onClick={() => window.open('mailto:contact@example.com?subject=Business Plan Inquiry', '_blank')}
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Get in Contact
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
