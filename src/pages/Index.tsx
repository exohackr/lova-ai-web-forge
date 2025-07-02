
import { useState } from "react";
import { AuthProvider } from "@/components/AuthProvider";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { SiteGenerator } from "@/components/SiteGenerator";
import { AnimatedBackground } from "@/components/AnimatedBackground";

const Index = () => {
  return (
    <AuthProvider>
      <div className="min-h-screen relative overflow-hidden">
        <AnimatedBackground />
        <div className="relative z-10">
          <Header />
          <Hero />
          <SiteGenerator />
        </div>
      </div>
    </AuthProvider>
  );
};

export default Index;
