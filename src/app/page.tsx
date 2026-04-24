import Header from '@/components/landing/header';
import Hero from '@/components/landing/hero';
import Products from '@/components/landing/products';
import WhyItWorks from '@/components/landing/why-it-works';
import CTA from '@/components/landing/cta';
import Footer from '@/components/landing/footer';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col text-foreground">
      <Header />
      <main className="flex-1">
        <Hero />
        <Products />
        <WhyItWorks />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
