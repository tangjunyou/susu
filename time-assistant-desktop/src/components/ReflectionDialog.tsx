import React, { useState, useEffect } from 'react';
import { X, Trash2 } from 'lucide-react';
import { Plan, Reflection } from '../types';
import { reflectionApi } from '../utils/api';
import { getCurrentTimestamp, formatDate } from '../utils/format';

interface ReflectionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  plan: Plan | null;
}

export function ReflectionDialog({ isOpen, onClose, plan }: ReflectionDialogProps) {
  const [content, setContent] = useState('');
  const [reflections, setReflections] = useState<Reflection[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && plan?.id) {
      loadReflections();
    }
  }, [isOpen, plan?.id]);

  const loadReflections = async () => {
    if (!plan?.id) {
      console.warn('无法加载反思: plan.id不存在', plan);
      return;
    }
    
    console.log('加载计划反思, plan_id:', plan.id);
    try {
      const data = await reflectionApi.getReflectionsForPlan(plan.id);
      console.log('反思加载成功, 数量:', data.length);
      setReflections(data);
    } catch (error) {
      console.error('加载反思失败:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      alert('加载反思失败: ' + errorMessage);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('提交反思:', { plan, content: content.trim() });
    
    if (!content.trim()) {
      alert('请输入反思内容');
      return;
    }
    
    if (!plan?.id) {
      console.error('计划ID无效:', plan);
      alert('计划ID无效，无法添加反思');
      return;
    }

    setLoading(true);
    try {
      const reflectionData = {
        planId: Number(plan.id), // 确保是数字类型
        content: content.trim(),
        createdAt: getCurrentTimestamp(),
      };
      
      console.log('发送反思数据:', reflectionData);
      const newId = await reflectionApi.addReflection(reflectionData);
      console.log('反思添加成功, ID:', newId);
      
      setContent('');
      await loadReflections();
    } catch (error) {
      console.error('添加反思失败:', error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : typeof error === 'string' 
          ? error 
          : JSON.stringify(error);
      alert('添加反思失败: ' + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('确定要删除这条反思吗？')) return;

    try {
      await reflectionApi.deleteReflection(id);
      await loadReflections();
    } catch (error) {
      alert(error instanceof Error ? error.message : '删除反思失败');
    }
  };

  if (!isOpen || !plan) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col animate-slide-in">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">计划反思</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{plan.title}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <form onSubmit={handleSubmit} className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              添加新反思
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white mb-2"
              placeholder="记录你的执行反思、收获或改进建议..."
              rows={4}
              required
            />
            <button
              type="submit"
              disabled={loading || !content.trim()}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? '添加中...' : '添加反思'}
            </button>
          </form>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              历史反思 ({reflections.length})
            </h3>
            {reflections.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                还没有反思记录
              </p>
            ) : (
              <div className="space-y-4">
                {reflections.map((reflection) => (
                  <div
                    key={reflection.id}
                    className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(reflection.createdAt)}
                      </span>
                      <button
                        onClick={() => handleDelete(reflection.id!)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
                      {reflection.content}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
