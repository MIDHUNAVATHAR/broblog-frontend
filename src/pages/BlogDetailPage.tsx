import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  Loader2,
  Image as ImageIcon,
  Heart
} from 'lucide-react';
import { getBlogById, toggleLike } from '../api/blogs';
import Header from '../components/Header';

const BlogDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [blog, setBlog] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const userJson = localStorage.getItem('user');
  const currentUser = userJson ? JSON.parse(userJson) : null;
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBlog = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        const data = await getBlogById(id);
        setBlog(data);
      } catch (err) {
        console.error("Failed to fetch blog details", err);
        setError("Story not found or an error occurred.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchBlog();
  }, [id]);

  const handleLike = async () => {
    if (!blog) return;
    try {
      const result = await toggleLike(blog.id);
      const newLikes = result.liked 
        ? [...(blog.likes || []), { userId: currentUser?.id, blogId: blog.id }]
        : (blog.likes || []).filter((l: any) => l.userId !== currentUser?.id);
      setBlog({ ...blog, likeCount: result.likeCount, likes: newLikes });
    } catch (error) {
      console.error("Failed to toggle like", error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="flex flex-col items-center justify-center py-32">
          <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
          <p className="text-slate-500 font-medium animate-pulse">Gathering the story...</p>
        </div>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="max-w-3xl mx-auto px-4 py-20 text-center">
          <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-red-500">
            <ImageIcon className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">{error || "Story not found"}</h2>
          <button 
            onClick={() => navigate('/home')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-full font-semibold hover:bg-indigo-700 transition-all shadow-md"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Stories
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans">
      <Header />
      
      {/* Article Header */}
      <div className="max-w-4xl mx-auto px-4 pt-12 pb-8">
        <button 
          onClick={() => navigate('/home')}
          className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-indigo-600 transition-colors mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to feed
        </button>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 leading-tight">
            {blog.title}
          </h1>
          <button 
            onClick={handleLike}
            className={`flex items-center gap-2 px-6 py-3 rounded-full transition-all border shrink-0 h-fit ${
              blog.likes?.some((l: any) => l.userId === currentUser?.id)
              ? 'text-rose-600 bg-rose-50 border-rose-100 shadow-sm shadow-rose-100'
              : 'text-slate-500 bg-white border-slate-200 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-100'
            }`}
          >
            <Heart className={`w-5 h-5 ${blog.likes?.some((l: any) => l.userId === currentUser?.id) ? 'fill-current' : ''}`} />
            <span className="font-bold text-lg">{blog.likeCount || 0}</span>
          </button>
        </div>
        
        <div className="flex flex-wrap items-center gap-6 py-6 border-y border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold">
              {blog.author?.email?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">{blog.author?.email?.split('@')[0]}</p>
              <p className="text-xs text-slate-500">Author</p>
            </div>
          </div>
          
          <div className="h-8 w-px bg-slate-100 hidden sm:block"></div>
          
          <div className="flex items-center gap-4 text-slate-500 text-sm">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              <span>{new Date(blog.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              <span>{blog.readingTime || '1 min read'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Image */}
      <div className="max-w-5xl mx-auto px-4 mb-12">
        <div className="aspect-[21/9] w-full rounded-3xl overflow-hidden bg-slate-100 shadow-2xl shadow-indigo-100/50">
          {blog.image ? (
            <img 
              src={blog.image} 
              alt={blog.title} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-300">
              <ImageIcon className="w-20 h-20" />
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 pb-20">
        <div className="text-slate-700 leading-relaxed space-y-6 text-lg">
          {blog.content.split('\n').map((paragraph: string, idx: number) => (
            <p key={idx} className="mb-4 last:mb-0">
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BlogDetailPage;
