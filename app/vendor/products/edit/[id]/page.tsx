'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { 
  X, 
  Image as ImageIcon, 
  Loader2,
  Award
} from 'lucide-react';

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params?.id;
  const { token } = useAuth();
  
  // ============ FORM STATE ============
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [category, setCategory] = useState('electronics');
  const [customCategory, setCustomCategory] = useState(''); // কাস্টম ক্যাটাগরি নামের জন্য স্টেট
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
  
  // Images & Previews
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>('');
  
  const [galleryImages, setGalleryImages] = useState<File[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
  const [existingGalleryUrls, setExistingGalleryUrls] = useState<string[]>([]);
  
  // UI state
  const [fetching, setFetching] = useState(true);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const physicalCategories = [
    'electronics', 'clothing', 'home-appliances', 'books', 'fitness', 
    'toys', 'beauty', 'accessories', 'gadgets', 'food-items', 'other'
  ];

  // ============ FETCH EXISTING PRODUCT DATA ============
  useEffect(() => {
    if (!productId) {
      setFetching(false);
      return;
    }

    const fetchProductDetails = async () => {
      try {
        setFetching(true);
        
        const headers: any = {};
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const res = await axios.get(`/api/products/${productId}`, {
          headers,
          withCredentials: true,
          timeout: 8000
        });

        if (res.data && res.data.success) {
          const p = res.data.data?.product || res.data.data || {};
          setTitle(p.title || '');
          setDescription(p.description || '');
          setShortDescription(p.shortDescription || '');
          
          const fetchedCategory = p.category || 'electronics';
          if (physicalCategories.includes(fetchedCategory)) {
            setCategory(fetchedCategory);
          } else {
            setCategory('other');
            setCustomCategory(fetchedCategory);
          }

          setSubCategory(p.subCategory || '');
          setPrice(p.price !== undefined ? p.price.toString() : '');
          setSalePrice(p.salePrice !== undefined && p.salePrice !== null ? p.salePrice.toString() : '');
          setTags(Array.isArray(p.tags) ? p.tags.join(', ') : '');
          setStockQuantity(p.stock !== undefined ? p.stock.toString() : (p.stockQuantity !== undefined ? p.stockQuantity.toString() : ''));
          setSku(p.sku || '');
          setWeight(p.weight || '');
          setDimensions(p.dimensions || '');
          setIsPremium(p.isPremium || false);
          
          if (p.thumbnailUrl) {
            setThumbnailPreview(p.thumbnailUrl);
          }
          if (Array.isArray(p.images)) {
            setExistingGalleryUrls(p.images);
          }
        }
      } catch (err: any) {
        console.error('Fetch product error:', err);
        toast.error('Failed to load product details');
      } finally {
        setFetching(false);
      }
    };

    fetchProductDetails();
  }, [productId, token]);

  // ============ FILE HANDLERS ============
  const handleThumbnailSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 5 * 1024 * 1024) {
        toast.error('Thumbnail size must be less than 5MB');
        return;
      }
      setThumbnail(selectedFile);
      setThumbnailPreview(URL.createObjectURL(selectedFile));
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

  const removeExistingGalleryImage = (index: number) => {
    setExistingGalleryUrls(prev => prev.filter((_, i) => i !== index));
  };

  const removeNewGalleryImage = (index: number) => {
    setGalleryImages(prev => prev.filter((_, i) => i !== index));
    setGalleryPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    if (!title.trim()) newErrors.title = 'Title is required';
    if (!description.trim()) newErrors.description = 'Description is required';
    if (price === '' || isNaN(parseFloat(price))) newErrors.price = 'Valid price is required';
    if (!stockQuantity || parseInt(stockQuantity) < 0) {
      newErrors.stockQuantity = 'Stock quantity is required';
    }
    if (!thumbnailPreview) newErrors.thumbnail = 'Main product image is required';
    if (category === 'other' && !customCategory.trim()) {
      newErrors.customCategory = 'Please enter custom category name';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const uploadToCloudinary = async (fileToUpload: File) => {
    const data = new FormData();
    data.append('file', fileToUpload);
    data.append('upload_preset', 'wahisnovaimex');

    const cloudName = 'momlcc6a'; 
    try {
      const res = await axios.post(
        `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
        data
      );
      return res.data.secure_url;
    } catch (err: any) {
      console.error('Cloudinary Upload Error:', err.response?.data);
      throw new Error(err.response?.data?.error?.message || 'Failed to upload image to Cloudinary');
    }
  };

  // ============ UPDATE SUBMIT ============
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fill all required fields correctly');
      return;
    }
    
    setLoading(true);
    setUploadProgress(20);
    
    try {
      toast.loading('Updating images...', { id: 'updateToast' });

      let thumbnailUrl = thumbnailPreview;
      if (thumbnail) {
        thumbnailUrl = await uploadToCloudinary(thumbnail);
        setUploadProgress(50);
      }

      let finalGalleryUrls = [...existingGalleryUrls];
      for (let i = 0; i < galleryImages.length; i++) {
        const url = await uploadToCloudinary(galleryImages[i]);
        finalGalleryUrls.push(url);
        setUploadProgress(50 + Math.round(((i + 1) / galleryImages.length) * 35));
      }

      setUploadProgress(90);
      toast.loading('Saving product changes...', { id: 'updateToast' });

      const finalCategory = category === 'other' 
        ? customCategory.trim().toLowerCase().replace(/\s+/g, '-') 
        : category;

      const payload = {
        title,
        description,
        shortDescription,
        productType: 'physical',
        category: finalCategory,
        subCategory,
        price: parseFloat(price),
        salePrice: salePrice ? parseFloat(salePrice) : null,
        tags: tags ? tags.split(',').map(t => t.trim()) : [],
        stockQuantity: parseInt(stockQuantity || '0'),
        sku,
        weight,
        dimensions,
        isPremium,
        thumbnailUrl,
        images: finalGalleryUrls
      };

      const headers: any = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await axios.put(`/api/products/${productId}`, payload, {
        headers,
        withCredentials: true
      });
      
      setUploadProgress(100);
      toast.dismiss('updateToast');

      if (response.data && response.data.success) {
        toast.success('Product updated successfully!');
        router.push('/vendor/products');
      } else {
        throw new Error(response.data.error || 'Update failed');
      }
    } catch (error: any) {
      console.error('Update error:', error);
      toast.dismiss('updateToast');
      const errorMessage = error.response?.data?.error || error.message || 'Update failed';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="text-center py-24">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mx-auto" />
        <p className="text-gray-500 mt-3">Loading product details...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto pb-12 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Edit Product / Food Item</h1>
        <p className="text-gray-600 mt-1">Update your physical product or food item information</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Basic Info */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={`w-full px-4 py-2.5 bg-white text-neutral-900 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none ${errors.title ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Product title"
              />
              {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Short Description</label>
              <input
                type="text"
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                className="w-full px-4 py-2.5 bg-white text-neutral-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                maxLength={300}
                placeholder="Brief summary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Description <span className="text-red-500">*</span></label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                className={`w-full px-4 py-2.5 bg-white text-neutral-900 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none ${errors.description ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Detailed description..."
              />
              {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description}</p>}
            </div>
          </div>
        </div>

        {/* Category & Pricing */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Category & Pricing</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category <span className="text-red-500">*</span></label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2.5 bg-white text-neutral-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none capitalize"
              >
                {physicalCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat === 'other' ? 'Other (Type your own)' : cat.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price (USD) <span className="text-red-500">*</span></label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                min="0"
                step="0.01"
                className={`w-full px-4 py-2.5 bg-white text-neutral-900 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none ${errors.price ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="49.99"
              />
              {errors.price && <p className="text-xs text-red-500 mt-1">{errors.price}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sale Price</label>
              <input
                type="number"
                value={salePrice}
                onChange={(e) => setSalePrice(e.target.value)}
                min="0"
                step="0.01"
                className="w-full px-4 py-2.5 bg-white text-neutral-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
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
                className={`w-full px-4 py-2.5 bg-white text-neutral-900 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none ${errors.customCategory ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="e.g. Handmade Crafts, Organic Spices"
              />
              {errors.customCategory && <p className="text-xs text-red-500 mt-1">{errors.customCategory}</p>}
            </div>
          )}

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma separated)</label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full px-4 py-2.5 bg-white text-neutral-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="food, burger, organic, gadget"
            />
          </div>
        </div>

        {/* Inventory & Shipping Details */}
        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-orange-500 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Inventory & Shipping Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity <span className="text-red-500">*</span></label>
              <input
                type="number"
                value={stockQuantity}
                onChange={(e) => setStockQuantity(e.target.value)}
                min="0"
                className={`w-full px-4 py-2.5 bg-white text-neutral-900 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none ${errors.stockQuantity ? 'border-red-500' : 'border-gray-300'}`}
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
                className="w-full px-4 py-2.5 bg-white text-neutral-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="PROD-SKU-001"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Weight</label>
              <input
                type="text"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="w-full px-4 py-2.5 bg-white text-neutral-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="e.g. 500g"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Dimensions</label>
              <input
                type="text"
                value={dimensions}
                onChange={(e) => setDimensions(e.target.value)}
                className="w-full px-4 py-2.5 bg-white text-neutral-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="e.g. 10x5x2 cm"
              />
            </div>
          </div>
        </div>

        {/* Main Product Image */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Main Product Image <span className="text-red-500">*</span></h2>
          <div className="flex items-center gap-6">
            {thumbnailPreview ? (
              <div className="relative">
                <img src={thumbnailPreview} className="w-32 h-32 object-cover rounded-lg border border-gray-200 shadow-sm" alt="Thumbnail Preview" />
                <button 
                  type="button" 
                  onClick={() => { setThumbnail(null); setThumbnailPreview(''); }} 
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div 
                onClick={() => thumbnailInputRef.current?.click()} 
                className={`w-32 h-32 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-indigo-400 bg-gray-50 ${errors.thumbnail ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
              >
                <ImageIcon className="w-8 h-8 text-gray-400" />
                <span className="text-xs text-gray-500 mt-2">Add Image</span>
              </div>
            )}
            <input ref={thumbnailInputRef} type="file" onChange={handleThumbnailSelect} className="hidden" accept="image/*" />
          </div>
          {errors.thumbnail && <p className="text-xs text-red-500 mt-1">{errors.thumbnail}</p>}
        </div>

        {/* Gallery Images */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Product Gallery Images</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
            {/* Existing Gallery Images */}
            {existingGalleryUrls.map((url, index) => (
              <div key={`existing-${index}`} className="relative w-full h-28 rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                <img src={url} alt={`Existing ${index}`} className="w-full h-28 object-cover" />
                <button
                  type="button"
                  onClick={() => removeExistingGalleryImage(index)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 shadow"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}

            {/* New Gallery Previews */}
            {galleryPreviews.map((preview, index) => (
              <div key={`new-${index}`} className="relative w-full h-28 rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                <img src={preview} alt={`New Preview ${index}`} className="w-full h-28 object-cover" />
                <button
                  type="button"
                  onClick={() => removeNewGalleryImage(index)}
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
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <label className="flex items-center justify-between cursor-pointer">
            <div className="flex items-center gap-3">
              <Award className="w-6 h-6 text-yellow-500" />
              <div>
                <p className="font-semibold text-gray-900">Premium Product</p>
                <p className="text-xs text-gray-500">Mark this product as premium featured item</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={isPremium}
              onChange={(e) => setIsPremium(e.target.checked)}
              className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500 border-gray-300"
            />
          </label>
        </div>

        {/* Progress Bar */}
        {loading && (
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div className="bg-indigo-600 h-2.5 rounded-full transition-all" style={{ width: `${uploadProgress}%` }} />
            </div>
            <p className="text-sm text-gray-500 mt-2 text-center">{uploadProgress}% updating...</p>
          </div>
        )}

        {/* Submit Buttons */}
        <div className="flex gap-4 pb-8">
          <button 
            type="submit" 
            disabled={loading} 
            className="flex-1 px-6 py-3.5 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors shadow-sm"
          >
            {loading && <Loader2 className="w-5 h-5 animate-spin" />}
            {loading ? 'Updating Product...' : 'Save Changes'}
          </button>
          <button 
            type="button" 
            onClick={() => router.back()} 
            className="px-6 py-3.5 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}