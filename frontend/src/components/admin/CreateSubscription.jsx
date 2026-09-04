import React, { useState } from 'react';
import { X, Sparkles } from 'lucide-react';
import authService from '../../services/auth.service';
import toast from 'react-hot-toast';

const CreateSubscription = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    price: '',
    sellingPrice: '',
    validity: { value: '', unit: 'month' },
    features: [],
    about: '',
    termsAndConditions: [],
    order: 0,
    isActive: true,
  });
  const [featureInput, setFeatureInput] = useState('');
  const [termsInput, setTermsInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'validityValue') {
      setFormData(prev => ({
        ...prev,
        validity: { ...prev.validity, value }
      }));
    } else if (name === 'validityUnit') {
      setFormData(prev => ({
        ...prev,
        validity: { ...prev.validity, unit: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const addFeature = () => {
    if (featureInput.trim()) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, featureInput.trim()]
      }));
      setFeatureInput('');
    }
  };

  const removeFeature = (index) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  const addTerm = () => {
    if (termsInput.trim()) {
      setFormData(prev => ({
        ...prev,
        termsAndConditions: [...prev.termsAndConditions, termsInput.trim()]
      }));
      setTermsInput('');
    }
  };

  const removeTerm = (index) => {
    setFormData(prev => ({
      ...prev,
      termsAndConditions: prev.termsAndConditions.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('price', formData.price);
      formDataToSend.append('sellingPrice', formData.sellingPrice);
      formDataToSend.append('validity', JSON.stringify(formData.validity));
      formDataToSend.append('features', JSON.stringify(formData.features));
      formDataToSend.append('about', formData.about);
      formDataToSend.append('termsAndConditions', JSON.stringify(formData.termsAndConditions));
      formDataToSend.append('order', formData.order);
      formDataToSend.append('isActive', formData.isActive);

      const response = await authService.createSubscription(formDataToSend);
      
      if (response?.success) {
        toast.success('Subscription created successfully');
        onSuccess();
        onClose();
      } else {
        toast.error(response?.message || 'Failed to create subscription');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to create subscription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white/90 dark:bg-black/90 backdrop-blur-xl border border-[#22c55e]/20 dark:border-[#4ade80]/10 shadow-2xl shadow-[#22c55e]/10 dark:shadow-[#4ade80]/5">
        <div className="sticky top-0 z-10 flex items-center justify-between p-6 border-b border-[#22c55e]/10 dark:border-[#4ade80]/10 bg-white/90 dark:bg-black/90 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-[#22c55e] to-[#16a34a] dark:from-[#4ade80] dark:to-[#22c55e] rounded-xl shadow-lg shadow-[#22c55e]/30 dark:shadow-[#4ade80]/20">
              <Sparkles className="w-5 h-5 text-white dark:text-black" />
            </div>
            <h2 className="text-2xl font-bold text-[#1a3a1a] dark:text-white">Create Subscription</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#22c55e]/10 dark:hover:bg-[#4ade80]/10 rounded-xl transition-all duration-300 hover:scale-110"
          >
            <X className="w-5 h-5 text-[#1a3a1a] dark:text-white" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-[#1a3a1a] dark:text-[#6b8b6b] mb-1.5">
              Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 bg-white/50 dark:bg-black/50 border border-[#22c55e]/20 dark:border-[#4ade80]/10 rounded-xl focus:ring-2 focus:ring-[#22c55e] dark:focus:ring-[#4ade80] focus:border-transparent outline-none transition-all text-[#1a3a1a] dark:text-white placeholder-[#2a5a2a]/50 dark:placeholder-[#6b8b6b]/50"
              placeholder="Enter subscription title"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#1a3a1a] dark:text-[#6b8b6b] mb-1.5">
                Price (₹) *
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 bg-white/50 dark:bg-black/50 border border-[#22c55e]/20 dark:border-[#4ade80]/10 rounded-xl focus:ring-2 focus:ring-[#22c55e] dark:focus:ring-[#4ade80] focus:border-transparent outline-none transition-all text-[#1a3a1a] dark:text-white placeholder-[#2a5a2a]/50 dark:placeholder-[#6b8b6b]/50"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1a3a1a] dark:text-[#6b8b6b] mb-1.5">
                Selling Price (₹) *
              </label>
              <input
                type="number"
                name="sellingPrice"
                value={formData.sellingPrice}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 bg-white/50 dark:bg-black/50 border border-[#22c55e]/20 dark:border-[#4ade80]/10 rounded-xl focus:ring-2 focus:ring-[#22c55e] dark:focus:ring-[#4ade80] focus:border-transparent outline-none transition-all text-[#1a3a1a] dark:text-white placeholder-[#2a5a2a]/50 dark:placeholder-[#6b8b6b]/50"
                placeholder="0"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#1a3a1a] dark:text-[#6b8b6b] mb-1.5">
                Validity Value *
              </label>
              <input
                type="number"
                name="validityValue"
                value={formData.validity.value}
                onChange={handleChange}
                required
                min="1"
                className="w-full px-4 py-2.5 bg-white/50 dark:bg-black/50 border border-[#22c55e]/20 dark:border-[#4ade80]/10 rounded-xl focus:ring-2 focus:ring-[#22c55e] dark:focus:ring-[#4ade80] focus:border-transparent outline-none transition-all text-[#1a3a1a] dark:text-white placeholder-[#2a5a2a]/50 dark:placeholder-[#6b8b6b]/50"
                placeholder="12"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1a3a1a] dark:text-[#6b8b6b] mb-1.5">
                Validity Unit *
              </label>
              <select
                name="validityUnit"
                value={formData.validity.unit}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 bg-white/50 dark:bg-black/50 border border-[#22c55e]/20 dark:border-[#4ade80]/10 rounded-xl focus:ring-2 focus:ring-[#22c55e] dark:focus:ring-[#4ade80] focus:border-transparent outline-none transition-all text-[#1a3a1a] dark:text-white"
              >
                <option value="month">Month</option>
                <option value="year">Year</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1a3a1a] dark:text-[#6b8b6b] mb-1.5">
              Features
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={featureInput}
                onChange={(e) => setFeatureInput(e.target.value)}
                placeholder="Enter a feature"
                className="flex-1 px-4 py-2.5 bg-white/50 dark:bg-black/50 border border-[#22c55e]/20 dark:border-[#4ade80]/10 rounded-xl focus:ring-2 focus:ring-[#22c55e] dark:focus:ring-[#4ade80] focus:border-transparent outline-none transition-all text-[#1a3a1a] dark:text-white placeholder-[#2a5a2a]/50 dark:placeholder-[#6b8b6b]/50"
              />
              <button
                type="button"
                onClick={addFeature}
                className="px-5 py-2.5 bg-gradient-to-r from-[#22c55e] to-[#16a34a] hover:from-[#16a34a] hover:to-[#15803d] text-white rounded-xl transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-[#22c55e]/30 dark:shadow-[#4ade80]/20 font-medium"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              {formData.features.map((feature, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#22c55e]/10 dark:bg-[#4ade80]/10 text-[#1a3a1a] dark:text-[#4ade80] rounded-lg text-sm border border-[#22c55e]/20 dark:border-[#4ade80]/10"
                >
                  {feature}
                  <button
                    type="button"
                    onClick={() => removeFeature(index)}
                    className="hover:text-red-500 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1a3a1a] dark:text-[#6b8b6b] mb-1.5">
              About
            </label>
            <textarea
              name="about"
              value={formData.about}
              onChange={handleChange}
              rows="3"
              className="w-full px-4 py-2.5 bg-white/50 dark:bg-black/50 border border-[#22c55e]/20 dark:border-[#4ade80]/10 rounded-xl focus:ring-2 focus:ring-[#22c55e] dark:focus:ring-[#4ade80] focus:border-transparent outline-none transition-all text-[#1a3a1a] dark:text-white placeholder-[#2a5a2a]/50 dark:placeholder-[#6b8b6b]/50"
              placeholder="Describe your subscription plan..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1a3a1a] dark:text-[#6b8b6b] mb-1.5">
              Terms & Conditions
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={termsInput}
                onChange={(e) => setTermsInput(e.target.value)}
                placeholder="Enter a term"
                className="flex-1 px-4 py-2.5 bg-white/50 dark:bg-black/50 border border-[#22c55e]/20 dark:border-[#4ade80]/10 rounded-xl focus:ring-2 focus:ring-[#22c55e] dark:focus:ring-[#4ade80] focus:border-transparent outline-none transition-all text-[#1a3a1a] dark:text-white placeholder-[#2a5a2a]/50 dark:placeholder-[#6b8b6b]/50"
              />
              <button
                type="button"
                onClick={addTerm}
                className="px-5 py-2.5 bg-gradient-to-r from-[#22c55e] to-[#16a34a] hover:from-[#16a34a] hover:to-[#15803d] text-white rounded-xl transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-[#22c55e]/30 dark:shadow-[#4ade80]/20 font-medium"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              {formData.termsAndConditions.map((term, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#22c55e]/5 dark:bg-[#4ade80]/5 text-[#1a3a1a] dark:text-[#6b8b6b] rounded-lg text-sm border border-[#22c55e]/10 dark:border-[#4ade80]/10"
                >
                  {term}
                  <button
                    type="button"
                    onClick={() => removeTerm(index)}
                    className="hover:text-red-500 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1a3a1a] dark:text-[#6b8b6b] mb-1.5">
              Order Number
            </label>
            <input
              type="number"
              name="order"
              value={formData.order}
              onChange={handleChange}
              min="0"
              className="w-full px-4 py-2.5 bg-white/50 dark:bg-black/50 border border-[#22c55e]/20 dark:border-[#4ade80]/10 rounded-xl focus:ring-2 focus:ring-[#22c55e] dark:focus:ring-[#4ade80] focus:border-transparent outline-none transition-all text-[#1a3a1a] dark:text-white placeholder-[#2a5a2a]/50 dark:placeholder-[#6b8b6b]/50"
              placeholder="0"
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
              className="w-5 h-5 text-[#22c55e] rounded focus:ring-[#22c55e] border-[#22c55e]/30 dark:border-[#4ade80]/30"
            />
            <label className="text-sm font-medium text-[#1a3a1a] dark:text-[#6b8b6b]">
              Active (Plan will be visible to users)
            </label>
          </div>

          <div className="flex gap-3 pt-4 border-t border-[#22c55e]/10 dark:border-[#4ade80]/10">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-[#22c55e]/20 dark:border-[#4ade80]/10 text-[#1a3a1a] dark:text-[#6b8b6b] rounded-xl hover:bg-[#22c55e]/5 dark:hover:bg-[#4ade80]/5 transition-all duration-300 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-[#22c55e] to-[#16a34a] hover:from-[#16a34a] hover:to-[#15803d] text-white rounded-xl transition-all duration-300 hover:scale-[1.02] shadow-lg hover:shadow-[#22c55e]/30 dark:shadow-[#4ade80]/20 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></span>
                  Creating...
                </span>
              ) : (
                'Create Subscription'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateSubscription;