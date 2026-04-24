#!/usr/bin/env python3
from PIL import Image
import sys

# Open the logo
logo = Image.open('/workspaces/pilotsuite2025/public/logo.png')

# Get dimensions
width, height = logo.size
print(f"Original logo size: {width}x{height}")

# Create square canvas (use the larger dimension)
size = max(width, height)

# Create square images with logo centered
for icon_size in [16, 32, 180, 512]:
    # Create a transparent square canvas
    square = Image.new('RGBA', (size, size), (255, 255, 255, 0))
    
    # Calculate position to center the logo
    x = (size - width) // 2
    y = (size - height) // 2
    
    # Paste logo onto square canvas
    square.paste(logo, (x, y), logo if logo.mode == 'RGBA' else None)
    
    # Resize to target size
    resized = square.resize((icon_size, icon_size), Image.Resampling.LANCZOS)
    
    # Save
    if icon_size == 180:
        resized.save('/workspaces/pilotsuite2025/src/app/apple-icon.png')
        print(f"Saved apple-icon.png ({icon_size}x{icon_size})")
    elif icon_size == 512:
        resized.save('/workspaces/pilotsuite2025/src/app/icon.png')
        print(f"Saved icon.png ({icon_size}x{icon_size})")
    else:
        # Save smaller sizes to public
        resized.save(f'/workspaces/pilotsuite2025/public/favicon-{icon_size}x{icon_size}.png')
        print(f"Saved favicon-{icon_size}x{icon_size}.png")

print("Favicon creation complete!")
