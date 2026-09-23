import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Search results are shown in the Collection page via the SearchOverlay.
// This route just redirects there.
const Search = () => {
  const navigate = useNavigate();
  useEffect(() => {
    navigate('/collection', { replace: true });
  }, [navigate]);
  return null;
};

export default Search;
