import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Balancer } from "react-wrap-balancer";

export function CTA() {
  return (
    <section id="contact" className="py-20 bg-gradient-to-r from-primary via-purple-500 to-pink-500">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center animate-fade-in-up">
        <h2 className="text-4xl font-bold text-white mb-6">
          <Balancer>
            Partner with Us
          </Balancer>
        </h2>
        <p className="text-xl text-primary-foreground/90 mb-8 max-w-3xl mx-auto">
          <Balancer>
            We are always looking for new opportunities and partnerships. Reach out to learn more about our work and how we can collaborate.
          </Balancer>
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            asChild
            size="lg"
            className="bg-white text-primary hover:bg-white/90 transform hover:scale-105 transition-all duration-200 shadow-lg"
          >
            <Link href="mailto:contact@3thirty3.com">Contact Us</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

export default CTA;
