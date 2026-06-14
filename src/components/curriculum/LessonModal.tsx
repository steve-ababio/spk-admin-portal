import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Clock, Video, FileCode, HelpCircle, Save } from 'lucide-react';

interface LessonFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  initialData?: any;
}

export default function LessonModal({ isOpen, onClose, onSave, initialData }: LessonFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    duration: '',
    type: 'Video',
    description: '',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    notes: ''
  });

  useEffect(() => {
    if (isOpen) {
      setFormData(initialData || {
        title: '',
        duration: '',
        type: 'Video',
        description: '',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        notes: ''
      });
    }
  }, [isOpen, initialData]);

  const types = [
    { id: 'Video', icon: Video, color: 'text-secondary' },
    { id: 'Practical Lab', icon: FileCode, color: 'text-tertiary-fixed-variant' },
    { id: 'Quiz', icon: HelpCircle, color: 'text-on-error-container' }
  ];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm overflow-y-auto">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden my-8"
        >
          <div className="p-6 flex justify-between items-center pb-3 bg-white">
            <h3 className="h3 text-primary">{initialData ? 'Edit Lesson' : 'Add New Lesson'}</h3>
            <button onClick={onClose} className="p-2 hover:bg-surface-container-high rounded-lg transition-all">
              <X size={20} />
            </button>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
            <div className="space-y-3">
              <label className="font-semibold text-sm text-[#34405E]">Lesson Title</label>
              <input 
                type="text" 
                autoFocus
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
                className="w-full bg-white border border-gray-400/40 rounded-lg px-4 py-3 body-md focus:ring-2 focus:ring-secondary/20 focus:outline-none transition-all"
                placeholder="e.g. Memory Management Principles"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="">
                <label className="font-semibold mb-1 text-sm text-[#34405E] flex items-center gap-2">
                  <Clock size={14} /> Duration
                </label>
                <input 
                  type="text" 
                  value={formData.duration}
                  onChange={e => setFormData({...formData, duration: e.target.value})}
                  className="w-full bg-white border border-gray-400/40 rounded-lg px-4 py-3 body-md focus:ring-2 focus:ring-secondary/20 focus:outline-none transition-all"
                  placeholder="e.g. 45m or 1h 15m"
                  required
                />
              </div>
              <div className="space-y-3">
                <label className="font-semibold text-sm text-[#34405E]">Content Type</label>
                <select 
                  value={formData.type}
                  onChange={e => setFormData({...formData, type: e.target.value})}
                  className="w-full  bg-white border border-gray-400/40 rounded-lg px-4 py-3 body-md focus:ring-2 focus:ring-secondary/20 focus:outline-none transition-all"
                >
                  {types.map(t => <option key={t.id}>{t.id}</option>)}
                </select>
              </div>
            </div>

            <div className="space-y-3">
              <label className="font-semibold text-sm text-[#34405E]">Video URL / Source</label>
              <input 
                type="text" 
                value={formData.videoUrl} 
                onChange={e => setFormData({...formData, videoUrl: e.target.value})}
                className="w-full  bg-white border placeholder:text-gray-100/30 border-gray-400/40 rounded-lg px-4 py-3 body-md focus:ring-2 focus:ring-secondary/20 focus:outline-none transition-all"
                placeholder="https://..."
                required
              />
            </div>

            <div className="space-y-3">
              <label className="font-semibold text-sm text-[#34405E]">Description</label>
              <textarea 
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                rows={3}
                className="w-full bg-white border border-gray-400/40 rounded-lg px-4 py-3 body-md focus:ring-2 focus:ring-secondary/20 focus:outline-none transition-all resize-none"
                placeholder="Brief summary of the lesson concepts..."
                required
              />
            </div>

            <div className="space-y-3">
              <label className="font-semibold text-sm text-[#34405E]">Notes (Optional)</label>
              <textarea 
                value={formData.notes}
                onChange={e => setFormData({...formData, notes: e.target.value})}
                rows={3}
                className="w-full  bg-white border border-gray-400/40 rounded-lg px-4 py-3 body-md focus:ring-2 focus:ring-secondary/20 focus:outline-none transition-all resize-none"
                placeholder="Study guide or extra notes..."
              />
            </div>

            <div className="flex gap-3 justify-end pt-4">
              <button 
                type="button" 
                onClick={onClose}
                className="px-6 py-2.5 border border-outline-variant rounded-md body-md font-bold text-on-surface-variant hover:bg-black hover:text-white transition-all"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="px-8 py-2.5 bg-black text-white rounded-md body-md font-bold flex items-center gap-2 hover:opacity-90 transition-all shadow-lg shadow-black/20"
              >
                <Save size={18} />
                Save Lesson
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
