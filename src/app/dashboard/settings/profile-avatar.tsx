
'use client';

import * as React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { UploadCloud } from 'lucide-react';

export function ProfileAvatar() {
    const [avatarPreview, setAvatarPreview] = React.useState<string | null>('https://placehold.co/128x128.png');
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="flex items-center gap-6">
            <Avatar className="w-24 h-24 border-2 border-primary/50">
                <AvatarImage src={avatarPreview || ''} alt="User Avatar" data-ai-hint="male avatar" />
                <AvatarFallback className="text-3xl">DU</AvatarFallback>
            </Avatar>
            <div>
                 <Button type="button" variant="outline" onClick={handleUploadClick}>
                    <UploadCloud className="mr-2" />
                    Upload New Photo
                </Button>
                <p className="text-xs text-muted-foreground mt-2">PNG, JPG, GIF up to 5MB.</p>
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleAvatarChange}
                    className="hidden"
                    accept="image/png, image/jpeg, image/gif" 
                />
            </div>
        </div>
    );
}
