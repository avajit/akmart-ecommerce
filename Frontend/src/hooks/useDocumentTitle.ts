import { useEffect } from 'react';

export function useDocumentTitle(title: string, prevailOnUnmount: boolean = false) {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = title ? `${title} | AKMart Nepal` : 'AKMart | Online Shopping Nepal';

    return () => {
      if (!prevailOnUnmount) {
        document.title = previousTitle;
      }
    };
  }, [title, prevailOnUnmount]);
}

export default useDocumentTitle;
