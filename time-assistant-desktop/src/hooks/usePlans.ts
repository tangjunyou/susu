import { useState, useEffect } from 'react';
import { Plan } from '../types';
import { planApi } from '../utils/api';
import { getCurrentTimestamp } from '../utils/format';

export function usePlans() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPlans = async () => {
    try {
      setLoading(true);
      const data = await planApi.getAllPlans();
      setPlans(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载计划失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlans();
  }, []);

  const addPlan = async (plan: Omit<Plan, 'id'>) => {
    try {
      const id = await planApi.addPlan(plan);
      await loadPlans();
      return id;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : '添加计划失败');
    }
  };

  const updatePlan = async (plan: Plan) => {
    try {
      await planApi.updatePlan({ ...plan, updatedAt: getCurrentTimestamp() });
      await loadPlans();
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : '更新计划失败');
    }
  };

  const deletePlan = async (id: number) => {
    try {
      await planApi.deletePlan(id);
      await loadPlans();
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : '删除计划失败');
    }
  };

  return {
    plans,
    loading,
    error,
    loadPlans,
    addPlan,
    updatePlan,
    deletePlan,
  };
}
