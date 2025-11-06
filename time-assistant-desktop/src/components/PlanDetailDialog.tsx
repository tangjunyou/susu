import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, Tag, FolderOpen, MessageSquare } from 'lucide-react';
import { Plan, Reflection } from '../types';
import { formatTimeShort, formatDateRange, formatDate } from '../utils/format';
import { PRIORITY_LABELS, PRIORITY_COLORS, CATEGORY_LABELS, CATEGORY_COLORS } from '../types';
import { reflectionApi } from '../utils/api';

interface PlanDetailDialogProps {
  isOpen: boolean;
  onClose: () => void;
  plan: Plan | null;
  onStartTimer?: () => void;
  onReflect?: () => void;
}

export function PlanDetailDialog({ 
  isOpen, 
  onClose, 
  plan, 
  onStartTimer,
  onReflect 
}: PlanDetailDialogProps) {
  const [recentReflections, setRecentReflections] = useState<Reflection[]>([]);

  // 加载最近的反思
  useEffect(() => {
    const loadReflections = async () => {
      if (plan?.id) {
        try {
          const reflections = await reflectionApi.getReflectionsForPlan(plan.id);
          // 只取最近的3条
          setRecentReflections(reflections.slice(0, 3));
        } catch (error) {
          console.error('加载反思失败:', error);
        }
      }
    };
    
    if (isOpen && plan) {
      loadReflections();
    }
  }, [isOpen, plan?.id]);

  if (!isOpen || !plan) return null;

  const isMultiDay = plan.startDate !== plan.endDate;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col animate-slide-in">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {plan.title}
            </h2>
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium border ${PRIORITY_COLORS[plan.priority]}`}>
                {PRIORITY_LABELS[plan.priority]}
              </span>
              <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium border ${CATEGORY_COLORS[plan.category]}`}>
                {CATEGORY_LABELS[plan.category]}
              </span>
              {plan.completed && (
                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-700 border border-green-300">
                  ✓ 已完成
                </span>
              )}
              {isMultiDay && (
                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-700 border border-blue-300">
                  📅 跨天任务
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {/* 日期信息 */}
          <div className="mb-6">
            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 mb-2">
              <Calendar className="w-5 h-5" />
              <span className="font-medium">时间范围</span>
            </div>
            <div className="ml-7 text-gray-600 dark:text-gray-400">
              {formatDateRange(plan.startDate, plan.endDate)}
            </div>
          </div>

          {/* 累计时间 */}
          <div className="mb-6">
            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 mb-2">
              <Clock className="w-5 h-5" />
              <span className="font-medium">累计时间</span>
            </div>
            <div className="ml-7">
              {plan.totalTime > 0 ? (
                <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                  {formatTimeShort(plan.totalTime)}
                </span>
              ) : (
                <span className="text-gray-500 dark:text-gray-400">尚未开始计时</span>
              )}
            </div>
          </div>

          {/* 描述 */}
          {plan.description && (
            <div className="mb-6">
              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 mb-2">
                <FolderOpen className="w-5 h-5" />
                <span className="font-medium">详细描述</span>
              </div>
              <div className="ml-7 text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                {plan.description}
              </div>
            </div>
          )}

          {/* 最近反思 */}
          {recentReflections.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 mb-2">
                <MessageSquare className="w-5 h-5" />
                <span className="font-medium">最近反思</span>
                <span className="text-xs text-gray-500">（共{recentReflections.length > 3 ? '3+' : recentReflections.length}条）</span>
              </div>
              <div className="ml-7 space-y-3">
                {recentReflections.map((reflection) => (
                  <div key={reflection.id} className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                    <div className="text-xs text-purple-600 dark:text-purple-400 mb-1">
                      {formatDate(reflection.createdAt)}
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {reflection.content}
                    </p>
                  </div>
                ))}
                <button
                  onClick={onReflect}
                  className="text-xs text-purple-600 dark:text-purple-400 hover:underline"
                >
                  查看全部反思 →
                </button>
              </div>
            </div>
          )}

          {/* 状态信息 */}
          <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">创建时间</div>
                <div className="text-sm text-gray-900 dark:text-white">
                  {new Date(plan.createdAt).toLocaleString('zh-CN')}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">最后更新</div>
                <div className="text-sm text-gray-900 dark:text-white">
                  {new Date(plan.updatedAt).toLocaleString('zh-CN')}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 底部操作按钮 */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          {!plan.completed && onStartTimer && (
            <button
              onClick={() => {
                onStartTimer();
                onClose();
              }}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              开始计时
            </button>
          )}
          {onReflect && (
            <button
              onClick={() => {
                onReflect();
                onClose();
              }}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              添加反思
            </button>
          )}
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
}

