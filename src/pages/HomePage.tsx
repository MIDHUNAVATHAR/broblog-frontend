import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Plus,
  Image as ImageIcon,
  X,
  Loader2,
  BookOpen,
  RotateCw,
  Clock,
  Heart
} from 'lucide-react';
import { getBlogs, createBlog, uploadImage, toggleLike } from '../api/blogs';
import Header from '../components/Header';
import ImageCropper from '../components/ImageCropper';
import { useBlogs } from '../context/BlogContext';
import { blogSchema } from '../validators/blog.validator';

const HomePage = () => {
  const navigate = useNavigate();
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const { blogs, setBlogs, isInitialLoad, setIsInitialLoad } = useBlogs();
  const [search, setSearch] = useState('');
  const userJson = localStorage.getItem('user');
  const currentUser = userJson ? JSON.parse(userJson) : null;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [newBlog, setNewBlog] = useState({ title: '', content: '', image: '', imagePublicId: '' });
  const [fieldErrors, setFieldErrors] = useState<{ title?: string; content?: string }>({});
  const [error, setError] = useState<string | null>(null);

  // Cropper states
  const [tempImage, setTempImage] = useState<string | null>(null);
  const [showCropper, setShowCropper] = useState(false);

  const fetchBlogs = async (query?: string) => {
    // Only show full page loader if it's the very first load and no data exists
    if (isInitialLoad && blogs.length === 0) setIsLoading(true);

    try {
      const data = await getBlogs(query);
      setBlogs(data);
      if (isInitialLoad) setIsInitialLoad(false);
    } catch (error) {
      console.error("Failed to fetch blogs", error);
    } finally {
      setIsLoading(false);
    }
  };
  const calculateReadingTime = (text: string) => {
    const wordsPerMinute = 150;
    const words = text.trim().split(/\s+/).length;
    const minutes = Math.max(1, Math.ceil(words / wordsPerMinute));
    return `${minutes} min read`;
  };

  const handleLike = async (e: React.MouseEvent, blogId: string) => {
    e.stopPropagation();
    try {
      const result = await toggleLike(blogId);
      setBlogs(prev => prev.map(blog => {
        if (blog.id === blogId) {
          const newLikes = result.liked
            ? [...(blog.likes || []), { userId: currentUser?.id, blogId }]
            : (blog.likes || []).filter((l: any) => l.userId !== currentUser?.id);
          return { ...blog, likeCount: result.likeCount, likes: newLikes };
        }
        return blog;
      }));
    } catch (error) {
      console.error("Failed to toggle like", error);
    }
  };

  const isFirstRender = React.useRef(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const searchQuery = params.get('search') || '';
    const shouldOpenModal = params.get('create') === 'true';

    // Set initial search state from URL
    if (searchQuery && search === '') {
      setSearch(searchQuery);
    }

    if (shouldOpenModal) {
      setIsModalOpen(true);
      window.history.replaceState({}, '', '/home' + (searchQuery ? `?search=${searchQuery}` : ''));
    }

    // Debounced fetch
    const timer = setTimeout(() => {

      fetchBlogs(search);
    }, isFirstRender.current ? 0 : 500); // No delay on first render

    isFirstRender.current = false;

    return () => clearTimeout(timer);
  }, [search]); // Triggered by search changes

  const handleSearch = (query: string) => {
    fetchBlogs(query);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setTempImage(reader.result as string);
        setShowCropper(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const onCropComplete = async (croppedBlob: Blob) => {
    setShowCropper(false);
    setIsUploading(true);
    try {
      const result = await uploadImage(croppedBlob);
      setNewBlog(prev => ({ ...prev, image: result.url, imagePublicId: result.public_id }));
    } catch (error) {
      console.error("Failed to upload image", error);
      alert("Failed to upload image. Please try again.");
    } finally {
      setIsUploading(false);
      setTempImage(null);
    }
  };

  const handleCreateBlog = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = blogSchema.safeParse(newBlog);
    if (!result.success) {
      const newErrors: { title?: string; content?: string } = {};
      result.error.issues.forEach((err) => {
        if (err.path[0]) {
          newErrors[err.path[0] as keyof typeof newErrors] = err.message;
        }
      });
      setFieldErrors(newErrors);
      return;
    }

    setFieldErrors({});
    const readingTime = calculateReadingTime(newBlog.content);
    setIsCreating(true);
    setError(null);
    try {
      await createBlog({ ...newBlog, readingTime });
      setIsModalOpen(false);
      setNewBlog({ title: '', content: '', image: '', imagePublicId: '' });
      fetchBlogs();
    } catch (err: any) {
      console.error("Failed to create blog", err);
      setError(err.response?.data?.message || 'Failed to publish story. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };



  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <Header
        onSearch={handleSearch}
        onCreateClick={() => setIsModalOpen(true)}
        searchValue={search}
        setSearchValue={setSearch}
      />

      {/* Image Cropper Modal */}
      {showCropper && tempImage && (
        <ImageCropper
          image={tempImage}
          onCropComplete={onCropComplete}
          onCancel={() => {
            setShowCropper(false);
            setTempImage(null);
          }}
        />
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Recent Stories</h1>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <BookOpen className="w-4 h-4" />
            <span>{blogs.length} posts found</span>
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
            <p className="text-slate-500 font-medium">Loading amazing stories...</p>
          </div>
        ) : blogs.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogs.map((blog) => (
              <div
                key={blog.id}
                onClick={() => navigate(`/blog/${blog.id}`)}
                className="bg-white rounded-2xl overflow-hidden border border-slate-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group cursor-pointer"
              >
                <div className="aspect-video w-full overflow-hidden bg-slate-100 relative">
                  {blog.image ? (
                    <img
                      src={blog.image}
                      alt={blog.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                      <ImageIcon className="w-12 h-12" />
                    </div>
                  )}
                  <div className="absolute top-4 right-4 px-2 py-1 bg-white/90 backdrop-blur rounded-lg text-[10px] font-bold uppercase tracking-wider text-indigo-600 shadow-sm flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {blog.readingTime || '1 min read'}
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-2 leading-tight group-hover:text-indigo-600 transition-colors">
                    {blog.title}
                  </h3>
                  <p className="text-slate-600 text-sm line-clamp-3 mb-4 leading-relaxed">
                    {blog.content}
                  </p>
                  <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500">
                        {blog.author?.email?.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-xs font-medium text-slate-500">{blog.author?.email?.split('@')[0]}</span>
                    </div>
                    <span className="text-[10px] font-medium text-slate-400 uppercase tracking-tighter">
                      {new Date(blog.createdAt).toLocaleDateString()}
                    </span>
                    <button
                      onClick={(e) => handleLike(e, blog.id)}
                      className={`flex items-center gap-1.5 px-2 py-1 rounded-full transition-all ${blog.likes?.some((l: any) => l.userId === currentUser?.id)
                          ? 'text-rose-600 bg-rose-50'
                          : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                        }`}
                    >
                      <Heart className={`w-3.5 h-3.5 ${blog.likes?.some((l: any) => l.userId === currentUser?.id) ? 'fill-current' : ''}`} />
                      <span className="text-xs font-bold">{blog.likeCount || 0}</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200">
            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              {search ? `No results for "${search}"` : "No stories found"}
            </h3>
            <p className="text-slate-500 mb-6">
              {search
                ? "Try adjusting your search to find what you're looking for."
                : "Be the first one to share a story with the world!"}
            </p>
            {!search && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-full font-semibold hover:bg-indigo-700 transition-all shadow-md"
              >
                <Plus className="w-5 h-5" />
                Write your first story
              </button>
            )}
            {search && (
              <button
                onClick={() => setSearch('')}
                className="inline-flex items-center gap-2 px-6 py-3 bg-slate-100 text-slate-600 rounded-full font-semibold hover:bg-slate-200 transition-all"
              >
                Clear search
              </button>
            )}
          </div>
        )}
      </main>

      {/* Create Blog Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => !isCreating && !isUploading && setIsModalOpen(false)}
          ></div>
          <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-900">Create New Story</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                disabled={isCreating || isUploading}
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <form onSubmit={handleCreateBlog} className="p-6 space-y-5">
              {error && (
                <div className="p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-medium">
                  {error}
                </div>
              )}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Title</label>
                <input
                  type="text"
                  placeholder="Give your story a catchy title..."
                  className={`w-full px-4 py-3 bg-slate-50 border ${fieldErrors.title ? 'border-red-300 ring-red-100' : 'border-slate-200'} rounded-xl text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all`}
                  value={newBlog.title}
                  onChange={(e) => {
                    setNewBlog({ ...newBlog, title: e.target.value });
                    if (fieldErrors.title) setFieldErrors(prev => ({ ...prev, title: undefined }));
                  }}
                />
                {fieldErrors.title && <p className="mt-1 text-xs text-red-600 font-medium">{fieldErrors.title}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Content</label>
                <textarea
                  rows={5}
                  placeholder="What's on your mind? Share your thoughts..."
                  className={`w-full px-4 py-3 bg-slate-50 border ${fieldErrors.content ? 'border-red-300 ring-red-100' : 'border-slate-200'} rounded-xl text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all resize-none`}
                  value={newBlog.content}
                  onChange={(e) => {
                    setNewBlog({ ...newBlog, content: e.target.value });
                    if (fieldErrors.content) setFieldErrors(prev => ({ ...prev, content: undefined }));
                  }}
                />
                {fieldErrors.content && <p className="mt-1 text-xs text-red-600 font-medium">{fieldErrors.content}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Featured Image</label>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileChange}
                />

                {newBlog.image ? (
                  <div className="relative aspect-video rounded-xl overflow-hidden border border-slate-200 group">
                    <img src={newBlog.image} alt="Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="p-2 bg-white rounded-full text-slate-900 hover:scale-110 transition-transform"
                      >
                        <RotateCw className="w-5 h-5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setNewBlog({ ...newBlog, image: '', imagePublicId: '' })}
                        className="p-2 bg-white rounded-full text-red-600 hover:scale-110 transition-transform"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    disabled={isUploading}
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full aspect-video flex flex-col items-center justify-center gap-3 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl hover:bg-slate-100 hover:border-indigo-300 transition-all group"
                  >
                    {isUploading ? (
                      <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                    ) : (
                      <>
                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                          <Plus className="w-6 h-6 text-indigo-600" />
                        </div>
                        <span className="text-sm font-medium text-slate-500">Upload and crop cover image</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isCreating || isUploading}
                  className="w-full flex items-center justify-center gap-2 py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 disabled:opacity-50"
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Publishing...
                    </>
                  ) : (
                    <>
                      <Plus className="w-5 h-5" />
                      Publish Story
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;
