from PIL import Image
import sys

try:
    path = r"C:/Users/Faizan/.gemini/antigravity/brain/63187c4c-ded4-4df8-acb0-3a0107970228/uploaded_image_1767180897376.png"
    img = Image.open(path)
    width, height = img.size
    
    # Sample points: Left-Center, Center, Right-Center (assuming horizontal)
    # Also Top-Center, Bottom-Center (assuming vertical)
    
    left = img.getpixel((5, height // 2))
    right = img.getpixel((width - 5, height // 2))
    top = img.getpixel((width // 2, 5))
    bottom = img.getpixel((width // 2, height - 5))
    
    print(f"Size: {width}x{height}")
    print(f"Left: #{left[0]:02x}{left[1]:02x}{left[2]:02x}")
    print(f"Right: #{right[0]:02x}{right[1]:02x}{right[2]:02x}")
    print(f"Top: #{top[0]:02x}{top[1]:02x}{top[2]:02x}")
    print(f"Bottom: #{bottom[0]:02x}{bottom[1]:02x}{bottom[2]:02x}")
    
except Exception as e:
    print(f"Error: {e}")
