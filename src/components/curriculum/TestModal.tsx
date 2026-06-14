import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Save, Plus, Trash2, HelpCircle, Check, Clock, ShieldAlert } from 'lucide-react';
import { testService } from '@/src/services/testService';

interface TestModalProps {
  isOpen: boolean;
  onClose: () => void;
  moduleId: string;
  moduleTitle: string;
  onSaveSuccess: () => void;
}

interface Option {
  id: string;
  text: string;
  points: number;
  isCorrect: boolean;
}

interface Question {
  id: string;
  text: string;
  options: Option[];
}

export default function TestModal({ isOpen, onClose, moduleId, moduleTitle, onSaveSuccess }: TestModalProps) {
  const [loading, setLoading] = useState(true);
  const [testId, setTestId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [timeLimit, setTimeLimit] = useState(15);
  const [allowedAttempts, setAllowedAttempts] = useState(3);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen && moduleId) {
      loadTest();
    }
  }, [isOpen, moduleId]);

  const loadTest = async () => {
    try {
      setLoading(true);
      const test = await testService.getTestByModule(moduleId);
      if (test) {
        setTestId(test.id);
        setTitle(test.title || '');
        setTimeLimit(test.timeLimit || 15);
        setAllowedAttempts(test.allowedAttempts || 3);
        setQuestions(test.questions || []);
      } else {
        // Default new test layout
        setTestId(null);
        setTitle(`${moduleTitle} Quiz`);
        setTimeLimit(15);
        setAllowedAttempts(3);
        setQuestions([
          {
            id: `temp-${Date.now()}`,
            text: 'Sample Question: What is the primary role of a Sentinel in system monitoring?',
            options: [
              { id: '1', text: 'To encrypt communications between nodes', points: 0, isCorrect: false },
              { id: '2', text: 'To actively scan, intercept, and block unauthorized traffic anomalies in real-time', points: 10, isCorrect: true },
              { id: '3', text: 'To store transaction history records in cold storage logs', points: 0, isCorrect: false },
              { id: '4', text: 'To deploy cloud servers on-demand automatically', points: 0, isCorrect: false }
            ]
          }
        ]);
      }
    } catch (err) {
      console.error('Failed to load test:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddQuestion = () => {
    const newQ: Question = {
      id: `temp-${Date.now()}`,
      text: 'New Question text...',
      options: [
        { id: '1', text: 'Option A', points: 0, isCorrect: false },
        { id: '2', text: 'Option B', points: 0, isCorrect: false },
        { id: '3', text: 'Option C', points: 0, isCorrect: false },
        { id: '4', text: 'Option D', points: 0, isCorrect: false }
      ]
    };
    setQuestions([...questions, newQ]);
  };

  const handleRemoveQuestion = (index: number) => {
    const updated = [...questions];
    updated.splice(index, 1);
    setQuestions(updated);
  };

  const handleQuestionTextChange = (index: number, text: string) => {
    const updated = [...questions];
    updated[index].text = text;
    setQuestions(updated);
  };

  const handleOptionChange = (qIndex: number, optIndex: number, field: keyof Option, value: any) => {
    const updated = [...questions];
    const option = updated[qIndex].options[optIndex];

    if (field === 'isCorrect') {
      // If setting this option correct, set others incorrect (single-choice style but keep points)
      updated[qIndex].options.forEach((opt, idx) => {
        opt.isCorrect = idx === optIndex ? !!value : false;
        if (idx === optIndex && value) {
          opt.points = opt.points || 10; // default to 10 points for correct
        } else if (idx !== optIndex) {
          opt.points = 0; // standard correct choice model
        }
      });
    } else {
      (option as any)[field] = value;
    }
    setQuestions(updated);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await testService.saveTest({
        id: testId || undefined,
        title,
        timeLimit,
        allowedAttempts,
        moduleId,
        questions
      });
      onSaveSuccess();
      onClose();
    } catch (err) {
      console.error('Failed to save test:', err);
      alert('Failed to save test.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!testId) return;
    if (confirm('Are you sure you want to completely delete this test/quiz from the lesson?')) {
      try {
        setSaving(true);
        await testService.deleteTest(testId);
        onSaveSuccess();
        onClose();
      } catch (err) {
        console.error('Failed to delete test:', err);
        alert('Failed to delete test.');
      } finally {
        setSaving(false);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/45 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden my-8 border border-outline-variant"
        >
          {/* Header */}
          <div className="p-6 border-b border-b-gray-400/60 flex justify-between items-center">
            <div>
              <h3 className="h3 text-primary flex items-center gap-2">
                <HelpCircle className="text-secondary" size={22} />
                Manage Module Quiz
              </h3>
              <p className="text-xs text-on-surface-variant font-medium mt-1">Module: {moduleTitle}</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-surface-container-high rounded-lg transition-all">
              <X size={20} />
            </button>
          </div>

          {loading ? (
            <div className="p-12 text-center text-primary font-bold">
              Loading Quiz configuration...
            </div>
          ) : (
            <form onSubmit={handleSave} className="flex flex-col h-[70vh]">
              {/* Form Content */}
              <div className="flex-1 p-6 space-y-6 overflow-y-auto max-h-[60vh] bg-white">
                {/* General quiz settings */}
                <div className="bg-white rounded-xl p-5 border border-gray-200/60 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2 col-span-1 md:col-span-3">
                    <label className="font-bold text-sm text-[#34405E]">Quiz Title</label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full bg-white border border-gray-400/40 rounded-lg px-4 py-2.5 body-md focus:ring-2 focus:ring-secondary/20 focus:outline-none transition-all"
                      placeholder="e.g. End of Lesson Quiz"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="font-bold text-sm text-[#34405E] flex items-center gap-1.5">
                      <Clock size={15} /> Time Limit (mins)
                    </label>
                    <input
                      type="number"
                      value={timeLimit}
                      onChange={(e) => setTimeLimit(Number(e.target.value))}
                      className="w-full bg-white border border-gray-400/40 rounded-lg px-4 py-2.5 body-md focus:ring-2 focus:ring-secondary/20 focus:outline-none transition-all"
                      min={1}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="font-bold text-sm text-[#34405E]">Allowed Attempts</label>
                    <input
                      type="number"
                      value={allowedAttempts}
                      onChange={(e) => setAllowedAttempts(Number(e.target.value))}
                      className="w-full bg-white border border-gray-400/40 rounded-lg px-4 py-2.5 body-md focus:ring-2 focus:ring-secondary/20 focus:outline-none transition-all"
                      min={1}
                      required
                    />
                  </div>
                  {testId && (
                    <div className="flex items-end justify-start md:justify-end">
                      <button
                        type="button"
                        onClick={handleDelete}
                        className="w-full md:w-auto px-4 py-2.5 bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 rounded-lg text-sm font-bold flex items-center justify-center gap-1.5 transition-all"
                      >
                        <Trash2 size={16} /> Delete Quiz
                      </button>
                    </div>
                  )}
                </div>

                {/* Questions Header */}
                <div className="flex justify-between items-center pt-2">
                  <h4 className="h4 text-[#34405E] font-extrabold flex items-center gap-2">
                    Questions ({questions.length})
                  </h4>
                  <button
                    type="button"
                    onClick={handleAddQuestion}
                    className="px-4 py-2 bg-black text-white hover:bg-gray-800 rounded-lg text-sm font-bold flex items-center gap-1.5 transition-all"
                  >
                    <Plus size={16} /> Add Question
                  </button>
                </div>

                {/* Questions List */}
                <div className="space-y-5">
                  {questions.map((q, qIndex) => (
                    <div key={q.id || qIndex} className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm relative space-y-4">
                      {/* Close / Remove Question button */}
                      <button
                        type="button"
                        onClick={() => handleRemoveQuestion(qIndex)}
                        className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        title="Remove Question"
                      >
                        <Trash2 size={16} />
                      </button>

                      {/* Question Index & Text */}
                      <div className="space-y-2 pr-8">
                        <label className="font-bold text-sm text-[#34405E] uppercase tracking-wider">
                          Question {qIndex + 1}
                        </label>
                        <input
                          type="text"
                          value={q.text}
                          onChange={(e) => handleQuestionTextChange(qIndex, e.target.value)}
                          className="w-full bg-white border border-gray-400/40 rounded-lg px-4 py-2.5 body-md focus:ring-2 focus:ring-secondary/20 focus:outline-none transition-all font-semibold text-primary"
                          placeholder="Type your question..."
                          required
                        />
                      </div>

                      {/* Options */}
                      <div className="space-y-2.5">
                        <span className="block font-bold text-xs uppercase tracking-wider text-[#7A8B9E]">
                          Answer Options & Grading Points
                        </span>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                          {q.options.map((opt, optIndex) => (
                            <div key={opt.id || optIndex} className="flex items-center gap-2 bg-[#FAFBFD] p-3 rounded-lg border border-gray-200/50 hover:border-gray-300 transition-all">
                              <input
                                type="checkbox"
                                checked={opt.isCorrect}
                                onChange={(e) => handleOptionChange(qIndex, optIndex, 'isCorrect', e.target.checked)}
                                className="w-4 h-4 rounded text-black focus:ring-black border-gray-300 cursor-pointer"
                                id={`q-${qIndex}-opt-${optIndex}-correct`}
                              />
                              <input
                                type="text"
                                value={opt.text}
                                onChange={(e) => handleOptionChange(qIndex, optIndex, 'text', e.target.value)}
                                className="flex-1 bg-transparent border-b border-dashed border-gray-300 focus:border-black focus:outline-none text-sm px-1 py-0.5"
                                placeholder={`Option ${optIndex + 1}`}
                                required
                              />
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                <input
                                  type="number"
                                  value={opt.points}
                                  onChange={(e) => handleOptionChange(qIndex, optIndex, 'points', Number(e.target.value))}
                                  className="w-12 bg-white border border-gray-200 rounded px-1.5 py-0.5 text-center text-xs text-primary font-bold focus:outline-none focus:ring-1 focus:ring-black"
                                  min={0}
                                />
                                <span>pts</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}

                  {questions.length === 0 && (
                    <div className="p-8 text-center text-gray-400 bg-white border border-dashed border-gray-200 rounded-xl">
                      No questions added yet. Click "Add Question" to start.
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-5 border-t border-gray-400/60 flex justify-between items-center bg-white">
                <span className="text-xs text-gray-400 flex items-center gap-1.5">
                  <ShieldAlert size={14} /> Ensure exactly one correct answer is checked per question.
                </span>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-6 py-2.5 border border-outline-variant rounded-md text-sm font-bold text-on-surface-variant hover:bg-gray-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-8 py-2.5 bg-black text-white rounded-md text-sm font-bold flex items-center gap-2 hover:opacity-90 disabled:opacity-50 transition-all shadow-lg"
                  >
                    <Save size={18} />
                    {saving ? 'Saving...' : 'Save Quiz'}
                  </button>
                </div>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
