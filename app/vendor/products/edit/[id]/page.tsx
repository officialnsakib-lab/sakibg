'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { 
  Upload, 
  X, 
  Image as ImageIcon, 
  Loader2,
  Package,
  Box,
  Award
} from 'lucide-react';

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params?.id;
  const { token } = useAuth();
  
  // ============ FORM STATE ============
  const [productType, setProductType] = useState<'digital' | 'physical'>('digital');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [category, setCategory] = useState('templates');
  const [subCategory, setSubCategory] = useState('');
  const [price, setPrice] = useState('');
  const [salePrice, setSalePrice] = useState('');
  const [tags, setTags] = useState('');
  const [features, setFeatures] = useState('');
  const [requirements, setRequirements] = useState('');
  const [demoUrl, setDemoUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [version, setVersion] = useState('1.0.0');
  const [documentation, setDocumentation] = useState('');
  
  // Physical product specific
  const [stockQuantity, setStockQuantity] = useState('');
  const [sku, setSku] = useState('');
  const [weight, setWeight] = useState('');
  const [dimensions, setDimensions] = useState('');
  
  // Premium & Verification
  const [isPremium, setIsPremium] = useState(false);
  
  // Files & Previews
  const [file, setFile] = useState<File | null>(null);
  const [existingFileUrl, setExistingFileUrl] = useState('');
  
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>('');
  
  const [galleryImages, setGalleryImages] = useState<File[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
  const [existingGalleryUrls, setExistingGalleryUrls] = useState<string[]>([]);
  
  // UI state
  const [fetching, setFetching] = useState(true);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const digitalCategories = [
    'templates', 'software', 'ebooks', 'graphics', 
    'music', 'videos', 'courses', 'plugins', 'themes', 'other'
  ];
  
  const physicalCategories = [
    'electronics', 'clothing', 'home-appliances', 'books', 'fitness', 
    'toys', 'beauty', 'accessories', 'gadgets', 'other'
  ];

  // ============ FETCH EXISTING PRODUCT DATA ============
  useEffect(() => {
    if (!productId || !token) return;

    const fetchProductDetails = async () => {
      try {
        setFetching(true);
        const res = await axios.get(`/api/products/${productId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (res.data.success) {
          const p = res.data.data;
          setTitle(p.title || '');
          setDescription(p.description || '');
          setShortDescription(p.shortDescription || '');
          setProductType(p.productType || 'digital');
          setCategory(p.category || 'templates');
          setSubCategory(p.subCategory || '');
          setPrice(p.price !== undefined ? p.price.toString() : '');
          setSalePrice(p.salePrice !== undefined && p.salePrice !== null ? p.salePrice.toString() : '');
          setTags(Array.isArray(p.tags) ? p.tags.join(', ') : '');
          setFeatures(Array.isArray(p.features) ? p.features.join(', ') : '');
          setRequirements(Array.isArray(p.requirements) ? p.requirements.join(', ') : '');
          setDemoUrl(p.demoUrl || '');
          setVideoUrl(p.videoUrl || '');
          setVersion(p.version || '1.0.0');
          setDocumentation(p.documentation || '');
          setStockQuantity(p.stockQuantity !== undefined ? p.stockQuantity.toString() : '');
          setSku(p.sku || '');
          setWeight(p.weight || '');
          setDimensions(p.dimensions || '');
          setIsPremium(p.isPremium || false);
          
          setExistingFileUrl(p.fileUrl || '');
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
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 100 * 1024 * 1024) {
        toast.error('File size must be less than 100MB');
        return;
      }
      setFile(selectedFile);
      if (errors.file) setErrors({ ...errors, file: '' });
    }
  };

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

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      setFile(droppedFile);
      if (errors.file) setErrors({ ...errors, file: '' });
    }
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    if (!title.trim()) newErrors.title = 'Title is required';
    if (!description.trim()) newErrors.description = 'Description is required';
    if (price === '' || isNaN(parseFloat(price))) newErrors.price = 'Valid price is required';
    if (productType === 'physical' && (!stockQuantity || parseInt(stockQuantity) < 0)) {
      newErrors.stockQuantity = 'Stock quantity is required for physical products';
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
      throw new Error(err.response?.data?.error?.message || 'Failed to upload file to Cloudinary');
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
    setUploadProgress(10);
    
    try {
      // ১. যদি নতুন মেইন ফাইল দেওয়া হয় তা আপলোড করা, না হলে পুরনোটা রাখা
      let fileUrl = existingFileUrl;
      if (file) {
        fileUrl = await uploadToCloudinary(file);
        setUploadProgress(40);
      }

      // ২. নতুন থাম্বনেইল আপলোড বা পুরনো প্রিভিউ লিংক রাখা
      let thumbnailUrl = thumbnailPreview;
      if (thumbnail) {
        thumbnailUrl = await uploadToCloudinary(thumbnail);
        setUploadProgress(60);
      }

      // ৩. পুরনো গ্যালারি ইমেজ + নতুন আপলোড করা গ্যালারি ইমেজ একত্রিত করা
      let finalGalleryUrls = [...existingGalleryUrls];
      for (let i = 0; i < galleryImages.length; i++) {
        const url = await uploadToCloudinary(galleryImages[i]);
        finalGalleryUrls.push(url);
        setUploadProgress(60 + Math.round(((i + 1) / galleryImages.length) * 30));
      }

      setUploadProgress(95);

      const payload = {
        title,
        description,
        shortDescription,
        productType,
        category,
        subCategory,
        price: parseFloat(price),
        salePrice: salePrice ? parseFloat(salePrice) : null,
        tags: tags ? tags.split(',').map(t => t.trim()) : [],
        features: features ? features.split(',').map(f => f.trim()) : [],
        requirements: requirements ? requirements.split(',').map(r => r.trim()) : [],
        demoUrl,
        videoUrl,
        version: version || '1.0.0',
        documentation,
        stockQuantity: productType === 'physical' ? parseInt(stockQuantity || '0') : 0,
        sku,
        weight,
        dimensions,
        isPremium,
        fileUrl,
        thumbnailUrl,
        images: finalGalleryUrls
      };

      // প্রোডাক্ট আপডেট এপিআই কল (PUT / PATCH)
      const response = await axios.put(`/api/products/${productId}`, payload, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      setUploadProgress(100);
      if (response.data.success) {
        toast.success('Product updated successfully!');
        router.push('/vendor/products');
      }
    } catch (error: any) {
      console.error('Update error:', error);
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
    <div className="max-w-5xl mx-auto pb-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Edit Product</h1>
        <p className="text-gray-600 mt-1">Update your product information</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Product Type */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Product Type <span className="text-red-500">*</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => { setProductType('digital'); setCategory('templates'); }}
              className={`p-5 rounded-lg border-2 text-center transition-all ${
                productType === 'digital' ? 'border-indigo-500 bg-indigo-50 shadow-md' : 'border-gray-200'
              }`}
            >
              <Package className={`w-10 h-10 mx-auto mb-2 ${productType === 'digital' ? 'text-indigo-600' : 'text-gray-400'}`} />
              <div className="font-semibold text-gray-900">Digital Product</div>
              <div className="text-xs text-gray-500 mt-1">Software, eBook, Template</div>
            </button>
            
            <button
              type="button"
              onClick={() => { setProductType('physical'); setCategory('electronics'); }}
              className={`p-5 rounded-lg border-2 text-center transition-all ${
                productType === 'physical' ? 'border-orange-500 bg-orange-50 shadow-md' : 'border-gray-200'
              }`}
            >
              <Box className={`w-10 h-10 mx-auto mb-2 ${productType === 'physical' ? 'text-orange-600' : 'text-gray-400'}`} />
              <div className="font-semibold text-gray-900">Physical Product</div>
              <div className="text-xs text-gray-500 mt-1">Shippable goods, merchandise</div>
            </button>
          </div>
        </div>

        {/* Basic Info */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={`w-full px-4 py-2.5 border rounded-lg ${errors.title ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Short Description</label>
              <input
                type="text"
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
                maxLength={300}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Description <span className="text-red-500">*</span></label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                className={`w-full px-4 py-2.5 border rounded-lg ${errors.description ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description}</p>}
            </div>
          </div>
        </div>

        {/* Category & Pricing */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Category & Pricing</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category <span className="text-red-500">*</span></label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
              >
                {(productType === 'digital' ? digitalCategories : physicalCategories).map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
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
                className={`w-full px-4 py-2.5 border rounded-lg ${errors.price ? 'border-red-500' : 'border-gray-300'}`}
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
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma separated)</label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
            />
          </div>
        </div>

        {/* Physical Product Specific Fields */}
        {productType === 'physical' && (
          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-orange-500">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Inventory & Shipping Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity <span className="text-red-500">*</span></label>
                <input
                  type="number"
                  value={stockQuantity}
                  onChange={(e) => setStockQuantity(e.target.value)}
                  min="0"
                  className={`w-full px-4 py-2.5 border rounded-lg ${errors.stockQuantity ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.stockQuantity && <p className="text-xs text-red-500 mt-1">{errors.stockQuantity}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
                <input
                  type="text"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Weight</label>
                <input
                  type="text"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Dimensions</label>
                <input
                  type="text"
                  value={dimensions}
                  onChange={(e) => setDimensions(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
          </div>
        )}

        {/* Product File Upload */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Product Main File</h2>
          {existingFileUrl && !file && (
            <p className="text-xs text-indigo-600 mb-3 font-medium">Current file is already attached. Upload a new one only if you want to replace it.</p>
          )}
          <div 
            onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
              dragActive ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <input ref={fileInputRef} type="file" onChange={handleFileSelect} className="hidden" />
            <Upload className="w-10 h-10 text-gray-400 mx-auto mb-2" />
            {file ? (
              <div>
                <p className="font-medium text-gray-900">{file.name}</p>
                <p className="text-xs text-gray-500 mt-1">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
              </div>
            ) : (
              <div>
                <p className="font-medium text-gray-700">{existingFileUrl ? 'Replace existing file' : 'Click to upload or drag and drop'}</p>
                <p className="text-xs text-gray-400 mt-1">ZIP, PDF, RAR, software package</p>
              </div>
            )}
          </div>
        </div>

        {/* Thumbnail */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Product Thumbnail</h2>
          <div className="flex items-center gap-6">
            {thumbnailPreview ? (
              <div className="relative">
                <img src={thumbnailPreview} className="w-32 h-32 object-cover rounded-lg border" alt="Thumbnail Preview" />
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
                className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-indigo-400"
              >
                <ImageIcon className="w-8 h-8 text-gray-400" />
                <span className="text-xs text-gray-500 mt-2">Add Image</span>
              </div>
            )}
            <input ref={thumbnailInputRef} type="file" onChange={handleThumbnailSelect} className="hidden" accept="image/*" />
          </div>
        </div>

        {/* Gallery Images */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Product Gallery Images</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
            {/* Existing Gallery Images */}
            {existingGalleryUrls.map((url, index) => (
              <div key={`existing-${index}`} className="relative w-full h-28 rounded-lg border overflow-hidden">
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
              <div key={`new-${index}`} className="relative w-full h-28 rounded-lg border overflow-hidden">
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
            <p className="text-sm text-gray-500 mt-2">{uploadProgress}% updating...</p>
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
            {loading ? 'Updating Product...' : 'Save Changes'}
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