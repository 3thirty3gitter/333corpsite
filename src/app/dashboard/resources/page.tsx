import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Youtube, FileText, HelpCircle, ArrowRight } from "lucide-react";
import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

type VideoResource = { title: string; type: "video"; duration: string; image: string; hint?: string };
type GuideResource = { title: string; type: "guide" };
type FaqResource = { title: string; type: "faq" };
type Resource = VideoResource | GuideResource | FaqResource;

type ResourceCategory = {
    title: string;
    description: string;
    icon: ReactNode;
    resources: Resource[];
};

function isVideoResources(resources: Resource[]): resources is VideoResource[] {
    return resources.every((r) => r.type === "video");
}

const resourceCategories: ResourceCategory[] = [
    {
        title: "Video Tutorials",
        description: "Watch and learn with our step-by-step video guides.",
        icon: <Youtube className="w-8 h-8 text-red-500" />,
        resources: [
                { title: "Getting Started with PrintPilot", type: "video", duration: "5:43", image: "https://placehold.co/600x400.png", hint: "abstract video" },
            { title: "Advanced Features in StickerPilot", type: "video", duration: "12:15", image: "https://placehold.co/600x400.png", hint: "abstract video" },
            { title: "TimePilot for Teams", type: "video", duration: "8:30", image: "https://placehold.co/600x400.png", hint: "abstract video" },
        ]
    },
    {
        title: "User Guides & Documentation",
        description: "In-depth articles and documentation for every feature.",
        icon: <FileText className="w-8 h-8 text-primary" />,
        resources: [
            { title: "PrintPilot Full Documentation", type: "guide" },
            { title: "StickerPilot API Integration", type: "guide" },
            { title: "Exporting Reports from TimePilot", type: "guide" },
        ]
    },
    {
        title: "Frequently Asked Questions",
        description: "Quick answers to common questions.",
        icon: <HelpCircle className="w-8 h-8 text-yellow-500" />,
        resources: [
            { title: "How do I change my subscription plan?", type: "faq" },
            { title: "Is there a limit on how many projects I can have?", type: "faq" },
            { title: "What are the image requirements for StickerPilot?", type: "faq" },
        ]
    }
];

export default function ResourcesPage() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Resources & Support</h1>
                <p className="text-muted-foreground">Everything you need to get the most out of the Pilot Suite.</p>
            </div>

            {resourceCategories.map((category, index) => (
                <Card key={index}>
                    <CardHeader className="flex flex-row items-start gap-4">
                        <div className="bg-secondary p-3 rounded-lg">
                           {category.icon}
                        </div>
                        <div>
                           <CardTitle>{category.title}</CardTitle>
                           <CardDescription>{category.description}</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {isVideoResources(category.resources) ? (
                             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {category.resources.map((resource, rIndex) => (
                                    <Link href="#" key={rIndex} className="group block">
                                        <Card className="overflow-hidden h-full flex flex-col">
                                             <div className="relative">
                                                <Image 
                                                    // resource has been narrowed to VideoResource by the typeguard above
                                                    src={resource.image} 
                                                    alt={resource.title} 
                                                    width={600} 
                                                    height={400} 
                                                    className="aspect-video object-cover transition-transform duration-300 group-hover:scale-105" 
                                                    data-ai-hint={resource.hint}
                                                />
                                                <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs font-semibold px-2 py-1 rounded">
                                                    {resource.duration}
                                                </div>
                                             </div>
                                            <div className="p-4 flex-grow">
                                                <p className="font-semibold text-foreground">{resource.title}</p>
                                            </div>
                                        </Card>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                             <div className="space-y-2">
                                {category.resources.map((resource, rIndex) => (
                                   <Link href="#" key={rIndex}>
                                        <div className="flex items-center justify-between p-3 rounded-md hover:bg-secondary">
                                            <p className="font-medium text-foreground">{resource.title}</p>
                                            <ArrowRight className="w-4 h-4 text-muted-foreground" />
                                        </div>
                                   </Link>
                                ))}
                            </div>
                        )}
                        <Button variant="outline" className="mt-6">
                            View all {category.title.toLowerCase()}
                        </Button>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
