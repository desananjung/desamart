import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const UMKMCommunity = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newPost, setNewPost] = useState({ title: '', content: '', category: 'TIPS' });
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await api.get('/umkm/community/posts');
        setPosts(res.data.data || []);
      } catch (error) {
        console.error('Error fetching community posts:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  const handleCreatePost = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/umkm/community/posts', newPost);
      setPosts([res.data.data, ...posts]);
      setNewPost({ title: '', content: '', category: 'TIPS' });
      setShowForm(false);
    } catch (error) {
      alert('Gagal membuat post');
    }
  };

  const handleLike = async (postId) => {
    try {
      await api.post(`/umkm/community/posts/${postId}/like`);
      setPosts(posts.map(p =>
        p.id === postId ? { ...p, likes: p.likes + 1 } : p
      ));
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleAddComment = async (postId, content) => {
    try {
      const res = await api.post('/umkm/community/comments', {
        postId,
        content,
        parentId: null
      });
      setPosts(posts.map(p =>
        p.id === postId ? { ...p, comments: [...p.comments, res.data.data] } : p
      ));
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">💬 Komunitas UMKM</h1>
          <p className="text-gray-500">Diskusi, tips, dan cerita sukses dari pelaku UMKM</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary"
        >
          {showForm ? '✕ Tutup' : '+ Buat Post'}
        </button>
      </div>

      {/* Create Post Form */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <h3 className="font-bold mb-4">Buat Post Baru</h3>
          <form onSubmit={handleCreatePost}>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Judul"
                value={newPost.title}
                onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                className="input-field"
                required
              />
              <select
                value={newPost.category}
                onChange={(e) => setNewPost({ ...newPost, category: e.target.value })}
                className="input-field"
              >
                <option value="TIPS">💡 Tips & Trik</option>
                <option value="SUCCESS_STORY">📈 Cerita Sukses</option>
                <option value="QUESTION">❓ Tanya Jawab</option>
                <option value="DISCUSSION">💬 Diskusi</option>
              </select>
              <textarea
                placeholder="Konten"
                value={newPost.content}
                onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                className="input-field"
                rows="4"
                required
              />
              <button type="submit" className="btn-primary w-full">
                📤 Posting
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Posts */}
      <div className="space-y-4">
        {posts.map(post => (
          <div key={post.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <span className="px-2 py-0.5 bg-gray-100 text-xs rounded-full">
                    {post.category}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(post.createdAt).toLocaleDateString('id-ID')}
                  </span>
                </div>
                <h3 className="font-bold text-lg">{post.title}</h3>
                <p className="text-gray-700 mt-2">{post.content}</p>
                <div className="flex items-center space-x-4 mt-4 text-sm text-gray-500">
                  <span>👤 {post.author?.name}</span>
                  <span>👁️ {post.views}</span>
                  <button
                    onClick={() => handleLike(post.id)}
                    className="flex items-center space-x-1 hover:text-primary transition"
                  >
                    <span>❤️</span>
                    <span>{post.likes}</span>
                  </button>
                  <span>💬 {post._count?.comments || 0}</span>
                </div>
              </div>
            </div>

            {/* Comments */}
            {post.comments?.length > 0 && (
              <div className="mt-4 border-t border-gray-100 pt-4 space-y-3">
                {post.comments.map(comment => (
                  <div key={comment.id} className="flex space-x-3">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                      {comment.author?.name?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{comment.author?.name}</p>
                      <p className="text-sm text-gray-700">{comment.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add Comment */}
            <div className="mt-4 flex space-x-2">
              <input
                type="text"
                placeholder="Tulis komentar..."
                className="flex-1 input-field py-2 text-sm"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && e.target.value.trim()) {
                    handleAddComment(post.id, e.target.value);
                    e.target.value = '';
                  }
                }}
              />
              <button className="btn-primary text-sm px-4">Kirim</button>
            </div>
          </div>
        ))}

        {posts.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl">
            <span className="text-4xl block mb-4">💬</span>
            <p className="text-gray-500">Belum ada post di komunitas</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UMKMCommunity;