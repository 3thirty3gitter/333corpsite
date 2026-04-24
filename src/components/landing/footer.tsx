import Link from "next/link";
import Image from "next/image";
import { Balancer } from "react-wrap-balancer";

export function Footer() {
  return (
    <footer className="bg-secondary text-secondary-foreground">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-8">
          <div className="col-span-1 md:col-span-4 lg:col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-4">
              <Image src="/logo.png" alt="3Thirty3 Group" width={234} height={62} className="h-13 w-auto" />
            </Link>
            <p className="text-muted-foreground mb-6 max-w-md">
              <Balancer>
                A diversified holding company focused on innovation and growth across multiple industries.
              </Balancer>
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4 text-foreground">Subsidiaries</h3>
            <ul className="space-y-3 text-muted-foreground">
              <li><Link href="#products" className="hover:text-primary transition-colors">PrintPilot</Link></li>
              <li><Link href="#products" className="hover:text-primary transition-colors">StickerPilot</Link></li>
              <li><Link href="#products" className="hover:text-primary transition-colors">TimePilot</Link></li>
              <li><Link href="#products" className="hover:text-primary transition-colors">Future Expansions</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4 text-foreground">Company</h3>
            <ul className="space-y-3 text-muted-foreground">
              <li><Link href="#about" className="hover:text-primary transition-colors">Our Values</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Careers</Link></li>
              <li><Link href="#contact" className="hover:text-primary transition-colors">Contact HR</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>

           <div>
            <h3 className="text-lg font-semibold mb-4 text-foreground">Social</h3>
            <ul className="space-y-3 text-muted-foreground">
              <li><Link href="#" className="hover:text-primary transition-colors">Twitter / X</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">LinkedIn</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Facebook</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-12 pt-8 flex flex-col md:flex-row justify-between items-center text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} 3Thirty3 Group of Companies. All rights reserved.</p>
          <Link href="/dashboard" className="text-sm hover:text-primary transition-colors mt-4 md:mt-0">
            Employee Login
          </Link>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
