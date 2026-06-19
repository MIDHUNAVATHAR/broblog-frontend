import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Image as ImageIcon,
  Loader2,
  BookOpen,
  ArrowLeft,
  Trash2,
  X,
  AlertTriangle,
  Clock,
  Heart
} from 'lucide-react';
import { getMyBlogs, deleteBlog, updateBlog, toggleLike } from '../api/blogs';
import Header from '../components/Header';
import { blogSchema } from '../validators/blog.validator';
import type { Blog, Like } from '../context/BlogContext';

interface CurrentUser {
  id: string;
  email: string;
}

const MyPostsPage = () => {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const userJson = localStorage.getItem('user');
  const currentUser: CurrentUser | null = userJson ? JSON.parse(userJson) : null;
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [blogToDelete, setBlogToDelete] = useState<string | null>(null);
  const [blogToEdit, setBlogToEdit] = useState<Blog | null>(null);
  const [editData, setEditData] = useState({ title: '', content: '' });
  const [fieldErrors, setFieldErrors] = useState<{ title?: string; content?: string }>({});
  const [error, setError] = useState<string | null>(null);

  const fetchMyBlogs = async () => {
    setIsLoading(true);
    try {
      const data = await getMyBlogs();
      setBlogs(data);
    } catch (error) {
      console.error("Failed to fetch my blogs", error);
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
    if (!currentUser) return;
    try {
      const result = await toggleLike(blogId);
      setBlogs(prev => prev.map(blog => {
        if (blog.id === blogId) {
          const newLikes = result.liked
            ? [...(blog.likes || []), { userId: currentUser.id, blogId }]
            : (blog.likes || []).filter((l: Like) => l.userId !== currentUser.id);
          return { ...blog, likeCount: result.likeCount, likes: newLikes };
        }
        return blog;
      }));
    } catch (error) {
      console.error("Failed to toggle like", error);
    }
  };

  const handleDelete = async () => {
    if (!blogToDelete) return;
    setIsDeleting(true);
    try {
      await deleteBlog(blogToDelete);
      setBlogs(blogs.filter(b => b.id !== blogToDelete));
      setBlogToDelete(null);
    } catch (error) {
      console.error("Failed to delete blog", error);
      alert("Failed to delete story. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!blogToEdit) return;

    const result = blogSchema.partial().safeParse(editData);
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
    const readingTime = calculateReadingTime(editData.content);
    setIsUpdating(true);
    setError(null);
    try {
      await updateBlog(blogToEdit.id, { ...editData, readingTime });
      setBlogs(blogs.map(b => b.id === blogToEdit.id ? { ...b, ...editData, readingTime } : b));
      setBlogToEdit(null);
    } catch (err) {
      console.error("Failed to update blog", err);
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to update story. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const openEditModal = (blog: Blog) => {
    setBlogToEdit(blog);
    setEditData({ title: blog.title, content: blog.content });
    setFieldErrors({});
    setError(null);
  };

  useEffect(() => {
    fetchMyBlogs();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/home')}
              className="p-2 hover:bg-white rounded-full transition-colors text-slate-500 hover:text-indigo-600"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-bold text-slate-900">My Stories</h1>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <BookOpen className="w-4 h-4" />
            <span>{blogs.length} stories published</span>
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
            <p className="text-slate-500 font-medium">Gathering your masterpieces...</p>
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
                    <span className="text-[10px] font-medium text-slate-400 uppercase tracking-tighter">
                      Published {new Date(blog.createdAt).toLocaleDateString()}
                    </span>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={(e) => handleLike(e, blog.id)}
                        className={`flex items-center gap-1 px-2 py-1 rounded-lg transition-all ${blog.likes?.some((l: Like) => l.userId === currentUser?.id)
                            ? 'text-rose-600 bg-rose-50'
                            : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                          }`}
                      >
                        <Heart className={`w-3.5 h-3.5 ${blog.likes?.some((l: Like) => l.userId === currentUser?.id) ? 'fill-current' : ''}`} />
                        <span className="text-xs font-bold">{blog.likeCount || 0}</span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditModal(blog);
                        }}
                        className="text-xs font-bold text-indigo-600 hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setBlogToDelete(blog.id);
                        }}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        title="Delete Story"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200">
            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">You haven't written anything yet</h3>
            <p className="text-slate-500 mb-6">Start sharing your thoughts with the world today!</p>
            <button
              onClick={() => navigate('/home?create=true')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-full font-semibold hover:bg-indigo-700 transition-all shadow-md"
            >
              <Plus className="w-5 h-5" />
              Write your first story
            </button>
          </div>
        )}
      </main>

      {/* Delete Confirmation Modal */}
      {blogToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => !isDeleting && setBlogToDelete(null)}
          ></div>
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-red-600 shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">Delete Story?</h3>
                <p className="text-sm text-slate-500">This action cannot be undone. Your story and its cover image will be permanently removed.</p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                disabled={isDeleting}
                onClick={() => setBlogToDelete(null)}
                className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                disabled={isDeleting}
                onClick={handleDelete}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-200 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Delete Story'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Blog Modal */}
      {blogToEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => !isUpdating && setBlogToEdit(null)}
          ></div>
          <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-900">Edit Story</h2>
              <button
                onClick={() => setBlogToEdit(null)}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                disabled={isUpdating}
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="p-6 space-y-5">
              {error && (
                <div className="p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-medium">
                  {error}
                </div>
              )}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Title</label>
                <input
                  type="text"
                  placeholder="Story title..."
                  className={`w-full px-4 py-3 bg-slate-50 border ${fieldErrors.title ? 'border-red-300 ring-red-100' : 'border-slate-200'} rounded-xl text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all`}
                  value={editData.title}
                  onChange={(e) => {
                    setEditData({ ...editData, title: e.target.value });
                    if (fieldErrors.title) setFieldErrors(prev => ({ ...prev, title: undefined }));
                  }}
                />
                {fieldErrors.title && <p className="mt-1 text-xs text-red-600 font-medium">{fieldErrors.title}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Content</label>
                <textarea
                  rows={8}
                  placeholder="Share your updated thoughts..."
                  className={`w-full px-4 py-3 bg-slate-50 border ${fieldErrors.content ? 'border-red-300 ring-red-100' : 'border-slate-200'} rounded-xl text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all resize-none`}
                  value={editData.content}
                  onChange={(e) => {
                    setEditData({ ...editData, content: e.target.value });
                    if (fieldErrors.content) setFieldErrors(prev => ({ ...prev, content: undefined }));
                  }}
                />
                {fieldErrors.content && <p className="mt-1 text-xs text-red-600 font-medium">{fieldErrors.content}</p>}
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="w-full flex items-center justify-center gap-2 py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 disabled:opacity-50"
                >
                  {isUpdating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Saving changes...
                    </>
                  ) : (
                    'Save Changes'
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

export default MyPostsPage;