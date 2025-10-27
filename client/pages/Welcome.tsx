import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Shield, Calendar, Bell, ArrowRight } from 'lucide-react';

export default function Welcome() {
  const navigate = useNavigate();
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const handleForm1099 = () => {
    navigate('/');
  };

  const handleFormW9 = () => {
    navigate('/forms');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-blue-50/20">
      <main className="container mx-auto px-4 py-20 max-w-7xl">
        <div className="grid lg:grid-cols-[2fr_1fr] gap-16">
          {/* Main Content Area */}
          <div className="space-y-16">
            {/* Hero Section */}
            <div className="text-center space-y-6 animate-fade-in">
              <Badge className="bg-blue-600 text-white px-4 py-2 text-sm font-semibold shadow-md mb-4">
                New Tax Year Available
              </Badge>
              <h1 className="text-6xl font-bold text-gray-900 tracking-tight leading-tight">
                Welcome to tax year <span className="text-blue-600">2024</span>
              </h1>
              <p className="text-2xl text-gray-600 font-medium max-w-2xl mx-auto">
                Which form would you like to start using?
              </p>
            </div>

            {/* Selection Cards */}
            <div className="grid md:grid-cols-2 gap-8 mt-16">
              {/* Form 1099s Card */}
              <Card
                className={`group cursor-pointer transition-all duration-300 border-2 bg-white hover:shadow-2xl hover:-translate-y-2 animate-slide-up overflow-hidden ${
                  hoveredCard === '1099' ? 'shadow-2xl -translate-y-2 border-blue-400' : 'border-gray-200 shadow-md'
                }`}
                onMouseEnter={() => setHoveredCard('1099')}
                onMouseLeave={() => setHoveredCard(null)}
                onClick={handleForm1099}
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-blue-600"></div>
                <CardContent className="p-10 text-center relative">
                  <div className="mb-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4 group-hover:bg-blue-600 transition-colors duration-300">
                      <FileText className="h-8 w-8 text-blue-600 group-hover:text-white transition-colors duration-300" />
                    </div>
                  </div>
                  <h2 className="text-3xl font-bold text-blue-600 mb-4">
                    Form 1099s
                  </h2>
                  <div className="space-y-2 mb-6">
                    <p className="text-sm text-gray-600 font-medium">1099s, W-2</p>
                    <p className="text-sm text-gray-600 font-medium">1095-B/C, 940</p>
                    <p className="text-sm text-gray-600 font-medium">T4A, 1042-S</p>
                  </div>
                  <div className="flex items-center justify-center text-blue-600 font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="mr-2">Get Started</span>
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </CardContent>
              </Card>

              {/* Form W-9 Card */}
              <Card
                className={`group cursor-pointer transition-all duration-300 border-2 bg-white hover:shadow-2xl hover:-translate-y-2 animate-slide-up-delayed overflow-hidden ${
                  hoveredCard === 'w9' ? 'shadow-2xl -translate-y-2 border-green-400' : 'border-gray-200 shadow-md'
                }`}
                onMouseEnter={() => setHoveredCard('w9')}
                onMouseLeave={() => setHoveredCard(null)}
                onClick={handleFormW9}
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-green-600"></div>
                <CardContent className="p-10 text-center relative">
                  <div className="mb-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4 group-hover:bg-green-600 transition-colors duration-300">
                      <span className="text-2xl font-bold text-green-600 group-hover:text-white transition-colors duration-300">W-9</span>
                    </div>
                  </div>
                  <h2 className="text-3xl font-bold text-green-600 mb-4">
                    Form W-9
                  </h2>
                  <div className="space-y-2 mb-6">
                    <p className="text-sm text-gray-600 font-medium">W-9</p>
                    <p className="text-sm text-gray-600 font-medium">W-4</p>
                    <p className="text-sm text-gray-600 font-medium">W-8BEN</p>
                  </div>
                  <div className="flex items-center justify-center text-green-600 font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="mr-2">Get Started</span>
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* News & Alerts Sidebar */}
          <div className="lg:border-l-2 lg:border-gray-200 lg:pl-12">
            <Card className="sticky top-8 shadow-lg border-2 border-blue-100 bg-white animate-fade-in-delayed overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                <div className="flex items-center gap-3 text-white">
                  <Bell className="h-5 w-5" />
                  <h2 className="text-xl font-bold">
                    News & Alerts
                  </h2>
                </div>
              </div>
              
              <CardContent className="p-6">
                <ul className="space-y-4">
                  <li className="flex items-start gap-3 p-4 rounded-lg bg-green-50 border border-green-200 hover:bg-green-100 transition-colors">
                    <Calendar className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Tax year 2024 is now available.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3 p-4 rounded-lg bg-blue-50 border border-blue-200 hover:bg-blue-100 transition-colors">
                    <FileText className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-gray-900">You can e-file prior years until Nov. 23, 2024.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3 p-4 rounded-lg bg-amber-50 border border-amber-200 hover:bg-amber-100 transition-colors">
                    <Bell className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Postal Mail service begins in Jan.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3 p-4 rounded-lg bg-purple-50 border border-purple-200 hover:bg-purple-100 transition-colors">
                    <Shield className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-gray-900">2-Step Verification for login is available.</p>
                    </div>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Custom Animations */}
      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }

        .animate-fade-in-delayed {
          animation: fade-in 0.8s ease-out 0.2s both;
        }

        .animate-slide-up {
          animation: slide-up 0.6s ease-out 0.3s both;
        }

        .animate-slide-up-delayed {
          animation: slide-up 0.6s ease-out 0.4s both;
        }
      `}</style>
    </div>
  );
}
