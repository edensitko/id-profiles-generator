'use client';

import { useEffect } from 'react';

export default function RemovePortal() {
  useEffect(() => {
    // Function to remove the NextJS portal element
    const removePortal = () => {
      const portalElements = document.querySelectorAll('nextjs-portal');
      portalElements.forEach(element => {
        element.remove();
      });
    };

    // Run once on mount
    removePortal();

    // Set up a mutation observer to catch any dynamically added portals
    const observer = new MutationObserver((mutations) => {
      mutations.forEach(() => {
        const portalElements = document.querySelectorAll('nextjs-portal');
        if (portalElements.length > 0) {
          removePortal();
        }
      });
    });

    // Start observing the document
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    // Clean up observer on component unmount
    return () => {
      observer.disconnect();
    };
  }, []);

  return null; // This component doesn't render anything
}
