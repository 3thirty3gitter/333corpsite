import { Shield, Rocket, Compass, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Balancer } from "react-wrap-balancer";

const benefits = [
  {
    icon: Shield,
    title: "Integrity & Trust",
    description: "We build trust through transparency and consistent action. We hold ourselves to the highest standards in everything we do.",
    iconBg: "bg-blue-500/10",
    iconColor: "text-blue-400",
  },
  {
    icon: Rocket,
    title: "Innovation & Growth",
    description: "We encourage creative thinking and continuous improvement. Our goal is to foster an environment where new ideas can take flight and scale.",
    iconBg: "bg-green-500/10",
    iconColor: "text-green-400",
  },
  {
    icon: Compass,
    title: "Collaboration",
    description: "We believe in the power of working together. By sharing knowledge and resources across all subsidiaries, we achieve more than we could alone.",
    iconBg: "bg-purple-500/10",
    iconColor: "text-purple-400",
  },
];

export function WhyItWorks() {
  return (
    <section id="about" className="py-20 bg-secondary/50">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 animate-fade-in-up">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            <Balancer>Our Core Values</Balancer>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            <Balancer>
              At 3Thirty3 Group, we are driven by a shared commitment to excellence, innovation, and collaboration.
            </Balancer>
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <Card 
              key={index} 
              className="text-center bg-background border-border hover:border-primary/50 shadow-lg hover:shadow-primary/10 transition-all duration-300 transform hover:-translate-y-2 animate-fade-in-up"
              style={{ animationDelay: `${index * 150}ms`, opacity: 0, animationFillMode: 'forwards' }}
            >
              <CardHeader className="items-center">
                <div className={`w-16 h-16 ${benefit.iconBg} rounded-full flex items-center justify-center mb-4 border border-border`}>
                  <benefit.icon className={`w-8 h-8 ${benefit.iconColor}`} />
                </div>
                <CardTitle className="text-xl">{benefit.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  <Balancer>{benefit.description}</Balancer>
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

export default WhyItWorks;
