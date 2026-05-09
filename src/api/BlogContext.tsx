import React, { createContext, useContext, useState, ReactNode } from 'react';

interface BlogContextType {
  blogs: any[];
  setBlogs: React.Dispatch<React.SetStateAction<any[]>>;
  isInitialLoad: boolean;
  setIsInitialLoad: React.Dispatch<React.SetStateAction<boolean>>;
}

const BlogContext = createContext<BlogContextType | undefined>(undefined);

export const BlogProvider = ({ children }: { children: ReactNode }) => {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  return (
    <BlogContext.Provider value={{ blogs, setBlogs, isInitialLoad, setIsInitialLoad }}>
      {children}
    </BlogContext.Provider>
  );
};

export const useBlogs = () => {
  const context = useContext(BlogContext);
  if (context === undefined) {
    throw new Error('useBlogs must be used within a BlogProvider');
  }
  return context;
};
