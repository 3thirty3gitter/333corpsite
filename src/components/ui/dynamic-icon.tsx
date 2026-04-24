import * as LucideIcons from "lucide-react";
import { LucideProps } from "lucide-react";

interface DynamicIconProps extends LucideProps {
  name: string;
}

export function DynamicIcon({ name, ...props }: DynamicIconProps) {
  // @ts-ignore - Accessing icons dynamically
  const IconComponent = LucideIcons[name];

  if (!IconComponent) {
    return null;
  }

  return <IconComponent {...props} />;
}
