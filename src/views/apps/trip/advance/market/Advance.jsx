// 'use client'
// import { useState, useMemo, useRef, useEffect } from 'react'
// import {
//     Card,
//     CardContent,
//     Typography,
//     Button,
//     Dialog,
//     DialogTitle,
//     DialogContent,
//     TextField,
//     MenuItem,
//     Divider,
//     IconButton,
//     Table,
//     TableHead,
//     TableRow,
//     TableCell,
//     TableBody,
//     CircularProgress,
//     Alert,
//     Snackbar,
//     Autocomplete
// } from '@mui/material'
// import {
//     createColumnHelper,
//     getCoreRowModel,
//     useReactTable,
//     flexRender
// } from '@tanstack/react-table'
// import tableStyles from '@core/styles/table.module.css'
// /* ================= CONSTANTS ================= */
// const advanceTypes = [
//     '1st Advance',
//     '2nd Advance',
//     'Diesel ',
// ]
// const columnHelper = createColumnHelper()
// /* ================================================= */
// const AdvanceRegister = () => {
//     /* ================= STATE ================= */
//     const [rows, setRows] = useState([])
//     const [loading, setLoading] = useState(true)
//     const [open, setOpen] = useState(false)
//     const [snackbar, setSnackbar] = useState({
//         open: false,
//         message: '',
//         severity: 'success'
//     })
//     const [trip, setTrip] = useState({
//         id: null,
//         _id: null,
//         vehicleNo: '',
//         vehicleType: '',
//         fromLocation: '',
//         toLocation: '',
//         lhsNo: '',
//         bankName: '',
//         driverName: '',
//         dieselLtr: '',
//         dieselRate: '',
//         totalDieselAmount: '',
//         totalAdvanceAmount: 0,
//         advances: []
//     })
//     const [advanceForm, setAdvanceForm] = useState({
//         advanceType: '',
//         amount: '',
//         remark: ''
//     })
//     const [formLoading, setFormLoading] = useState(false)
//     const printRef = useRef()
//     /* ================= API ENDPOINTS ================= */
//     const API_BASE = 'https://srtransport.vercel.app/api/apps'
//     const TRIPS_API = `${API_BASE}/trip/market`  // ✅ CORRECTED: 'trips' not 'trip'
//     const ADVANCES_API = `${API_BASE}/trip/advance/market`
//     /* ================= FETCH TRIPS ================= */
//     useEffect(() => {
//         fetchTrips()
//     }, [])
//     const fetchTrips = async () => {
//         try {
//             setLoading(true)
//             const response = await fetch(TRIPS_API)
//             const result = await response.json()
//             if (result.success) {
//                 setRows(result.data || [])
//             } else {
//                 showSnackbar('Failed to fetch trips: ' + (result.error || result.message), 'error')
//             }
//         } catch (error) {
//             console.error('Error fetching trips:', error)
//             showSnackbar('Error fetching trips: ' + error.message, 'error')
//         } finally {
//             setLoading(false)
//         }
//     }
//     /* ================= FETCH TRIP WITH ADVANCES ================= */
//     const fetchTripWithAdvances = async (tripId) => {
//         try {
//             setFormLoading(true)
//             // Fetch trip details
//             const tripResponse = await fetch(`${TRIPS_API}?id=${tripId}`)
//             const tripResult = await tripResponse.json()
//             if (!tripResult.success || !tripResult.data) {
//                 showSnackbar('Trip not found', 'error')
//                 return null
//             }
//             // Fetch advances for this trip
//             const advancesResponse = await fetch(`${ADVANCES_API}?tripId=${tripId}`)
//             const advancesResult = await advancesResponse.json()
//             return {
//                 trip: tripResult.data,
//                 advances: advancesResult.success ? advancesResult.data : []
//             }
//         } catch (error) {
//             console.error('Error fetching trip with advances:', error)
//             showSnackbar('Error loading trip details', 'error')
//             return null
//         } finally {
//             setFormLoading(false)
//         }
//     }
//     /* ================= CALCULATIONS ================= */
//     const totalDiesel = Number(trip.dieselLtr || 0) * Number(trip.dieselRate || 0)
//     const totalAdvancePaid = trip.advances.reduce((s, a) => s + Number(a.amount || 0), 0)
//     const balance = totalDiesel - totalAdvancePaid
//     /* ================= ADD / EDIT ================= */
//     const openAdd = () => {
//         setTrip({
//             id: null,
//             _id: null,
//             vehicleNo: '',
//             vehicleType: '',
//             fromLocation: '',
//             toLocation: '',
//             lhsNo: '',
//             bankName: '',
//             driverName: '',
//             dieselLtr: '',
//             dieselRate: '',
//             totalDieselAmount: '',
//             totalAdvanceAmount: 0,
//             advances: []
//         })
//         setOpen(true)
//     }
//     const openEdit = async (row) => {
//         try {
//             if (!row._id && !row.id) {
//                 showSnackbar('Trip ID is required', 'error')
//                 return
//             }
//             const tripId = row._id || row.id
//             const data = await fetchTripWithAdvances(tripId)
//             if (data) {
//                 const { trip: tripData, advances } = data
//                 setTrip({
//                     id: tripData.id || null,
//                     _id: tripData._id || tripId,
//                     vehicleNo: tripData.vehicleNo || '',
//                     vehicleType: tripData.vehicleType || '',
//                     fromLocation: tripData.fromLocation || '',
//                     toLocation: tripData.toLocation || '',
//                     lhsNo: tripData.lhsNo || '',
//                     bankName: tripData.bankName || '',
//                     driverName: tripData.driverName || '',
//                     dieselLtr: tripData.dieselLtr || 0,
//                     dieselRate: tripData.dieselRate || 0,
//                     totalDieselAmount: tripData.totalDieselAmount || 0,
//                     totalAdvanceAmount: tripData.totalAdvanceAmount || 0,
//                     advances: advances
//                 })
//                 setOpen(true)
//             }
//         } catch (error) {
//             console.error('Error opening edit:', error)
//             showSnackbar('Error loading trip details', 'error')
//         }
//     }
//     /* ================= ADD ADVANCE ================= */
//     const addAdvance = async () => {
//         if (!advanceForm.advanceType || !advanceForm.amount || !trip._id || !trip.vehicleNo) {
//             showSnackbar('Please fill all required fields', 'warning')
//             return
//         }
//         try {
//             setFormLoading(true)
//             const response = await fetch(ADVANCES_API, {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify({
//                     tripId: trip._id,
//                     vehicleNo: trip.vehicleNo,
//                     advanceType: advanceForm.advanceType,
//                     amount: advanceForm.amount,
//                     remark: advanceForm.remark,
//                     date: new Date().toISOString().split('T')[0]
//                 })
//             })
//             const result = await response.json()
//             if (result.success) {
//                 // Refresh advances for this trip
//                 const data = await fetchTripWithAdvances(trip._id)
//                 if (data) {
//                     setTrip(prev => ({
//                         ...prev,
//                         advances: data.advances,
//                         totalAdvanceAmount: result.totalAdvancePaid || 0
//                     }))
//                 }
//                 setAdvanceForm({ advanceType: '', amount: '', remark: '' })
//                 showSnackbar('Advance added successfully', 'success')
//             } else {
//                 showSnackbar(result.error || 'Failed to add advance', 'error')
//             }
//         } catch (error) {
//             console.error('Error adding advance:', error)
//             showSnackbar('Error adding advance', 'error')
//         } finally {
//             setFormLoading(false)
//         }
//     }
//     /* ================= DELETE ADVANCE ================= */
//     const deleteAdvance = async (advanceId) => {
//         if (!advanceId) return
//         if (!confirm('Are you sure you want to delete this advance?')) return
//         try {
//             setFormLoading(true)
//             const response = await fetch(ADVANCES_API, {
//                 method: 'DELETE',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify({ advanceId })
//             })
//             const result = await response.json()
//             if (result.success) {
//                 // Refresh advances for this trip
//                 const data = await fetchTripWithAdvances(trip._id)
//                 if (data) {
//                     setTrip(prev => ({
//                         ...prev,
//                         advances: data.advances,
//                         totalAdvanceAmount: result.totalAdvancePaid || 0
//                     }))
//                 }
//                 showSnackbar('Advance deleted successfully', 'success')
//             } else {
//                 showSnackbar(result.error || 'Failed to delete advance', 'error')
//             }
//         } catch (error) {
//             console.error('Error deleting advance:', error)
//             showSnackbar('Error deleting advance', 'error')
//         } finally {
//             setFormLoading(false)
//         }
//     }
//     /* ================= PRINT ================= */
//     const handlePrint = () => {
//         if (!rows.length) {
//             showSnackbar('No data to print', 'warning')
//             return
//         }
//         const w = window.open('', '', 'width=900,height=650')
//         w.document.write(printRef.current.innerHTML)
//         w.document.close()
//         w.print()
//     }
//     /* ================= SNACKBAR ================= */
//     const showSnackbar = (message, severity = 'success') => {
//         setSnackbar({
//             open: true,
//             message,
//             severity
//         })
//     }
//     const handleCloseSnackbar = () => {
//         setSnackbar(prev => ({ ...prev, open: false }))
//     }
//     /* ================= TABLE COLUMNS ================= */
//     const columns = useMemo(
//         () => [
//             columnHelper.accessor('vehicleNo', { header: 'Vehicle No' }),
//             columnHelper.accessor('vehicleType', { header: 'Vehicle Type' }),
//             columnHelper.accessor('fromLocation', { header: 'From' }),
//             columnHelper.accessor('toLocation', { header: 'To' }),
//             columnHelper.accessor('lhsNo', { header: 'LHS No' }),
//             columnHelper.accessor('bankName', { header: 'Bank' }),
//             columnHelper.accessor('driverName', { header: 'Driver' }),
//             columnHelper.accessor('dieselLtr', {
//                 header: 'Diesel LTR',
//                 cell: ({ row }) => row.original.dieselLtr || 0
//             }),
//             columnHelper.accessor('dieselRate', {
//                 header: 'Diesel Rate',
//                 cell: ({ row }) => row.original.dieselRate || 0
//             }),
//             columnHelper.display({
//                 header: 'Total Diesel',
//                 cell: ({ row }) => {
//                     const ltr = row.original.dieselLtr || 0
//                     const rate = row.original.dieselRate || 0
//                     return (ltr * rate).toFixed(2)
//                 }
//             }),
//             columnHelper.accessor('totalAdvanceAmount', {
//                 header: 'Advance Paid',
//                 cell: ({ row }) => row.original.totalAdvanceAmount || 0
//             }),
//             columnHelper.display({
//                 header: 'Balance',
//                 cell: ({ row }) => {
//                     const ltr = row.original.dieselLtr || 0
//                     const rate = row.original.dieselRate || 0
//                     const totalAdvance = row.original.totalAdvanceAmount || 0
//                     const totalDiesel = ltr * rate
//                     return (totalDiesel - totalAdvance).toFixed(2)
//                 }
//             }),
//             columnHelper.display({
//                 header: 'Action',
//                 cell: ({ row }) => (
//                     <Button
//                         size="small"
//                         variant="outlined"
//                         onClick={() => openEdit(row.original)}
//                         disabled={loading}
//                     >
//                         View/Manage
//                     </Button>
//                 )
//             })
//         ],
//         [loading]
//     )
//     const table = useReactTable({
//         data: rows,
//         columns,
//         getCoreRowModel: getCoreRowModel()
//     })
//     /* ================= RENDER ================= */
//     return (
//         <>
//             {/* ================= TABLE ================= */}
//             <Card>
//                 <CardContent>
//                     <div className="flex justify-between items-center">
//                         <Typography variant="h5">Advance Register</Typography>
//                         <div className="flex gap-2 items-center">
//                             {loading && <CircularProgress size={20} />}
//                             {/* ADD ADVANCE BUTTON (New) */}
//                             <Button
//                                 variant="contained"
//                                 onClick={openAdd}
//                                 disabled={loading}
//                                 startIcon={<i className="ri-add-line" />}
//                             >
//                                 Add Advance
//                             </Button>
//                             <Button
//                                 variant="outlined"
//                                 onClick={handlePrint}
//                                 disabled={!rows.length || loading}
//                                 startIcon={<i className="ri-printer-line" />}
//                             >
//                                 Print / PDF
//                             </Button>
//                         </div>
//                     </div>
//                     {loading ? (
//                         <div className="flex justify-center p-8">
//                             <CircularProgress />
//                         </div>
//                     ) : rows.length === 0 ? (
//                         <div className="p-8 text-center">
//                             <Typography color="textSecondary">
//                                 No trips found. Please create trips first.
//                             </Typography>
//                         </div>
//                     ) : (
//                         <div className="overflow-x-auto mt-4">
//                             <table className={tableStyles.table}>
//                                 <thead>
//                                     {table.getHeaderGroups().map(hg => (
//                                         <tr key={hg.id}>
//                                             {hg.headers.map(h => (
//                                                 <th key={h.id}>
//                                                     {flexRender(h.column.columnDef.header, h.getContext())}
//                                                 </th>
//                                             ))}
//                                         </tr>
//                                     ))}
//                                 </thead>
//                                 <tbody>
//                                     {table.getRowModel().rows.map(row => (
//                                         <tr key={row.id}>
//                                             {row.getVisibleCells().map(cell => (
//                                                 <td key={cell.id}>
//                                                     {flexRender(cell.column.columnDef.cell, cell.getContext())}
//                                                 </td>
//                                             ))}
//                                         </tr>
//                                     ))}
//                                 </tbody>
//                             </table>
//                         </div>
//                     )}
//                 </CardContent>
//             </Card>
//             {/* ================= MODAL ================= */}
//             <Dialog
//                 open={open}
//                 maxWidth="xl"
//                 fullWidth
//                 onClose={() => !formLoading && setOpen(false)}
//             >
//                 <DialogTitle>
//                     {trip._id ? `Advance Entry - ${trip.vehicleNo}` : 'Add New Advance'}
//                     {formLoading && <CircularProgress size={20} sx={{ ml: 2 }} />}
//                     <IconButton
//                         onClick={() => setOpen(false)}
//                         style={{ float: 'right' }}
//                         disabled={formLoading}
//                     >
//                         ✕
//                     </IconButton>
//                 </DialogTitle>
//                 <DialogContent dividers ref={printRef}>
//                     {/* ADD NEW ADVANCE FORM (when no trip selected) */}
//                     {!trip._id ? (
//                         <div className="flex flex-col gap-4">
//                             <Typography variant="h6" className="mb-3">Select a Trip</Typography>
//                             <Autocomplete
//                                 options={rows.filter(row => row.vehicleNo)}
//                                 getOptionLabel={(option) => `${option.vehicleNo} - ${option.driverName || ''}`}
//                                 value={null}
//                                 onChange={(_, newValue) => {
//                                     if (newValue) {
//                                         openEdit(newValue)
//                                     }
//                                 }}
//                                 renderInput={(params) => (
//                                     <TextField
//                                         {...params}
//                                         label="Search by Vehicle No or Driver"
//                                         placeholder="Type to search..."
//                                         fullWidth
//                                     />
//                                 )}
//                                 renderOption={(props, option) => (
//                                     <li {...props}>
//                                         <div>
//                                             <Typography variant="body2">{option.vehicleNo}</Typography>
//                                             <Typography variant="caption" color="textSecondary">
//                                                 {option.driverName} | {option.fromLocation} → {option.toLocation}
//                                             </Typography>
//                                         </div>
//                                     </li>
//                                 )}
//                             />
//                         </div>
//                     ) : (
//                         /* EXISTING TRIP ADVANCE MANAGEMENT */
//                         <>
//                             <div className="grid grid-cols-2 gap-6">
//                                 {/* LEFT SIDE - Trip Details (Readonly) */}
//                                 <div className="grid grid-cols-2 gap-3">
//                                     <TextField
//                                         label="Vehicle No"
//                                         value={trip.vehicleNo}
//                                         InputProps={{ readOnly: true }}
//                                         fullWidth
//                                     />
//                                     <TextField
//                                         label="Vehicle Type"
//                                         value={trip.vehicleType}
//                                         InputProps={{ readOnly: true }}
//                                         fullWidth
//                                     />
//                                     <TextField
//                                         label="From"
//                                         value={trip.fromLocation}
//                                         InputProps={{ readOnly: true }}
//                                         fullWidth
//                                     />
//                                     <TextField
//                                         label="To"
//                                         value={trip.toLocation}
//                                         InputProps={{ readOnly: true }}
//                                         fullWidth
//                                     />
//                                     <TextField
//                                         label="LHS No"
//                                         value={trip.lhsNo}
//                                         InputProps={{ readOnly: true }}
//                                         fullWidth
//                                     />
//                                     <TextField
//                                         label="Bank Name"
//                                         value={trip.bankName}
//                                         InputProps={{ readOnly: true }}
//                                         fullWidth
//                                     />
//                                     <TextField
//                                         label="Driver Name"
//                                         value={trip.driverName}
//                                         InputProps={{ readOnly: true }}
//                                         fullWidth
//                                     />
//                                 </div>
//                                 {/* RIGHT SIDE - Calculations */}
//                                 <div className="grid grid-cols-2 gap-3">
//                                     <TextField
//                                         label="Diesel LTR"
//                                         type="number"
//                                         value={trip.dieselLtr || 0}
//                                         InputProps={{ readOnly: true }}
//                                         fullWidth
//                                     />
//                                     <TextField
//                                         label="Diesel Rate"
//                                         type="number"
//                                         value={trip.dieselRate || 0}
//                                         InputProps={{ readOnly: true }}
//                                         fullWidth
//                                     />
//                                     <TextField
//                                         label="Total Diesel Amount"
//                                         value={trip.totalDieselAmount || totalDiesel.toFixed(2)}
//                                         InputProps={{ readOnly: true }}
//                                         fullWidth
//                                     />
//                                     <TextField
//                                         label="Total Advance Paid"
//                                         value={trip.totalAdvanceAmount || totalAdvancePaid.toFixed(2)}
//                                         InputProps={{ readOnly: true }}
//                                         fullWidth
//                                     />
//                                     <TextField
//                                         label="Balance"
//                                         value={balance.toFixed(2)}
//                                         InputProps={{ readOnly: true }}
//                                         fullWidth
//                                     />
//                                 </div>
//                             </div>
//                             <Divider className="my-4" />
//                             {/* ADVANCE ENTRY SECTION */}
//                             <Typography variant="h6" className="mb-3">Add New Advance</Typography>
//                             <div className="grid grid-cols-4 gap-3 items-end">
//                                 <TextField
//                                     select
//                                     label="Advance Type"
//                                     value={advanceForm.advanceType}
//                                     onChange={e =>
//                                         setAdvanceForm({ ...advanceForm, advanceType: e.target.value })
//                                     }
//                                     fullWidth
//                                     disabled={formLoading}
//                                 >
//                                     <MenuItem value="">Select Type</MenuItem>
//                                     {advanceTypes.map(t => (
//                                         <MenuItem key={t} value={t}>{t}</MenuItem>
//                                     ))}
//                                 </TextField>
//                                 <TextField
//                                     label="Amount"
//                                     type="number"
//                                     value={advanceForm.amount}
//                                     fullWidth
//                                     disabled={formLoading}
//                                     onChange={e => {
//                                         const value = Number(e.target.value)
//                                         // Update state first
//                                         setAdvanceForm(prev => ({
//                                             ...prev,
//                                             amount: e.target.value
//                                         }))
//                                         // Validate
//                                         if (value > Number(balance)) {
//                                             showSnackbar('Invalid amount', 'error')
//                                             setAdvanceForm(prev => ({
//                                                 ...prev,
//                                                 amount: ''
//                                             }))
//                                         }
//                                     }}
//                                 />
//                                 <TextField
//                                     label="Remark"
//                                     value={advanceForm.remark}
//                                     onChange={e =>
//                                         setAdvanceForm({ ...advanceForm, remark: e.target.value })
//                                     }
//                                     fullWidth
//                                     disabled={formLoading}
//                                 />
//                                 <Button
//                                     variant="contained"
//                                     onClick={addAdvance}
//                                     fullWidth
//                                     disabled={formLoading}
//                                     startIcon={formLoading && <CircularProgress size={16} />}
//                                 >
//                                     Add Advance
//                                 </Button>
//                             </div>
//                             {/* ADVANCES TABLE */}
//                             {trip.advances && trip.advances.length > 0 && (
//                                 <>
//                                     <Typography variant="h6" className="mt-6 mb-3">Existing Advances</Typography>
//                                     <Table size="small" className="mt-2">
//                                         <TableHead>
//                                             <TableRow>
//                                                 <TableCell><strong>Type</strong></TableCell>
//                                                 <TableCell><strong>Amount</strong></TableCell>
//                                                 <TableCell><strong>Remark</strong></TableCell>
//                                                 <TableCell><strong>Date</strong></TableCell>
//                                                 <TableCell><strong>Action</strong></TableCell>
//                                             </TableRow>
//                                         </TableHead>
//                                         <TableBody>
//                                             {trip.advances.map((advance, index) => (
//                                                 <TableRow key={advance._id || index}>
//                                                     <TableCell>{advance.advanceType}</TableCell>
//                                                     <TableCell>{advance.amount}</TableCell>
//                                                     <TableCell>{advance.remark}</TableCell>
//                                                     <TableCell>{advance.date || 'N/A'}</TableCell>
//                                                     <TableCell>
//                                                         <Button
//                                                             color="error"
//                                                             size="small"
//                                                             onClick={() => deleteAdvance(advance._id)}
//                                                             disabled={formLoading}
//                                                         >
//                                                             Delete
//                                                         </Button>
//                                                     </TableCell>
//                                                 </TableRow>
//                                             ))}
//                                         </TableBody>
//                                     </Table>
//                                 </>
//                             )}
//                         </>
//                     )}
//                     <div className="flex justify-end gap-2 mt-4">
//                         <Button
//                             variant="contained"
//                             onClick={async () => {
//                                 // Refresh the data when closing
//                                 await fetchTrips()
//                                 setOpen(false)
//                             }}
//                             disabled={formLoading}
//                         >
//                             Close
//                         </Button>
//                     </div>
//                 </DialogContent>
//             </Dialog>
//             {/* ================= SNACKBAR ================= */}
//             <Snackbar
//                 open={snackbar.open}
//                 autoHideDuration={6000}
//                 onClose={handleCloseSnackbar}
//                 anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
//             >
//                 <Alert
//                     onClose={handleCloseSnackbar}
//                     severity={snackbar.severity}
//                     variant="filled"
//                 >
//                     {snackbar.message}
//                 </Alert>
//             </Snackbar>
//         </>
//     )
// }
// export default AdvanceRegister
'use client'
import { useState, useMemo, useRef, useEffect } from 'react'
import {
    Card,
    CardContent,
    Typography,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    TextField,
    MenuItem,
    Divider,
    IconButton,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    CircularProgress,
    Alert,
    Snackbar,
    Autocomplete
} from '@mui/material'
import {
    createColumnHelper,
    getCoreRowModel,
    useReactTable,
    flexRender
} from '@tanstack/react-table'
import tableStyles from '@core/styles/table.module.css'
/* ================= CONSTANTS ================= */
const advanceTypes = [
    '1st Advance',
    '2nd Advance',
    'Diesel',
]
const columnHelper = createColumnHelper()
/* ================================================= */
const AdvanceRegister = () => {
    /* ================= STATE ================= */
    const [rows, setRows] = useState([])
    const [loading, setLoading] = useState(true)
    const [open, setOpen] = useState(false)
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
    })
    const [trip, setTrip] = useState({
        id: null,
        _id: null,
        vehicleNo: '',
        vehicleType: '',
        fromLocation: '',
        toLocation: '',
        lhsNo: '',
        bankName: '',
        driverName: '',
        dieselLtr: '',
        dieselRate: '',
        totalDieselAmount: '',
        totalAdvanceAmount: 0,
        advances: []
    })
    const [advanceForm, setAdvanceForm] = useState({
        advanceType: '',
        amount: '',
        remark: ''
    })
    const [formLoading, setFormLoading] = useState(false)
    const printRef = useRef()
    /* ================= FILTER AVAILABLE ADVANCE TYPES ================= */
    const availableAdvanceTypes = useMemo(() => {
        if (!trip._id) return advanceTypes;
        const usedAdvanceTypes = trip.advances?.map(adv => adv.advanceType) || [];
        // For Diesel type, always show it (allow multiple diesel entries)
        // For numbered advances (1st, 2nd, etc.), filter out if already used
        return advanceTypes.filter(type => {
            if (type.includes('Diesel')) {
                return true; // Always show Diesel
            }
            // For numbered advances, check if already used
            return !usedAdvanceTypes.includes(type);
        });
    }, [trip.advances, trip._id]);
    /* ================= API ENDPOINTS ================= */
    const API_BASE = '/api/apps'
    const TRIPS_API = `${API_BASE}/trip/market`
    const ADVANCES_API = `${API_BASE}/trip/advance/market`
    /* ================= FETCH TRIPS ================= */
    useEffect(() => {
        fetchTrips()
    }, [])
    const fetchTrips = async () => {
        try {
            setLoading(true)
            const response = await fetch(TRIPS_API)
            const result = await response.json()
            if (result.success) {
                setRows(result.data || [])
            } else {
                showSnackbar('Failed to fetch trips: ' + (result.error || result.message), 'error')
            }
        } catch (error) {
            console.error('Error fetching trips:', error)
            showSnackbar('Error fetching trips: ' + error.message, 'error')
        } finally {
            setLoading(false)
        }
    }
    /* ================= FETCH TRIP WITH ADVANCES ================= */
    const fetchTripWithAdvances = async (tripId) => {
        try {
            setFormLoading(true)
            // Fetch trip details
            const tripResponse = await fetch(`${TRIPS_API}?id=${tripId}`)
            const tripResult = await tripResponse.json()
            if (!tripResult.success || !tripResult.data) {
                showSnackbar('Trip not found', 'error')
                return null
            }
            // Fetch advances for this trip
            const advancesResponse = await fetch(`${ADVANCES_API}?tripId=${tripId}`)
            const advancesResult = await advancesResponse.json()
            return {
                trip: tripResult.data,
                advances: advancesResult.success ? advancesResult.data : []
            }
        } catch (error) {
            console.error('Error fetching trip with advances:', error)
            showSnackbar('Error loading trip details', 'error')
            return null
        } finally {
            setFormLoading(false)
        }
    }
    /* ================= CALCULATIONS ================= */
    const totalDiesel = Number(trip.dieselLtr || 0) * Number(trip.dieselRate || 0)
    const totalAdvancePaid = trip.advances.reduce((s, a) => s + Number(a.amount || 0), 0)
    const balance = totalDiesel - totalAdvancePaid
    /* ================= ADD / EDIT ================= */
    const openAdd = () => {
        setTrip({
            id: null,
            _id: null,
            vehicleNo: '',
            vehicleType: '',
            fromLocation: '',
            toLocation: '',
            lhsNo: '',
            bankName: '',
            driverName: '',
            dieselLtr: '',
            dieselRate: '',
            totalDieselAmount: '',
            totalAdvanceAmount: 0,
            advances: []
        })
        setAdvanceForm({
            advanceType: '',
            amount: '',
            remark: ''
        })
        setOpen(true)
    }
    const openEdit = async (row) => {
        try {
            if (!row._id && !row.id) {
                showSnackbar('Trip ID is required', 'error')
                return
            }
            const tripId = row._id || row.id
            const data = await fetchTripWithAdvances(tripId)
            if (data) {
                const { trip: tripData, advances } = data
                setTrip({
                    id: tripData.id || null,
                    _id: tripData._id || tripId,
                    vehicleNo: tripData.vehicleNo || '',
                    vehicleType: tripData.vehicleType || '',
                    fromLocation: tripData.fromLocation || '',
                    toLocation: tripData.toLocation || '',
                    lhsNo: tripData.lhsNo || '',
                    bankName: tripData.bankName || '',
                    driverName: tripData.driverName || '',
                    dieselLtr: tripData.dieselLtr || 0,
                    dieselRate: tripData.dieselRate || 0,
                    totalDieselAmount: tripData.totalDieselAmount || 0,
                    totalAdvanceAmount: tripData.totalAdvanceAmount || 0,
                    advances: advances
                })
                setAdvanceForm({
                    advanceType: '',
                    amount: '',
                    remark: ''
                })
                setOpen(true)
            }
        } catch (error) {
            console.error('Error opening edit:', error)
            showSnackbar('Error loading trip details', 'error')
        }
    }
    /* ================= ADD ADVANCE ================= */
    const addAdvance = async () => {
        // Validate required fields
        if (!advanceForm.advanceType || !advanceForm.amount || !trip._id || !trip.vehicleNo) {
            showSnackbar('Please fill all required fields', 'warning')
            return
        }
        // Validate if advance type already exists (except for Diesel)
        if (!advanceForm.advanceType.includes('Diesel')) {
            const isAdvanceTypeUsed = trip.advances?.some(
                adv => adv.advanceType === advanceForm.advanceType
            )
            if (isAdvanceTypeUsed) {
                showSnackbar(`"${advanceForm.advanceType}" has already been added. Please select another type.`, 'error')
                return
            }
        }
        // Validate amount
        const amount = Number(advanceForm.amount)
        if (amount <= 0) {
            showSnackbar('Please enter a valid amount greater than 0', 'error')
            return
        }
        // Validate if amount exceeds balance
        if (amount > balance) {
            showSnackbar(`Amount cannot exceed available balance of ${balance.toFixed(2)}`, 'error')
            return
        }
        try {
            setFormLoading(true)
            const response = await fetch(ADVANCES_API, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tripId: trip._id,
                    vehicleNo: trip.vehicleNo,
                    advanceType: advanceForm.advanceType,
                    amount: advanceForm.amount,
                    remark: advanceForm.remark,
                    date: new Date().toISOString().split('T')[0]
                })
            })
            const result = await response.json()
            if (result.success) {
                // Refresh advances for this trip
                const data = await fetchTripWithAdvances(trip._id)
                if (data) {
                    setTrip(prev => ({
                        ...prev,
                        advances: data.advances,
                        totalAdvanceAmount: result.totalAdvancePaid || 0
                    }))
                }
                // Reset form
                setAdvanceForm({ advanceType: '', amount: '', remark: '' })
                showSnackbar('Advance added successfully', 'success')
            } else {
                showSnackbar(result.error || 'Failed to add advance', 'error')
            }
        } catch (error) {
            console.error('Error adding advance:', error)
            showSnackbar('Error adding advance', 'error')
        } finally {
            setFormLoading(false)
        }
    }
    /* ================= DELETE ADVANCE ================= */
    const deleteAdvance = async (advanceId) => {
        if (!advanceId) return
        if (!confirm('Are you sure you want to delete this advance?')) return
        try {
            setFormLoading(true)
            const response = await fetch(ADVANCES_API, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ advanceId })
            })
            const result = await response.json()
            if (result.success) {
                // Refresh advances for this trip
                const data = await fetchTripWithAdvances(trip._id)
                if (data) {
                    setTrip(prev => ({
                        ...prev,
                        advances: data.advances,
                        totalAdvanceAmount: result.totalAdvancePaid || 0
                    }))
                }
                showSnackbar('Advance deleted successfully', 'success')
            } else {
                showSnackbar(result.error || 'Failed to delete advance', 'error')
            }
        } catch (error) {
            console.error('Error deleting advance:', error)
            showSnackbar('Error deleting advance', 'error')
        } finally {
            setFormLoading(false)
        }
    }
    /* ================= PRINT ================= */
    const handlePrint = () => {
        if (!rows.length) {
            showSnackbar('No data to print', 'warning')
            return
        }
        const w = window.open('', '', 'width=900,height=650')
        w.document.write(printRef.current.innerHTML)
        w.document.close()
        w.print()
    }
    /* ================= SNACKBAR ================= */
    const showSnackbar = (message, severity = 'success') => {
        setSnackbar({
            open: true,
            message,
            severity
        })
    }
    const handleCloseSnackbar = () => {
        setSnackbar(prev => ({ ...prev, open: false }))
    }
    /* ================= TABLE COLUMNS ================= */
    const columns = useMemo(
        () => [
            columnHelper.accessor('vehicleNo', { header: 'Vehicle No' }),
            columnHelper.accessor('vehicleType', { header: 'Vehicle Type' }),
            columnHelper.accessor('fromLocation', { header: 'From' }),
            columnHelper.accessor('toLocation', { header: 'To' }),
            columnHelper.accessor('lhsNo', { header: 'LHS No' }),
            columnHelper.accessor('bankName', { header: 'Bank' }),
            columnHelper.accessor('driverName', { header: 'Driver' }),
            columnHelper.accessor('dieselLtr', {
                header: 'Diesel LTR',
                cell: ({ row }) => row.original.dieselLtr || 0
            }),
            columnHelper.accessor('dieselRate', {
                header: 'Diesel Rate',
                cell: ({ row }) => row.original.dieselRate || 0
            }),
            columnHelper.display({
                header: 'Total Diesel',
                cell: ({ row }) => {
                    const ltr = row.original.dieselLtr || 0
                    const rate = row.original.dieselRate || 0
                    return (ltr * rate).toFixed(2)
                }
            }),
            columnHelper.accessor('totalAdvanceAmount', {
                header: 'Advance Paid',
                cell: ({ row }) => row.original.totalAdvanceAmount || 0
            }),
            columnHelper.display({
                header: 'Balance',
                cell: ({ row }) => {
                    const ltr = row.original.dieselLtr || 0
                    const rate = row.original.dieselRate || 0
                    const totalAdvance = row.original.totalAdvanceAmount || 0
                    const totalDiesel = ltr * rate
                    return (totalDiesel - totalAdvance).toFixed(2)
                }
            }),
            columnHelper.display({
                header: 'Action',
                cell: ({ row }) => (
                    <Button
                        size="small"
                        variant="outlined"
                        onClick={() => openEdit(row.original)}
                        disabled={loading}
                    >
                        View/Manage
                    </Button>
                )
            })
        ],
        [loading]
    )
    const table = useReactTable({
        data: rows,
        columns,
        getCoreRowModel: getCoreRowModel()
    })
    /* ================= RENDER ================= */
    return (
        <>
            {/* ================= TABLE ================= */}
            <Card>
                <CardContent>
                    <div className="flex justify-between items-center">
                        <Typography variant="h5">Advance Register</Typography>
                        <div className="flex gap-2 items-center">
                            {loading && <CircularProgress size={20} />}
                            <Button
                                variant="contained"
                                onClick={openAdd}
                                disabled={loading}
                                startIcon={<i className="ri-add-line" />}
                            >
                                Add Advance
                            </Button>
                            <Button
                                variant="outlined"
                                onClick={handlePrint}
                                disabled={!rows.length || loading}
                                startIcon={<i className="ri-printer-line" />}
                            >
                                Print / PDF
                            </Button>
                        </div>
                    </div>
                    {loading ? (
                        <div className="flex justify-center p-8">
                            <CircularProgress />
                        </div>
                    ) : rows.length === 0 ? (
                        <div className="p-8 text-center">
                            <Typography color="textSecondary">
                                No trips found. Please create trips first.
                            </Typography>
                        </div>
                    ) : (
                        <div className="overflow-x-auto mt-4">
                            <table className={tableStyles.table}>
                                <thead>
                                    {table.getHeaderGroups().map(hg => (
                                        <tr key={hg.id}>
                                            {hg.headers.map(h => (
                                                <th key={h.id}>
                                                    {flexRender(h.column.columnDef.header, h.getContext())}
                                                </th>
                                            ))}
                                        </tr>
                                    ))}
                                </thead>
                                <tbody>
                                    {table.getRowModel().rows.map(row => (
                                        <tr key={row.id}>
                                            {row.getVisibleCells().map(cell => (
                                                <td key={cell.id}>
                                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
            {/* ================= MODAL ================= */}
            <Dialog
                open={open}
                maxWidth="xl"
                fullWidth
                onClose={() => !formLoading && setOpen(false)}
            >
                <DialogTitle>
                    {trip._id ? `Advance Entry - ${trip.vehicleNo}` : 'Add New Advance'}
                    {formLoading && <CircularProgress size={20} sx={{ ml: 2 }} />}
                    <IconButton
                        onClick={() => setOpen(false)}
                        style={{ float: 'right' }}
                        disabled={formLoading}
                    >
                        ✕
                    </IconButton>
                </DialogTitle>
                <DialogContent dividers ref={printRef}>
                    {/* ADD NEW ADVANCE FORM (when no trip selected) */}
                    {!trip._id ? (
                        <div className="flex flex-col gap-4">
                            <Typography variant="h6" className="mb-3">Select a Trip</Typography>
                            <Autocomplete
                                options={rows.filter(row => row.vehicleNo)}
                                getOptionLabel={(option) => `${option.vehicleNo} - ${option.driverName || ''}`}
                                value={null}
                                onChange={(_, newValue) => {
                                    if (newValue) {
                                        openEdit(newValue)
                                    }
                                }}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Search by Vehicle No or Driver"
                                        placeholder="Type to search..."
                                        fullWidth
                                    />
                                )}
                                renderOption={(props, option) => (
                                    <li {...props}>
                                        <div>
                                            <Typography variant="body2">{option.vehicleNo}</Typography>
                                            <Typography variant="caption" color="textSecondary">
                                                {option.driverName} | {option.fromLocation} → {option.toLocation}
                                            </Typography>
                                        </div>
                                    </li>
                                )}
                            />
                        </div>
                    ) : (
                        /* EXISTING TRIP ADVANCE MANAGEMENT */
                        <>
                            <div className="grid grid-cols-2 gap-6">
                                {/* LEFT SIDE - Trip Details (Readonly) */}
                                <div className="grid grid-cols-2 gap-3">
                                    <TextField
                                        label="Vehicle No"
                                        value={trip.vehicleNo}
                                        InputProps={{ readOnly: true }}
                                        fullWidth
                                    />
                                    <TextField
                                        label="Vehicle Type"
                                        value={trip.vehicleType}
                                        InputProps={{ readOnly: true }}
                                        fullWidth
                                    />
                                    <TextField
                                        label="From"
                                        value={trip.fromLocation}
                                        InputProps={{ readOnly: true }}
                                        fullWidth
                                    />
                                    <TextField
                                        label="To"
                                        value={trip.toLocation}
                                        InputProps={{ readOnly: true }}
                                        fullWidth
                                    />
                                    <TextField
                                        label="LHS No"
                                        value={trip.lhsNo}
                                        InputProps={{ readOnly: true }}
                                        fullWidth
                                    />
                                    <TextField
                                        label="Bank Name"
                                        value={trip.bankName}
                                        InputProps={{ readOnly: true }}
                                        fullWidth
                                    />
                                    <TextField
                                        label="Driver Name"
                                        value={trip.driverName}
                                        InputProps={{ readOnly: true }}
                                        fullWidth
                                    />
                                </div>
                                {/* RIGHT SIDE - Calculations */}
                                <div className="grid grid-cols-2 gap-3">
                                    <TextField
                                        label="Diesel LTR"
                                        type="number"
                                        value={trip.dieselLtr || 0}
                                        InputProps={{ readOnly: true }}
                                        fullWidth
                                    />
                                    <TextField
                                        label="Diesel Rate"
                                        type="number"
                                        value={trip.dieselRate || 0}
                                        InputProps={{ readOnly: true }}
                                        fullWidth
                                    />
                                    <TextField
                                        label="Total Diesel Amount"
                                        value={trip.totalDieselAmount || totalDiesel.toFixed(2)}
                                        InputProps={{ readOnly: true }}
                                        fullWidth
                                    />
                                    <TextField
                                        label="Total Advance Paid"
                                        value={trip.totalAdvanceAmount || totalAdvancePaid.toFixed(2)}
                                        InputProps={{ readOnly: true }}
                                        fullWidth
                                    />
                                    <TextField
                                        label="Balance"
                                        value={balance.toFixed(2)}
                                        InputProps={{ readOnly: true }}
                                        fullWidth
                                    />
                                </div>
                            </div>
                            <Divider className="my-4" />
                            {/* ADVANCE ENTRY SECTION */}
                            <Typography variant="h6" className="mb-3">Add New Advance</Typography>
                            <div className="grid grid-cols-4 gap-3 items-end">
                                <TextField
                                    select
                                    label="Advance Type"
                                    value={advanceForm.advanceType}
                                    onChange={e =>
                                        setAdvanceForm({ ...advanceForm, advanceType: e.target.value })
                                    }
                                    fullWidth
                                    disabled={formLoading || availableAdvanceTypes.length === 0}
                                    helperText={availableAdvanceTypes.length === 0 ? "All advance types have been used" : ""}
                                >
                                    <MenuItem value="">Select Type</MenuItem>
                                    {availableAdvanceTypes.map(type => (
                                        <MenuItem key={type} value={type}>{type}</MenuItem>
                                    ))}
                                </TextField>
                                <TextField
                                    label="Amount"
                                    type="number"
                                    value={advanceForm.amount}
                                    fullWidth
                                    disabled={formLoading}
                                    onChange={e => {
                                        const value = e.target.value
                                        setAdvanceForm(prev => ({
                                            ...prev,
                                            amount: value
                                        }))
                                    }}
                                    InputProps={{
                                        inputProps: { min: 0, max: balance }
                                    }}
                                />
                                <TextField
                                    label="Remark"
                                    value={advanceForm.remark}
                                    onChange={e =>
                                        setAdvanceForm({ ...advanceForm, remark: e.target.value })
                                    }
                                    fullWidth
                                    disabled={formLoading}
                                />
                                <Button
                                    variant="contained"
                                    onClick={addAdvance}
                                    fullWidth
                                    disabled={formLoading || !advanceForm.advanceType || !advanceForm.amount || availableAdvanceTypes.length === 0}
                                    startIcon={formLoading && <CircularProgress size={16} />}
                                >
                                    Add Advance
                                </Button>
                            </div>
                            {/* ADVANCES TABLE */}
                            {trip.advances && trip.advances.length > 0 && (
                                <>
                                    <Typography variant="h6" className="mt-6 mb-3">Existing Advances</Typography>
                                    <Table size="small" className="mt-2">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell><strong>Type</strong></TableCell>
                                                <TableCell><strong>Amount</strong></TableCell>
                                                <TableCell><strong>Remark</strong></TableCell>
                                                <TableCell><strong>Date</strong></TableCell>
                                                <TableCell><strong>Action</strong></TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {trip.advances.map((advance, index) => (
                                                <TableRow key={advance._id || index}>
                                                    <TableCell>{advance.advanceType}</TableCell>
                                                    <TableCell>{advance.amount}</TableCell>
                                                    <TableCell>{advance.remark}</TableCell>
                                                    <TableCell>{advance.date || 'N/A'}</TableCell>
                                                    <TableCell>
                                                        <Button
                                                            color="error"
                                                            size="small"
                                                            onClick={() => deleteAdvance(advance._id)}
                                                            disabled={formLoading}
                                                        >
                                                            Delete
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </>
                            )}
                        </>
                    )}
                    <div className="flex justify-end gap-2 mt-4">
                        <Button
                            variant="contained"
                            onClick={async () => {
                                await fetchTrips()
                                setOpen(false)
                            }}
                            disabled={formLoading}
                        >
                            Close
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
            {/* ================= SNACKBAR ================= */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert
                    onClose={handleCloseSnackbar}
                    severity={snackbar.severity}
                    variant="filled"
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </>
    )
}
export default AdvanceRegister
