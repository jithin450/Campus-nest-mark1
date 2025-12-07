// Update this page (the content is just a fallback if you fail to update the page)

import Navbar from "@/components/layout/Navbar";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-8 max-w-2xl mx-auto px-4">
          <h1 className="text-5xl md:text-6xl font-bold text-gradient">
            Campus Nest
          </h1>
          <p className="text-xl text-muted-foreground">
            Your complete student life companion - hostels, restaurants, places & community
          </p>
          <div className="space-x-4 mb-8">
            <a href="/auth" className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-gradient-to-r from-primary to-accent text-white font-medium hover:scale-105 transition-transform duration-300">
              Get Started
            </a>
            <a href="/hostels" className="inline-flex items-center justify-center px-6 py-3 rounded-lg border border-primary text-primary hover:bg-primary hover:text-white transition-colors duration-300">
              Explore Features
            </a>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Index;
