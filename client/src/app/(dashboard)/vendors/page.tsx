'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  Store,
  Search,
  Plus,
  Mail,
  Phone,
  MapPin,
  Edit3,
  Trash2,
  ExternalLink,
  Filter,
  DollarSign,
  Calendar,
} from 'lucide-react'

import { cn } from '@/lib/cn'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardContent } from '@/components/ui/card'
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
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/components/ui/toast'
import { formatCurrency, formatDate } from '@/utils/format'
import type { Vendor } from '@/types'

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
// Mock vendors data
// 

const MOCK_VENDORS: Vendor[] = [
  { id: 'v1', companyId: 'c1', name: 'AWS', category: 'Cloud Services', contactPerson: 'Account Team', email: 'support@aws.com', phone: '+1-888-555-0199', address: '410 Terry Ave N, Seattle, WA 98109', paymentTerms: 'Net 30', totalSpent: 45280, lastTransaction: new Date('2025-07-25'), status: 'active', createdAt: new Date('2024-01-15'), updatedAt: new Date('2025-07-28') },
  { id: 'v2', companyId: 'c1', name: 'Slack', category: 'Software', contactPerson: 'Billing Team', email: 'billing@slack.com', phone: '+1-855-555-0220', gst: 'GST-1234-5678', paymentTerms: 'Net 15', totalSpent: 14400, lastTransaction: new Date('2025-07-20'), status: 'active', createdAt: new Date('2024-02-01'), updatedAt: new Date('2025-07-28') },
  { id: 'v3', companyId: 'c1', name: 'WeWork', category: 'Office Space', contactPerson: 'Community Manager', email: 'billing@wework.com', phone: '+1-212-555-0330', address: '115 18th St NW, Washington, DC 20036', paymentTerms: 'Net 30', totalSpent: 96000, lastTransaction: new Date('2025-07-01'), status: 'active', createdAt: new Date('2024-01-01'), updatedAt: new Date('2025-07-28') },
  { id: 'v4', companyId: 'c1', name: 'GitHub', category: 'Software', contactPerson: 'Enterprise Team', email: 'enterprise@github.com', gst: 'GST-9876-5432', paymentTerms: 'Net 30', totalSpent: 7200, lastTransaction: new Date('2025-07-15'), status: 'active', createdAt: new Date('2024-03-10'), updatedAt: new Date('2025-07-28') },
  { id: 'v5', companyId: 'c1', name: 'Staples', category: 'Office Supplies', contactPerson: 'Account Rep', email: 'corporate@staples.com', phone: '+1-800-555-0440', paymentTerms: 'Net 15', totalSpent: 3450, lastTransaction: new Date('2025-06-28'), status: 'active', createdAt: new Date('2024-04-05'), updatedAt: new Date('2025-07-20') },
  { id: 'v6', companyId: 'c1', name: 'Delta Airlines', category: 'Travel', contactPerson: 'Corporate Sales', phone: '+1-800-555-0550', address: '1030 Delta Blvd, Atlanta, GA 30354', paymentTerms: 'Net 7', totalSpent: 28300, lastTransaction: new Date('2025-07-10'), status: 'active', createdAt: new Date('2024-05-01'), updatedAt: new Date('2025-07-28') },
  { id: 'v7', companyId: 'c1', name: 'Old Office Vendor', category: 'Office Supplies', contactPerson: '', paymentTerms: 'Net 30', totalSpent: 1200, status: 'inactive', createdAt: new Date('2023-11-01'), updatedAt: new Date('2025-01-15') },
]

// 
// Categories for filter
// 

const VENDOR_CATEGORIES = ['All', 'Cloud Services', 'Software', 'Office Space', 'Office Supplies', 'Travel', 'Consulting', 'Legal', 'Marketing'] as const

// 
// Page Component
// 

