import React, { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';

// Redux
import { useAppDispatch } from './store';
import { initializeAuth } from './store/slices/authSlice';
import { initializeCart } from './store/slices/cartSlice';

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

  // Initialize app state once on mount
  useEffect(() => {
    dispatch(initializeAuth());
    dispatch(initializeCart());
  }, [dispatch]);

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
