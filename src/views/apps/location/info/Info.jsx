// 'use client'
// import { useState, useMemo, useEffect } from 'react'
// import {
//     Card,
//     CardContent,
//     Button,
//     Typography,
//     TextField,
//     Switch,
//     Chip,
//     IconButton,
//     Tooltip,
//     Dialog,
//     DialogTitle,
//     DialogContent,
//     DialogActions,
//     MenuItem,
//     Grid,
//     Alert,
//     CircularProgress,
//     Radio,
//     FormControlLabel
// } from '@mui/material'
// import {
//     createColumnHelper,
//     getCoreRowModel,
//     flexRender,
//     useReactTable
// } from '@tanstack/react-table'
// import tableStyles from '@core/styles/table.module.css'
// const columnHelper = createColumnHelper()
// const LocationInfo = () => {
//     /* ---------------- STATE ---------------- */
//     const [data, setData] = useState([])
//     const [locations, setLocations] = useState([])
//     const [vehicleTypes, setVehicleTypes] = useState([])
//     const [loading, setLoading] = useState(true)
//     const [error, setError] = useState(null)
//     const [dialogOpen, setDialogOpen] = useState(false)
//     const [editingItem, setEditingItem] = useState(null)
//     const [selectedLocationFor, setSelectedLocationFor] = useState('from') // 'from' or 'to'
//     const [form, setForm] = useState({
//         srno: '',
//         fromLocation: '',
//         viaTo: '',
//         distanceKm: '',
//         routeCode: '',
//         vehicleType: '',
//         dieselLtr: '',
//         advanceAmount: '',
//         isActive: true
//     })
//     /* ---------------- FETCH DATA ---------------- */
//     const fetchData = async () => {
//         try {
//             setLoading(true)
//             setError(null)
//             const [routesRes, locationsRes, vehicleTypesRes] = await Promise.all([
//                 fetch('/api/apps/location/info'),
//                 fetch('/api/apps/location'),
//                 fetch('/api/apps/vehicles/types')
//             ])
//             const [routesData, locationsData, vehicleTypesData] = await Promise.all([
//                 routesRes.json(),
//                 locationsRes.json(),
//                 vehicleTypesRes.json()
//             ])
//             if (routesData.success) setData(routesData.data || [])
//             setLocations(locationsData.data || [])
//             if (vehicleTypesData.success) setVehicleTypes(vehicleTypesData.data || [])
//         } catch (err) {
//             setError(err.message)
//             console.error('Error fetching data:', err)
//         } finally {
//             setLoading(false)
//         }
//     }
//     useEffect(() => {
//         fetchData()
//     }, [])
//     /* ---------------- ADD ---------------- */
//     const openAddDialog = () => {
//         setEditingItem(null)
//         setForm({
//             srno: data.length > 0 ? Math.max(...data.map(d => d.srno)) + 1 : 1,
//             fromLocation: '',
//             viaTo: '',
//             distanceKm: '',
//             routeCode: '',
//             vehicleType: '',
//             dieselLtr: '',
//             advanceAmount: '',
//             isActive: true
//         })
//         setSelectedLocationFor('from')
//         setDialogOpen(true)
//     }
//     /* ---------------- EDIT ---------------- */
//     const openEditDialog = async (row) => {
//         try {
//             const res = await fetch(`/api/apps/location/info?id=${row._id}`)
//             if (!res.ok) throw new Error('Failed to fetch route details')
//             const routeData = await res.json()
//             if (!routeData.success) throw new Error(routeData.message)
//             setEditingItem(routeData.data)
//             setForm({
//                 srno: routeData.data.srno || '',
//                 fromLocation: routeData.data.fromLocation?._id || '',
//                 viaTo: routeData.data.viaTo?._id || '',
//                 distanceKm: routeData.data.distanceKm || '',
//                 routeCode: routeData.data.routeCode || '',
//                 vehicleType: routeData.data.vehicleType?.id || '',
//                 dieselLtr: routeData.data.dieselLtr || '',
//                 advanceAmount: routeData.data.advanceAmount || '',
//                 isActive: routeData.data.isActive !== false
//             })
//             setSelectedLocationFor('from')
//             setDialogOpen(true)
//         } catch (err) {
//             setError(err.message)
//             console.error('Error fetching route details:', err)
//         }
//     }
//     /* ---------------- SUBMIT ---------------- */
//     const handleSubmit = async () => {
//         try {
//             if (!form.fromLocation) {
//                 alert('Please select From Location!')
//                 return
//             }
//             if (!form.viaTo) {
//                 alert('Please select Via/To Location!')
//                 return
//             }
//             if (!form.routeCode) {
//                 alert('Please enter Route Code!')
//                 return
//             }
//             const url = editingItem
//                 ? `/api/apps/location/info?id=${editingItem._id}`
//                 : '/api/apps/location/info/'
//             const method = editingItem ? 'PUT' : 'POST'
//             const payload = {
//                 ...(editingItem && { id: editingItem._id }),
//                 srno: Number(form.srno),
//                 fromLocation: form.fromLocation,
//                 viaTo: form.viaTo,
//                 distanceKm: Number(form.distanceKm) || 0,
//                 routeCode: form.routeCode,
//                 vehicleType: form.vehicleType,
//                 dieselLtr: Number(form.dieselLtr) || 0,
//                 advanceAmount: Number(form.advanceAmount) || 0,
//                 isActive: form.isActive
//             }
//             const response = await fetch(url, {
//                 method,
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify(payload)
//             })
//             const result = await response.json()
//             if (!response.ok) throw new Error(result.error || result.message || 'Operation failed')
//             if (result.success) {
//                 await fetchData()
//                 setDialogOpen(false)
//                 setEditingItem(null)
//                 alert(editingItem ? 'Route updated successfully!' : 'Route created successfully!')
//             }
//         } catch (err) {
//             setError(err.message)
//             alert(`Error: ${err.message}`)
//             console.error('Submit error:', err)
//         }
//     }
//     /* ---------------- DELETE ---------------- */
//     const handleDelete = async (id) => {
//         if (!confirm('Are you sure you want to delete this route?')) return
//         try {
//             const response = await fetch('/api/apps/location/info/', {
//                 method: 'DELETE',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify({ id })
//             })
//             const result = await response.json()
//             if (!response.ok) throw new Error(result.error || result.message || 'Delete failed')
//             if (result.success) {
//                 await fetchData()
//                 alert('Route deleted successfully!')
//             }
//         } catch (err) {
//             setError(err.message)
//             alert(`Error: ${err.message}`)
//             console.error('Delete error:', err)
//         }
//     }
//     /* ---------------- TABLE ---------------- */
//     const columns = useMemo(
//         () => [
//             columnHelper.accessor('srno', { header: 'SR No', cell: ({ row }) => row.original.srno || '-' }),
//             columnHelper.accessor('fromLocation', { header: 'From Location', cell: ({ row }) => row.original.fromLocation?.locationName || '-' }),
//             columnHelper.accessor('viaTo', { header: 'Via & To', cell: ({ row }) => row.original.viaTo?.locationName || '-' }),
//             columnHelper.accessor('distanceKm', { header: 'Distance (Km)', cell: ({ row }) => row.original.distanceKm || '-' }),
//             columnHelper.accessor('routeCode', { header: 'Route Code', cell: ({ row }) => row.original.routeCode || '-' }),
//             columnHelper.accessor('vehicleType', { header: 'Vehicle Type', cell: ({ row }) => row.original.vehicleType?._id || '-' }),
//             columnHelper.accessor('dieselLtr', { header: 'Diesel LTR', cell: ({ row }) => row.original.dieselLtr || '-' }),
//             columnHelper.accessor('advanceAmount', { header: 'Advance', cell: ({ row }) => row.original.advanceAmount ? `${row.original.advanceAmount}` : '-' }),
//             columnHelper.accessor('isActive', {
//                 header: 'Status',
//                 cell: ({ row }) => <Chip label={row.original.isActive ? 'Active' : 'Inactive'} color={row.original.isActive ? 'success' : 'error'} size="small" />
//             }),
//             columnHelper.display({
//                 id: 'actions',
//                 header: 'Actions',
//                 cell: ({ row }) => (
//                     <div className="flex gap-2">
//                         <Tooltip title="Edit">
//                             <IconButton onClick={() => openEditDialog(row.original)}><i className="ri-edit-line text-primary" /></IconButton>
//                         </Tooltip>
//                         <Tooltip title="Delete">
//                             <IconButton onClick={() => handleDelete(row.original._id)}><i className="ri-delete-bin-line text-error" /></IconButton>
//                         </Tooltip>
//                     </div>
//                 )
//             })
//         ],
//         []
//     )
//     const table = useReactTable({ data, columns, getCoreRowModel: getCoreRowModel() })
//     const filteredToLocations = locations.filter(
//         loc => loc._id !== form.fromLocation
//     )
//     /* ---------------- UI ---------------- */
//     if (loading) return <div className="flex justify-center items-center h-64"><CircularProgress /></div>
//     if (error) return <Alert severity="error" className="mb-4">Error: {error}</Alert>
//     return (
//         <>
//             <Card>
//                 <CardContent className="flex justify-between items-center">
//                     <Typography variant="h5">Route Master</Typography>
//                     <Button variant="contained" onClick={openAddDialog}>Add Route</Button>
//                 </CardContent>
//                 {data.length === 0 ? (
//                     <CardContent>
//                         <Typography align="center" color="textSecondary">No routes found. Add your first route!</Typography>
//                     </CardContent>
//                 ) : (
//                     <div className="overflow-x-auto">
//                         <table className={tableStyles.table}>
//                             <thead>{table.getHeaderGroups().map(hg => (<tr key={hg.id}>{hg.headers.map(h => (<th key={h.id}>{flexRender(h.column.columnDef.header, h.getContext())}</th>))}</tr>))}</thead>
//                             <tbody>{table.getRowModel().rows.map(row => (<tr key={row.id}>{row.getVisibleCells().map(cell => (<td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>))}</tr>))}</tbody>
//                         </table>
//                     </div>
//                 )}
//             </Card>
//             {/* ---------------- DIALOG ---------------- */}
//             <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}  >
//                 <DialogTitle sx={{ pb: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
//                     <Typography variant="h5" component="div" sx={{ fontWeight: 600 }}>
//                         {editingItem ? 'Edit Route' : 'Add New Route'}
//                     </Typography>
//                 </DialogTitle>
//                 <DialogContent sx={{ pt: 1 }}>
//                     <Grid container spacing={2}>
//                         {/* From */}
//                         <Grid item xs={4} md={2}>
//                             <TextField select fullWidth required value={form.fromLocation}
//                                 onChange={e => setForm({ ...form, fromLocation: e.target.value, viaTo: '' })}
//                                 SelectProps={{ displayEmpty: true }}
//                             >
//                                 <MenuItem value="" disabled>Select From</MenuItem>
//                                 {locations.map(l => (
//                                     <MenuItem key={l._id} value={l._id}>{l.locationName}</MenuItem>
//                                 ))}
//                             </TextField>
//                         </Grid>
//                         {/* To */}
//                         <Grid item xs={4} md={2}>
//                             <TextField select fullWidth required value={form.viaTo}
//                                 onChange={e => setForm({ ...form, viaTo: e.target.value })}
//                                 SelectProps={{ displayEmpty: true }}
//                             >
//                                 <MenuItem value="" disabled>Select To</MenuItem>
//                                 {locations.map(l => (
//                                     <MenuItem key={l._id} value={l._id}>{l.locationName}</MenuItem>
//                                 ))}
//                             </TextField>
//                         </Grid>
//                         {/* Route Code */}
//                         <Grid item xs={4} md={2}>
//                             <TextField fullWidth required label="Route Code"
//                                 value={form.routeCode}
//                                 onChange={e => setForm({ ...form, routeCode: e.target.value })}
//                             />
//                         </Grid>
//                         {/* Distance */}
//                         <Grid item xs={4} md={2}>
//                             <TextField fullWidth type="number" label="KM"
//                                 value={form.distanceKm}
//                                 onChange={e => setForm({ ...form, distanceKm: e.target.value })}
//                             />
//                         </Grid>
//                         {/* Vehicle */}
//                         <Grid item xs={4} md={2}>
//                             <TextField select fullWidth value={form.vehicleType}
//                                 onChange={e => setForm({ ...form, vehicleType: e.target.value })}
//                             >
//                                 <MenuItem value="" disabled>Vehicle</MenuItem>
//                                 {vehicleTypes.map(v => (
//                                     <MenuItem key={v.id} value={v.id}>{v.type}</MenuItem>
//                                 ))}
//                             </TextField>
//                         </Grid>
//                         {/* Diesel */}
//                         <Grid item xs={4} md={2}>
//                             <TextField fullWidth type="number" label="Diesel"
//                                 value={form.dieselLtr}
//                                 onChange={e => setForm({ ...form, dieselLtr: e.target.value })}
//                             />
//                         </Grid>
//                         {/* Advance */}
//                         <Grid item xs={4} md={2}>
//                             <TextField fullWidth type="number" label="Advance "
//                                 value={form.advanceAmount}
//                                 onChange={e => setForm({ ...form, advanceAmount: e.target.value })}
//                             />
//                         </Grid>
//                         {/* Status (span remaining columns nicely) */}
//                         <Grid item xs={12} md={10}>
//                             <Card variant="outlined" sx={{ p: 1.5 }}>
//                                 <div className="flex justify-between items-center">
//                                     <Typography fontWeight={500}>Route Status</Typography>
//                                     <Switch
//                                         checked={form.isActive}
//                                         onChange={e => setForm({ ...form, isActive: e.target.checked })}
//                                         color="success"
//                                     />
//                                 </div>
//                             </Card>
//                         </Grid>
//                     </Grid>
//                 </DialogContent>
//                 <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid', borderColor: 'divider' }}>
//                     <Button onClick={() => setDialogOpen(false)} variant="outlined" color="inherit">
//                         Cancel
//                     </Button>
//                     <Button variant="contained" onClick={handleSubmit} color="primary" startIcon={<i className="ri-save-line" />}>
//                         {editingItem ? 'Update Route' : 'Create Route'}
//                     </Button>
//                 </DialogActions>
//             </Dialog>
//         </>
//     )
// }
// export default LocationInfo
// ---------------------------------------Table Down Up Form--------------------------------------------------------
'use client'
import { useState, useMemo, useEffect } from 'react'
import {
    Card,
    CardContent,
    Button,
    Typography,
    TextField,
    Switch,
    Chip,
    IconButton,
    MenuItem,
    Grid,
    Alert,
    CircularProgress,
    Box,
    Divider,
    Tooltip
} from '@mui/material'
import {
    createColumnHelper,
    getCoreRowModel,
    flexRender,
    useReactTable
} from '@tanstack/react-table'
import tableStyles from '@core/styles/table.module.css'
const columnHelper = createColumnHelper()
const LocationInfo = () => {
    const [data, setData] = useState([])
    const [locations, setLocations] = useState([])
    const [vehicleTypes, setVehicleTypes] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [editingItem, setEditingItem] = useState(null)
    const [form, setForm] = useState({
        srno: '',
        fromLocation: '',
        viaTo: '',
        distanceKm: '',
        routeCode: '',
        vehicleType: '',
        dieselLtr: '',
        advanceAmount: '',
        isActive: true
    })
    // ---------------- FETCH DATA ----------------
    const fetchData = async () => {
        try {
            setLoading(true)
            setError(null)
            const [routesRes, locationsRes, vehicleTypesRes] = await Promise.all([
                fetch('/api/apps/location/info'),
                fetch('/api/apps/location'),
                fetch('/api/apps/vehicles/types'),
            ])
            const [routesData, locationsData, vehicleTypesData] = await Promise.all([
                routesRes.json(),
                locationsRes.json(),
                vehicleTypesRes.json()
            ])
            if (routesData.success) setData(routesData.data || [])
            setLocations(locationsData.data || [])
            if (vehicleTypesData.success) setVehicleTypes(vehicleTypesData.data || [])
        } catch (err) {
            setError(err.message)
            console.error(err)
        } finally {
            setLoading(false)
        }
    }
    useEffect(() => {
        fetchData()
    }, [])
    // ---------------- ADD / EDIT ----------------
    const openAddForm = () => {
        setEditingItem(null)
        setForm({
            srno: data.length > 0 ? Math.max(...data.map(d => d.srno)) + 1 : 1,
            fromLocation: '',
            viaTo: '',
            distanceKm: '',
            routeCode: '',
            vehicleType: '',
            dieselLtr: '',
            advanceAmount: '',
            isActive: true
        })
    }
    const openEditForm = (row) => {
        setEditingItem(row)
        setForm({
            srno: row.srno || '',
            fromLocation: row.fromLocation?._id || '',
            viaTo: row.viaTo?._id || '',
            distanceKm: row.distanceKm || '',
            routeCode: row.routeCode || '',
            vehicleType: row.vehicleType?.id || '',
            dieselLtr: row.dieselLtr || '',
            advanceAmount: row.advanceAmount || '',
            isActive: row.isActive !== false
        })
    }
    const handleSubmit = async () => {
        try {
            if (!form.fromLocation) return alert('Please select From Location!')
            if (!form.viaTo) return alert('Please select To Location!')
            if (!form.routeCode) return alert('Please enter Route Code!')
            const url = editingItem
                ? `/api/apps/location/info?id=${editingItem._id}`
                : '/api/apps/location/info/'
            const method = editingItem ? 'PUT' : 'POST'
            const payload = {
                ...(editingItem && { id: editingItem._id }),
                srno: Number(form.srno),
                fromLocation: form.fromLocation,
                viaTo: form.viaTo,
                distanceKm: Number(form.distanceKm) || 0,
                routeCode: form.routeCode,
                vehicleType: form.vehicleType,
                dieselLtr: Number(form.dieselLtr) || 0,
                advanceAmount: Number(form.advanceAmount) || 0,
                isActive: form.isActive
            }
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })
            const result = await response.json()
            if (!response.ok) throw new Error(result.error || result.message || 'Operation failed')
            if (result.success) {
                await fetchData()
                openAddForm()
                setEditingItem(null)
                alert(editingItem ? 'Route updated successfully!' : 'Route created successfully!')
            }
        } catch (err) {
            console.error(err)
            alert(err.message)
        }
    }
    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this route?')) return
        try {
            const response = await fetch('/api/apps/location/info/', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id })
            })
            const result = await response.json()
            if (!response.ok) throw new Error(result.error || result.message || 'Delete failed')
            if (result.success) await fetchData()
        } catch (err) {
            console.error(err)
            alert(err.message)
        }
    }
    // ---------------- TABLE ----------------
    const columns = useMemo(() => [
        columnHelper.accessor('srno', {
            header: 'SR',
            cell: ({ row }) => row.original.srno || '-',
            size: 50
        }),
        columnHelper.accessor('fromLocation', {
            header: 'From',
            cell: ({ row }) => row.original.fromLocation?.locationName || '-',
            size: 120
        }),
        columnHelper.accessor('viaTo', {
            header: 'To',
            cell: ({ row }) => row.original.viaTo?.locationName || '-',
            size: 120
        }),
        columnHelper.accessor('distanceKm', {
            header: 'Km',
            cell: ({ row }) => row.original.distanceKm || '-',
            size: 60
        }),
        columnHelper.accessor('routeCode', {
            header: 'Code',
            cell: ({ row }) => row.original.routeCode || '-',
            size: 80
        }),
        columnHelper.accessor('vehicleType', {
            header: 'Vehicle',
            cell: ({ row }) => row.original.vehicleType?.vehicleType || '+',
            size: 100
        }),
        columnHelper.accessor('dieselLtr', {
            header: 'Diesel',
            cell: ({ row }) => row.original.dieselLtr || '-',
            size: 70
        }),
        columnHelper.accessor('advanceAmount', {
            header: 'Advance',
            cell: ({ row }) => row.original.advanceAmount ? `${row.original.advanceAmount}` : '-',
            size: 90
        }),
        columnHelper.accessor('isActive', {
            header: 'Status',
            cell: ({ row }) => (
                <Chip
                    label={row.original.isActive ? 'Active' : 'Inactive'}
                    color={row.original.isActive ? 'success' : 'error'}
                    size="small"
                    sx={{ fontWeight: 500, fontSize: '11px' }}
                />
            ),
            size: 80
        }),
        columnHelper.display({
            id: 'actions',
            header: 'Actions',
            cell: ({ row }) => (
                <Box display="flex" gap={0.5}>
                    <Tooltip title="Edit">
                        <IconButton
                            size="small"
                            color="primary"
                            onClick={() => openEditForm(row.original)}
                            sx={{ padding: '6px' }}
                        >
                            <i className="ri-edit-line text-primary" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                        <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDelete(row.original._id)}
                            sx={{ padding: '6px' }}
                        >
                            <i className="ri-delete-bin-line text-error" />
                        </IconButton>
                    </Tooltip>
                </Box>
            ),
            size: 80
        })
    ], [data])
    const table = useReactTable({ data, columns, getCoreRowModel: getCoreRowModel() })
    const filteredToLocations = locations.filter(
        loc => loc._id !== form.fromLocation
    )
    const fromLocations = locations
    if (loading) return (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
            <CircularProgress size={48} />
        </Box>
    )
    if (error) return <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>Error: {error}</Alert>
    return (
        <Box sx={{ p: { xs: 2, sm: 3 } }}>
            {/* Form Card */}
            <Card sx={{ mb: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', borderRadius: 2 }}>
                <CardContent sx={{ p: 3 }}>
                    <Typography variant="h5" sx={{ mb: 3, fontWeight: 600, color: '#1a1a1a' }}>
                        Route Master
                    </Typography>
                    <Divider sx={{ mb: 3 }} />
                    <Grid container spacing={2.5}>
                        {/* SR No */}
                        {/* From Location */}
                        <Grid item xs={6} sm={4} md={5}>
                            <TextField
                                select
                                label="From Location"
                                value={form.fromLocation}
                                onChange={e => setForm({ ...form, fromLocation: e.target.value })}
                                fullWidth
                                required
                                size="small"
                                sx={{
                                    '& .MuiInputBase-root': {
                                        height: '42px',
                                        width: "200px"
                                    }
                                }}
                            >
                                <MenuItem value="">Select Location</MenuItem>
                                {fromLocations.map(loc => (
                                    <MenuItem key={loc._id} value={loc._id}>{loc.locationName}</MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        {/* To Location */}
                        <Grid item xs={12} sm={4} md={5}>
                            <TextField
                                select
                                label="Via/To"
                                value={form.viaTo}
                                onChange={e => setForm({ ...form, viaTo: e.target.value })}
                                fullWidth
                                required
                                size="small"
                                sx={{
                                    '& .MuiInputBase-root': {
                                        height: '42px',
                                        width: "200px"
                                    }
                                }}
                            >
                                <MenuItem value="">Select Location</MenuItem>
                                {filteredToLocations.filter(loc => loc._id !== form.fromLocation).map(loc => (
                                    <MenuItem key={loc._id} value={loc._id}>{loc.locationName}</MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        {/* Route Code */}
                        <Grid item xs={6} sm={4} md={3}>
                            <TextField
                                label="Route Code"
                                value={form.routeCode}
                                onChange={e => setForm({ ...form, routeCode: e.target.value })}
                                fullWidth
                                required
                                size="small"
                                sx={{
                                    '& .MuiInputBase-root': {
                                        height: '42px'
                                    }
                                }}
                            />
                        </Grid>
                        {/* Vehicle Type */}
                        <Grid item xs={6} sm={4} md={3}>
                            <TextField
                                select
                                label="Vehicle Type"
                                value={form.vehicleType}
                                onChange={e => setForm({ ...form, vehicleType: e.target.value })}
                                fullWidth
                                size="small"
                                sx={{
                                    '& .MuiInputBase-root': {
                                        height: '42px',
                                        width: "200px"
                                    }
                                }}
                            >
                                <MenuItem value="">Select Vehicle Type</MenuItem>
                                {vehicleTypes.map(v => (
                                    <MenuItem key={v.id} value={v.id}>{v.type}</MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        {/* Distance */}
                        <Grid item xs={6} sm={4} md={2}>
                            <TextField
                                label="Distance (Km)"
                                type="number"
                                value={form.distanceKm}
                                onChange={e => setForm({ ...form, distanceKm: e.target.value })}
                                fullWidth
                                size="small"
                                sx={{
                                    '& .MuiInputBase-root': {
                                        height: '42px'
                                    }
                                }}
                            />
                        </Grid>
                        {/* Diesel LTR */}
                        <Grid item xs={6} sm={4} md={2}>
                            <TextField
                                label="Diesel LTR"
                                type="number"
                                value={form.dieselLtr}
                                onChange={e => setForm({ ...form, dieselLtr: e.target.value })}
                                fullWidth
                                size="small"
                                sx={{
                                    '& .MuiInputBase-root': {
                                        height: '42px'
                                    }
                                }}
                            />
                        </Grid>
                        {/* Advance Amount */}
                        <Grid item xs={6} sm={4} md={2}>
                            <TextField
                                label="Advance Amount"
                                type="number"
                                value={form.advanceAmount}
                                onChange={e => setForm({ ...form, advanceAmount: e.target.value })}
                                fullWidth
                                size="small"
                                sx={{
                                    '& .MuiInputBase-root': {
                                        height: '42px'
                                    }
                                }}
                            />
                        </Grid>
                        {/* Status */}
                        <Grid item xs={6} sm={4} md={2}>
                            <Box display="flex" alignItems="center" height="42px">
                                <Switch
                                    checked={form.isActive}
                                    onChange={e => setForm({ ...form, isActive: e.target.checked })}
                                    color="primary"
                                />
                                <Typography variant="body2" sx={{ ml: 1, fontWeight: 500 }}>
                                    Active
                                </Typography>
                            </Box>
                        </Grid>
                        {/* Submit Buttons */}
                        <Grid item xs={12}>
                            <Box display="flex" gap={2} mt={1} flexWrap="wrap">
                                <Button
                                    variant="contained"
                                    onClick={handleSubmit}
                                    sx={{
                                        textTransform: 'none',
                                        px: 4,
                                        fontWeight: 500,
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                        minWidth: '120px'
                                    }}
                                >
                                    {editingItem ? 'Update' : 'Create'}
                                </Button>
                                {!editingItem && (
                                    <Button
                                        variant="outlined"
                                        onClick={openAddForm}
                                        sx={{ textTransform: 'none', px: 4, minWidth: '100px' }}
                                    >
                                        Reset
                                    </Button>
                                )}
                            </Box>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>
            {/* Table Card with Internal Scroll */}
            <Card sx={{ boxShadow: '0 2px 8px rgba(0,0,0,0.08)', borderRadius: 2 }}>
                <CardContent sx={{ p: 0 }}>
                    <Box sx={{ p: 2.5, pb: 2 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, color: '#1a1a1a' }}>
                            Routes List
                        </Typography>
                    </Box>
                    <Divider />
                    {/* Scrollable Table Container */}
                    <Box
                        sx={{
                            maxHeight: '500px',
                            overflowY: 'auto',
                            overflowX: 'auto',
                            '&::-webkit-scrollbar': {
                                width: '8px',
                                height: '8px'
                            },
                            '&::-webkit-scrollbar-track': {
                                backgroundColor: '#f1f1f1'
                            },
                            '&::-webkit-scrollbar-thumb': {
                                backgroundColor: '#c1c1c1',
                                borderRadius: '4px',
                                '&:hover': {
                                    backgroundColor: '#a8a8a8'
                                }
                            }
                        }}
                    >
                        <table className={tableStyles.table} style={{ minWidth: '900px' }}>
                            <thead style={{ position: 'sticky', top: 0, backgroundColor: '#fafafa', zIndex: 1 }}>
                                {table.getHeaderGroups().map(hg => (
                                    <tr key={hg.id}>
                                        {hg.headers.map(h => (
                                            <th
                                                key={h.id}
                                                style={{
                                                    padding: '12px 10px',
                                                    fontWeight: 600,
                                                    fontSize: '13px',
                                                    color: '#424242',
                                                    borderBottom: '2px solid #e0e0e0',
                                                    whiteSpace: 'nowrap'
                                                }}
                                            >
                                                {flexRender(h.column.columnDef.header, h.getContext())}
                                            </th>
                                        ))}
                                    </tr>
                                ))}
                            </thead>
                            <tbody>
                                {table.getRowModel().rows.length === 0 ? (
                                    <tr>
                                        <td colSpan={columns.length} style={{ textAlign: 'center', padding: '48px' }}>
                                            <Typography variant="body1" color="textSecondary">
                                                No routes found. Create your first route above.
                                            </Typography>
                                        </td>
                                    </tr>
                                ) : (
                                    table.getRowModel().rows.map(row => (
                                        <tr
                                            key={row.id}
                                            style={{
                                                borderBottom: '1px solid #f0f0f0',
                                                transition: 'background-color 0.2s'
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fafafa'}
                                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                        >
                                            {row.getVisibleCells().map(cell => (
                                                <td
                                                    key={cell.id}
                                                    style={{
                                                        padding: '10px',
                                                        fontSize: '13px',
                                                        color: '#424242'
                                                    }}
                                                >
                                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                </td>
                                            ))}
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </Box>
                </CardContent>
            </Card>
        </Box>
    )
}
export default LocationInfo
