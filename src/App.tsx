import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import SignupPage from "./pages/SignupPage";
import LoginPage from "./pages/LoginPage";
import OtpVerificationPage from "./pages/OtpVerificationPage"; 
import HomePage from "./pages/HomePage";
import BlogDetailPage from "./pages/BlogDetailPage";
import MyPostsPage from "./pages/MyPostsPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import { BlogProvider } from "./api/BlogContext";

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('accessToken');
  return token ? <>{children}</> : <Navigate to="/login" />;
};

const App = () => {
  return (
    <BlogProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/verify-otp" element={<OtpVerificationPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route 
            path="/home" 
            element={
              <PrivateRoute>
                <HomePage />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/blog/:id" 
            element={
              <PrivateRoute>
                <BlogDetailPage />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/my-posts" 
            element={
              <PrivateRoute>
                <MyPostsPage />
              </PrivateRoute>
            } 
          />
        </Routes>
      </Router>
    </BlogProvider>
  );
}

export default App;