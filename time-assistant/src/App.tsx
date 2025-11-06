import { useState, useEffect } from 'react'
import { Clock, Plus, Edit3, Trash2, CheckCircle2, Circle, Calendar, Tag, Timer, ChevronDown, ChevronUp } from 'lucide-react'
import './App.css'

interface Plan {
  id: string
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
  category: string
  completed: boolean
  createdAt: string
  completedAt?: string
  timeTracked: number // in minutes
  reflections: Reflection[]
}

interface Reflection {
  id: string
  content: string
  createdAt: string
  timeSpent: number // in minutes
}

function App() {
  const [plans, setPlans] = useState<Plan[]>([])
  const [isExpanded, setIsExpanded] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingPlan, setEditingPlan] = useState<string | null>(null)
  const [newPlan, setNewPlan] = useState({
    title: '',
    description: '',
    priority: 'medium' as const,
    category: '工作'
  })
  const [activeTimer, setActiveTimer] = useState<string | null>(null)
  const [timerStart, setTimerStart] = useState<number>(0)
  const [showReflectionForm, setShowReflectionForm] = useState<string | null>(null)
  const [newReflection, setNewReflection] = useState('')

  // 从 localStorage 加载数据
  useEffect(() => {
    const savedPlans = localStorage.getItem('timeAssistantPlans')
    if (savedPlans) {
      setPlans(JSON.parse(savedPlans))
    }
  }, [])

  // 保存数据到 localStorage
  useEffect(() => {
    localStorage.setItem('timeAssistantPlans', JSON.stringify(plans))
  }, [plans])

  // 计时器功能
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (activeTimer) {
      interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - timerStart) / 1000 / 60)
        setPlans(prev => prev.map(plan => 
          plan.id === activeTimer 
            ? { ...plan, timeTracked: plan.timeTracked + 1 }
            : plan
        ))
      }, 60000) // 每分钟更新一次
    }
    return () => clearInterval(interval)
  }, [activeTimer, timerStart])

  const startTimer = (planId: string) => {
    setActiveTimer(planId)
    setTimerStart(Date.now())
  }

  const stopTimer = () => {
    setActiveTimer(null)
    setTimerStart(0)
  }

  const addPlan = () => {
    if (!newPlan.title.trim()) return
    
    const plan: Plan = {
      id: Date.now().toString(),
      title: newPlan.title,
      description: newPlan.description,
      priority: newPlan.priority,
      category: newPlan.category,
      completed: false,
      createdAt: new Date().toISOString(),
      timeTracked: 0,
      reflections: []
    }
    
    setPlans(prev => [plan, ...prev])
    setNewPlan({ title: '', description: '', priority: 'medium', category: '工作' })
    setShowAddForm(false)
  }

  const togglePlanComplete = (planId: string) => {
    setPlans(prev => prev.map(plan => 
      plan.id === planId 
        ? {
            ...plan,
            completed: !plan.completed,
            completedAt: !plan.completed ? new Date().toISOString() : undefined
          }
        : plan
    ))
  }

  const deletePlan = (planId: string) => {
    setPlans(prev => prev.filter(plan => plan.id !== planId))
  }

  const addReflection = (planId: string) => {
    if (!newReflection.trim()) return
    
    const reflection: Reflection = {
      id: Date.now().toString(),
      content: newReflection,
      createdAt: new Date().toISOString(),
      timeSpent: 0
    }
    
    setPlans(prev => prev.map(plan => 
      plan.id === planId 
        ? { ...plan, reflections: [...plan.reflections, reflection] }
        : plan
    ))
    
    setNewReflection('')
    setShowReflectionForm(null)
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50'
      case 'medium': return 'text-yellow-600 bg-yellow-50'
      case 'low': return 'text-green-600 bg-green-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}小时${mins}分钟` : `${mins}分钟`
  }

  const completedPlans = plans.filter(plan => plan.completed)
  const pendingPlans = plans.filter(plan => !plan.completed)
  const totalTime = plans.reduce((sum, plan) => sum + plan.timeTracked, 0)

  return (
    <div className="time-assistant fixed top-4 right-4 z-50 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden transition-all duration-300">
      {/* 头部 - 始终显示 */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-3 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5" />
            <span className="font-semibold">时间助手</span>
            <span className="text-sm opacity-90">({pendingPlans.length} 待办)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="text-sm">
              总计: {formatTime(totalTime)}
            </div>
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </div>
      </div>

      {/* 展开内容 */}
      {isExpanded && (
        <div className="w-80 max-h-96 overflow-y-auto">
          {/* 统计信息 */}
          <div className="p-3 bg-gray-50 border-b">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="text-center">
                <div className="font-semibold text-blue-600">{pendingPlans.length}</div>
                <div className="text-gray-600">进行中</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-green-600">{completedPlans.length}</div>
                <div className="text-gray-600">已完成</div>
              </div>
            </div>
          </div>

          {/* 添加计划按钮 */}
          <div className="p-3">
            <button
              onClick={() => setShowAddForm(true)}
              className="w-full flex items-center justify-center space-x-2 p-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>添加新计划</span>
            </button>
          </div>

          {/* 添加计划表单 */}
          {showAddForm && (
            <div className="p-3 border-t bg-gray-50">
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="计划标题"
                  value={newPlan.title}
                  onChange={(e) => setNewPlan(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full p-2 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <textarea
                  placeholder="计划描述"
                  value={newPlan.description}
                  onChange={(e) => setNewPlan(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full p-2 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={2}
                />
                <div className="flex space-x-2">
                  <select
                    value={newPlan.priority}
                    onChange={(e) => setNewPlan(prev => ({ ...prev, priority: e.target.value as any }))}
                    className="flex-1 p-2 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="high">高优先级</option>
                    <option value="medium">中优先级</option>
                    <option value="low">低优先级</option>
                  </select>
                  <select
                    value={newPlan.category}
                    onChange={(e) => setNewPlan(prev => ({ ...prev, category: e.target.value }))}
                    className="flex-1 p-2 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="工作">工作</option>
                    <option value="学习">学习</option>
                    <option value="生活">生活</option>
                    <option value="健康">健康</option>
                    <option value="其他">其他</option>
                  </select>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={addPlan}
                    className="flex-1 p-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
                  >
                    添加
                  </button>
                  <button
                    onClick={() => setShowAddForm(false)}
                    className="flex-1 p-2 bg-gray-300 text-gray-700 rounded text-sm hover:bg-gray-400 transition-colors"
                  >
                    取消
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 计划列表 */}
          <div className="space-y-2 p-3">
            {pendingPlans.map(plan => (
              <div key={plan.id} className="border rounded-lg p-3 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <button
                        onClick={() => togglePlanComplete(plan.id)}
                        className="text-gray-400 hover:text-green-600 transition-colors"
                      >
                        <Circle className="w-4 h-4" />
                      </button>
                      <h4 className="font-medium text-sm">{plan.title}</h4>
                    </div>
                    {plan.description && (
                      <p className="text-xs text-gray-600 mb-2">{plan.description}</p>
                    )}
                    <div className="flex items-center space-x-2 mb-2">
                      <span className={`px-2 py-1 text-xs rounded ${getPriorityColor(plan.priority)}`}>
                        {plan.priority === 'high' ? '高' : plan.priority === 'medium' ? '中' : '低'}
                      </span>
                      <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded flex items-center space-x-1">
                        <Tag className="w-3 h-3" />
                        <span>{plan.category}</span>
                      </span>
                      <span className="px-2 py-1 text-xs bg-blue-100 text-blue-600 rounded flex items-center space-x-1">
                        <Timer className="w-3 h-3" />
                        <span>{formatTime(plan.timeTracked)}</span>
                      </span>
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => setShowReflectionForm(plan.id)}
                      className="text-gray-400 hover:text-blue-600 transition-colors"
                      title="添加反思"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deletePlan(plan.id)}
                      className="text-gray-400 hover:text-red-600 transition-colors"
                      title="删除计划"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                {/* 计时器控制 */}
                <div className="mt-2 flex space-x-2">
                  {activeTimer === plan.id ? (
                    <button
                      onClick={stopTimer}
                      className="flex-1 p-1 bg-red-100 text-red-600 rounded text-xs hover:bg-red-200 transition-colors"
                    >
                      停止计时
                    </button>
                  ) : (
                    <button
                      onClick={() => startTimer(plan.id)}
                      className="flex-1 p-1 bg-green-100 text-green-600 rounded text-xs hover:bg-green-200 transition-colors"
                    >
                      开始计时
                    </button>
                  )}
                </div>

                {/* 反思表单 */}
                {showReflectionForm === plan.id && (
                  <div className="mt-3 p-2 bg-gray-50 rounded">
                    <textarea
                      placeholder="记录你的执行反思和心得体会..."
                      value={newReflection}
                      onChange={(e) => setNewReflection(e.target.value)}
                      className="w-full p-2 text-xs border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      rows={2}
                    />
                    <div className="flex space-x-2 mt-2">
                      <button
                        onClick={() => addReflection(plan.id)}
                        className="flex-1 p-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors"
                      >
                        添加反思
                      </button>
                      <button
                        onClick={() => setShowReflectionForm(null)}
                        className="flex-1 p-1 bg-gray-300 text-gray-700 rounded text-xs hover:bg-gray-400 transition-colors"
                      >
                        取消
                      </button>
                    </div>
                  </div>
                )}

                {/* 已有反思 */}
                {plan.reflections.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {plan.reflections.map(reflection => (
                      <div key={reflection.id} className="p-2 bg-blue-50 rounded text-xs">
                        <div className="text-gray-600 mb-1">
                          {new Date(reflection.createdAt).toLocaleString('zh-CN')}
                        </div>
                        <div>{reflection.content}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* 已完成的计划 */}
            {completedPlans.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-semibold text-gray-600 mb-2">已完成计划</h4>
                {completedPlans.map(plan => (
                  <div key={plan.id} className="border rounded-lg p-3 bg-green-50 opacity-75">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <button
                            onClick={() => togglePlanComplete(plan.id)}
                            className="text-green-600 hover:text-gray-600 transition-colors"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                          <h4 className="font-medium text-sm line-through">{plan.title}</h4>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 text-xs rounded ${getPriorityColor(plan.priority)}`}>
                            {plan.priority === 'high' ? '高' : plan.priority === 'medium' ? '中' : '低'}
                          </span>
                          <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded flex items-center space-x-1">
                            <Tag className="w-3 h-3" />
                            <span>{plan.category}</span>
                          </span>
                          <span className="px-2 py-1 text-xs bg-blue-100 text-blue-600 rounded flex items-center space-x-1">
                            <Timer className="w-3 h-3" />
                            <span>{formatTime(plan.timeTracked)}</span>
                          </span>
                        </div>
                        {plan.completedAt && (
                          <div className="text-xs text-gray-500 mt-1">
                            完成于: {new Date(plan.completedAt).toLocaleString('zh-CN')}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => deletePlan(plan.id)}
                        className="text-gray-400 hover:text-red-600 transition-colors"
                        title="删除计划"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    
                    {/* 反思记录 */}
                    {plan.reflections.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {plan.reflections.map(reflection => (
                          <div key={reflection.id} className="p-2 bg-blue-50 rounded text-xs">
                            <div className="text-gray-600 mb-1">
                              {new Date(reflection.createdAt).toLocaleString('zh-CN')}
                            </div>
                            <div>{reflection.content}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {plans.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">还没有计划，添加你的第一个计划吧！</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default App
