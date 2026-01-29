import { supabase } from './supabase';

// Helper to convert snake_case to camelCase
function toCamelCase(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) return obj.map(toCamelCase);
  if (typeof obj !== 'object') return obj;
  
  const newObj: any = {};
  for (const key in obj) {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    newObj[camelKey] = toCamelCase(obj[key]);
  }
  return newObj;
}

// Helper to convert camelCase to snake_case
function toSnakeCase(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) return obj.map(toSnakeCase);
  if (typeof obj !== 'object') return obj;
  
  const newObj: any = {};
  for (const key in obj) {
    const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    newObj[snakeKey] = toSnakeCase(obj[key]);
  }
  return newObj;
}

// Database operations
export const db = {
  // Organizations
  organizations: {
    async create(data: { name: string }) {
      const { data: org, error } = await supabase
        .from('organizations')
        .insert(toSnakeCase(data))
        .select()
        .single();
      if (error) throw error;
      return toCamelCase(org);
    },
    async getById(id: string) {
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return toCamelCase(data);
    },
  },

  // Users
  users: {
    async create(data: {
      organizationId: string;
      email: string;
      password: string;
      name: string;
      role: string;
    }) {
      const { data: user, error } = await supabase
        .from('users')
        .insert(toSnakeCase(data))
        .select()
        .single();
      if (error) throw error;
      return toCamelCase(user);
    },
    async getByEmail(email: string) {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email);
      if (error) throw error;
      return data?.map(toCamelCase) || [];
    },
    async getByEmailAndOrg(email: string, organizationId: string) {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .eq('organization_id', organizationId)
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      return data ? toCamelCase(data) : null;
    },
    async getById(id: string) {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return toCamelCase(data);
    },
    async getByOrganization(organizationId: string) {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('organization_id', organizationId);
      if (error) throw error;
      return data?.map(toCamelCase) || [];
    },
    async update(id: string, data: Partial<{ email: string; password: string; name: string; role: string }>) {
      const { data: user, error } = await supabase
        .from('users')
        .update(toSnakeCase(data))
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return toCamelCase(user);
    },
    async delete(id: string) {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
  },

  // Tasks
  tasks: {
    async create(data: any) {
      const { data: task, error } = await supabase
        .from('tasks')
        .insert(toSnakeCase(data))
        .select()
        .single();
      if (error) throw error;
      return toCamelCase(task);
    },
    async getByOrganization(organizationId: string) {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('organization_id', organizationId);
      if (error) throw error;
      return data?.map(toCamelCase) || [];
    },
    async getById(id: string) {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return toCamelCase(data);
    },
    async update(id: string, data: any) {
      const updateData = { ...toSnakeCase(data), updated_at: new Date().toISOString() };
      const { data: task, error } = await supabase
        .from('tasks')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return toCamelCase(task);
    },
    async delete(id: string) {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
  },

  // Annual Goals
  annualGoals: {
    async create(data: any) {
      const { data: goal, error } = await supabase
        .from('annual_goals')
        .insert(toSnakeCase(data))
        .select()
        .single();
      if (error) throw error;
      return toCamelCase(goal);
    },
    async getByOrganization(organizationId: string) {
      const { data, error } = await supabase
        .from('annual_goals')
        .select('*')
        .eq('organization_id', organizationId);
      if (error) throw error;
      return data?.map(toCamelCase) || [];
    },
    async getById(id: string) {
      const { data, error } = await supabase
        .from('annual_goals')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return toCamelCase(data);
    },
    async update(id: string, data: any) {
      const updateData = { ...toSnakeCase(data), updated_at: new Date().toISOString() };
      const { data: goal, error } = await supabase
        .from('annual_goals')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return toCamelCase(goal);
    },
    async delete(id: string) {
      const { error } = await supabase
        .from('annual_goals')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
  },

  // MBO Goals
  mboGoals: {
    async create(data: any) {
      const { data: goal, error } = await supabase
        .from('mbo_goals')
        .insert(toSnakeCase(data))
        .select()
        .single();
      if (error) throw error;
      return toCamelCase(goal);
    },
    async getByOrganization(organizationId: string) {
      const { data, error } = await supabase
        .from('mbo_goals')
        .select('*')
        .eq('organization_id', organizationId);
      if (error) throw error;
      return data?.map(toCamelCase) || [];
    },
    async getById(id: string) {
      const { data, error } = await supabase
        .from('mbo_goals')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return toCamelCase(data);
    },
    async getByAnnualGoal(annualGoalId: string) {
      const { data, error } = await supabase
        .from('mbo_goals')
        .select('*')
        .eq('annual_goal_id', annualGoalId);
      if (error) throw error;
      return data?.map(toCamelCase) || [];
    },
    async update(id: string, data: any) {
      const updateData = { ...toSnakeCase(data), updated_at: new Date().toISOString() };
      const { data: goal, error } = await supabase
        .from('mbo_goals')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return toCamelCase(goal);
    },
    async delete(id: string) {
      const { error } = await supabase
        .from('mbo_goals')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
  },

  // KPIs
  kpis: {
    async create(data: any) {
      const { data: kpi, error } = await supabase
        .from('kpis')
        .insert(toSnakeCase(data))
        .select()
        .single();
      if (error) throw error;
      return toCamelCase(kpi);
    },
    async getByOrganization(organizationId: string) {
      const { data, error } = await supabase
        .from('kpis')
        .select('*')
        .eq('organization_id', organizationId);
      if (error) throw error;
      return data?.map(toCamelCase) || [];
    },
    async getById(id: string) {
      const { data, error } = await supabase
        .from('kpis')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return toCamelCase(data);
    },
    async update(id: string, data: any) {
      const updateData = { ...toSnakeCase(data), updated_at: new Date().toISOString() };
      const { data: kpi, error } = await supabase
        .from('kpis')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return toCamelCase(kpi);
    },
    async delete(id: string) {
      const { error } = await supabase
        .from('kpis')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
  },

  // Vacation Plans
  vacationPlans: {
    async create(data: any) {
      const { data: plan, error } = await supabase
        .from('vacation_plans')
        .insert(toSnakeCase(data))
        .select()
        .single();
      if (error) throw error;
      return toCamelCase(plan);
    },
    async getByOrganization(organizationId: string) {
      const { data, error } = await supabase
        .from('vacation_plans')
        .select('*')
        .eq('organization_id', organizationId);
      if (error) throw error;
      return data?.map(toCamelCase) || [];
    },
    async getById(id: string) {
      const { data, error } = await supabase
        .from('vacation_plans')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return toCamelCase(data);
    },
    async update(id: string, data: any) {
      const updateData = { ...toSnakeCase(data), updated_at: new Date().toISOString() };
      const { data: plan, error } = await supabase
        .from('vacation_plans')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return toCamelCase(plan);
    },
    async delete(id: string) {
      const { error } = await supabase
        .from('vacation_plans')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
  },

  // Training Plans
  trainingPlans: {
    async create(data: any) {
      const { data: plan, error } = await supabase
        .from('training_plans')
        .insert(toSnakeCase(data))
        .select()
        .single();
      if (error) throw error;
      return toCamelCase(plan);
    },
    async getByOrganization(organizationId: string) {
      const { data, error } = await supabase
        .from('training_plans')
        .select('*')
        .eq('organization_id', organizationId);
      if (error) throw error;
      return data?.map(toCamelCase) || [];
    },
    async getById(id: string) {
      const { data, error } = await supabase
        .from('training_plans')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return toCamelCase(data);
    },
    async update(id: string, data: any) {
      const updateData = { ...toSnakeCase(data), updated_at: new Date().toISOString() };
      const { data: plan, error } = await supabase
        .from('training_plans')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return toCamelCase(plan);
    },
    async delete(id: string) {
      const { error } = await supabase
        .from('training_plans')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
  },

  // Comments
  comments: {
    async create(data: any) {
      const { data: comment, error } = await supabase
        .from('comments')
        .insert(toSnakeCase(data))
        .select()
        .single();
      if (error) throw error;
      return toCamelCase(comment);
    },
    async getByTask(taskId: string) {
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('task_id', taskId);
      if (error) throw error;
      return data?.map(toCamelCase) || [];
    },
    async getByVacationPlan(vacationPlanId: string) {
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('vacation_plan_id', vacationPlanId);
      if (error) throw error;
      return data?.map(toCamelCase) || [];
    },
    async getByTrainingPlan(trainingPlanId: string) {
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('training_plan_id', trainingPlanId);
      if (error) throw error;
      return data?.map(toCamelCase) || [];
    },
    async deleteByTask(taskId: string) {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('task_id', taskId);
      if (error) throw error;
    },
  },

  // Calendar Events
  calendarEvents: {
    async create(data: any) {
      const { data: event, error } = await supabase
        .from('calendar_events')
        .insert(toSnakeCase(data))
        .select()
        .single();
      if (error) throw error;
      return toCamelCase(event);
    },
    async getByOrganization(organizationId: string) {
      const { data, error } = await supabase
        .from('calendar_events')
        .select('*')
        .eq('organization_id', organizationId);
      if (error) throw error;
      return data?.map(toCamelCase) || [];
    },
    async getById(id: string) {
      const { data, error } = await supabase
        .from('calendar_events')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return toCamelCase(data);
    },
    async update(id: string, data: any) {
      const updateData = { ...toSnakeCase(data), updated_at: new Date().toISOString() };
      const { data: event, error } = await supabase
        .from('calendar_events')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return toCamelCase(event);
    },
    async delete(id: string) {
      const { error } = await supabase
        .from('calendar_events')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
  },

  // Proposals
  proposals: {
    async create(data: any) {
      const { data: proposal, error } = await supabase
        .from('proposals')
        .insert(toSnakeCase(data))
        .select()
        .single();
      if (error) throw error;
      return toCamelCase(proposal);
    },
    async getByOrganization(organizationId: string) {
      const { data, error } = await supabase
        .from('proposals')
        .select('*')
        .eq('organization_id', organizationId);
      if (error) throw error;
      return data?.map(toCamelCase) || [];
    },
    async getById(id: string) {
      const { data, error } = await supabase
        .from('proposals')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return toCamelCase(data);
    },
    async update(id: string, data: any) {
      const updateData = { ...toSnakeCase(data), updated_at: new Date().toISOString() };
      const { data: proposal, error } = await supabase
        .from('proposals')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return toCamelCase(proposal);
    },
    async delete(id: string) {
      const { error } = await supabase
        .from('proposals')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
  },

  // Weekly Updates
  weeklyUpdates: {
    async create(data: any) {
      const { data: update, error } = await supabase
        .from('weekly_updates')
        .insert(toSnakeCase(data))
        .select()
        .single();
      if (error) throw error;
      return toCamelCase(update);
    },
    async getByOrganization(organizationId: string) {
      const { data, error } = await supabase
        .from('weekly_updates')
        .select('*')
        .eq('organization_id', organizationId)
        .order('week_start_date', { ascending: false });
      if (error) throw error;
      return data?.map(toCamelCase) || [];
    },
    async getById(id: string) {
      const { data, error } = await supabase
        .from('weekly_updates')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return toCamelCase(data);
    },
    async update(id: string, data: any) {
      const updateData = { ...toSnakeCase(data), updated_at: new Date().toISOString() };
      const { data: weeklyUpdate, error } = await supabase
        .from('weekly_updates')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return toCamelCase(weeklyUpdate);
    },
    async delete(id: string) {
      const { error } = await supabase
        .from('weekly_updates')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
  },
};

export default db;