export default function VendorsPage() {
  const { toast } = useToast()
  const [vendors, setVendors] = useState(MOCK_VENDORS)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('all')
  const [vendorDialog, setVendorDialog] = useState(false)
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    gst: '',
    paymentTerms: 'Net 30',
  })

  //  Filters 

  const filteredVendors = useMemo(() => {
    return vendors.filter((v) => {
      if (search) {
        const q = search.toLowerCase()
        if (!v.name.toLowerCase().includes(q) && !(v.contactPerson ?? '').toLowerCase().includes(q) && !(v.email ?? '').toLowerCase().includes(q) && !(v.category ?? '').toLowerCase().includes(q)) return false
      }
      if (categoryFilter !== 'All' && v.category !== categoryFilter) return false
      if (statusFilter !== 'all' && v.status !== statusFilter) return false
      return true
    })
  }, [vendors, search, categoryFilter, statusFilter])

  //  Handlers 

  const handleOpenAdd = () => {
    setEditingVendor(null)
    setFormData({ name: '', category: '', contactPerson: '', email: '', phone: '', address: '', gst: '', paymentTerms: 'Net 30' })
    setVendorDialog(true)
  }

  const handleOpenEdit = (vendor: Vendor) => {
    setEditingVendor(vendor)
    setFormData({
      name: vendor.name,
      category: vendor.category ?? '',
      contactPerson: vendor.contactPerson ?? '',
      email: vendor.email ?? '',
      phone: vendor.phone ?? '',
      address: vendor.address ?? '',
      gst: vendor.gst ?? '',
      paymentTerms: vendor.paymentTerms ?? 'Net 30',
    })
    setVendorDialog(true)
  }

  const handleSave = () => {
    if (!formData.name.trim()) {
      toast({ title: 'Name required', description: 'Please enter a vendor name.', variant: 'destructive' })
      return
    }

    if (editingVendor) {
      setVendors((prev) =>
        prev.map((v) =>
          v.id === editingVendor.id
            ? { ...v, name: formData.name, category: formData.category, contactPerson: formData.contactPerson, email: formData.email, phone: formData.phone, address: formData.address, gst: formData.gst, paymentTerms: formData.paymentTerms, updatedAt: new Date() }
            : v,
        ),
      )
      toast({ title: 'Vendor updated', description: `${formData.name} has been updated.`, variant: 'success' })
    } else {
      const newVendor: Vendor = {
        id: `v${Date.now()}`,
        companyId: 'c1',
        name: formData.name,
        category: formData.category || undefined,
        contactPerson: formData.contactPerson || undefined,
        email: formData.email || undefined,
        phone: formData.phone || undefined,
        address: formData.address || undefined,
        gst: formData.gst || undefined,
        paymentTerms: formData.paymentTerms || undefined,
        totalSpent: 0,
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      setVendors((prev) => [newVendor, ...prev])
      toast({ title: 'Vendor added', description: `${formData.name} has been added.`, variant: 'success' })
    }
    setVendorDialog(false)
  }

  const handleDelete = (id: string) => {
    setVendors((prev) => prev.filter((v) => v.id !== id))
    toast({ title: 'Vendor removed', description: 'The vendor has been removed.', variant: 'success' })
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
        title="Vendors"
        description="Manage your company's vendors and suppliers"
      >
        <Button onClick={handleOpenAdd}>
          <Plus className="mr-1.5 h-4 w-4" />
          Add Vendor
        </Button>
      </PageHeader>

      {/*  Filters  */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search vendors by name, category, or contact..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {VENDOR_CATEGORIES.map((cat) => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-32">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
          {filteredVendors.length} of {vendors.length}
        </span>
      </div>

      {/*  Table  */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vendor</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Payment Terms</TableHead>
                <TableHead>Total Spent</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Transaction</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVendors.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="py-16 text-center">
                    <div className="flex flex-col items-center">
                      <Store className="mb-2 h-8 w-8 text-gray-300" />
                      <p className="text-sm text-gray-500">No vendors found</p>
                      <p className="text-xs text-gray-400">Try adjusting your search or filters</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredVendors.map((vendor) => (
                  <TableRow key={vendor.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 text-sm font-bold text-white">
                          {vendor.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{vendor.name}</p>
                          {vendor.gst && (
                            <p className="text-xs text-gray-400 dark:text-gray-500 font-mono">GST: {vendor.gst}</p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px]">{vendor.category ?? '—'}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {vendor.contactPerson && (
                          <p className="text-gray-700 dark:text-gray-300">{vendor.contactPerson}</p>
                        )}
                        {vendor.email && (
                          <p className="text-xs text-gray-500 dark:text-gray-400">{vendor.email}</p>
                        )}
                        {!vendor.contactPerson && !vendor.email && (
                          <span className="text-gray-400">—</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-gray-700 dark:text-gray-300">
                      {vendor.paymentTerms ?? '—'}
                    </TableCell>
                    <TableCell className="text-sm font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(vendor.totalSpent)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={vendor.status === 'active' ? 'success' : 'secondary'}
                        className="capitalize text-[10px]"
                      >
                        {vendor.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-500 dark:text-gray-400">
                      {vendor.lastTransaction ? formatDate(vendor.lastTransaction, 'MMM dd, yyyy') : '—'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleOpenEdit(vendor)}>
                          <Edit3 className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:text-red-600" onClick={() => handleDelete(vendor.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/*  Add/Edit Vendor Dialog  */}
      <Dialog open={vendorDialog} onOpenChange={setVendorDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingVendor ? 'Edit Vendor' : 'Add Vendor'}</DialogTitle>
            <DialogDescription>
              {editingVendor ? 'Update vendor information' : 'Add a new vendor or supplier'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Input label="Vendor Name *" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. Acme Supplies" />
            </div>
            <Input label="Category" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} placeholder="e.g. Office Supplies" />
            <Input label="Payment Terms" value={formData.paymentTerms} onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })} placeholder="e.g. Net 30" />
            <Input label="Contact Person" value={formData.contactPerson} onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })} placeholder="John Doe" />
            <Input label="Email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="vendor@company.com" />
            <Input label="Phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="+1-555-0000" />
            <Input label="GST / Tax ID" value={formData.gst} onChange={(e) => setFormData({ ...formData, gst: e.target.value })} placeholder="GST-XXXX-XXXX" />
            <div className="sm:col-span-2">
              <Input label="Address" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} placeholder="Street, City, State, ZIP" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setVendorDialog(false)}>Cancel</Button>
            <Button onClick={handleSave}>{editingVendor ? 'Save Changes' : 'Add Vendor'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}
