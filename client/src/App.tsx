import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import Navigation from './components/Navigation';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Properties from './pages/Properties';
import AdminDashboard from './pages/AdminDashboard';
import Profile from './pages/Profile';
import Favorites from './pages/Favorites';
import { testApiConnection } from './services/testApiConnection';
import './App.css';

function App() {
  useEffect(() => {
    testApiConnection().then((res: any) => {
      if (res?.error) {
        console.error('API connection error:', res.error);
        alert('API კავშირი ვერ მოხერხდა: ' + res.error);
      } else {
        console.log('API connection OK:', res);
      }
    });
  }, []);

  return (
    <LanguageProvider>
      <AuthProvider>
        <Router>
          <div className="App font-sans antialiased">
            <Navigation />
            <main className="min-h-screen">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/properties" element={<Properties />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/favorites" element={<Favorites />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
          </div>
        </Router>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
