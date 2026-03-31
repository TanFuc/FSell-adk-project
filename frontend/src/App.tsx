import { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import ScrollToTop from "@/components/common/ScrollToTop";

// Lazy load pages for code-splitting
const LandingPage = lazy(() => import("@/pages/LandingPage"));
const EventsPage = lazy(() => import("@/pages/EventsPage"));
const ConceptPage = lazy(() => import("@/pages/ConceptPage"));
const GalleryPage = lazy(() => import("@/pages/GalleryPage"));
const AdminLogin = lazy(() => import("@/pages/AdminLogin"));
const AdminDashboard = lazy(() => import("@/pages/AdminDashboard"));

// Lazy load components
const ProtectedRoute = lazy(() => import("@/components/admin/ProtectedRoute"));
const PopupManager = lazy(() => import("@/components/common/PopupManager"));

// Loading spinner component
function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-adk-green/5 via-white to-adk-blue/5">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 mb-4">
          <div className="w-12 h-12 border-4 border-adk-green/30 border-t-adk-green rounded-full animate-spin" />
        </div>
        <p className="text-gray-500 text-sm">Đang tải...</p>
      </div>
    </div>
  );
}

function App() {
  return (
    <>
      <ScrollToTop />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/su-kien" element={<EventsPage />} />
          <Route path="/mo-hinh" element={<ConceptPage />} />
          <Route path="/thu-vien" element={<GalleryPage />} />

          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin/*"
            element={
              <Suspense fallback={<PageLoader />}>
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              </Suspense>
            }
          />
        </Routes>
      </Suspense>

      {/* Global Components - Lazy loaded */}
      <Suspense fallback={null}>
        <PopupManager />
      </Suspense>
      <Toaster />
    </>
  );
}

export default App;
