import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
  // This hook listens to the URL (pathname)
  const { pathname } = useLocation();

  // Whenever the pathname changes, run this code
  useEffect(() => {
    window.scrollTo(0, 0); // Scroll window to top (x=0, y=0)
  }, [pathname]);

  return null; // This component doesn't render anything visible
};

export default ScrollToTop;