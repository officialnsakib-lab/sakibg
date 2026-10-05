'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'react-hot-toast';
import { 
  X, 
  Image as ImageIcon, 
  Loader2,
  Award
} from 'lucide-react';

export default function UploadProductPage() {
  const router = useRouter();
  const { token } = useAuth();
  
  // ============ FORM STATE ============
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [category, setCategory] = useState('electronics');
  const [customCategory, setCustomCategory] = useState(''); // নতুন ক্যাটাগরি নামের জন্য স্টেট
  const [subCategory, setSubCategory] = useState('');
  const [price, setPrice] = useState('');
  const [salePrice, setSalePrice] = useState('');
  const [tags, setTags] = useState('');
  
  // Physical & Food product specific
  const [stockQuantity, setStockQuantity] = useState('');
  const [sku, setSku] = useState('');
  const [weight, setWeight] = useState('');
  const [dimensions, setDimensions] = useState('');
  
  // Premium & Verification
  const [isPremium, setIsPremium] = useState(false);
  
  // Images (Main Product Image & Gallery)
  const [mainImage, setMainImage] = useState<File | null>(null);
  const [mainImagePreview, setMainImagePreview] = useState<string>('');
  
  const [galleryImages, setGalleryImages] = useState<File[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  
  const mainImageInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  // ============ CATEGORIES ============
  const physicalCategories = [
    'electronics', 'clothing', 'home-appliances', 'books', 'fitness', 
    'toys', 'beauty', 'accessories', 'gadgets', 'food-items', 'other'
  ];

  // ============ FILE HANDLERS ============
  const handleMainImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB');
        return;
      }
      setMainImage(selectedFile);
      setMainImagePreview(URL.createObjectURL(selectedFile));
      if (errors.mainImage) setErrors({ ...errors, mainImage: '' });
    }
  };

  const handleGallerySelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newFilesArray = Array.from(files);
      const validFiles = newFilesArray.filter(fileItem => {
        if (fileItem.size > 5 * 1024 * 1024) {
          toast.error(`${fileItem.name} is too large (Max 5MB)`);
          return false;
        }
        return true;
      });

      setGalleryImages(prev => [...prev, ...validFiles]);
      const newPreviews = validFiles.map(fileItem => URL.createObjectURL(fileItem));
      setGalleryPreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const removeGalleryImage = (index: number) => {
    setGalleryImages(prev => prev.filter((_, i) => i !== index));
    setGalleryPreviews(prev => prev.filter((_, i) => i !== index));
  };

  // ============ VALIDATION ============
  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!title.trim()) newErrors.title = 'Title is required';
    if (!description.trim()) newErrors.description = 'Description is required';
    if (price === '' || isNaN(parseFloat(price))) newErrors.price = 'Valid price is required';
    if (!stockQuantity || parseInt(stockQuantity) < 0) {
      newErrors.stockQuantity = 'Stock quantity is required';
    }
    if (!mainImage) newErrors.mainImage = 'Main product image is required';
    if (category === 'other' && !customCategory.trim()) {
      newErrors.customCategory = 'Please enter custom category name';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ============ SUBMIT WITH FORMDATA ============
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fill all required fields correctly');
      return;
    }
    
    setLoading(true);
    setUploadProgress(30);
    
    try {
      // যদি ভেন্ডর 'other' সিলেক্ট করে, তবে কাস্টম ক্যাটাগরি নাম ফরম্যাট করে ক্যাটাগরিতে বসবে
      const finalCategory = category === 'other' 
        ? customCategory.trim().toLowerCase().replace(/\s+/g, '-') 
        : category;

      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('shortDescription', shortDescription || '');
      formData.append('productType', 'physical');
      formData.append('category', finalCategory);
      formData.append('subCategory', subCategory || '');
      formData.append('price', price);
      formData.append('salePrice', salePrice || '');
      formData.append('tags', tags);
      formData.append('stockQuantity', stockQuantity);
      formData.append('sku', sku || '');
      formData.append('weight', weight || '');
      formData.append('dimensions', dimensions || '');
      formData.append('isPremium', String(isPremium));

      // মূল ইমেজ যুক্ত করা
      if (mainImage) {
        formData.append('thumbnail', mainImage);
      }

      // গ্যালারি ইমেজগুলো যুক্ত করা
      galleryImages.forEach((img) => {
        formData.append('images', img);
      });

      setUploadProgress(70);
      toast.loading('Uploading product and images...', { id: 'uploadToast' });

      const response = await fetch('/api/products/upload', {
        method: 'POST',
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: formData,
      });

      const data = await response.json();
      setUploadProgress(100);
      toast.dismiss('uploadToast');

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Upload failed');
      }
      
      toast.success('Product submitted for review!');
      router.push('/vendor/products');

    } catch (error: any) {
      console.error('Upload error:', error);
      toast.dismiss('uploadToast');
      toast.error(error.message || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto pb-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Upload Physical Product / Food Item</h1>
        <p className="text-gray-600 mt-1">Submit your product or food item for admin review</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Basic Info */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={`w-full px-4 py-2.5 bg-white text-neutral-900 border rounded-lg ${errors.title ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Product or food title"
              />
              {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Short Description
              </label>
              <input
                type="text"
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                className="w-full px-4 py-2.5 bg-white text-neutral-900 border border-gray-300 rounded-lg"
                placeholder="Brief summary"
                maxLength={300}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Description <span className="text-red-500">*</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                className={`w-full px-4 py-2.5 bg-white text-neutral-900 border rounded-lg ${errors.description ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Detailed description..."
              />
              {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description}</p>}
            </div>
          </div>
        </div>

        {/* Category & Pricing */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Category & Pricing</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2.5 bg-white text-neutral-900 border border-gray-300 rounded-lg capitalize"
              >
                {physicalCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat === 'other' ? 'Other (Type your own)' : cat.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price (USD) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                min="0"
                step="0.01"
                className={`w-full px-4 py-2.5 bg-white text-neutral-900 border rounded-lg ${errors.price ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="49.99"
              />
              {errors.price && <p className="text-xs text-red-500 mt-1">{errors.price}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sale Price
              </label>
              <input
                type="number"
                value={salePrice}
                onChange={(e) => setSalePrice(e.target.value)}
                min="0"
                step="0.01"
                className="w-full px-4 py-2.5 bg-white text-neutral-900 border border-gray-300 rounded-lg"
                placeholder="39.99"
              />
            </div>
          </div>

          {/* Custom Category Input (Shows up when 'Other' is selected) */}
          {category === 'other' && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Enter Custom Category Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                className={`w-full px-4 py-2.5 bg-white text-neutral-900 border rounded-lg ${errors.customCategory ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="e.g. Handmade Crafts, Organic Spices"
              />
              {errors.customCategory && <p className="text-xs text-red-500 mt-1">{errors.customCategory}</p>}
            </div>
          )}

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tags (comma separated)
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full px-4 py-2.5 bg-white text-neutral-900 border border-gray-300 rounded-lg"
              placeholder="food, burger, organic, fashion"
            />
          </div>
        </div>

        {/* Inventory & Shipping Details */}
        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-orange-500">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Inventory & Shipping Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stock Quantity <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={stockQuantity}
                onChange={(e) => setStockQuantity(e.target.value)}
                min="0"
                className={`w-full px-4 py-2.5 bg-white text-neutral-900 border rounded-lg ${errors.stockQuantity ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="100"
              />
              {errors.stockQuantity && <p className="text-xs text-red-500 mt-1">{errors.stockQuantity}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
              <input
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                className="w-full px-4 py-2.5 bg-white text-neutral-900 border border-gray-300 rounded-lg"
                placeholder="PROD-SKU-001"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Weight</label>
              <input
                type="text"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="w-full px-4 py-2.5 bg-white text-neutral-900 border border-gray-300 rounded-lg"
                placeholder="0.5 kg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Dimensions</label>
              <input
                type="text"
                value={dimensions}
                onChange={(e) => setDimensions(e.target.value)}
                className="w-full px-4 py-2.5 bg-white text-neutral-900 border border-gray-300 rounded-lg"
                placeholder="10 x 5 x 2 inches"
              />
            </div>
          </div>
        </div>

        {/* Main Product Image */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Main Product Image <span className="text-red-500">*</span>
          </h2>
          <p className="text-xs text-gray-500 mb-4">Upload the primary image for your product or food item.</p>
          <div className="flex items-center gap-6">
            {mainImagePreview ? (
              <div className="relative">
                <img src={mainImagePreview} className="w-32 h-32 object-cover rounded-lg border shadow-sm" alt="Main Product Preview" />
                <button 
                  type="button" 
                  onClick={() => { setMainImage(null); setMainImagePreview(''); }} 
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div 
                onClick={() => mainImageInputRef.current?.click()} 
                className={`w-32 h-32 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-indigo-400 ${errors.mainImage ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
              >
                <ImageIcon className="w-8 h-8 text-gray-400" />
                <span className="text-xs text-gray-500 mt-2">Add Image</span>
              </div>
            )}
            <input ref={mainImageInputRef} type="file" onChange={handleMainImageSelect} className="hidden" accept="image/*" />
          </div>
          {errors.mainImage && <p className="text-xs text-red-500 mt-1">{errors.mainImage}</p>}
        </div>

        {/* Gallery Images */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Product Gallery Images (Optional)</h2>
          <p className="text-xs text-gray-500 mb-4">Add extra images to show different angles or details.</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
            {galleryPreviews.map((preview, index) => (
              <div key={index} className="relative w-full h-28 rounded-lg border overflow-hidden group shadow-sm">
                <img src={preview} alt={`Gallery ${index}`} className="w-full h-28 object-cover" />
                <button
                  type="button"
                  onClick={() => removeGalleryImage(index)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 shadow"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
            
            <div 
              onClick={() => galleryInputRef.current?.click()}
              className="w-full h-28 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-indigo-400 bg-gray-50"
            >
              <ImageIcon className="w-6 h-6 text-gray-400" />
              <span className="text-xs text-gray-500 mt-1">Add More</span>
            </div>
          </div>
          <input ref={galleryInputRef} type="file" multiple accept="image/*" onChange={handleGallerySelect} className="hidden" />
        </div>

        {/* Premium Toggle */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <label className="flex items-center justify-between cursor-pointer">
            <div className="flex items-center gap-3">
              <Award className="w-6 h-6 text-yellow-500" />
              <div>
                <p className="font-semibold text-gray-900">Premium Product</p>
                <p className="text-xs text-gray-500">Mark this product as premium featured</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={isPremium}
              onChange={(e) => setIsPremium(e.target.checked)}
              className="w-5 h-5 text-indigo-600 rounded"
            />
          </label>
        </div>

        {/* Progress Bar */}
        {loading && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div className="bg-indigo-600 h-2.5 rounded-full transition-all" style={{ width: `${uploadProgress}%` }} />
            </div>
            <p className="text-sm text-gray-500 mt-2">{uploadProgress}% uploading...</p>
          </div>
        )}

        {/* Submit Buttons */}
        <div className="flex gap-4 pb-8">
          <button 
            type="submit" 
            disabled={loading} 
            className="flex-1 px-6 py-3.5 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="w-5 h-5 animate-spin" />}
            {loading ? 'Uploading Product...' : 'Submit for Review'}
          </button>
          <button 
            type="button" 
            onClick={() => router.back()} 
            className="px-6 py-3.5 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}