'use client'
// ===================== React =====================
import { useState, useEffect, useMemo } from 'react'
// ===================== MUI =====================
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
// ===================== Third-party =====================
import classnames from 'classnames'
import { rankItem } from '@tanstack/match-sorter-utils'
import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    useReactTable,
    getFilteredRowModel,
    getSortedRowModel,
    getPaginationRowModel
} from '@tanstack/react-table'
// ===================== Components =====================
import AddVehicleDrawer from './AddVehicleDrawer'
// ===================== Styles =====================
import tableStyles from '@core/styles/table.module.css'
// ===================== Fuzzy Search =====================
const fuzzyFilter = (row, columnId, value, addMeta) => {
    const itemRank = rankItem(row.getValue(columnId), value)
    addMeta({ itemRank })
    return itemRank.passed
}
// ===================== Debounced Input =====================
const DebouncedInput = ({ value: initialValue, onChange, debounce = 500, ...props }) => {
    const [value, setValue] = useState(initialValue)
    useEffect(() => setValue(initialValue), [initialValue])
    useEffect(() => {
        const timeout = setTimeout(() => onChange(value), debounce)
        return () => clearTimeout(timeout)
    }, [value])
    return <TextField {...props} value={value} onChange={e => setValue(e.target.value)} size='small' />
}
// ===================== Column Helper =====================
const columnHelper = createColumnHelper()
// ===================== Vehicle Table =====================
const VehicleTable = () => {
    // States
    const [data, setData] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState('')
    const [globalFilter, setGlobalFilter] = useState('')
    const [rowSelection, setRowSelection] = useState({})
    const [formOpen, setFormOpen] = useState(false)
    const [editData, setEditData] = useState(null)
    const [selectedRows, setSelectedRows] = useState([])
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })
    // ===================== Fetch Vehicles =====================
    const fetchVehicles = async () => {
        try {
            setIsLoading(true)
            setError('')
            const res = await fetch('/api/apps/vehicles/market')
            if (!res.ok) throw new Error('Failed to fetch vehicles')
            const json = await res.json()
            if (json.success) {
                const transformed = json.data.map((v, i) => ({
                    id: v._id || v.id,
                    serialNo: i + 1,
                    vehicleNo: v.vehicleNo || '',
                    vehicleModel: v.model || '',
                    ownerName: v.ownerName || 'Unknown Owner',
                    ownerMobile: v.ownerMobile || '', // This might be undefined

                    driverName: v.driverName || 'No Driver',
                    driverMobile: v.driverMobile || 'N/A',
                    bankName: v.bankName || '',
                    accountNo: v.accountNo || '',
                    ifscCode: v.ifscCode || '',
                    accountHolderName: v.accountHolderName || '',
                    isActive: v.isActive !== undefined ? v.isActive : true,
                    documents: v.documents || []
                }))
                setData(transformed)
            } else throw new Error(json.message || 'Failed to fetch vehicles')
        } catch (err) {
            setError(err.message)
        } finally {
            setIsLoading(false)
        }
    }
    useEffect(() => { fetchVehicles() }, [])
    const handleRefresh = () => {
        // In real app, this would fetch fresh data from API
        setData([...data])
        setSelectedRows([])
        setSnackbar({
            open: true,
            message: 'Data refreshed successfully',
            severity: 'info'
        })
    }
    // ===================== Status Toggle =====================
    const handleStatusToggle = async (vehicle) => {
        try {
            const newStatus = !vehicle.isActive

            const res = await fetch('/api/apps/vehicles/market', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: vehicle.id,
                    isActive: newStatus
                })
            })

            const json = await res.json()
            if (!res.ok) throw new Error(json.error || 'Failed to update status')

            setData(prev => prev.map(v => v.id === vehicle.id ? { ...v, isActive: newStatus } : v))

        } catch (err) {
            console.error('Status toggle error:', err)
            alert(err.message)
        }
    }
    // ===================== Edit / Delete =====================
    const handleEdit = vehicle => {
        console.log('Editing vehicle:', vehicle) // Add this to debug

        setEditData(vehicle)
        setFormOpen(true)
    }
    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this vehicle?')) return
        try {
            // Pass ID as query parameter in the URL
            const response = await fetch(`/api/apps/vehicles/market?id=${id}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                // Remove body since backend expects query param
            })

            const result = await response.json()
            if (!response.ok) throw new Error(result.error || result.message || 'Delete failed')
            if (result.success) {
                await fetchVehicles()
                alert('Vehicle deleted successfully!')
            }
        } catch (err) {
            console.error(err)
            alert(err.message)
        }
    }
    // ===================== Columns =====================
    const columns = useMemo(() => [
        {
            id: 'select',
            header: ({ table }) => (
                <Checkbox
                    checked={table.getIsAllRowsSelected()}
                    indeterminate={table.getIsSomeRowsSelected()}
                    onChange={table.getToggleAllRowsSelectedHandler()}
                />
            ),
            cell: ({ row }) => (
                <Checkbox
                    checked={row.getIsSelected()}
                    indeterminate={row.getIsSomeSelected()}
                    onChange={row.getToggleSelectedHandler()}
                />
            )
        },
        columnHelper.accessor('serialNo', { header: 'Sr. No.', cell: ({ row }) => row.original.serialNo }),
        columnHelper.accessor('vehicleNo', { header: 'Vehicle No.', cell: ({ row }) => row.original.vehicleNo }),
        columnHelper.accessor('ownerName', { header: 'Owner', cell: ({ row }) => row.original.ownerName }),
        columnHelper.accessor('vehicleModel', { header: 'Model', cell: ({ row }) => row.original.vehicleModel }),
        columnHelper.accessor('driverName', {
            header: 'Driver',
            cell: ({ row }) => (
                <div>
                    {row.original.driverName}
                    <br />
                    <Typography variant='body2' color='text.secondary'>{row.original.driverMobile}</Typography>
                </div>
            )
        }),
        columnHelper.accessor('bankName', { header: 'Bank', cell: ({ row }) => row.original.bankName || 'N/A' }),
        columnHelper.accessor('accountHolderName', { header: 'Account Holder', cell: ({ row }) => row.original.accountHolderName || 'N/A' }),
        columnHelper.accessor('accountNo', {
            header: 'Account No.',
            cell: ({ row }) => row.original.accountNo ? `****${row.original.accountNo.slice(-4)}` : 'N/A'
        }),
        columnHelper.accessor('ifscCode', { header: 'IFSC', cell: ({ row }) => row.original.ifscCode || 'N/A' }),
        columnHelper.accessor('isActive', {
            header: 'Status',
            cell: ({ row }) => (
                <div className='flex items-center gap-2'>
                    <Switch
                        checked={row.original.isActive}
                        onChange={() => handleStatusToggle(row.original)}
                        size='small'
                    />
                    <Chip label={row.original.isActive ? 'Active' : 'Inactive'} size='small' color={row.original.isActive ? 'success' : 'error'} variant='tonal' />
                </div>
            )
        }),
        columnHelper.accessor('actions', {
            header: 'Actions',
            cell: ({ row }) => (
                <div className='flex gap-1'>
                    <Tooltip title="Edit">
                        <IconButton size='small' onClick={() => handleEdit(row.original)}>
                            <i className='ri-edit-line text-primary' />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                        <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDelete(row.original.id)}
                            sx={{ padding: '6px' }}
                        >
                            <i className="ri-delete-bin-line text-error" />
                        </IconButton>
                    </Tooltip>
                </div>
            ),
            enableSorting: false
        })
    ], [])
    // ===================== React Table =====================
    const table = useReactTable({
        data,
        columns,
        state: { globalFilter, rowSelection },
        filterFns: { fuzzy: fuzzyFilter },
        globalFilterFn: fuzzyFilter,
        enableRowSelection: true,
        onRowSelectionChange: setRowSelection,
        onGlobalFilterChange: setGlobalFilter,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel()
    })
    // ===================== Loading / Error =====================
    if (isLoading) return <Card><CardContent className='flex justify-center p-12'><CircularProgress /> <Typography className='ml-3'>Loading vehicles...</Typography></CardContent></Card>
    if (error) return <Card><CardContent><Alert severity='error'>{error}</Alert><Button variant='outlined' onClick={fetchVehicles}>Retry</Button></CardContent></Card>
    // ===================== Render =====================
    return (
        <>
            <Card>
                <CardContent className='flex justify-between flex-wrap items-center gap-4'>
                    <div>
                        <Typography variant='h5' className='font-semibold'>Vehicle Information</Typography>
                        <Typography variant='body2' color='text.secondary'>Total: {data.length} vehicles</Typography>
                    </div>
                    {/* <Button
                        variant="outlined"
                        onClick={handleRefresh}
                        startIcon={<i className="ri-refresh-line" />}
                    >
                        Refresh
                    </Button> */}
                    <div className='flex gap-4'>
                        <DebouncedInput
                            value={globalFilter ?? ''}
                            onChange={value => setGlobalFilter(String(value))}
                            placeholder='Search by vehicle no, owner, or driver'
                        />
                        <Button variant='contained' startIcon={<i className='ri-add-line' />} onClick={() => { setEditData(null); setFormOpen(true) }}>
                            Add Vehicle
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
                                            {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                        </th>
                                    ))}
                                </tr>
                            ))}
                        </thead>
                        <tbody>
                            {table.getRowModel().rows.length === 0 ? (
                                <tr><td colSpan={columns.length} className='text-center p-8'>No vehicles found</td></tr>
                            ) : (
                                table.getRowModel().rows.map(row => (
                                    <tr key={row.id}>{row.getVisibleCells().map(cell => <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>)}</tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                <TablePagination
                    rowsPerPageOptions={[10, 25, 50, 100]}
                    component='div'
                    count={table.getFilteredRowModel().rows.length}
                    rowsPerPage={table.getState().pagination.pageSize}
                    page={table.getState().pagination.pageIndex}
                    onPageChange={(_, page) => table.setPageIndex(page)}
                    onRowsPerPageChange={e => table.setPageSize(Number(e.target.value))}
                />
            </Card>
            {/* Add / Edit Drawer */}
            <AddVehicleDrawer
                open={formOpen}
                handleClose={() => setFormOpen(false)}
                refreshData={fetchVehicles}
                editData={editData}
            />
        </>
    )
}
export default VehicleTable
