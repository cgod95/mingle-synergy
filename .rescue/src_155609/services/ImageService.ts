
interface ImageDimensions {
  width: number;
  height: number;
}

export class ImageService {
  // Resize and compress an image
  public async compressImage(
    file: File, 
    maxWidth = 1200, 
    quality = 0.7
  ): Promise<File | Blob> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        if (!event.target?.result) {
          reject(new Error('Failed to read file'));
          return;
        }
        
        const img = new Image();
        
        img.onload = () => {
          // Calculate new dimensions while maintaining aspect ratio
          const dimensions = this.calculateDimensions(img, maxWidth);
          
          // Create canvas and context for resizing
          const canvas = document.createElement('canvas');
          canvas.width = dimensions.width;
          canvas.height = dimensions.height;
          
          // Draw and resize image on canvas
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Failed to get canvas context'));
            return;
          }
          
          ctx.drawImage(img, 0, 0, dimensions.width, dimensions.height);
          
          // Convert to blob with compression
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Failed to create blob'));
                return;
              }
              
              // Create a new file from the blob
              const newFile = new File(
                [blob], 
                file.name, 
                { type: 'image/jpeg', lastModified: Date.now() }
              );
              
              resolve(newFile);
            },
            'image/jpeg',
            quality
          );
        };
        
        img.onerror = () => {
          reject(new Error('Failed to load image'));
        };
        
        img.src = event.target.result as string;
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      
      reader.readAsDataURL(file);
    });
  }
  
  // Calculate dimensions while preserving aspect ratio
  private calculateDimensions(img: HTMLImageElement, maxWidth: number): ImageDimensions {
    let width = img.width;
    let height = img.height;
    
    if (width > maxWidth) {
      const ratio = maxWidth / width;
      width = maxWidth;
      height = Math.round(height * ratio);
    }
    
    return { width, height };
  }
  
  // Create an image URL with preloading
  public createImageUrl(src: string, onLoad?: () => void): string {
    if (!src) return '';
    
    // Preload the image
    const img = new Image();
    
    if (onLoad) {
      img.onload = onLoad;
    }
    
    img.src = src;
    
    return src;
  }
  
  // Generate a placeholder based on user initials
  public generateInitialsPlaceholder(name: string): string {
    const canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 200;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';
    
    // Background
    ctx.fillStyle = '#F0957D'; // Use primary color
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Text
    const initials = this.getInitials(name);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 80px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(initials, canvas.width / 2, canvas.height / 2);
    
    return canvas.toDataURL('image/png');
  }
  
  // Get initials from name
  private getInitials(name: string): string {
    if (!name) return '?';
    
    const parts = name.trim().split(' ');
    
    if (parts.length === 1) {
      return parts[0].charAt(0).toUpperCase();
    }
    
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  }
}

export const imageService = new ImageService();
