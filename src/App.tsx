import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import SignupPage from "./pages/SignupPage";
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import BlogDetailPage from "./pages/BlogDetailPage";
import MyPostsPage from "./pages/MyPostsPage";
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