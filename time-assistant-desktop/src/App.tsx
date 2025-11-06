import { useState } from 'react';
import { Plus, Settings as SettingsIcon, Filter } from 'lucide-react';
import { Plan } from './types';
import { usePlans } from './hooks/usePlans';
import { PlanCard } from './components/PlanCard';
import { AddPlanDialog } from './components/AddPlanDialog';
import { ReflectionDialog } from './components/ReflectionDialog';
import { SettingsPanel } from './components/SettingsPanel';
import { PlanDetailDialog } from './components/PlanDetailDialog';

function App() {
  const { plans, loading, error, addPlan, updatePlan, deletePlan } = usePlans();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [reflectionPlan, setReflectionPlan] = useState<Plan | null>(null);
  const [detailPlan, setDetailPlan] = useState<Plan | null>(null);
  const [alwaysOnTop, setAlwaysOnTop] = useState(false);
  const [isCompactMode, setIsCompactMode] = useState(false);
  const [filterCompleted, setFilterCompleted] = useState<'all' | 'active' | 'completed'>('all');

  // 置顶时自动进入紧凑模式
  const handleToggleAlwaysOnTop = (value: boolean) => {
    setAlwaysOnTop(value);
    setIsCompactMode(value);
  };

  // 紧凑模式下只显示未完成的计划
  const filteredPlans = plans.filter((plan) => {
    if (isCompactMode) return !plan.completed; // 紧凑模式只显示进行中
    if (filterCompleted === 'active') return !plan.completed;
    if (filterCompleted === 'completed') return plan.completed;
    return true;
  });

  const stats = {
    total: plans.length,
    active: plans.filter((p) => !p.completed).length,
    completed: plans.filter((p) => p.completed).length,
    totalTime: plans.reduce((sum, p) => sum + p.totalTime, 0),
  };

  return (
    <div className={`${isCompactMode ? '' : 'min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800'}`}>
      <div className={`${isCompactMode ? 'max-w-md' : 'max-w-4xl'} mx-auto ${isCompactMode ? 'p-0' : 'p-4'}`}>
        {isCompactMode ? (
          // 超紧凑模式：只显示任务列表
          <div className="bg-white dark:bg-gray-800">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800 p-2">
                <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}
            {loading ? (
              <div className="text-center py-6">
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
                <p className="mt-2 text-xs text-gray-500">加载中...</p>
              </div>
            ) : filteredPlans.length === 0 ? (
              <div className="text-center py-6 px-4">
                <p className="text-xs text-gray-500">没有进行中的任务</p>
              </div>
            ) : (
              <div className="p-2 space-y-2">
                {filteredPlans.map((plan) => (
                  <PlanCard
                    key={plan.id}
                    plan={plan}
                    onUpdate={updatePlan}
                    onDelete={deletePlan}
                    onReflect={setReflectionPlan}
                    onClick={setDetailPlan}
                  />
                ))}
              </div>
            )}
            {/* 紧凑模式的迷你设置按钮 */}
            <button
              onClick={() => setShowSettings(true)}
              className="fixed top-2 right-2 p-1.5 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full shadow-md transition-colors z-10"
              title="设置"
            >
              <SettingsIcon className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          // 完整模式
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  时间助手
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  高效管理你的时间和计划
                </p>
              </div>
              <button
                onClick={() => setShowSettings(true)}
                className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <SettingsIcon className="w-5 h-5" />
              </button>
            </div>

          {!isCompactMode && (
            <div className="grid grid-cols-4 gap-4 mb-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {stats.total}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">总计划</div>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {stats.active}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">进行中</div>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {stats.completed}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">已完成</div>
            </div>
            <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3">
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {Math.floor(stats.totalTime / 3600)}h
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">累计时间</div>
            </div>
          </div>
          )}

          {!isCompactMode && (
            <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              <select
                value={filterCompleted}
                onChange={(e) => setFilterCompleted(e.target.value as any)}
                className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="all">全部计划</option>
                <option value="active">进行中</option>
                <option value="completed">已完成</option>
              </select>
            </div>
            <button
              onClick={() => setShowAddDialog(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>添加计划</span>
            </button>
          </div>
          )}

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
              <p className="text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-primary-600"></div>
              <p className="mt-2 text-gray-600 dark:text-gray-400">加载中...</p>
            </div>
          ) : filteredPlans.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-12 text-center">
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                {filterCompleted === 'all' ? '还没有计划，点击上方按钮添加第一个计划吧' : 
                 filterCompleted === 'active' ? '没有进行中的计划' : '没有已完成的计划'}
              </p>
            </div>
          ) : (
            <div>
              {filteredPlans.map((plan) => (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  onUpdate={updatePlan}
                  onDelete={deletePlan}
                  onReflect={setReflectionPlan}
                  onClick={setDetailPlan}
                />
              ))}
            </div>
          )}
          </div>
        )}
      </div>

      <AddPlanDialog
        isOpen={showAddDialog}
        onClose={() => setShowAddDialog(false)}
        onAdd={addPlan}
      />

      <ReflectionDialog
        isOpen={!!reflectionPlan}
        onClose={() => setReflectionPlan(null)}
        plan={reflectionPlan}
      />

      <PlanDetailDialog
        isOpen={!!detailPlan}
        onClose={() => setDetailPlan(null)}
        plan={detailPlan}
        onReflect={() => {
          if (detailPlan) {
            setReflectionPlan(detailPlan);
            setDetailPlan(null);
          }
        }}
      />

      <SettingsPanel
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        alwaysOnTop={alwaysOnTop}
        onToggleAlwaysOnTop={handleToggleAlwaysOnTop}
      />
    </div>
  );
}

export default App;
