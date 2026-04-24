import Link from "next/link";
import {
  Printer,
  StickyNote,
  Clock,
  ShoppingCart,
  Palette,
  Users,
  ArrowRight,
  CheckCircle2
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const products = [
  {
    name: "PrintPilot",
    title: "Print Management Simplified",
    description: "Streamline your printing workflow with intelligent automation and real-time tracking.",
    icon: Printer,
    features: ["Automated Workflows", "Real-time Tracking", "Client Portals", "Integration API"],
    color: "text-primary",
  },
  {
    name: "StickerPilot",
    title: "Stickers at Scale, Done Right",
    description: "Design, produce, and manage sticker orders with our specialized platform.",
    icon: StickyNote,
    features: ["Design Studio", "Batch Production", "Template Library", "Quality Control"],
    color: "text-chart-2",
  },
  {
    name: "TimePilot",
    title: "Smarter Time Tracking",
    description: "Accurate time tracking with intelligent insights for better productivity.",
    icon: Clock,
    features: ["Automatic Tracking", "Project Analytics", "Team Reports", "Billing Integration"],
    color: "text-chart-3",
  }
];

const futureProducts = [
  { name: "ShopPilot", icon: ShoppingCart, color: "text-chart-5", description: "E-commerce storefront manager" },
  { name: "BrandPilot", icon: Palette, color: "text-destructive", description: "Brand asset manager & mockup tool" },
  { name: "TeamPilot", icon: Users, color: "text-primary", description: "Collaboration & project management" }
];

const ProductCard = ({ product, index }: { product: typeof products[0], index: number }) => (
  <Card 
    className="overflow-hidden group animate-fade-in-up bg-secondary/50 border-border hover:border-primary/50 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/10" 
    style={{ animationDelay: `${index * 150}ms`, opacity: 0, animationFillMode: 'forwards' }}
  >
    <CardHeader className={`p-0`}>
      <div className="p-8 flex items-center justify-center bg-secondary">
        <div className={`p-4 rounded-xl bg-background ${product.color}`}>
          <product.icon className="w-12 h-12" />
        </div>
      </div>
    </CardHeader>
    <CardContent className="p-6 flex flex-col h-full">
      <h3 className="text-2xl font-bold text-foreground mb-2">{product.name}</h3>
      <p className="text-lg font-semibold text-muted-foreground mb-4">{product.title}</p>
      <p className="text-muted-foreground mb-6 flex-grow">{product.description}</p>
      <div className="space-y-3 mb-8">
        {product.features.map((feature, i) => (
          <div key={i} className="flex items-center text-sm text-muted-foreground">
            <CheckCircle2 className="w-4 h-4 text-chart-2 mr-2 flex-shrink-0" />
            {feature}
          </div>
        ))}
      </div>
      <Button variant="outline" className="mt-auto w-full group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-200">
        Learn More
        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
      </Button>
    </CardContent>
  </Card>
);

export function Products() {
  return (
    <section id="products" className="py-20 bg-background">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 animate-fade-in-up">
          <Badge variant="outline" className="mb-4 border-primary/50 text-primary">Our Brands</Badge>
          <h2 className="text-4xl font-bold text-foreground mb-4">Our Subsidiaries</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            The 3Thirty3 Group family of companies. Each subsidiary operates with autonomy while sharing our core values and resources.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product, index) => (
            <ProductCard key={index} product={product} index={index} />
          ))}
        </div>

        <div className="mt-24 text-center animate-fade-in-up" style={{ animationDelay: '450ms', opacity: 0, animationFillMode: 'forwards' }}>
          <h3 className="text-3xl font-bold text-foreground mb-8">Future Expansions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {futureProducts.map((product, index) => (
              <div key={index} className="bg-secondary/50 border border-dashed border-border/50 rounded-xl p-6 hover:bg-accent transition-colors hover:border-primary/50">
                <product.icon className={`w-10 h-10 ${product.color} mx-auto mb-4`} />
                <h4 className="text-xl font-bold text-foreground mb-2">{product.name}</h4>
                <p className="text-muted-foreground">{product.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default Products;
