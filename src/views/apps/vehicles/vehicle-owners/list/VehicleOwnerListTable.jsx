'use client'
// React Imports
import { useState, useEffect, useMemo } from 'react'
// Next Imports
import { useParams } from 'next/navigation'
// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Checkbox from '@mui/material/Checkbox'
import TextField from '@mui/material/TextField'
import TablePagination from '@mui/material/TablePagination'
import Switch from '@mui/material/Switch'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
// Third-party Imports
import classnames from 'classnames'
import { rankItem } from '@tanstack/match-sorter-utils'
import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    useReactTable,
    getFilteredRowModel,
    getFacetedRowModel,
    getFacetedUniqueValues,
    getFacetedMinMaxValues,
    getPaginationRowModel,
    getSortedRowModel
} from '@tanstack/react-table'
// Component Imports
import AddVehicleOwnerDrawer from './AddVehicleOwnerDrawer'
// Style Imports
import tableStyles from '@core/styles/table.module.css'
const fuzzyFilter = (row, columnId, value, addMeta) => {
    const itemRank = rankItem(row.getValue(columnId), value)
    addMeta({ itemRank })
    return itemRank.passed
}
const DebouncedInput = ({ value: initialValue, onChange, debounce = 500, ...props }) => {
    const [value, setValue] = useState(initialValue)
    useEffect(() => {
        setValue(initialValue)
    }, [initialValue])
    useEffect(() => {
        const timeout = setTimeout(() => {
            onChange(value)
        }, debounce)
        return () => clearTimeout(timeout)
    }, [value])
    return <TextField {...props} value={value} onChange={e => setValue(e.target.value)} size='small' />
}
// Column Definitions
const columnHelper = createColumnHelper()
const VehicleOwnersTable = () => {
    // States
    const [customerUserOpen, setCustomerUserOpen] = useState(false)
    const [editDialogOpen, setEditDialogOpen] = useState(false)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [selectedOwner, setSelectedOwner] = useState(null)
    const [rowSelection, setRowSelection] = useState({})
    const [data, setData] = useState([])
    const [globalFilter, setGlobalFilter] = useState('')
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState('')
    const [actionMenuAnchor, setActionMenuAnchor] = useState(null)
    const [actionMenuOwner, setActionMenuOwner] = useState(null)
    const [editForm, setEditForm] = useState({
        ownerName: '',
        mobile: '',
        isActive: true
    })
    // Hooks
    const { lang: locale } = useParams()
    // Fetch vehicle owners data
    useEffect(() => {
        fetchVehicleOwners()
    }, [])
    const fetchVehicleOwners = async () => {
        try {
            setIsLoading(true)
            setError('')
            console.log('🔄 Fetching vehicle owners...')
            const response = await fetch('/api/apps/vehicles/vehicle-owner')
            if (!response.ok) {
                if (response.status === 401) {
                    setError('Please login to view vehicle owners')
                    return
                }
                if (response.status === 403) {
                    setError('Access denied. Admin/Manager role required.')
                    return
                }
                throw new Error(`API error: ${response.status}`)
            }
            const result = await response.json()
            if (result.success) {
                console.log(`✅ Got ${result.data.length} vehicle owners`)
                // Transform data: Plain serial numbers (1, 2, 3...)
                const transformedData = result.data.map((item, index) => ({
                    ...item,
                    serialNo: index + 1, // Plain serial number: 1, 2, 3...
                    ownerName: item.ownerName || item.fullName || 'Unknown',
                    mobile: item.mobile || item.phone || 'N/A',
                    isActive: item.isActive !== false
                }))
                setData(transformedData)
            } else {
                throw new Error(result.message || 'Failed to fetch vehicle owners')
            }
        } catch (err) {
            console.error('❌ Error fetching vehicle owners:', err)
            setError(err.message || 'Failed to load vehicle owners')
        } finally {
            setIsLoading(false)
        }
    }
    // Handle Edit
    const handleEditClick = (owner) => {
        setSelectedOwner(owner)
        setEditForm({
            ownerName: owner.ownerName,
            mobile: owner.mobile,
            isActive: owner.isActive
        })
        setEditDialogOpen(true)
        setActionMenuAnchor(null)
    }
    const handleEditSubmit = async () => {
        try {
            const response = await fetch(`/api/apps/vehicles/vehicle-owner/${selectedOwner.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editForm)
            })
            if (response.ok) {
                // Update local state
                setData(prev => prev.map(item =>
                    item.id === selectedOwner.id
                        ? { ...item, ...editForm }
                        : item
                ))
                setEditDialogOpen(false)
                setSelectedOwner(null)
            } else {
                const result = await response.json()
                throw new Error(result.error || 'Failed to update')
            }
        } catch (error) {
            console.error('Update error:', error)
            setError(error.message)
        }
    }
    // Handle Delete
    const handleDeleteClick = (owner) => {
        setSelectedOwner(owner)
        setDeleteDialogOpen(true)
        setActionMenuAnchor(null)
    }
    const handleDeleteConfirm = async () => {
        try {
            const response = await fetch(`/api/apps/vehicles/vehicle-owner/${selectedOwner.id}`, {
                method: 'DELETE'
            })
            if (response.ok) {
                // Remove from local state
                setData(prev => prev.filter(item => item.id !== selectedOwner.id))
                setDeleteDialogOpen(false)
                setSelectedOwner(null)
            } else {
                const result = await response.json()
                throw new Error(result.error || 'Failed to delete')
            }
        } catch (error) {
            console.error('Delete error:', error)
            setError(error.message)
        }
    }
    // Handle Status Toggle
    const handleStatusToggle = async (owner) => {
        try {
            const newStatus = !owner.isActive
            const response = await fetch(`/api/apps/vehicles/vehicle-owner/${owner.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isActive: newStatus })
            })
            if (response.ok) {
                // Update local state
                setData(prev => prev.map(item =>
                    item.id === owner.id
                        ? { ...item, isActive: newStatus }
                        : item
                ))
            } else {
                const result = await response.json()
                throw new Error(result.error || 'Failed to update status')
            }
        } catch (error) {
            console.error('Status toggle error:', error)
            setError(error.message)
        }
    }
    // Action Menu
    const handleActionMenuOpen = (event, owner) => {
        setActionMenuAnchor(event.currentTarget)
        setActionMenuOwner(owner)
    }
    const handleActionMenuClose = () => {
        setActionMenuAnchor(null)
        setActionMenuOwner(null)
    }
    // Define columns
    const columns = useMemo(
        () => [
            {
                id: 'select',
                header: ({ table }) => (
                    <Checkbox
                        {...{
                            checked: table.getIsAllRowsSelected(),
                            indeterminate: table.getIsSomeRowsSelected(),
                            onChange: table.getToggleAllRowsSelectedHandler()
                        }}
                    />
                ),
                cell: ({ row }) => (
                    <Checkbox
                        {...{
                            checked: row.getIsSelected(),
                            disabled: !row.getCanSelect(),
                            indeterminate: row.getIsSomeSelected(),
                            onChange: row.getToggleSelectedHandler()
                        }}
                    />
                )
            },
            columnHelper.accessor('serialNo', {
                header: 'Sr. No.',
                cell: ({ row }) => (
                    <Typography color='text.primary' className='font-medium'>
                        {row.original.serialNo}
                    </Typography>
                )
            }),
            columnHelper.accessor('ownerName', {
                header: 'Owner Name',
                cell: ({ row }) => (
                    <Typography color='text.primary' className='font-medium'>
                        {row.original.ownerName}
                    </Typography>
                )
            }),
            columnHelper.accessor('mobile', {
                header: 'Mobile Number',
                cell: ({ row }) => (
                    <Typography color='text.primary'>
                        {row.original.mobile}
                    </Typography>
                )
            }),
            columnHelper.accessor('isActive', {
                header: 'Status',
                cell: ({ row }) => (
                    <div className='flex items-center gap-2'>
                        <Switch
                            checked={row.original.isActive}
                            onChange={() => handleStatusToggle(row.original)}
                            size='small'
                        />
                        <Chip
                            label={row.original.isActive ? 'Active' : 'Inactive'}
                            size='small'
                            color={row.original.isActive ? 'success' : 'error'}
                            variant='tonal'
                        />
                    </div>
                )
            }),
            columnHelper.accessor('actions', {
                header: 'Actions',
                cell: ({ row }) => (
                    <div className='flex items-center gap-1'>
                        <Tooltip title="Edit">
                            <IconButton size='small' onClick={() => handleEditClick(row.original)}>
                                <i className='ri-edit-line text-primary' />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                            <IconButton size='small' onClick={() => handleDeleteClick(row.original)}>
                                <i className='ri-delete-bin-line text-error' />
                            </IconButton>
                        </Tooltip>
                    </div>
                ),
                enableSorting: false
            })
        ],
        []
    )
    const table = useReactTable({
        data: data,
        columns,
        filterFns: {
            fuzzy: fuzzyFilter
        },
        state: {
            rowSelection,
            globalFilter
        },
        initialState: {
            pagination: {
                pageSize: 10
            }
        },
        enableRowSelection: true,
        globalFilterFn: fuzzyFilter,
        onRowSelectionChange: setRowSelection,
        getCoreRowModel: getCoreRowModel(),
        onGlobalFilterChange: setGlobalFilter,
        getFilteredRowModel: getFilteredRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getFacetedRowModel: getFacetedRowModel(),
        getFacetedUniqueValues: getFacetedUniqueValues(),
        getFacetedMinMaxValues: getFacetedMinMaxValues()
    })
    // Loading state
    if (isLoading) {
        return (
            <Card>
                <CardContent className='flex justify-center items-center p-12'>
                    <CircularProgress />
                    <Typography className='ml-3' color='text.secondary'>
                        Loading vehicle owners...
                    </Typography>
                </CardContent>
            </Card>
        )
    }
    // Error state
    if (error) {
        return (
            <Card>
                <CardContent>
                    <Alert severity='error' className='mb-4'>
                        {error}
                    </Alert>
                    <Button
                        variant='outlined'
                        onClick={fetchVehicleOwners}
                    >
                        Retry
                    </Button>
                </CardContent>
            </Card>
        )
    }
    return (
        <>
            <Card>
                <CardContent className='flex justify-between flex-wrap max-sm:flex-col sm:items-center gap-4'>
                    <div className='flex flex-col gap-1'>
                        <Typography variant='h5' className='font-semibold'>
                            Vehicle Owners
                        </Typography>
                        <Typography variant='body2' color='text.secondary'>
                            Total: {data.length} owners
                        </Typography>
                    </div>
                    <div className='flex gap-4 max-sm:flex-col max-sm:is-full'>
                        <DebouncedInput
                            value={globalFilter ?? ''}
                            onChange={value => setGlobalFilter(String(value))}
                            placeholder='Search by name or mobile'
                            className='max-sm:is-full'
                        />
                        <Button
                            variant='contained'
                            color='primary'
                            className='max-sm:is-full'
                            startIcon={<i className='ri-add-line' />}
                            onClick={() => setCustomerUserOpen(true)}
                        >
                            Add Owner
                        </Button>
                    </div>
                </CardContent>
                <div className='overflow-x-auto'>
                    <table className={tableStyles.table}>
                        <thead>
                            {table.getHeaderGroups().map(headerGroup => (
                                <tr key={headerGroup.id}>
                                    {headerGroup.headers.map(header => (
                                        <th key={header.id}>
                                            {header.isPlaceholder ? null : (
                                                <>
                                                    <div
                                                        className={classnames({
                                                            'flex items-center': header.column.getIsSorted(),
                                                            'cursor-pointer select-none': header.column.getCanSort()
                                                        })}
                                                        onClick={header.column.getToggleSortingHandler()}
                                                    >
                                                        {flexRender(header.column.columnDef.header, header.getContext())}
                                                        {{
                                                            asc: <i className='ri-arrow-up-s-line text-xl' />,
                                                            desc: <i className='ri-arrow-down-s-line text-xl' />
                                                        }[header.column.getIsSorted()] ?? null}
                                                    </div>
                                                </>
                                            )}
                                        </th>
                                    ))}
                                </tr>
                            ))}
                        </thead>
                        {table.getFilteredRowModel().rows.length === 0 ? (
                            <tbody>
                                <tr>
                                    <td colSpan={table.getVisibleFlatColumns().length} className='text-center p-8'>
                                        <Typography color='text.secondary'>
                                            {data.length === 0 ? 'No vehicle owners found' : 'No matching results'}
                                        </Typography>
                                    </td>
                                </tr>
                            </tbody>
                        ) : (
                            <tbody>
                                {table
                                    .getRowModel()
                                    .rows.slice(0, table.getState().pagination.pageSize)
                                    .map(row => {
                                        return (
                                            <tr key={row.id} className={classnames({ selected: row.getIsSelected() })}>
                                                {row.getVisibleCells().map(cell => (
                                                    <td key={cell.id}>
                                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                    </td>
                                                ))}
                                            </tr>
                                        )
                                    })}
                            </tbody>
                        )}
                    </table>
                </div>
                <TablePagination
                    rowsPerPageOptions={[10, 25, 50, 100]}
                    component='div'
                    className='border-bs'
                    count={table.getFilteredRowModel().rows.length}
                    rowsPerPage={table.getState().pagination.pageSize}
                    page={table.getState().pagination.pageIndex}
                    SelectProps={{
                        inputProps: { 'aria-label': 'rows per page' }
                    }}
                    onPageChange={(_, page) => {
                        table.setPageIndex(page)
                    }}
                    onRowsPerPageChange={e => table.setPageSize(Number(e.target.value))}
                />
            </Card>
            {/* Add Owner Drawer */}
            <AddVehicleOwnerDrawer
                open={customerUserOpen}
                handleClose={() => setCustomerUserOpen(false)}
                setData={setData}
                customerData={data}
                isVehicleOwner={true}
                refreshData={fetchVehicleOwners}
            />
            {/* Edit Dialog */}
            <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
                <DialogTitle>Edit Vehicle Owner</DialogTitle>
                <DialogContent className='flex flex-col gap-4 pt-4'>
                    <TextField
                        label="Owner Name"
                        fullWidth
                        value={editForm.ownerName}
                        onChange={(e) => setEditForm({ ...editForm, ownerName: e.target.value })}
                    />
                    <TextField
                        label="Mobile Number"
                        fullWidth
                        value={editForm.mobile}
                        onChange={(e) => setEditForm({ ...editForm, mobile: e.target.value })}
                    />
                    <div className='flex items-center justify-between'>
                        <Typography>Active Status</Typography>
                        <Switch
                            checked={editForm.isActive}
                            onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked })}
                        />
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
                    <Button variant='contained' onClick={handleEditSubmit}>Save Changes</Button>
                </DialogActions>
            </Dialog>
            {/* Delete Dialog */}
            <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
                <DialogTitle>Delete Vehicle Owner</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete {selectedOwner?.ownerName}?
                        This action cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
                    <Button variant='contained' color='error' onClick={handleDeleteConfirm}>
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    )
}
export default VehicleOwnersTable
