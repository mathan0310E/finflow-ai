'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  Users,
  Search,
  Plus,
  Mail,
  Phone,
  Briefcase,
  Calendar,
  Edit3,
  Trash2,
  MoreHorizontal,
  Filter,
  Loader2,
} from 'lucide-react'

import { cn } from '@/lib/cn'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/components/ui/toast'
import { formatDate } from '@/utils/format'
import { USER_ROLES_MAP } from '@/constants'
import type { User, UserRole } from '@/types'

// 
// Animation variants
// 

const pageVariants = {
  hidden: { opacity: 0, y: 12 } as const,
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.25, 0.1, 0.25, 1] as const },
  } as const,
}

// 
// Mock employees data
// 

const MOCK_EMPLOYEES: User[] = [
  { id: 'e1', email: 'john.smith@acme.com', displayName: 'John Smith', role: 'employee', companyId: 'c1', departmentId: 'd1', status: 'active', designation: 'Senior Developer', employeeId: 'EMP-006', phone: '+1-555-0106', joiningDate: new Date('2022-06-15'), createdAt: new Date('2022-06-15'), updatedAt: new Date('2025-07-28') },
  { id: 'e2', email: 'sarah.jones@acme.com', displayName: 'Sarah Jones', role: 'employee', companyId: 'c1', departmentId: 'd2', status: 'active', designation: 'Marketing Specialist', employeeId: 'EMP-007', phone: '+1-555-0107', joiningDate: new Date('2023-02-01'), createdAt: new Date('2023-02-01'), updatedAt: new Date('2025-07-28') },
  { id: 'e3', email: 'mike.brown@acme.com', displayName: 'Mike Brown', role: 'employee', companyId: 'c1', departmentId: 'd3', status: 'active', designation: 'Sales Representative', employeeId: 'EMP-008', phone: '+1-555-0108', joiningDate: new Date('2023-04-10'), createdAt: new Date('2023-04-10'), updatedAt: new Date('2025-07-28') },
  { id: 'e4', email: 'emma.wilson@acme.com', displayName: 'Emma Wilson', role: 'employee', companyId: 'c1', departmentId: 'd4', status: 'active', designation: 'UI/UX Designer', employeeId: 'EMP-009', joiningDate: new Date('2023-07-20'), createdAt: new Date('2023-07-20'), updatedAt: new Date('2025-07-28') },
  { id: 'e5', email: 'david.lee@acme.com', displayName: 'David Lee', role: 'employee', companyId: 'c1', departmentId: 'd1', status: 'active', designation: 'Backend Developer', employeeId: 'EMP-010', phone: '+1-555-0110', joiningDate: new Date('2024-01-05'), createdAt: new Date('2024-01-05'), updatedAt: new Date('2025-07-28') },
  { id: 'e6', email: 'anna.garcia@acme.com', displayName: 'Anna Garcia', role: 'dept_manager', companyId: 'c1', departmentId: 'd2', status: 'active', designation: 'Marketing Manager', employeeId: 'EMP-011', phone: '+1-555-0111', joiningDate: new Date('2021-09-01'), createdAt: new Date('2021-09-01'), updatedAt: new Date('2025-07-28') },
  { id: 'e7', email: 'tom.clark@acme.com', displayName: 'Tom Clark', role: 'employee', companyId: 'c1', departmentId: 'd5', status: 'inactive', designation: 'Operations Assistant', employeeId: 'EMP-012', joiningDate: new Date('2024-03-15'), createdAt: new Date('2024-03-15'), updatedAt: new Date('2025-06-30') },
  { id: 'e8', email: 'lisa.white@acme.com', displayName: 'Lisa White', role: 'finance_manager', companyId: 'c1', departmentId: 'd1', status: 'active', designation: 'Finance Controller', employeeId: 'EMP-013', phone: '+1-555-0113', joiningDate: new Date('2022-11-01'), createdAt: new Date('2022-11-01'), updatedAt: new Date('2025-07-28') },
]

const MOCK_DEPARTMENTS = [
  { id: 'd1', name: 'Engineering' },
  { id: 'd2', name: 'Marketing' },
  { id: 'd3', name: 'Sales' },
  { id: 'd4', name: 'Design' },
  { id: 'd5', name: 'Operations' },
]

// 
// Page Component
// 

