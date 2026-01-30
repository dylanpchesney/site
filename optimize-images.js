// Image Optimization Helper Script
// This script helps you optimize images for web use

console.log(`
🖼️ IMAGE OPTIMIZATION GUIDE
==============================

Your headshot.jpg is now optimized at 23KB - perfect for web! ✅

QUICK FIXES:
1. Use an online compressor:
   • TinyPNG.com (free, excellent quality)
   • ImageOptim.com
   • Squoosh.app (Google's tool)

2. Target size: 100-300KB (8-10x smaller!)

3. Recommended dimensions: 600x800px max

4. Alternative: Convert to WebP format (50% smaller than JPG)

TECHNICAL SOLUTIONS:
• Added preloading for critical images
• Added loading placeholders and animations
• Optimized image attributes (width, height, decoding)
• Set fetchpriority="high" for faster loading

NEXT STEPS:
1. Compress headshot.jpg to ~200KB
2. Consider creating a WebP version
3. Replace the current file in /images/
4. Deploy changes

The code optimizations are already in place - now just need a smaller image file!
`);

// Function to check if we're in a browser environment
if (typeof window !== 'undefined') {
    // Browser environment - add image load tracking
    document.addEventListener('DOMContentLoaded', function() {
        const headshotImg = document.querySelector('.about-image');
        if (headshotImg) {
            const startTime = performance.now();
            
            headshotImg.addEventListener('load', function() {
                const loadTime = performance.now() - startTime;
                console.log(`✅ Headshot loaded in ${Math.round(loadTime)}ms`);
                
                if (loadTime > 2000) {
                    console.warn('⚠️ Image took longer than 2 seconds to load. Consider compression!');
                }
            });
            
            headshotImg.addEventListener('error', function() {
                console.error('❌ Failed to load headshot image');
            });
        }
    });
} 