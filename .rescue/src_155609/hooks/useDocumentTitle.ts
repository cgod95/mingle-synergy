
import { useEffect } from 'react';

export function useDocumentTitle(title: string, description?: string) {
  useEffect(() => {
    // Update the document title
    const originalTitle = document.title;
    document.title = `${title} | Mingle`;
    
    // Update meta description if provided
    if (description) {
      const metaDescription = document.querySelector('meta[name="description"]');
      const originalDescription = metaDescription?.getAttribute('content') || '';
      
      if (metaDescription) {
        metaDescription.setAttribute('content', description);
      } else {
        const newMeta = document.createElement('meta');
        newMeta.name = 'description';
        newMeta.content = description;
        document.head.appendChild(newMeta);
      }
      
      return () => {
        document.title = originalTitle;
        
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc && originalDescription) {
          metaDesc.setAttribute('content', originalDescription);
        }
      };
    }
    
    return () => {
      document.title = originalTitle;
    };
  }, [title, description]);
}
