import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Save, Layers, Clock, Hash } from 'lucide-react';

interface ModuleFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  initialData?: any;
}

export default function ModuleModal({ isOpen, onClose, onSave, initialData }: ModuleFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    order: 1,
    estimatedTime: '',
    moduleDetails: '',
    lessons: []
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        order: initialData.order || 1,
        estimatedTime: initialData.estimatedTime || initialData.duration || '',
        moduleDetails: initialData.moduleDetails || initialData.description || '',
        lessons: initialData.lessons || []
      });
    } else {
      setFormData({
        title: '',
        order: 1,
        estimatedTime: '',
        moduleDetails: '',
        lessons: []
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white rounded-xl w-full max-w-md shadow-soft-md overflow-hidden"
        >
          <div className="p-6 flex justify-between items-center">
            <h3 className="h3 text-primary">{initialData ? 'Edit Module' : 'Create New Module'}</h3>
            <button onClick={onClose} className="p-2 hover:bg-surface-container-high rounded-lg transition-all">
              <X size={20} />
            </button>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }} className="p-6 space-y-5">
            <div className="space-y-2">
              <label className="font-semibold text-sm text-[#34405E] flex items-center gap-2">
                <Layers size={14} className="text-[#34405E]" /> Module Title
              </label>
              <input 
                type="text" 
                autoFocus
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
                className="w-full bg-white border border-gray-400/40 rounded-lg px-4 py-3 body-md focus:ring-2 focus:ring-black/50 focus:outline-none transition-all"
                placeholder="e.g. Distributed Computing Fundamentals"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="font-semibold text-sm text-[#34405E] flex items-center gap-2">
                  <Hash size={14} /> Display Order
                </label>
                <input 
                  type="number" 
                  value={formData.order}
                  onChange={e => setFormData({...formData, order: Number(e.target.value)})}
                  className="w-full bg-white border border-gray-400/40 rounded-lg px-4 py-3 body-md focus:ring-2 focus:ring-black/50 focus:outline-none transition-all"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="font-semibold text-sm text-[#34405E] flex items-center gap-2">
                  <Clock size={14} /> Estimated Time
                </label>
                <input 
                  type="text" 
                  value={formData.estimatedTime}
                  onChange={e => setFormData({...formData, estimatedTime: e.target.value})}
                  className="w-full bg-white border border-gray-400/40 rounded-lg px-4 py-3 body-md focus:ring-2 focus:ring-black/50 focus:outline-none transition-all"
                  placeholder="e.g. 5h 30m"
                  required
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="font-semibold text-sm text-[#34405E]">Module Details (Optional)</label>
              <textarea 
                value={formData.moduleDetails}
                onChange={e => setFormData({...formData, moduleDetails: e.target.value})}
                rows={3}
                className="w-full bg-white border border-gray-400/40 rounded-lg px-4 py-3 body-md focus:ring-2 focus:ring-black/50 focus:outline-none transition-all resize-none"
                placeholder="Briefly describe what this module covers..."
              />
            </div>

            <div className="flex gap-3 justify-end pt-4">
              <button 
                type="button" 
                onClick={onClose}
                className="px-6 py-2.5 bg-white border border-gray-400/40 rounded-md body-md font-bold text-on-surface-variant hover:text-white cursor-pointer hover:bg-black transition-all"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="px-8 py-2.5 bg-black text-white rounded-md body-md font-bold flex items-center gap-2 hover:opacity-90 transition-all cursor-pointer shadow-lg shadow-black/20"
              >
                <Save size={18} />
                {initialData ? 'Update Module' : 'Add Module'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
