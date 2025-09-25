import React, { useState } from 'react';
import { X, Star, Image as ImageIcon } from 'lucide-react';
import { Blog } from '../../services/blogService';
import Button from '../Button';

interface BlogFormProps {
  blog?: Blog | null;
  onSubmit: (blogData: any) => void;
  onCancel: () => void;
}

function BlogForm({ blog, onSubmit, onCancel }: BlogFormProps) {
  const [formData, setFormData] = useState({
    title: blog?.title || '',
    content: blog?.content || '',
    excerpt: blog?.excerpt || '',
    categories: blog?.categories?.join(', ') || '',
    tags: blog?.tags?.join(', ') || '',
    featuredImage: blog?.featuredImage || '',
    isFeatured: blog?.isFeatured || false,
    status: blog?.status || 'draft'
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await onSubmit(formData);
    setIsLoading(false);
  };

  return (
    <div className="mb-8 card">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">
            {blog ? 'Edit Blog' : 'Create New Blog'}
          </h3>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-500 transition-colors duration-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="px-6 py-6">
        <div className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Blog Title
            </label>
            <input
              type="text"
              id="title"
              required
              className="input mt-1"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter your blog title"
            />
          </div>

          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700">
              Content
            </label>
            <textarea
              id="content"
              rows={10}
              required
              className="input mt-1"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Write your blog content here..."
            />
          </div>

          <div>
            <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700">
              Excerpt (Optional)
            </label>
            <textarea
              id="excerpt"
              rows={3}
              className="input mt-1"
              value={formData.excerpt}
              onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
              placeholder="Brief description of your blog post (auto-generated if left empty)"
            />
            <p className="mt-1 text-xs text-gray-500">
              Leave empty to auto-generate from content (first 150 characters)
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="categories" className="block text-sm font-medium text-gray-700">
                Categories
              </label>
              <input
                type="text"
                id="categories"
                className="input mt-1"
                value={formData.categories}
                onChange={(e) => setFormData({ ...formData, categories: e.target.value })}
                placeholder="Technology, Web Development, etc."
              />
              <p className="mt-1 text-xs text-gray-500">
                Separate multiple categories with commas
              </p>
            </div>

            <div>
              <label htmlFor="tags" className="block text-sm font-medium text-gray-700">
                Tags
              </label>
              <input
                type="text"
                id="tags"
                className="input mt-1"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="react, javascript, tutorial, etc."
              />
              <p className="mt-1 text-xs text-gray-500">
                Separate multiple tags with commas
              </p>
            </div>
          </div>

          <div>
            <label htmlFor="featuredImage" className="block text-sm font-medium text-gray-700">
              Featured Image URL (Optional)
            </label>
            <div className="mt-1 flex rounded-md shadow-sm">
              <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                <ImageIcon className="h-4 w-4" />
              </span>
              <input
                type="url"
                id="featuredImage"
                className="input rounded-l-none"
                value={formData.featuredImage}
                onChange={(e) => setFormData({ ...formData, featuredImage: e.target.value })}
                placeholder="https://example.com/image.jpg"
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Provide a URL to an image for your blog post
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                Status
              </label>
              <select
                id="status"
                className="input mt-1"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>

            <div className="flex items-center">
              <div className="flex items-center h-5">
                <input
                  id="isFeatured"
                  type="checkbox"
                  className="h-4 w-4 text-brand-600 focus:ring-brand-500 border-gray-300 rounded"
                  checked={formData.isFeatured}
                  onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="isFeatured" className="font-medium text-gray-700 flex items-center">
                  <Star className="h-4 w-4 mr-1 text-yellow-500" />
                  Featured Post
                </label>
                <p className="text-gray-500">Mark this post as featured</p>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="secondary"
              onClick={onCancel}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={isLoading}
            >
              {blog ? 'Update Blog' : 'Create Blog'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default BlogForm;