export default function EmployeesPage() {
  const { toast } = useToast()
  const [employees, setEmployees] = useState(MOCK_EMPLOYEES)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [inviteDialog, setInviteDialog] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<UserRole>('employee')
  const [editingEmployee, setEditingEmployee] = useState<User | null>(null)

  //  Filters 

  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      if (search) {
        const q = search.toLowerCase()
        if (!emp.displayName.toLowerCase().includes(q) && !emp.email.toLowerCase().includes(q) && !(emp.designation ?? '').toLowerCase().includes(q) && !(emp.employeeId ?? '').toLowerCase().includes(q)) return false
      }
      if (roleFilter !== 'all' && emp.role !== roleFilter) return false
      if (statusFilter !== 'all' && emp.status !== statusFilter) return false
      return true
    })
  }, [employees, search, roleFilter, statusFilter])

  //  Handlers 

  const handleInvite = () => {
    if (!inviteEmail.trim()) return
    toast({ title: 'Invitation sent', description: `Invitation sent to ${inviteEmail}.`, variant: 'success' })
    setInviteEmail('')
    setInviteDialog(false)
  }

  const handleDelete = (id: string) => {
    setEmployees((prev) => prev.filter((e) => e.id !== id))
    toast({ title: 'Employee removed', description: 'The employee has been removed.', variant: 'success' })
  }

  const handleEdit = (emp: User) => {
    setEditingEmployee(emp)
  }

  const handleSaveEdit = () => {
    toast({ title: 'Employee updated', description: 'Changes have been saved.', variant: 'success' })
    setEditingEmployee(null)
  }

  //  Render 

  return (
    <motion.div
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <PageHeader
        title="Employees"
        description="Manage your team members and their roles"
      >
        <Button onClick={() => setInviteDialog(true)}>
          <Plus className="mr-1.5 h-4 w-4" />
          Add Employee
        </Button>
      </PageHeader>

      {/*  Filters  */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search by name, email, or designation..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-full sm:w-36">
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            {Object.values(USER_ROLES_MAP).map((r) => (
              <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-36">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
          {filteredEmployees.length} of {employees.length}
        </span>
      </div>

      {/*  Table  */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Employee ID</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEmployees.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-16 text-center">
                    <div className="flex flex-col items-center">
                      <Users className="mb-2 h-8 w-8 text-gray-300" />
                      <p className="text-sm text-gray-500">No employees found</p>
                      <p className="text-xs text-gray-400">Try adjusting your search or filters</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredEmployees.map((emp) => {
                  const roleConfig = USER_ROLES_MAP[emp.role]
                  const dept = MOCK_DEPARTMENTS.find(d => d.id === emp.departmentId)
                  return (
                    <TableRow key={emp.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-xs font-medium bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-700 dark:from-blue-900/50 dark:to-indigo-900/50 dark:text-blue-300">
                              {emp.displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{emp.displayName}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{emp.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-gray-500 dark:text-gray-400">
                        {emp.employeeId ?? '—'}
                      </TableCell>
                      <TableCell className="text-sm text-gray-700 dark:text-gray-300">
                        {dept?.name ?? '—'}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn('border-0 text-[10px]', roleConfig?.color, roleConfig?.textColor)}>
                          {roleConfig?.label ?? emp.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={emp.status === 'active' ? 'success' : emp.status === 'inactive' ? 'secondary' : 'destructive'}
                          className="capitalize text-[10px]"
                        >
                          {emp.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-gray-500 dark:text-gray-400">
                        {emp.joiningDate ? formatDate(emp.joiningDate, 'MMM dd, yyyy') : '—'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEdit(emp)}>
                            <Edit3 className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:text-red-600" onClick={() => handleDelete(emp.id)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/*  Invite Dialog  */}
      <Dialog open={inviteDialog} onOpenChange={setInviteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Employee</DialogTitle>
            <DialogDescription>Invite a new team member to your organization</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <Input label="Email Address" type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="employee@company.com" icon={<Mail className="h-4 w-4" />} />
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Role</label>
              <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as UserRole)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(USER_ROLES_MAP).filter(r => r.value !== 'super_admin').map((r) => (
                    <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInviteDialog(false)}>Cancel</Button>
            <Button onClick={handleInvite}>Send Invitation</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/*  Edit Dialog  */}
      <Dialog open={!!editingEmployee} onOpenChange={(open) => { if (!open) setEditingEmployee(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Employee</DialogTitle>
            <DialogDescription>Update employee details and role</DialogDescription>
          </DialogHeader>
          {editingEmployee && (
            <div className="space-y-4 py-2">
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="text-sm font-bold bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-700">
                    {editingEmployee.displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">{editingEmployee.displayName}</p>
                  <p className="text-sm text-gray-500">{editingEmployee.email}</p>
                </div>
              </div>
              <Separator />
              <Input label="Designation" defaultValue={editingEmployee.designation ?? ''} />
              <Input label="Phone" defaultValue={editingEmployee.phone ?? ''} />
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Role</label>
                <Select defaultValue={editingEmployee.role}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(USER_ROLES_MAP).filter(r => r.value !== 'super_admin').map((r) => (
                      <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                <Select defaultValue={editingEmployee.status}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingEmployee(null)}>Cancel</Button>
            <Button onClick={handleSaveEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}
