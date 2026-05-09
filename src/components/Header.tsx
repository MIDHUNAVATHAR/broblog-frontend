import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Plus, 
  LogOut, 
  User, 
  BookOpen
} from 'lucide-react';
import { logout } from '../api/auth';
import Logo from './Logo';

interface HeaderProps {
  onSearch?: (query: string) => void;
  onCreateClick?: () => void;
  searchValue?: string;
  setSearchValue?: (value: string) => void;
  showCreateButton?: boolean;
}

const Header: React.FC<HeaderProps> = ({ 
  onSearch, 
  onCreateClick, 
  searchValue: propsSearchValue, 
  setSearchValue: propsSetSearchValue,
  showCreateButton = true
}) => {
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [internalSearchValue, setInternalSearchValue] = useState('');

  const searchValue = propsSearchValue !== undefined ? propsSearchValue : internalSearchValue;
  const setSearchValue = propsSetSearchValue || setInternalSearchValue;

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed", error);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      navigate('/login');
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchValue);
    } else {
      // If no onSearch provided (e.g. on detail page), redirect to home with search query
      const url = searchValue ? `/home?search=${encodeURIComponent(searchValue)}` : '/home';
      navigate(url);
    }
  };

  const handleCreateClick = () => {
    if (onCreateClick) {
      onCreateClick();
    } else {
      // If no onCreateClick provided, redirect to home with create flag
      navigate('/home?create=true');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 px-4 py-3 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        {/* Left: Profile & Logo */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <button 
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 hover:bg-indigo-200 transition-colors border border-indigo-200"
            >
              <User className="w-6 h-6" />
            </button>
            
            {showProfileMenu && (
              <div className="absolute left-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 py-2 animate-in fade-in slide-in-from-top-2">
                <div className="px-4 py-2 border-b border-slate-50">
                  <p className="text-sm font-medium text-slate-900 truncate">User Account</p>
                </div>
                <button 
                  onClick={() => {
                    navigate('/my-posts');
                    setShowProfileMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  <BookOpen className="w-4 h-4" />
                  My Posts
                </button>
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            )}
          </div>
          
          <div 
            onClick={() => navigate('/home')} 
            className="cursor-pointer hover:opacity-80 transition-opacity"
          >
            <Logo className="w-9 h-9" />
          </div>
        </div>

        {/* Center & Right: Search and Create */}
        <div className="flex-1 max-w-2xl flex items-center gap-2">
          <form onSubmit={handleSearchSubmit} className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Search stories..."
              className="block w-full pl-10 pr-3 py-2 bg-slate-100 border-none rounded-full text-sm focus:ring-2 focus:ring-indigo-500 transition-all"
              value={searchValue || ''}
              onChange={(e) => setSearchValue && setSearchValue(e.target.value)}
            />
          </form>
          
          {showCreateButton && (
            <button 
              onClick={handleCreateClick}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-full text-sm font-semibold hover:bg-indigo-700 transition-all shadow-sm active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Create</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
