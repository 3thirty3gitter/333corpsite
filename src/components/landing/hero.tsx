import Link from 'next/link';
import { ArrowRight, Compass } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Balancer } from 'react-wrap-balancer';

const products = [
  {
    name: "PrintPilot",
    color: "bg-primary/10 text-primary-foreground border border-primary/20",
    hoverColor: "hover:bg-primary/20"
  },
  {
    name: "StickerPilot",
    color: "bg-chart-2/10 text-primary-foreground border border-chart-2/20",
    hoverColor: "hover:bg-chart-2/20"
  },
  {
    name: "TimePilot",
    color: "bg-chart-3/10 text-primary-foreground border border-chart-3/20",
    hoverColor: "hover:bg-chart-3/20"
  }
];

export function Hero() {
  return (
    <section id="home" className="relative overflow-hidden py-24 lg:py-32">
      <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/10"></div>
      
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center animate-fade-in-up">
          <div className="flex justify-center mb-8">
            <div className="bg-secondary p-2 rounded-full border border-border">
              <div className="bg-background p-3 rounded-full">
                 <Compass className="w-12 h-12 text-primary" />
              </div>
            </div>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-black text-foreground mb-6 leading-tight">
            <Balancer>
              <span className="bg-gradient-to-r from-primary via-purple-400 to-pink-500 bg-clip-text text-transparent">
                3Thirty3
              </span>
              <br />
              <span className="text-3xl md:text-4xl font-medium text-muted-foreground">Group of Companies</span>
            </Balancer>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-3xl mx-auto leading-relaxed">
            <Balancer>
              Innovating across industries with a diverse portfolio of forward-thinking companies. We build, acquire, and grow businesses that make a difference.
            </Balancer>
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 transform hover:scale-105 transition-all duration-200 shadow-lg shadow-primary/20">
              <Link href="#products">
                View Portfolio
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="ghost" className="transition-all duration-200 hover:bg-accent">
              <Link href="#about">Company Values</Link>
            </Button>
          </div>

          <div className="flex flex-wrap justify-center items-center gap-4">
            <p className="text-sm text-muted-foreground">OUR BRANDS:</p>
            {products.map((product) => (
              <Link
                key={product.name}
                href="#products"
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-transform cursor-pointer ${product.color} ${product.hoverColor}`}
              >
                {product.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
