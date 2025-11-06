import React, { useState, useEffect } from 'react';
import { Play, Pause, CheckCircle, Circle, Trash2, MessageSquare, Calendar } from 'lucide-react';
import { Plan, PRIORITY_LABELS, CATEGORY_LABELS, PRIORITY_COLORS, CATEGORY_COLORS } from '../types';
import { formatTimeShort, formatDate, formatDateRange } from '../utils/format';
import { useTimer } from '../hooks/useTimer';
import { reflectionApi } from '../utils/api';

interface PlanCardProps {
  plan: Plan;
  onUpdate: (plan: Plan) => void;
  onDelete: (id: number) => void;
  onReflect: (plan: Plan) => void;
  onClick?: (plan: Plan) => void;
}

export function PlanCard({ plan, onUpdate, onDelete, onReflect, onClick }: PlanCardProps) {
  const { time, isRunning, start, stop, setTime } = useTimer(plan.id || 0, plan.totalTime);
  const isMultiDay = plan.startDate !== plan.endDate;
  const [reflectionCount, setReflectionCount] = useState(0);

  // 加载反思数量
  useEffect(() => {
    const loadReflectionCount = async () => {
      if (plan.id) {
        try {
          const reflections = await reflectionApi.getReflectionsForPlan(plan.id);
          setReflectionCount(reflections.length);
        } catch (error) {
          console.error('加载反思数量失败:', error);
        }
      }
    };
    loadReflectionCount();
  }, [plan.id]);

  const handleToggleComplete = () => {
    onUpdate({ ...plan, completed: !plan.completed });
  };

  const handleToggleTimer = () => {
    if (isRunning) {
      stop();
      onUpdate({ ...plan, totalTime: time });
    } else {
      start();
    }
  };

  const handleDelete = () => {
    if (window.confirm('确定要删除这个计划吗？')) {
      onDelete(plan.id!);
    }
  };

  React.useEffect(() => {
    if (isRunning) {
      const interval = setInterval(() => {
        onUpdate({ ...plan, totalTime: time });
      }, 60000);
      return () => clearInterval(interval);
    }
  }, [isRunning, time]);

  return (
    <div 
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-3 transition-all hover:shadow-lg ${
        plan.completed ? 'opacity-75' : ''
      } ${onClick ? 'cursor-pointer' : ''}`}
      onClick={() => onClick?.(plan)}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-start flex-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleToggleComplete();
            }}
            className="mt-1 mr-3 text-gray-400 hover:text-primary-500 transition-colors"
          >
            {plan.completed ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : (
              <Circle className="w-5 h-5" />
            )}
          </button>
          <div className="flex-1">
            <h3 className={`text-lg font-semibold mb-1 ${
              plan.completed ? 'line-through text-gray-500' : 'text-gray-900 dark:text-white'
            }`}>
              {plan.title}
            </h3>
            {plan.description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                {plan.description}
              </p>
            )}
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-2">
              <Calendar className="w-3 h-3" />
              <span>{formatDateRange(plan.startDate, plan.endDate)}</span>
              {isMultiDay && (
                <span className="px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded">
                  跨天
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-2 mb-2">
              <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium border ${PRIORITY_COLORS[plan.priority]}`}>
                {PRIORITY_LABELS[plan.priority]}
              </span>
              <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium border ${CATEGORY_COLORS[plan.category]}`}>
                {CATEGORY_LABELS[plan.category]}
              </span>
              {reflectionCount > 0 && (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-700 border border-purple-300 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-700">
                  <MessageSquare className="w-3 h-3" />
                  {reflectionCount}条反思
                </span>
              )}
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
              <span>创建于 {formatDate(plan.createdAt)}</span>
              {time > 0 && (
                <span className="font-medium text-primary-600 dark:text-primary-400">
                  累计: {formatTimeShort(time)}
                </span>
              )}
            </div>
          </div>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleDelete();
          }}
          className="text-gray-400 hover:text-red-500 transition-colors ml-2"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleToggleTimer();
          }}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-colors ${
            isRunning
              ? 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900 dark:text-red-200'
              : 'bg-primary-100 text-primary-700 hover:bg-primary-200 dark:bg-primary-900 dark:text-primary-200'
          }`}
        >
          {isRunning ? (
            <>
              <Pause className="w-4 h-4" />
              <span>停止计时</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              <span>开始计时</span>
            </>
          )}
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onReflect(plan);
          }}
          className="flex items-center gap-2 px-3 py-2 rounded-lg font-medium bg-purple-100 text-purple-700 hover:bg-purple-200 transition-colors dark:bg-purple-900 dark:text-purple-200"
        >
          <MessageSquare className="w-4 h-4" />
          <span>添加反思</span>
        </button>
      </div>
    </div>
  );
}
