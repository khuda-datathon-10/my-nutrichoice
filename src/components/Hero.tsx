import { Salad, TrendingUp, Apple } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeroProps {
  onGetStarted: () => void;
}

const Hero = ({ onGetStarted }: HeroProps) => {
  return (
    <section className="relative overflow-hidden bg-gradient-hero py-20 px-6">
      <div className="container mx-auto max-w-6xl">
        <div className="flex flex-col items-center text-center">
          <div className="mb-6 flex gap-4">
            <div className="animate-bounce" style={{ animationDelay: '0s' }}>
              <Salad className="h-12 w-12 text-white/90" />
            </div>
            <div className="animate-bounce" style={{ animationDelay: '0.2s' }}>
              <Apple className="h-12 w-12 text-white/90" />
            </div>
            <div className="animate-bounce" style={{ animationDelay: '0.4s' }}>
              <TrendingUp className="h-12 w-12 text-white/90" />
            </div>
          </div>
          
          <h1 className="mb-6 text-5xl font-bold text-white md:text-6xl lg:text-7xl">
            급식 영양 분석 & 추천
          </h1>
          
          <p className="mb-8 max-w-2xl text-xl text-white/90 md:text-2xl">
            학교 급식의 영양 정보를 분석하고, 부족한 영양소를 채울 수 있는 음식을 추천받으세요
          </p>
          
          <Button
            size="lg"
            onClick={onGetStarted}
            className="bg-white text-primary hover:bg-white/90 shadow-large text-lg px-8 py-6 h-auto font-semibold transition-all hover:scale-105"
          >
            시작하기
          </Button>
        </div>
      </div>
      
      {/* Decorative shapes */}
      <div className="absolute top-10 left-10 h-32 w-32 rounded-full bg-white/10 blur-3xl" />
      <div className="absolute bottom-10 right-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
    </section>
  );
};

export default Hero;
