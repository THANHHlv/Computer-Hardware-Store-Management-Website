import React, { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';

// Redux
import { useAppDispatch, useAppSelector } from './store';
import { initializeAuth } from './store/slices/authSlice';
import { initializeCart } from './store/slices/cartSlice';
import { fetchWishlist } from './store/slices/wishlistSlice';

// Theme
import { ThemeModeProvider } from './theme/ThemeContext';

// Routes
import { AppRoutes } from './routes/AppRoutes';

// Error Boundary
import { GlobalErrorBoundary } from './components/common/GlobalErrorBoundary';
import ScrollToTop from './components/common/ScrollToTop';

/**
 * 🏪 MAIN APP COMPONENT - Computer Shop E-commerce
 * International Clean & Bright Theme with Smooth Animations & Mode Switching
 */
const App: React.FC = () => {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  // Initialize app state once on mount
  useEffect(() => {
    dispatch(initializeAuth());
    dispatch(initializeCart());
  }, [dispatch]);

  // Load wishlist when auth state changes
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchWishlist());
    }
  }, [dispatch, isAuthenticated]);

  return (
    <ThemeModeProvider>
      <GlobalErrorBoundary>
        <BrowserRouter>
          <ScrollToTop />
          <AppRoutes />
        </BrowserRouter>
      </GlobalErrorBoundary>
    </ThemeModeProvider>
  );
};

export default App;

