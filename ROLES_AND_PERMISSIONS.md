# User Roles and Permissions

This document clearly defines the roles and permissions for each user type in the Task Management Dashboard.

---

## Role Overview

| Role | Description | Access Level |
|------|-------------|--------------|
| **Owner** | Organization owner. Sets up the organization and manages users only. | User Management Only |
| **Admin (Manager)** | Full operational access. Manages all day-to-day activities. | Full Access |
| **Employee** | Regular team member. Limited to own tasks and plans. | Limited Access |

---

## 1. Owner

The Owner is the organization creator. They have a **dedicated screen** (`/owner`) with no access to operational features.

### Allowed Actions
| Action | Allowed |
|--------|---------|
| Register organization (one-time) | ✅ |
| Create Admin (Manager) | ✅ |
| Create Employee | ✅ |
| Edit Admin/Employee | ✅ |
| Delete Admin/Employee | ✅ |
| View user list | ✅ |

### Not Allowed
| Action | Allowed |
|--------|---------|
| Access Dashboard | ❌ |
| Create/Edit/Delete Tasks | ❌ |
| Create/Edit/Delete Goals | ❌ |
| Create/Edit/Delete KPIs | ❌ |
| Create/Edit Plans | ❌ |
| View Analytics | ❌ |
| Weekly Updates | ❌ |
| Any transaction/operational management | ❌ |

---

## 2. Admin (Manager)

The Admin has **full access** to all operational features. They manage the team's work.

### Allowed Actions
| Feature | Create | Read | Update | Delete |
|---------|--------|------|--------|--------|
| **Dashboard** | - | ✅ All | - | - |
| **Tasks** | ✅ | ✅ All | ✅ | ✅ |
| **Goals** (Annual & MBO) | ✅ | ✅ All | ✅ | ✅ |
| **KPIs** | ✅ | ✅ All | ✅ | ✅ |
| **Plans** (Vacation & Training) | ✅ | ✅ All | Approve/Reject | ✅ |
| **Weekly Updates** | ✅ | ✅ All | ✅ | ✅ |
| **Users** | ✅ (Employees) | ✅ All | ✅ | ✅ (Except Owner) |
| **Analytics** | - | ✅ | - | - |
| **Proposals** | ✅ | ✅ | ✅ | ✅ |

### Special Permissions
- Assign tasks to any employee
- Approve or reject vacation and training plans
- View all employees' progress and workload
- Add and manage team members (Managers and Employees)

---

## 3. Employee

The Employee has **limited access** focused on their own work.

### Allowed Actions
| Feature | Create | Read | Update | Delete |
|---------|--------|------|--------|--------|
| **Dashboard** | - | ✅ Own stats only | - | - |
| **Tasks** | ❌ | ✅ Assigned to me | ✅ Status/own fields | ❌ |
| **Goals** | ❌ | ✅ All (view) | ❌ | ❌ |
| **KPIs** | ❌ | ✅ All (view) | Update value on own | ❌ |
| **Plans** | ✅ Own | ✅ Own | ✅ Own | ✅ Own |
| **Weekly Updates** | ✅ Own | ✅ Own | ✅ Own | ✅ Own |
| **Users** | ❌ | ❌ | ❌ | ❌ |
| **Analytics** | - | ✅ Read-only | - | - |
| **Proposals** | ✅ | ✅ | ✅ Own | ❌ |

### Restrictions
- Can only view and update tasks **assigned to them**
- Cannot create or delete tasks
- Cannot create, edit, or delete goals
- Can create vacation and training plans for themselves
- Cannot access user management
- Cannot approve/reject plans

---

## Permission Matrix Summary

| Action | Owner | Admin | Employee |
|--------|:-----:|:-----:|:--------:|
| Manage users | ✅ | ✅ | ❌ |
| Create tasks | ❌ | ✅ | ❌ |
| Update own task status | ❌ | ✅ | ✅ |
| Create/Edit goals | ❌ | ✅ | ❌ |
| Create/Edit KPIs | ❌ | ✅ | Update value only |
| Submit plans | ❌ | ✅ | ✅ |
| Approve plans | ❌ | ✅ | ❌ |
| View dashboard | ❌ | ✅ | ✅ (own) |
| View analytics | ❌ | ✅ | ✅ |

---

## Technical Notes

- **Owner** is redirected to `/owner` and never sees the main app navigation
- **Admin** = **Manager** (same role, different display name)
- Role checks are enforced in API routes via `requireAuth`, `requireOwnerOrManager`, and role-specific logic
- Employees can only access resources where they are the `assignedTo` or `userId`
