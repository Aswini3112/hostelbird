import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import DestinationPage from './pages/DestinationPage';
import PropertyPage from './pages/PropertyPage';
import BookingPage from './pages/BookingPage';
import DebugCenterPage from './pages/DebugCenterPage';
import NotFoundPage from './pages/NotFoundPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="location/:slug" element={<DestinationPage />} />
          <Route path="property/:slug" element={<PropertyPage />} />
          <Route path="booking/:propertySlug/:roomId" element={<BookingPage />} />
          <Route path="debug" element={<DebugCenterPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
