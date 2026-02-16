// 'use client'
// // ===================== React =====================
// import { useState, useEffect, useMemo } from 'react'
// // ===================== MUI =====================
// import Card from '@mui/material/Card'
// import CardContent from '@mui/material/CardContent'
// import Button from '@mui/material/Button'
// import Typography from '@mui/material/Typography'
// import Checkbox from '@mui/material/Checkbox'
// import TextField from '@mui/material/TextField'
// import TablePagination from '@mui/material/TablePagination'
// import Switch from '@mui/material/Switch'
// import Chip from '@mui/material/Chip'
// import CircularProgress from '@mui/material/CircularProgress'
// import Alert from '@mui/material/Alert'
// import IconButton from '@mui/material/IconButton'
// import Tooltip from '@mui/material/Tooltip'
// import Menu from '@mui/material/Menu'
// import MenuItem from '@mui/material/MenuItem'
// import ListItemIcon from '@mui/material/ListItemIcon'
// import ListItemText from '@mui/material/ListItemText'
// import Dialog from '@mui/material/Dialog'
// import DialogTitle from '@mui/material/DialogTitle'
// import DialogContent from '@mui/material/DialogContent'
// import DialogContentText from '@mui/material/DialogContentText'
// import DialogActions from '@mui/material/DialogActions'
// // ===================== Third-party =====================
// import classnames from 'classnames'
// import { rankItem } from '@tanstack/match-sorter-utils'
// import {
//     createColumnHelper,
//     flexRender,
//     getCoreRowModel,
//     useReactTable,
//     getFilteredRowModel,
//     getSortedRowModel,
//     getPaginationRowModel
// } from '@tanstack/react-table'
// // ===================== Components =====================
// import AddVehicleDrawer from './AddVehicleDrawer'
// // ===================== Styles =====================
// import tableStyles from '@core/styles/table.module.css'
// // ===================== Fuzzy Search =====================
// const fuzzyFilter = (row, columnId, value, addMeta) => {
//     const itemRank = rankItem(row.getValue(columnId), value)
//     addMeta({ itemRank })
//     return itemRank.passed
// }
// // ===================== Debounced Input =====================
// const DebouncedInput = ({ value: initialValue, onChange, debounce = 500, ...props }) => {
//     const [value, setValue] = useState(initialValue)
//     useEffect(() => setValue(initialValue), [initialValue])
//     useEffect(() => {
//         const timeout = setTimeout(() => onChange(value), debounce)
//         return () => clearTimeout(timeout)
//     }, [value])
//     return <TextField {...props} value={value} onChange={e => setValue(e.target.value)} size='small' />
// }
// // ===================== Column Helper =====================
// const columnHelper = createColumnHelper()
// // ===================== Vehicle Table =====================
// const VehicleTable = () => {
//     // States
//     const [data, setData] = useState([])
//     const [isLoading, setIsLoading] = useState(true)
//     const [error, setError] = useState('')
//     const [globalFilter, setGlobalFilter] = useState('')
//     const [rowSelection, setRowSelection] = useState({})
//     const [formOpen, setFormOpen] = useState(false)
//     const [editData, setEditData] = useState(null)
//     // Bulk delete states
//     const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false)
//     const [bulkDeleteLoading, setBulkDeleteLoading] = useState(false)
//     const [actionMenuAnchor, setActionMenuAnchor] = useState(null)
//     const selectedRowsCount = Object.keys(rowSelection).length
//     // ===================== Fetch Vehicles =====================
//     const fetchVehicles = async () => {
//         try {
//             setIsLoading(true)
//             setError('')
//             const res = await fetch('/api/apps/vehicles')
//             if (!res.ok) throw new Error('Failed to fetch vehicles')
//             const json = await res.json()
//             if (json.success) {
//                 const transformed = json.data.map((v, i) => ({
//                     id: v._id || v.id,
//                     serialNo: i + 1,
//                     vehicleNo: v.vehicleNo || '',
//                     vehicleModel: v.model || '',
//                     ownerName: v.ownerName || 'Unknown Owner',
//                     driverName: v.driverName || 'No Driver',
//                     driverMobile: v.driverMobile || 'N/A',
//                     bankName: v.bankName || '',
//                     accountNo: v.accountNo || '',
//                     ifscCode: v.ifscCode || '',
//                     accountHolderName: v.accountHolderName || '',
//                     isActive: v.isActive !== undefined ? v.isActive : true,
//                     documents: v.documents || []
//                 }))
//                 setData(transformed)
//             } else throw new Error(json.message || 'Failed to fetch vehicles')
//         } catch (err) {
//             setError(err.message)
//         } finally {
//             setIsLoading(false)
//         }
//     }
//     useEffect(() => { fetchVehicles() }, [])
//     // ===================== Status Toggle =====================
//     const handleStatusToggle = async vehicle => {
//         try {
//             const newStatus = !vehicle.isActive
//             const res = await fetch(`/api/apps/vehicles`, { // Changed from /api/apps/vehicles/${vehicle.id}
//                 method: 'PATCH', // Using PATCH for partial update
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify({
//                     id: vehicle.id, // Send ID in body
//                     isActive: newStatus
//                 })
//             })
//             const json = await res.json()
//             if (!res.ok) throw new Error(json.error || json.message)
//             setData(prev => prev.map(v => v.id === vehicle.id ? { ...v, isActive: newStatus } : v))
//         } catch (err) {
//             alert(err.message)
//         }
//     }
//     // ===================== Single Edit =====================
//     const handleEdit = vehicle => {
//         setEditData(vehicle)
//         setFormOpen(true)
//     }
//     // ===================== Single Delete =====================
//     const handleDelete = async (id) => {
//         if (!confirm('Are you sure you want to delete this vehicle?')) return
//         try {
//             const response = await fetch('/api/apps/vehicles', {
//                 method: 'DELETE',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify({ id }) // Send single ID
//             })
//             const result = await response.json()
//             if (!response.ok) throw new Error(result.error || result.message || 'Delete failed')
//             if (result.success) {
//                 await fetchVehicles()
//                 alert('Vehicle deleted successfully!')
//             }
//         } catch (err) {
//             console.error(err)
//             alert(err.message)
//         }
//     }
//     // ===================== Bulk Delete =====================
//     const handleBulkDelete = async () => {
//         if (selectedRowsCount === 0) return
//         setBulkDeleteDialogOpen(true)
//     }
//     const confirmBulkDelete = async () => {
//         try {
//             setBulkDeleteLoading(true)
//             const selectedIds = Object.keys(rowSelection)
//                 .map(index => data[index]?.id)
//                 .filter(id => id)
//             if (selectedIds.length === 0) {
//                 alert('No valid vehicles selected for deletion')
//                 return
//             }
//             // Call bulk delete using main API endpoint
//             const response = await fetch('/api/apps/vehicles', { // Changed from /api/apps/vehicles/bulk-delete
//                 method: 'DELETE',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify({ ids: selectedIds }) // Send array of IDs
//             })
//             const result = await response.json()
//             if (!response.ok) {
//                 throw new Error(result.error || result.message || 'Bulk delete failed')
//             }
//             if (result.success) {
//                 // Clear selection and refresh data
//                 setRowSelection({})
//                 await fetchVehicles()
//                 alert(`Successfully deleted ${selectedIds.length} vehicle(s)`)
//             }
//         } catch (err) {
//             console.error(err)
//             alert(err.message || 'Failed to delete selected vehicles')
//         } finally {
//             setBulkDeleteLoading(false)
//             setBulkDeleteDialogOpen(false)
//             setActionMenuAnchor(null)
//         }
//     }
//     // ===================== Bulk Status Update =====================
//     const handleBulkStatusUpdate = async (status) => {
//         try {
//             const selectedIds = Object.keys(rowSelection)
//                 .map(index => data[index]?.id)
//                 .filter(id => id)
//             if (selectedIds.length === 0) {
//                 alert('No vehicles selected')
//                 return
//             }
//             // Call bulk status update using main API endpoint
//             const response = await fetch('/api/apps/vehicles', { // Changed from /api/apps/vehicles/bulk-status
//                 method: 'PUT',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify({
//                     ids: selectedIds, // Send array of IDs
//                     isActive: status
//                 })
//             })
//             const result = await response.json()
//             if (!response.ok) {
//                 throw new Error(result.error || result.message || 'Bulk update failed')
//             }
//             if (result.success) {
//                 // Update local data and clear selection
//                 setData(prev =>
//                     prev.map(vehicle =>
//                         selectedIds.includes(vehicle.id)
//                             ? { ...vehicle, isActive: status }
//                             : vehicle
//                     )
//                 )
//                 setRowSelection({})
//                 setActionMenuAnchor(null)
//                 alert(`Successfully updated ${selectedIds.length} vehicle(s) to ${status ? 'Active' : 'Inactive'}`)
//             }
//         } catch (err) {
//             console.error(err)
//             alert(err.message || 'Failed to update selected vehicles')
//         }
//     }
//     // ===================== Columns =====================
//     const columns = useMemo(() => [
//         {
//             id: 'select',
//             header: ({ table }) => (
//                 <Checkbox
//                     checked={table.getIsAllRowsSelected()}
//                     indeterminate={table.getIsSomeRowsSelected()}
//                     onChange={table.getToggleAllRowsSelectedHandler()}
//                 />
//             ),
//             cell: ({ row }) => (
//                 <Checkbox
//                     checked={row.getIsSelected()}
//                     indeterminate={row.getIsSomeSelected()}
//                     onChange={row.getToggleSelectedHandler()}
//                 />
//             )
//         },
//         columnHelper.accessor('serialNo', { header: 'Sr. No.', cell: ({ row }) => row.original.serialNo }),
//         columnHelper.accessor('vehicleNo', { header: 'Vehicle No.', cell: ({ row }) => row.original.vehicleNo }),
//         columnHelper.accessor('ownerName', { header: 'Owner', cell: ({ row }) => row.original.ownerName }),
//         columnHelper.accessor('vehicleModel', { header: 'Model', cell: ({ row }) => row.original.vehicleModel }),
//         columnHelper.accessor('driverName', {
//             header: 'Driver',
//             cell: ({ row }) => (
//                 <div>
//                     {row.original.driverName}
//                     <br />
//                     <Typography variant='body2' color='text.secondary'>{row.original.driverMobile}</Typography>
//                 </div>
//             )
//         }),
//         columnHelper.accessor('bankName', { header: 'Bank', cell: ({ row }) => row.original.bankName || 'N/A' }),
//         columnHelper.accessor('accountHolderName', { header: 'Account Holder', cell: ({ row }) => row.original.accountHolderName || 'N/A' }),
//         columnHelper.accessor('accountNo', {
//             header: 'Account No.',
//             cell: ({ row }) => row.original.accountNo ? `****${row.original.accountNo.slice(-4)}` : 'N/A'
//         }),
//         columnHelper.accessor('ifscCode', { header: 'IFSC', cell: ({ row }) => row.original.ifscCode || 'N/A' }),
//         columnHelper.accessor('isActive', {
//             header: 'Status',
//             cell: ({ row }) => (
//                 <div className='flex items-center gap-2'>
//                     <Switch
//                         checked={row.original.isActive}
//                         onChange={() => handleStatusToggle(row.original)}
//                         size='small'
//                     />
//                     <Chip
//                         label={row.original.isActive ? 'Active' : 'Inactive'}
//                         size='small'
//                         color={row.original.isActive ? 'success' : 'error'}
//                         variant='tonal'
//                     />
//                 </div>
//             )
//         }),
//         columnHelper.accessor('actions', {
//             header: 'Actions',
//             cell: ({ row }) => (
//                 <div className='flex gap-1'>
//                     <Tooltip title="Edit">
//                         <IconButton size='small' onClick={() => handleEdit(row.original)}>
//                             <i className='ri-edit-line text-primary' />
//                         </IconButton>
//                     </Tooltip>
//                     <Tooltip title="Delete">
//                         <IconButton
//                             size="small"
//                             color="error"
//                             onClick={() => handleDelete(row.original.id)}
//                             sx={{ padding: '6px' }}
//                         >
//                             <i className="ri-delete-bin-line text-error" />
//                         </IconButton>
//                     </Tooltip>
//                 </div>
//             ),
//             enableSorting: false
//         })
//     ], [])
//     // ===================== React Table =====================
//     const table = useReactTable({
//         data,
//         columns,
//         state: { globalFilter, rowSelection },
//         filterFns: { fuzzy: fuzzyFilter },
//         globalFilterFn: fuzzyFilter,
//         enableRowSelection: true,
//         onRowSelectionChange: setRowSelection,
//         onGlobalFilterChange: setGlobalFilter,
//         getCoreRowModel: getCoreRowModel(),
//         getFilteredRowModel: getFilteredRowModel(),
//         getSortedRowModel: getSortedRowModel(),
//         getPaginationRowModel: getPaginationRowModel()
//     })
//     // ===================== Loading / Error =====================
//     if (isLoading) return <Card><CardContent className='flex justify-center p-12'><CircularProgress /> <Typography className='ml-3'>Loading vehicles...</Typography></CardContent></Card>
//     if (error) return <Card><CardContent><Alert severity='error'>{error}</Alert><Button variant='outlined' onClick={fetchVehicles}>Retry</Button></CardContent></Card>
//     // ===================== Render =====================
//     return (
//         <>
//             <Card>
//                 <CardContent className='flex justify-between flex-wrap items-center gap-4'>
//                     <div className='flex items-center gap-4'>
//                         <div>
//                             <Typography variant='h5' className='font-semibold'>Vehicle Information</Typography>
//                             <Typography variant='body2' color='text.secondary'>
//                                 Total: {data.length} vehicles
//                                 {selectedRowsCount > 0 && ` | Selected: ${selectedRowsCount}`}
//                             </Typography>
//                         </div>
//                         {selectedRowsCount > 0 && (
//                             <>
//                                 <Button
//                                     variant="outlined"
//                                     color="primary"
//                                     onClick={(e) => setActionMenuAnchor(e.currentTarget)}
//                                     startIcon={<i className="ri-more-2-line" />}
//                                 >
//                                     Actions ({selectedRowsCount})
//                                 </Button>
//                                 <Menu
//                                     anchorEl={actionMenuAnchor}
//                                     open={Boolean(actionMenuAnchor)}
//                                     onClose={() => setActionMenuAnchor(null)}
//                                 >
//                                     <MenuItem onClick={() => handleBulkStatusUpdate(true)}>
//                                         <ListItemIcon>
//                                             <i className="ri-check-line text-success" />
//                                         </ListItemIcon>
//                                         <ListItemText>Mark as Active</ListItemText>
//                                     </MenuItem>
//                                     <MenuItem onClick={() => handleBulkStatusUpdate(false)}>
//                                         <ListItemIcon>
//                                             <i className="ri-close-line text-error" />
//                                         </ListItemIcon>
//                                         <ListItemText>Mark as Inactive</ListItemText>
//                                     </MenuItem>
//                                     <MenuItem onClick={handleBulkDelete} sx={{ color: 'error.main' }}>
//                                         <ListItemIcon>
//                                             <i className="ri-delete-bin-line text-error" />
//                                         </ListItemIcon>
//                                         <ListItemText>Delete Selected</ListItemText>
//                                     </MenuItem>
//                                 </Menu>
//                             </>
//                         )}
//                     </div>
//                     <div className='flex gap-4'>
//                         <DebouncedInput
//                             value={globalFilter ?? ''}
//                             onChange={value => setGlobalFilter(String(value))}
//                             placeholder='Search by vehicle no, owner, or driver'
//                         />
//                         <Button variant='contained' startIcon={<i className='ri-add-line' />} onClick={() => { setEditData(null); setFormOpen(true) }}>
//                             Add Vehicle
//                         </Button>
//                     </div>
//                 </CardContent>
//                 <div className='overflow-x-auto'>
//                     <table className={tableStyles.table}>
//                         <thead>
//                             {table.getHeaderGroups().map(headerGroup => (
//                                 <tr key={headerGroup.id}>
//                                     {headerGroup.headers.map(header => (
//                                         <th key={header.id}>
//                                             {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
//                                         </th>
//                                     ))}
//                                 </tr>
//                             ))}
//                         </thead>
//                         <tbody>
//                             {table.getRowModel().rows.length === 0 ? (
//                                 <tr><td colSpan={columns.length} className='text-center p-8'>No vehicles found</td></tr>
//                             ) : (
//                                 table.getRowModel().rows.map(row => (
//                                     <tr key={row.id}>{row.getVisibleCells().map(cell => <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>)}</tr>
//                                 ))
//                             )}
//                         </tbody>
//                     </table>
//                 </div>
//                 <TablePagination
//                     rowsPerPageOptions={[10, 25, 50, 100]}
//                     component='div'
//                     count={table.getFilteredRowModel().rows.length}
//                     rowsPerPage={table.getState().pagination.pageSize}
//                     page={table.getState().pagination.pageIndex}
//                     onPageChange={(_, page) => table.setPageIndex(page)}
//                     onRowsPerPageChange={e => table.setPageSize(Number(e.target.value))}
//                 />
//             </Card>
//             {/* Add / Edit Drawer */}
//             <AddVehicleDrawer
//                 open={formOpen}
//                 handleClose={() => setFormOpen(false)}
//                 refreshData={fetchVehicles}
//                 editData={editData}
//             />
//             {/* Bulk Delete Confirmation Dialog */}
//             <Dialog
//                 open={bulkDeleteDialogOpen}
//                 onClose={() => !bulkDeleteLoading && setBulkDeleteDialogOpen(false)}
//             >
//                 <DialogTitle>Confirm Bulk Delete</DialogTitle>
//                 <DialogContent>
//                     <DialogContentText>
//                         Are you sure you want to delete {selectedRowsCount} selected vehicle(s)?
//                         This action cannot be undone.
//                     </DialogContentText>
//                 </DialogContent>
//                 <DialogActions>
//                     <Button
//                         onClick={() => setBulkDeleteDialogOpen(false)}
//                         disabled={bulkDeleteLoading}
//                     >
//                         Cancel
//                     </Button>
//                     <Button
//                         onClick={confirmBulkDelete}
//                         color="error"
//                         variant="contained"
//                         disabled={bulkDeleteLoading}
//                         startIcon={bulkDeleteLoading ? <CircularProgress size={20} color="inherit" /> : null}
//                     >
//                         {bulkDeleteLoading ? 'Deleting...' : 'Delete'}
//                     </Button>
//                 </DialogActions>
//             </Dialog>
//         </>
//     )
// }
// export default VehicleTable
'use client'
// ===================== React =====================
import { useState, useEffect, useMemo, useRef } from 'react'
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
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogActions from '@mui/material/DialogActions'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import OutlinedInput from '@mui/material/OutlinedInput'
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
// ===================== PDF Generation =====================
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
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
    // Report generation states
    const [reportDialogOpen, setReportDialogOpen] = useState(false)
    const [reportType, setReportType] = useState('all')
    const [reportFilter, setReportFilter] = useState('')
    const [ownerList, setOwnerList] = useState([])
    const [typeList, setTypeList] = useState([])
    const [isGeneratingReport, setIsGeneratingReport] = useState(false)
    // Bulk delete states
    const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false)
    const [bulkDeleteLoading, setBulkDeleteLoading] = useState(false)
    const [actionMenuAnchor, setActionMenuAnchor] = useState(null)
    const [reportMenuAnchor, setReportMenuAnchor] = useState(null)
    const selectedRowsCount = Object.keys(rowSelection).length
    // ===================== Fetch Vehicles =====================
    const fetchVehicles = async () => {
        try {
            setIsLoading(true)
            setError('')
            const res = await fetch('/api/apps/vehicles')
            if (!res.ok) throw new Error('Failed to fetch vehicles')
            const json = await res.json()
            if (json.success) {
                const transformed = json.data.map((v, i) => ({
                    id: v._id || v.id,
                    serialNo: i + 1,
                    vehicleNo: v.vehicleNo || '',
                    vehicleModel: v.model || '',
                    ownerName: v.ownerName || 'Unknown Owner',
                    driverName: v.driverName || 'No Driver',
                    driverMobile: v.driverMobile || 'N/A',
                    bankName: v.bankName || '',
                    accountNo: v.accountNo || '',
                    ifscCode: v.ifscCode || '',
                    accountHolderName: v.accountHolderName || '',
                    isActive: v.isActive !== undefined ? v.isActive : true,
                    documents: v.documents || [],
                    vehicleType: v.model || 'Standard', // Assuming this field exists
                }))
                setData(transformed)
                // Extract unique owners and types for report filters
                const owners = [...new Set(transformed.map(v => v.ownerName))].filter(Boolean)
                const types = [...new Set(transformed.map(v => v.vehicleType))].filter(Boolean)
                setOwnerList(owners)
                setTypeList(types)
            } else throw new Error(json.message || 'Failed to fetch vehicles')
        } catch (err) {
            setError(err.message)
        } finally {
            setIsLoading(false)
        }
    }
    useEffect(() => { fetchVehicles() }, [])
    // ===================== Status Toggle with Debug =====================
    // ===================== Status Toggle with Detailed Debugging =====================
    const pendingRequests = useRef(new Set())

    const handleStatusToggle = async vehicle => {
        const vehicleId = vehicle.id || vehicle._id

        try {
            const newStatus = !vehicle.isActive

            console.log('=== FRONTEND DEBUG ===')
            console.log('1. Vehicle object:', vehicle)
            console.log('2. Vehicle ID:', vehicleId)
            console.log('3. New status:', newStatus)
            console.log('4. ID type:', typeof vehicleId)
            console.log('5. ID length:', vehicleId?.length)
            console.log('6. Is valid MongoDB ID format?', /^[0-9a-fA-F]{24}$/.test(vehicleId))
            console.log('7. Full vehicle number:', vehicle.vehicleNo)

            if (!vehicleId) {
                throw new Error('Vehicle ID not found')
            }

            // Prevent multiple toggles on same vehicle
            if (pendingRequests.current.has(vehicleId)) {
                console.log('⚠️ Toggle already in progress for:', vehicleId)
                return
            }

            pendingRequests.current.add(vehicleId)

            // Store previous status for potential revert
            const previousStatus = vehicle.isActive

            // Optimistically update UI
            setData(prev => prev.map(v => {
                const currentId = v.id || v._id
                return currentId === vehicleId ? { ...v, isActive: newStatus } : v
            }))

            console.log('8. Sending PATCH request with payload:', {
                id: vehicleId,
                isActive: newStatus
            })

            const res = await fetch(`/api/apps/vehicles`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: vehicleId,
                    isActive: newStatus
                })
            })

            console.log('9. Response status:', res.status)
            console.log('10. Response status text:', res.statusText)

            const json = await res.json()
            console.log('11. API Response:', json)

            if (!res.ok) {
                console.error('12. API Error:', json)

                // Revert optimistic update on error
                setData(prev => prev.map(v => {
                    const currentId = v.id || v._id
                    return currentId === vehicleId ? { ...v, isActive: previousStatus } : v
                }))

                throw new Error(json.error || json.message || `HTTP ${res.status}`)
            }

            console.log('13. Status updated successfully')

        } catch (err) {
            console.error('❌ Status toggle error:', err)
            alert(`Error: ${err.message}`)
        } finally {
            if (vehicleId) {
                pendingRequests.current.delete(vehicleId)
                console.log('14. Removed from pending requests')
            }
        }
    }
    // ===================== Single Edit =====================
    const handleEdit = vehicle => {
        setEditData(vehicle)
        setFormOpen(true)
    }
    // ===================== Single Delete =====================
    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this vehicle?')) return
        try {
            const response = await fetch('/api/apps/vehicles', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id })
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
    // ===================== Bulk Delete =====================
    const handleBulkDelete = async () => {
        if (selectedRowsCount === 0) return
        setBulkDeleteDialogOpen(true)
    }
    const confirmBulkDelete = async () => {
        try {
            setBulkDeleteLoading(true)
            const selectedIds = Object.keys(rowSelection)
                .map(index => data[index]?.id)
                .filter(id => id)
            if (selectedIds.length === 0) {
                alert('No valid vehicles selected for deletion')
                return
            }
            const response = await fetch('/api/apps/vehicles', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids: selectedIds })
            })
            const result = await response.json()
            if (!response.ok) {
                throw new Error(result.error || result.message || 'Bulk delete failed')
            }
            if (result.success) {
                setRowSelection({})
                await fetchVehicles()
                alert(`Successfully deleted ${selectedIds.length} vehicle(s)`)
            }
        } catch (err) {
            console.error(err)
            alert(err.message || 'Failed to delete selected vehicles')
        } finally {
            setBulkDeleteLoading(false)
            setBulkDeleteDialogOpen(false)
            setActionMenuAnchor(null)
        }
    }
    // ===================== Bulk Status Update =====================
    const handleBulkStatusUpdate = async (status) => {
        try {
            const selectedIds = Object.keys(rowSelection)
                .map(index => data[index]?.id)
                .filter(id => id)
            if (selectedIds.length === 0) {
                alert('No vehicles selected')
                return
            }
            const response = await fetch('/api/apps/vehicles', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ids: selectedIds,
                    isActive: status
                })
            })
            const result = await response.json()
            if (!response.ok) {
                throw new Error(result.error || result.message || 'Bulk update failed')
            }
            if (result.success) {
                setData(prev =>
                    prev.map(vehicle =>
                        selectedIds.includes(vehicle.id)
                            ? { ...vehicle, isActive: status }
                            : vehicle
                    )
                )
                setRowSelection({})
                setActionMenuAnchor(null)
                alert(`Successfully updated ${selectedIds.length} vehicle(s) to ${status ? 'Active' : 'Inactive'}`)
            }
        } catch (err) {
            console.error(err)
            alert(err.message || 'Failed to update selected vehicles')
        }
    }
    // ===================== PDF Report Generation =====================
    const generatePDFReport = (filteredData, reportTitle) => {
        try {
            // Create new PDF document
            const doc = new jsPDF()
            // Add title
            doc.setFontSize(18)
            doc.setTextColor(41, 128, 185)
            doc.text(reportTitle, 14, 22)
            // Add generation date and time
            doc.setFontSize(10)
            doc.setTextColor(100, 100, 100)
            const now = new Date()
            const dateStr = now.toLocaleDateString() + ' ' + now.toLocaleTimeString()
            doc.text(`Generated on: ${dateStr}`, 14, 30)
            // Add summary statistics
            doc.setFontSize(11)
            doc.setTextColor(0, 0, 0)
            doc.text(`Total Vehicles: ${filteredData.length}`, 14, 40)
            const activeCount = filteredData.filter(v => v.isActive).length
            const inactiveCount = filteredData.length - activeCount
            doc.text(`Active: ${activeCount} | Inactive: ${inactiveCount}`, 14, 47)
            // Add a line separator
            doc.setDrawColor(200, 200, 200)
            doc.line(14, 52, 196, 52)
            // Prepare table data
            const tableColumn = [
                'Sr. No.',
                'Vehicle No.',
                'Model',
                'Owner',
                'Driver',
                'Driver Mobile',
                'Bank',
                'Account Holder',
                'Account No.',
                'IFSC',
                'Status'
            ]
            const tableRows = filteredData.map((vehicle, index) => [
                index + 1,
                vehicle.vehicleNo,
                vehicle.vehicleModel,
                vehicle.ownerName,
                vehicle.driverName,
                vehicle.driverMobile,
                vehicle.bankName || 'N/A',
                vehicle.accountHolderName || 'N/A',
                vehicle.accountNo ? `****${vehicle.accountNo.slice(-4)}` : 'N/A',
                vehicle.ifscCode || 'N/A',
                vehicle.isActive ? 'Active' : 'Inactive'
            ])
            // Generate table using autoTable
            autoTable(doc, {
                head: [tableColumn],
                body: tableRows,
                startY: 60,
                styles: {
                    fontSize: 8,
                    cellPadding: 2,
                    lineColor: [220, 220, 220],
                    lineWidth: 0.1
                },
                headStyles: {
                    fillColor: [41, 128, 185],
                    textColor: 255,
                    fontStyle: 'bold',
                    halign: 'center'
                },
                bodyStyles: {
                    textColor: [50, 50, 50]
                },
                alternateRowStyles: {
                    fillColor: [245, 245, 245]
                },
                columnStyles: {
                    0: { halign: 'center' }, // Sr. No.
                    11: { halign: 'center' } // Status
                },
                margin: { top: 60, right: 14, bottom: 20, left: 14 },
                didDrawPage: function (data) {
                    // Add footer on each page
                    doc.setFontSize(8)
                    doc.setTextColor(150, 150, 150)
                    doc.text(
                        `Page ${data.pageNumber} of ${data.pageCount}`,
                        doc.internal.pageSize.width / 2,
                        doc.internal.pageSize.height - 10,
                        { align: 'center' }
                    )
                }
            })
            // Add summary at the end
            const finalY = doc.lastAutoTable.finalY || 60
            doc.setFontSize(10)
            doc.setTextColor(41, 128, 185)
            doc.text('Summary', 14, finalY + 15)
            doc.setFontSize(9)
            doc.setTextColor(80, 80, 80)
            doc.text(`Total Vehicles: ${filteredData.length}`, 14, finalY + 25)
            doc.text(`Active Vehicles: ${activeCount}`, 14, finalY + 32)
            doc.text(`Inactive Vehicles: ${inactiveCount}`, 14, finalY + 39)
            // Save the PDF
            const fileName = `${reportTitle.replace(/[^a-zA-Z0-9]/g, '_')}_${now.getTime()}.pdf`
            doc.save(fileName)
        } catch (error) {
            console.error('Error in generatePDFReport:', error)
            throw error
        }
    }
    const handleGenerateReport = () => {
        try {
            let filteredData = []
            let reportTitle = ''
            switch (reportType) {
                case 'all':
                    filteredData = data
                    reportTitle = 'Complete Vehicle Report'
                    break
                case 'owner':
                    filteredData = data.filter(v => v.ownerName === reportFilter)
                    reportTitle = `Vehicle Report - Owner: ${reportFilter}`
                    break
                case 'type':
                    filteredData = data.filter(v => (v.vehicleType || 'Standard') === reportFilter)
                    reportTitle = `Vehicle Report - Type: ${reportFilter}`
                    break
                case 'selected':
                    filteredData = Object.keys(rowSelection)
                        .map(index => data[index])
                        .filter(Boolean)
                    reportTitle = `Selected Vehicles Report (${filteredData.length} vehicles)`
                    break
                default:
                    filteredData = data
                    reportTitle = 'Vehicle Report'
            }
            if (filteredData.length === 0) {
                alert('No vehicles found for the selected criteria')
                return
            }
            setIsGeneratingReport(true)
            // Use setTimeout to prevent UI blocking
            setTimeout(() => {
                try {
                    generatePDFReport(filteredData, reportTitle)
                } catch (error) {
                    console.error('Error generating PDF:', error)
                    alert('Failed to generate PDF report. Please check console for details.')
                } finally {
                    setIsGeneratingReport(false)
                    setReportDialogOpen(false)
                    setReportMenuAnchor(null)
                    setReportType('all')
                    setReportFilter('')
                }
            }, 100)
        } catch (error) {
            console.error('Error in handleGenerateReport:', error)
            alert('Failed to generate report')
            setIsGeneratingReport(false)
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
    ], [data])
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
                    <div className='flex items-center gap-4'>
                        <div>
                            <Typography variant='h5' className='font-semibold'>Vehicle Information</Typography>
                            <Typography variant='body2' color='text.secondary'>
                                Total: {data.length} vehicles
                                {selectedRowsCount > 0 && ` | Selected: ${selectedRowsCount}`}
                            </Typography>
                        </div>
                        <div className='flex gap-2'>
                            {/* Report Generation Button */}
                            <Button
                                variant="outlined"
                                color="secondary"
                                onClick={(e) => setReportMenuAnchor(e.currentTarget)}
                                startIcon={<i className="ri-file-pdf-line" />}
                            >
                                Reports
                            </Button>
                            <Menu
                                anchorEl={reportMenuAnchor}
                                open={Boolean(reportMenuAnchor)}
                                onClose={() => setReportMenuAnchor(null)}
                            >
                                <MenuItem onClick={() => {
                                    setReportType('all')
                                    setReportDialogOpen(true)
                                    setReportMenuAnchor(null)
                                }}>
                                    <ListItemIcon>
                                        <i className="ri-file-list-line" />
                                    </ListItemIcon>
                                    <ListItemText>Complete Vehicle Report</ListItemText>
                                </MenuItem>
                                <MenuItem onClick={() => {
                                    setReportType('owner')
                                    setReportDialogOpen(true)
                                    setReportMenuAnchor(null)
                                }}>
                                    <ListItemIcon>
                                        <i className="ri-user-line" />
                                    </ListItemIcon>
                                    <ListItemText>Report by Owner</ListItemText>
                                </MenuItem>
                                <MenuItem onClick={() => {
                                    setReportType('type')
                                    setReportDialogOpen(true)
                                    setReportMenuAnchor(null)
                                }}>
                                    <ListItemIcon>
                                        <i className="ri-car-line" />
                                    </ListItemIcon>
                                    <ListItemText>Report by Vehicle Type</ListItemText>
                                </MenuItem>
                                <MenuItem
                                    onClick={() => {
                                        setReportType('selected')
                                        setReportDialogOpen(true)
                                        setReportMenuAnchor(null)
                                    }}
                                    disabled={selectedRowsCount === 0}
                                >
                                    <ListItemIcon>
                                        <i className="ri-checkbox-multiple-line" />
                                    </ListItemIcon>
                                    <ListItemText>Selected Vehicles Report ({selectedRowsCount})</ListItemText>
                                </MenuItem>
                            </Menu>
                            {selectedRowsCount > 0 && (
                                <>
                                    <Button
                                        variant="outlined"
                                        color="primary"
                                        onClick={(e) => setActionMenuAnchor(e.currentTarget)}
                                        startIcon={<i className="ri-more-2-line" />}
                                    >
                                        Actions ({selectedRowsCount})
                                    </Button>
                                    <Menu
                                        anchorEl={actionMenuAnchor}
                                        open={Boolean(actionMenuAnchor)}
                                        onClose={() => setActionMenuAnchor(null)}
                                    >
                                        <MenuItem onClick={() => handleBulkStatusUpdate(true)}>
                                            <ListItemIcon>
                                                <i className="ri-check-line text-success" />
                                            </ListItemIcon>
                                            <ListItemText>Mark as Active</ListItemText>
                                        </MenuItem>
                                        <MenuItem onClick={() => handleBulkStatusUpdate(false)}>
                                            <ListItemIcon>
                                                <i className="ri-close-line text-error" />
                                            </ListItemIcon>
                                            <ListItemText>Mark as Inactive</ListItemText>
                                        </MenuItem>
                                        <MenuItem onClick={handleBulkDelete} sx={{ color: 'error.main' }}>
                                            <ListItemIcon>
                                                <i className="ri-delete-bin-line text-error" />
                                            </ListItemIcon>
                                            <ListItemText>Delete Selected</ListItemText>
                                        </MenuItem>
                                    </Menu>
                                </>
                            )}
                        </div>
                    </div>
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
            {/* Report Generation Dialog */}
            <Dialog open={reportDialogOpen} onClose={() => !isGeneratingReport && setReportDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>
                    Generate Report
                    {reportType === 'all' && ' - All Vehicles'}
                    {reportType === 'owner' && ' - By Owner'}
                    {reportType === 'type' && ' - By Vehicle Type'}
                    {reportType === 'selected' && ' - Selected Vehicles'}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ mb: 3 }}>
                        {reportType === 'all' && 'Generate a complete report of all vehicles in the system.'}
                        {reportType === 'owner' && 'Select an owner to generate a report for their vehicles.'}
                        {reportType === 'type' && 'Select a vehicle type to generate a report.'}
                        {reportType === 'selected' && `Generate a report for ${selectedRowsCount} selected vehicle(s).`}
                    </DialogContentText>
                    {(reportType === 'owner' || reportType === 'type') && (
                        <FormControl fullWidth sx={{ mt: 2 }}>
                            <InputLabel>
                                {reportType === 'owner' ? 'Select Owner' : 'Select Vehicle Type'}
                            </InputLabel>
                            <Select
                                value={reportFilter}
                                onChange={(e) => setReportFilter(e.target.value)}
                                input={<OutlinedInput label={reportType === 'owner' ? 'Select Owner' : 'Select Vehicle Type'} />}
                            >
                                {(reportType === 'owner' ? ownerList : typeList).map((item) => (
                                    <MenuItem key={item} value={item}>
                                        {item}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => {
                            setReportDialogOpen(false)
                            setReportFilter('')
                            setReportType('all')
                        }}
                        disabled={isGeneratingReport}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleGenerateReport}
                        color="secondary"
                        variant="contained"
                        disabled={
                            isGeneratingReport ||
                            ((reportType === 'owner' || reportType === 'type') && !reportFilter) ||
                            (reportType === 'selected' && selectedRowsCount === 0)
                        }
                        startIcon={isGeneratingReport ? <CircularProgress size={20} color="inherit" /> : <i className="ri-file-pdf-line" />}
                    >
                        {isGeneratingReport ? 'Generating...' : 'Generate PDF'}
                    </Button>
                </DialogActions>
            </Dialog>
            {/* Add / Edit Drawer */}
            <AddVehicleDrawer
                open={formOpen}
                handleClose={() => setFormOpen(false)}
                refreshData={fetchVehicles}
                editData={editData}
            />
            {/* Bulk Delete Confirmation Dialog */}
            <Dialog
                open={bulkDeleteDialogOpen}
                onClose={() => !bulkDeleteLoading && setBulkDeleteDialogOpen(false)}
            >
                <DialogTitle>Confirm Bulk Delete</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete {selectedRowsCount} selected vehicle(s)?
                        This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => setBulkDeleteDialogOpen(false)}
                        disabled={bulkDeleteLoading}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={confirmBulkDelete}
                        color="error"
                        variant="contained"
                        disabled={bulkDeleteLoading}
                        startIcon={bulkDeleteLoading ? <CircularProgress size={20} color="inherit" /> : null}
                    >
                        {bulkDeleteLoading ? 'Deleting...' : 'Delete'}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    )
}
export default VehicleTable
