import React, { createContext, useContext, useState } from 'react';

// ─── Added the Types your HomePage needs ──────────────────────────────────────

export interface Like {
  userId: string;
  blogId: string;
}

export interface Author {
  email: string;
}

export interface Blog {
  id: string;
  title: string;
  content: string;
  
  // Made optional with '?' so it doesn't crash if a blog has no image
  image?: string; 
  imagePublicId?: string;

  authorId: string;
  author?: Author;

  // Added missing properties for your likes and reading time
  likes?: Like[];
  likeCount?: number;
  readingTime?: string;

  createdAt: string;
  updatedAt: string;
}

// ─── Context Implementation (Unchanged) ───────────────────────────────────────

interface BlogContextType {
  blogs: Blog[];
  setBlogs: React.Dispatch<React.SetStateAction<Blog[]>>;
  isInitialLoad: boolean;
  setIsInitialLoad: React.Dispatch<React.SetStateAction<boolean>>;
}

const BlogContext = createContext<BlogContextType | undefined>(undefined);

export const BlogProvider = ({ children }: { children: React.ReactNode }) => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
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