// 'use client'
// // ===================== React =====================
// import { useState, useEffect } from 'react'
// // ===================== MUI =====================
// import Dialog from '@mui/material/Dialog'
// import DialogTitle from '@mui/material/DialogTitle'
// import DialogContent from '@mui/material/DialogContent'
// import DialogActions from '@mui/material/DialogActions'
// import Button from '@mui/material/Button'
// import TextField from '@mui/material/TextField'
// import Select from '@mui/material/Select'
// import MenuItem from '@mui/material/MenuItem'
// import InputLabel from '@mui/material/InputLabel'
// import FormControl from '@mui/material/FormControl'
// import Switch from '@mui/material/Switch'
// import FormControlLabel from '@mui/material/FormControlLabel'
// import Grid from '@mui/material/Grid'
// import Typography from '@mui/material/Typography'
// import Alert from '@mui/material/Alert'
// import CircularProgress from '@mui/material/CircularProgress'
// import IconButton from '@mui/material/IconButton'
// import Divider from '@mui/material/Divider'
// import Box from '@mui/material/Box'
// import Chip from '@mui/material/Chip'
// // ===================== RHF =====================
// import { useForm, Controller } from 'react-hook-form'
// import { Paper } from '@mui/material'
// // ===================== Documents Master =====================
// const DOCUMENTS = [
//     { key: 'RTO_PASSING', label: 'RTO Passing' },
//     { key: 'INSURANCE', label: 'Insurance' },
//     { key: 'PUC', label: 'PUC' },
//     { key: 'PERMIT', label: 'Permit' },
//     { key: 'TAX', label: 'Tax' },
//     { key: 'AIP', label: 'AIP' },
//     { key: 'LICENSE', label: 'License' }
// ]
// const AddVehicleDrawer = ({
//     open,
//     handleClose,
//     refreshData,
//     editData = null
// }) => {
//     // ===================== State =====================
//     const [owners, setOwners] = useState([])
//     const [types, setTypes] = useState([])
//     const [drivers, setDrivers] = useState([])
//     const [documents, setDocuments] = useState([{ documentType: '', expiryDate: '' }])
//     const [isLoading, setIsLoading] = useState(false)
//     const [isSubmitting, setIsSubmitting] = useState(false)
//     const [error, setError] = useState('')
//     const [success, setSuccess] = useState('')
//     const [selectedDriverMobile, setSelectedDriverMobile] = useState('')
//     // ===================== Form =====================
//     const {
//         control,
//         handleSubmit,
//         reset,
//         watch,
//         formState: { errors }
//     } = useForm({
//         defaultValues: {
//             vehicleNo: '',
//             ownerId: '',
//             vehicleModel: setTypes || '',
//             driverId: '',
//             bankName: '',
//             accountNo: '',
//             ifscCode: '',
//             accountHolderName: '',
//             isActive: true,
//         }
//     })
//     const watchDriverId = watch('driverId')
//     // ===================== Update Driver Mobile =====================
//     useEffect(() => {
//         if (watchDriverId) {
//             const driver = drivers.find(d => d._id === watchDriverId)
//             setSelectedDriverMobile(driver?.contact || 'N/A')
//         } else {
//             setSelectedDriverMobile('')
//         }
//     }, [watchDriverId, drivers])
//     // ===================== Fetch Owners + Drivers =====================
//     useEffect(() => {
//         if (open) fetchDropdownData(), fetchTypes()
//     }, [open])
//     const fetchDropdownData = async () => {
//         try {
//             setIsLoading(true)
//             const res = await fetch('/api/apps/vehicles?action=form-data')
//             const json = await res.json()
//             if (json.success) {
//                 setOwners(json.data.owners || [])
//                 setDrivers(json.data.drivers || [])
//             }
//         } catch {
//             setError('Failed to load dropdown data')
//         } finally {
//             setIsLoading(false)
//         }
//     }
//     const fetchTypes = async () => {
//         try {
//             setIsLoading(true)
//             const res = await fetch('/api/apps/vehicles/types')
//             const json = await res.json()
//             if (json.success) {
//                 console.log("Types data loaded:", json.data)
//                 setTypes(json.data || []) // Note: your data is directly in json.data, not json.data.types
//             }
//         } catch {
//             setError('Failed to load dropdown data')
//         } finally {
//             setIsLoading(false)
//         }
//     }
//     // ===================== Edit Mode Prefill =====================
//     useEffect(() => {
//         if (editData && open) {
//             reset({
//                 vehicleNo: editData.vehicleNo,
//                 ownerId: editData.ownerId,
//                 vehicleModel: editData.model,
//                 driverId: editData.driverId || '',
//                 bankName: editData.bankName || '',
//                 accountNo: editData.accountNo || '',
//                 ifscCode: editData.ifscCode || '',
//                 accountHolderName: editData.accountHolderName || '',
//                 isActive: editData.isActive,
//             })
//             setDocuments(
//                 editData.documents?.length
//                     ? editData.documents.map(d => ({
//                         documentType: d.documentType,
//                         expiryDate: d.expiryDate?.slice(0, 10)
//                     }))
//                     : [{ documentType: '', expiryDate: '' }]
//             )
//         }
//         if (!editData && open) {
//             reset()
//             setDocuments([{ documentType: '', expiryDate: '' }])
//             setSelectedDriverMobile('')
//         }
//     }, [editData, open])
//     // ===================== Document Handlers =====================
//     const addDocument = () =>
//         setDocuments(prev => [...prev, { documentType: '', expiryDate: '' }])
//     const removeDocument = index =>
//         setDocuments(prev => prev.filter((_, i) => i !== index))
//     const updateDocument = (index, field, value) => {
//         const updated = [...documents]
//         updated[index][field] = value
//         setDocuments(updated)
//     }
//     // ===================== Submit =====================
//     const onSubmit = async formData => {
//         try {
//             setIsSubmitting(true)
//             setError('')
//             setSuccess('')
//             const payload = {
//                 ...formData,
//                 documents: documents
//                     .filter(d => d.documentType && d.expiryDate)
//                     .map(d => ({
//                         documentType: d.documentType,
//                         expiryDate: d.expiryDate
//                     }))
//             }
//             if (editData?._id) payload.id = editData._id
//             const res = await fetch('/api/apps/vehicles', {
//                 method: editData ? 'PUT' : 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify(payload)
//             })
//             const json = await res.json()
//             if (!res.ok) throw new Error(json.error)
//             setSuccess(editData ? 'Vehicle updated successfully' : 'Vehicle added successfully')
//             setTimeout(() => {
//                 refreshData?.()
//                 handleClose()
//             }, 1000)
//         } catch (err) {
//             setError(err.message)
//         } finally {
//             setIsSubmitting(false)
//         }
//     }
//     // ===================== UI =====================
//     return (
//         <Dialog
//             open={open}
//             onClose={handleClose}
//             maxWidth="md"
//             fullWidth
//             PaperProps={{
//                 sx: {
//                     borderRadius: 2,
//                     maxHeight: '85vh'
//                 }
//             }}
//         >
//             <DialogTitle sx={{ p: 3, pb: 2 }}>
//                 <Box display="flex" justifyContent="space-between" alignItems="center">
//                     <Box>
//                         <Typography variant="h6" fontWeight={600} sx={{ mb: 0.5 }}>
//                             {editData ? 'Edit Vehicle' : 'Add New Vehicle'}
//                         </Typography>
//                         <Typography variant="body2" color="text.secondary">
//                             {editData ? 'Update vehicle details and documents' : 'Enter new vehicle information'}
//                         </Typography>
//                     </Box>
//                     <IconButton
//                         onClick={handleClose}
//                         size="small"
//                         sx={{
//                             p: 0.75,
//                             '&:hover': {
//                                 backgroundColor: 'action.hover'
//                             }
//                         }}
//                     >
//                         <i className="ri-close-line" />
//                     </IconButton>
//                 </Box>
//             </DialogTitle>
//             <DialogContent sx={{ p: 3 }}>
//                 {isLoading ? (
//                     <Box
//                         display="flex"
//                         justifyContent="center"
//                         alignItems="center"
//                         height={300}
//                     >
//                         <CircularProgress size={28} />
//                     </Box>
//                 ) : (
//                     <>
//                         {error && (
//                             <Alert
//                                 severity="error"
//                                 sx={{
//                                     mb: 3,
//                                     borderRadius: 1.5,
//                                     fontSize: '0.875rem'
//                                 }}
//                                 onClose={() => { }}
//                             >
//                                 {error}
//                             </Alert>
//                         )}
//                         {success && (
//                             <Alert
//                                 severity="success"
//                                 sx={{
//                                     mb: 3,
//                                     borderRadius: 1.5,
//                                     fontSize: '0.875rem'
//                                 }}
//                                 onClose={() => { }}
//                             >
//                                 {success}
//                             </Alert>
//                         )}
//                         <form onSubmit={handleSubmit(onSubmit)}>
//                             {/* Vehicle Info Card */}
//                             <Paper
//                                 elevation={0}
//                                 variant="outlined"
//                                 sx={{
//                                     p: 2.5,
//                                     mb: 3,
//                                     borderRadius: 2
//                                 }}
//                             >
//                                 <Typography
//                                     variant="subtitle2"
//                                     fontWeight={600}
//                                     sx={{
//                                         mb: 2.5,
//                                         display: 'flex',
//                                         alignItems: 'center',
//                                         gap: 1,
//                                         color: 'primary.main'
//                                     }}
//                                 >
//                                     <i className="ri-car-line" style={{ fontSize: '16px' }} />
//                                     Vehicle Information
//                                 </Typography>
//                                 <Grid container spacing={2.5}>
//                                     <Grid item xs={12} sm={6}>
//                                         <Controller
//                                             name="vehicleNo"
//                                             control={control}
//                                             rules={{ required: 'Required' }}
//                                             render={({ field }) => (
//                                                 <TextField
//                                                     {...field}
//                                                     fullWidth
//                                                     label="Vehicle Number"
//                                                     placeholder="MH12AB1234"
//                                                     error={!!errors.vehicleNo}
//                                                     helperText={errors.vehicleNo?.message}
//                                                     size="small"
//                                                 />
//                                             )}
//                                         />
//                                     </Grid>
//                                     <Grid item xs={12} sm={6}>
//                                         <Controller
//                                             name="vehicleModel"
//                                             control={control}
//                                             rules={{ required: 'Required' }}
//                                             render={({ field }) => (
//                                                 <FormControl
//                                                     fullWidth
//                                                     error={!!errors.vehicleModel}
//                                                     size="small"
//                                                     disabled={types.length === 0}
//                                                 >
//                                                     <InputLabel>Vehicle Type</InputLabel>
//                                                     <Select
//                                                         {...field}
//                                                         label="Vehicle Type"
//                                                         MenuProps={{
//                                                             PaperProps: {
//                                                                 sx: {
//                                                                     maxHeight: 300,
//                                                                     minWidth: 600,
//                                                                 }
//                                                             }
//                                                         }}
//                                                     >
//                                                         {types.map(type => (
//                                                             <MenuItem key={type.id} value={type.id}>
//                                                                 {type.type}
//                                                             </MenuItem>
//                                                         ))}
//                                                     </Select>
//                                                     {errors.vehicleModel && (
//                                                         <Typography variant="caption" color="error">
//                                                             {errors.vehicleModel.message}
//                                                         </Typography>
//                                                     )}
//                                                 </FormControl>
//                                             )}
//                                         />
//                                     </Grid>
//                                     <Grid item xs={12} sm={6}>
//                                         <Controller
//                                             name="ownerId"
//                                             control={control}
//                                             rules={{ required: 'Required' }}
//                                             render={({ field }) => (
//                                                 <FormControl
//                                                     fullWidth
//                                                     error={!!errors.ownerId}
//                                                     size="small"
//                                                 >
//                                                     <InputLabel>Owner</InputLabel>
//                                                     <Select {...field} label="Owner" style={{ width: "200px" }}>
//                                                         {owners.map(o => (
//                                                             <MenuItem key={o._id} value={o._id}>
//                                                                 {o.fullName}
//                                                             </MenuItem>
//                                                         ))}
//                                                     </Select>
//                                                     {errors.ownerId && (
//                                                         <Typography variant="caption" color="error">
//                                                             {errors.ownerId.message}
//                                                         </Typography>
//                                                     )}
//                                                 </FormControl>
//                                             )}
//                                         />
//                                     </Grid>
//                                     <Grid item xs={12} sm={6}>
//                                         <Controller
//                                             name="driverId"
//                                             control={control}
//                                             render={({ field }) => (
//                                                 <FormControl fullWidth size="small">
//                                                     <InputLabel>Driver</InputLabel>
//                                                     <Select {...field} label="Driver" style={{ width: "200px" }}>
//                                                         <MenuItem value="">None</MenuItem>
//                                                         {drivers.map(d => (
//                                                             <MenuItem key={d._id} value={d._id}>
//                                                                 {d.name}
//                                                             </MenuItem>
//                                                         ))}
//                                                     </Select>
//                                                 </FormControl>
//                                             )}
//                                         />
//                                     </Grid>
//                                     {selectedDriverMobile && (
//                                         <Grid item xs={12} sm={6}>
//                                             <TextField
//                                                 fullWidth
//                                                 label="Driver Contact"
//                                                 value={selectedDriverMobile}
//                                                 InputProps={{
//                                                     readOnly: true,
//                                                     sx: {
//                                                         backgroundColor: 'grey.50',
//                                                         fontSize: '0.875rem'
//                                                     }
//                                                 }}
//                                                 size="small"
//                                             />
//                                         </Grid>
//                                     )}
//                                     <Grid item xs={12}>
//                                         <Box display="flex" alignItems="center" justifyContent="space-between">
//                                             <Box display="flex" alignItems="center" gap={1}>
//                                                 <Typography variant="body2" fontWeight={500}>
//                                                     Vehicle Status
//                                                 </Typography>
//                                                 <Box
//                                                     sx={{
//                                                         width: 8,
//                                                         height: 8,
//                                                         borderRadius: '50%',
//                                                         backgroundColor: watch('isActive') ? 'success.main' : '#ff4d49'
//                                                     }}
//                                                 />
//                                             </Box>
//                                             <Controller
//                                                 name="isActive"
//                                                 control={control}
//                                                 render={({ field }) => (
//                                                     <Switch
//                                                         checked={field.value}
//                                                         {...field}
//                                                         color="primary"
//                                                         size="small"
//                                                     />
//                                                 )}
//                                             />
//                                         </Box>
//                                     </Grid>
//                                 </Grid>
//                             </Paper>
//                             {/* Documents Card */}
//                             <Paper
//                                 elevation={0}
//                                 variant="outlined"
//                                 sx={{
//                                     p: 2.5,
//                                     mb: 3,
//                                     borderRadius: 2
//                                 }}
//                             >
//                                 <Typography
//                                     variant="subtitle2"
//                                     fontWeight={600}
//                                     sx={{
//                                         mb: 2.5,
//                                         display: 'flex',
//                                         alignItems: 'center',
//                                         gap: 1,
//                                         color: 'primary.main'
//                                     }}
//                                 >
//                                     <i className="ri-file-list-3-line" style={{ fontSize: '16px' }} />
//                                     Documents
//                                     <Chip
//                                         label={`${documents.length} added`}
//                                         size="small"
//                                         sx={{
//                                             height: 20,
//                                             fontSize: '0.75rem',
//                                             ml: 1
//                                         }}
//                                     />
//                                 </Typography>
//                                 <Box sx={{ mb: 2 }}>
//                                     {documents.map((doc, index) => (
//                                         <Box
//                                             key={index}
//                                             sx={{
//                                                 display: 'flex',
//                                                 alignItems: 'center',
//                                                 gap: 2,
//                                                 mb: 2,
//                                                 p: 2,
//                                                 border: '1px dashed',
//                                                 borderColor: 'divider',
//                                                 borderRadius: 1.5,
//                                                 backgroundColor: index % 2 === 0 ? 'transparent' : 'grey.50'
//                                             }}
//                                         >
//                                             <FormControl size="small" sx={{ minWidth: 200, flex: 1 }}>
//                                                 <InputLabel>Type</InputLabel>
//                                                 <Select
//                                                     label="Type"
//                                                     value={doc.documentType}
//                                                     onChange={e => updateDocument(index, 'documentType', e.target.value)}
//                                                 >
//                                                     {DOCUMENTS.filter(d =>
//                                                         !documents.some((doc2, i) => i !== index && doc2.documentType === d.key)
//                                                     ).map(d => (
//                                                         <MenuItem key={d.key} value={d.key}>
//                                                             {d.label}
//                                                         </MenuItem>
//                                                     ))}
//                                                 </Select>
//                                             </FormControl>
//                                             <TextField
//                                                 size="small"
//                                                 type="date"
//                                                 label="Expiry"
//                                                 InputLabelProps={{ shrink: true }}
//                                                 value={doc.expiryDate}
//                                                 onChange={e => updateDocument(index, 'expiryDate', e.target.value)}
//                                                 sx={{ flex: 1 }}
//                                             />
//                                             <IconButton
//                                                 size="small"
//                                                 disabled={documents.length === 1}
//                                                 onClick={() => removeDocument(index)}
//                                                 sx={{
//                                                     color: 'error.main',
//                                                     '&.Mui-disabled': {
//                                                         opacity: 0.3
//                                                     }
//                                                 }}
//                                             >
//                                                 <i className="ri-delete-bin-6-line" />
//                                             </IconButton>
//                                         </Box>
//                                     ))}
//                                 </Box>
//                                 {documents.length < DOCUMENTS.length && (
//                                     <Button
//                                         variant="outlined"
//                                         onClick={addDocument}
//                                         size="small"
//                                         startIcon={<i className="ri-add-line" />}
//                                         sx={{
//                                             borderStyle: 'dashed',
//                                             borderWidth: 1.5
//                                         }}
//                                     >
//                                         Add Document
//                                     </Button>
//                                 )}
//                             </Paper>
//                             {/* Banking Card */}
//                             <Paper
//                                 elevation={0}
//                                 variant="outlined"
//                                 sx={{
//                                     p: 2.5,
//                                     borderRadius: 2
//                                 }}
//                             >
//                                 <Typography
//                                     variant="subtitle2"
//                                     fontWeight={600}
//                                     sx={{
//                                         mb: 2.5,
//                                         display: 'flex',
//                                         alignItems: 'center',
//                                         gap: 1,
//                                         color: 'primary.main'
//                                     }}
//                                 >
//                                     <i className="ri-bank-line" style={{ fontSize: '16px' }} />
//                                     Banking Details
//                                 </Typography>
//                                 <Grid container spacing={2.5}>
//                                     <Grid item xs={12} sm={6}>
//                                         <Controller
//                                             name="bankName"
//                                             control={control}
//                                             render={({ field }) => (
//                                                 <TextField
//                                                     {...field}
//                                                     fullWidth
//                                                     label="Bank Name"
//                                                     size="small"
//                                                 />
//                                             )}
//                                         />
//                                     </Grid>
//                                     <Grid item xs={12} sm={6}>
//                                         <Controller
//                                             name="accountHolderName"
//                                             control={control}
//                                             render={({ field }) => (
//                                                 <TextField
//                                                     {...field}
//                                                     fullWidth
//                                                     label="Account Holder"
//                                                     size="small"
//                                                 />
//                                             )}
//                                         />
//                                     </Grid>
//                                     <Grid item xs={12} sm={6}>
//                                         <Controller
//                                             name="accountNo"
//                                             control={control}
//                                             render={({ field }) => (
//                                                 <TextField
//                                                     {...field}
//                                                     fullWidth
//                                                     label="Account Number"
//                                                     size="small"
//                                                 />
//                                             )}
//                                         />
//                                     </Grid>
//                                     <Grid item xs={12} sm={6}>
//                                         <Controller
//                                             name="ifscCode"
//                                             control={control}
//                                             render={({ field }) => (
//                                                 <TextField
//                                                     {...field}
//                                                     fullWidth
//                                                     label="IFSC Code"
//                                                     size="small"
//                                                 />
//                                             )}
//                                         />
//                                     </Grid>
//                                 </Grid>
//                             </Paper>
//                         </form>
//                     </>
//                 )}
//             </DialogContent>
//             <Divider />
//             <DialogActions sx={{ p: 2.5, pt: 2 }}>
//                 <Button
//                     onClick={handleClose}
//                     variant="outlined"
//                     disabled={isSubmitting}
//                     sx={{
//                         borderRadius: 1.5,
//                         px: 4,
//                         py: 1
//                     }}
//                 >
//                     Cancel
//                 </Button>
//                 <Button
//                     onClick={handleSubmit(onSubmit)}
//                     variant="contained"
//                     disabled={isSubmitting}
//                     startIcon={isSubmitting ? <CircularProgress size={16} color="inherit" /> : null}
//                     sx={{
//                         borderRadius: 1.5,
//                         px: 4,
//                         py: 1,
//                         minWidth: 120
//                     }}
//                 >
//                     {isSubmitting ? 'Saving...' : (editData ? 'Update' : 'Save')}
//                 </Button>
//             </DialogActions>
//         </Dialog>
//     )
// }
// export default AddVehicleDrawer
// 'use client'
// // ===================== React =====================
// import { useState, useEffect } from 'react'
// // ===================== MUI =====================
// import Dialog from '@mui/material/Dialog'
// import DialogTitle from '@mui/material/DialogTitle'
// import DialogContent from '@mui/material/DialogContent'
// import DialogActions from '@mui/material/DialogActions'
// import Button from '@mui/material/Button'
// import TextField from '@mui/material/TextField'
// import Select from '@mui/material/Select'
// import MenuItem from '@mui/material/MenuItem'
// import InputLabel from '@mui/material/InputLabel'
// import FormControl from '@mui/material/FormControl'
// import Switch from '@mui/material/Switch'
// import FormControlLabel from '@mui/material/FormControlLabel'
// import Grid from '@mui/material/Grid'
// import Typography from '@mui/material/Typography'
// import Alert from '@mui/material/Alert'
// import CircularProgress from '@mui/material/CircularProgress'
// import IconButton from '@mui/material/IconButton'
// import Divider from '@mui/material/Divider'
// import Box from '@mui/material/Box'
// import Chip from '@mui/material/Chip'
// import Paper from '@mui/material/Paper'
// import Tooltip from '@mui/material/Tooltip'
// import Stack from '@mui/material/Stack'
// // ===================== RHF =====================
// import { useForm, Controller } from 'react-hook-form'
// // ===================== Documents Master =====================
// const DOCUMENTS = [
//     { key: 'RTO_PASSING', label: 'RTO Passing' },
//     { key: 'INSURANCE', label: 'Insurance' },
//     { key: 'PUC', label: 'PUC' },
//     { key: 'PERMIT', label: 'Permit' },
//     { key: 'TAX', label: 'Tax' },
//     { key: 'AIP', label: 'AIP' },
//     { key: 'LICENSE', label: 'License' }
// ]
// const AddVehicleDrawer = ({
//     open,
//     handleClose,
//     refreshData,
//     editData = null
// }) => {
//     // ===================== State =====================
//     const [owners, setOwners] = useState([])
//     const [types, setTypes] = useState([])
//     const [drivers, setDrivers] = useState([])
//     const [documents, setDocuments] = useState([{ documentType: '', expiryDate: '', file: null, imageUrl: '', publicId: '' }])
//     const [isLoading, setIsLoading] = useState(false)
//     const [isSubmitting, setIsSubmitting] = useState(false)
//     const [uploadingIndex, setUploadingIndex] = useState(null)
//     const [error, setError] = useState('')
//     const [success, setSuccess] = useState('')
//     const [selectedDriverMobile, setSelectedDriverMobile] = useState('')
//     // ===================== Form =====================
//     const {
//         control,
//         handleSubmit,
//         reset,
//         watch,
//         formState: { errors }
//     } = useForm({
//         defaultValues: {
//             vehicleNo: '',
//             ownerId: '',
//             vehicleModel: '',
//             driverId: '',
//             bankName: '',
//             accountNo: '',
//             ifscCode: '',
//             accountHolderName: '',
//             isActive: true,
//         }
//     })
//     const watchDriverId = watch('driverId')
//     // ===================== Update Driver Mobile =====================
//     useEffect(() => {
//         if (watchDriverId) {
//             const driver = drivers.find(d => d._id === watchDriverId)
//             setSelectedDriverMobile(driver?.contact || 'N/A')
//         } else {
//             setSelectedDriverMobile('')
//         }
//     }, [watchDriverId, drivers])
//     // ===================== Fetch Owners + Drivers =====================
//     useEffect(() => {
//         if (open) {
//             fetchDropdownData()
//             fetchTypes()
//         }
//     }, [open])
//     const fetchDropdownData = async () => {
//         try {
//             setIsLoading(true)
//             const res = await fetch('/api/apps/vehicles?action=form-data')
//             const json = await res.json()
//             if (json.success) {
//                 setOwners(json.data.owners || [])
//                 setDrivers(json.data.drivers || [])
//             }
//         } catch {
//             setError('Failed to load dropdown data')
//         } finally {
//             setIsLoading(false)
//         }
//     }
//     const fetchTypes = async () => {
//         try {
//             setIsLoading(true)
//             const res = await fetch('/api/apps/vehicles/types')
//             const json = await res.json()
//             if (json.success) {
//                 setTypes(json.data || [])
//             }
//         } catch {
//             setError('Failed to load dropdown data')
//         } finally {
//             setIsLoading(false)
//         }
//     }
//     // ===================== Edit Mode Prefill =====================
//     useEffect(() => {
//         if (editData && open) {
//             reset({
//                 vehicleNo: editData.vehicleNo,
//                 ownerId: editData.ownerId,
//                 vehicleModel: editData.model,
//                 driverId: editData.driverId || '',
//                 bankName: editData.bankName || '',
//                 accountNo: editData.accountNo || '',
//                 ifscCode: editData.ifscCode || '',
//                 accountHolderName: editData.accountHolderName || '',
//                 isActive: editData.isActive,
//             })
//             setDocuments(
//                 editData.documents?.length
//                     ? editData.documents.map(d => ({
//                         documentType: d.documentType,
//                         expiryDate: d.expiryDate?.slice(0, 10),
//                         imageUrl: d.imageUrl || '',
//                         publicId: d.publicId || ''
//                     }))
//                     : [{ documentType: '', expiryDate: '', file: null, imageUrl: '', publicId: '' }]
//             )
//         }
//         if (!editData && open) {
//             reset()
//             setDocuments([{ documentType: '', expiryDate: '', file: null, imageUrl: '', publicId: '' }])
//             setSelectedDriverMobile('')
//         }
//     }, [editData, open])
//     // ===================== Date Masking =====================
//     // ===================== Document Handlers =====================
//     const addDocument = () =>
//         setDocuments(prev => [...prev, { documentType: '', expiryDate: '', file: null, imageUrl: '', publicId: '' }])
//     const removeDocument = index => {
//         // If document has an image, delete it from Cloudinary first
//         if (documents[index]?.publicId) {
//             deleteImageFromCloudinary(documents[index].publicId)
//         }
//         setDocuments(prev => prev.filter((_, i) => i !== index))
//     }
//     const updateDocument = (index, field, value) => {
//         const updated = [...documents]
//         updated[index][field] = value
//         setDocuments(updated)
//     }
//     // ===================== Cloudinary Upload =====================
//     const uploadToCloudinary = async (file, index) => {
//         setUploadingIndex(index)
//         const formData = new FormData()
//         formData.append('file', file)
//         formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'your_upload_preset')
//         try {
//             const response = await fetch(
//                 `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'your_cloud_name'}/image/upload`,
//                 {
//                     method: 'POST',
//                     body: formData
//                 }
//             )
//             if (!response.ok) throw new Error('Upload failed')
//             const data = await response.json()
//             // Update document with Cloudinary data
//             updateDocument(index, 'imageUrl', data.secure_url)
//             updateDocument(index, 'publicId', data.public_id)
//             updateDocument(index, 'file', null)
//             return data
//         } catch (error) {
//             console.error('Cloudinary upload error:', error)
//             setError(`Failed to upload ${file.name}`)
//             return null
//         } finally {
//             setUploadingIndex(null)
//         }
//     }
//     const deleteImageFromCloudinary = async (publicId) => {
//         try {
//             const response = await fetch('/api/cloudinary/delete', {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify({ publicId })
//             })
//             if (!response.ok) {
//                 console.warn('Failed to delete image from Cloudinary')
//             }
//         } catch (error) {
//             console.error('Delete image error:', error)
//         }
//     }
//     const handleFileChange = (index, file) => {
//         if (!file) return
//         // Check file type
//         if (!file.type.startsWith('image/')) {
//             setError('Please upload an image file (JPG, PNG, etc.)')
//             return
//         }
//         // Check file size (max 5MB)
//         if (file.size > 5 * 1024 * 1024) {
//             setError('File size should be less than 5MB')
//             return
//         }
//         // If there's an existing image, delete it first
//         if (documents[index]?.publicId) {
//             deleteImageFromCloudinary(documents[index].publicId)
//         }
//         // Update document with new file
//         updateDocument(index, 'file', file)
//         updateDocument(index, 'imageUrl', '')
//         updateDocument(index, 'publicId', '')
//         // Auto-upload to Cloudinary
//         uploadToCloudinary(file, index)
//     }
//     const downloadImage = (url, fileName) => {
//         const link = document.createElement('a')
//         link.href = url
//         link.download = fileName || 'document.jpg'
//         link.target = '_blank'
//         link.rel = 'noopener noreferrer' // security best-practice
//         document.body.appendChild(link)
//         link.click()
//         document.body.removeChild(link)
//     }
//     // ===================== Submit =====================
//     const onSubmit = async formData => {
//         try {
//             setIsSubmitting(true)
//             setError('')
//             setSuccess('')
//             // First, upload any pending files
//             const uploadPromises = documents.map(async (doc, index) => {
//                 if (doc.file && !doc.imageUrl) {
//                     return uploadToCloudinary(doc.file, index)
//                 }
//                 return Promise.resolve()
//             })
//             await Promise.all(uploadPromises)
//             const payload = {
//                 ...formData,
//                 documents: documents
//                     .filter(d => d.documentType && d.expiryDate)
//                     .map(d => ({
//                         documentType: d.documentType,
//                         expiryDate: d.expiryDate,
//                         imageUrl: d.imageUrl || '',
//                         publicId: d.publicId || ''
//                     }))
//             }
//             if (editData?._id) payload.id = editData._id
//             const res = await fetch('/api/apps/vehicles', {
//                 method: editData ? 'PUT' : 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify(payload)
//             })
//             const json = await res.json()
//             if (!res.ok) throw new Error(json.error)
//             setSuccess(editData ? 'Vehicle updated successfully' : 'Vehicle added successfully')
//             setTimeout(() => {
//                 refreshData?.()
//                 handleClose()
//             }, 1000)
//         } catch (err) {
//             setError(err.message)
//         } finally {
//             setIsSubmitting(false)
//         }
//     }
//     // ===================== UI =====================
//     return (
//         <Dialog
//             open={open}
//             onClose={handleClose}
//             maxWidth="md"
//             fullWidth
//             PaperProps={{
//                 sx: {
//                     borderRadius: 2,
//                     maxHeight: '85vh'
//                 }
//             }}
//         >
//             <DialogTitle sx={{ p: 3, pb: 2 }}>
//                 <Box display="flex" justifyContent="space-between" alignItems="center">
//                     <Box>
//                         <Typography variant="h6" fontWeight={600} sx={{ mb: 0.5 }}>
//                             {editData ? 'Edit Vehicle' : 'Add New Vehicle'}
//                         </Typography>
//                         <Typography variant="body2" color="text.secondary">
//                             {editData ? 'Update vehicle details and documents' : 'Enter new vehicle information'}
//                         </Typography>
//                     </Box>
//                     <IconButton
//                         onClick={handleClose}
//                         size="small"
//                         sx={{
//                             p: 0.75,
//                             '&:hover': {
//                                 backgroundColor: 'action.hover'
//                             }
//                         }}
//                     >
//                         <i className="ri-close-line" />
//                     </IconButton>
//                 </Box>
//             </DialogTitle>
//             <DialogContent sx={{ p: 3 }}>
//                 {isLoading ? (
//                     <Box
//                         display="flex"
//                         justifyContent="center"
//                         alignItems="center"
//                         height={300}
//                     >
//                         <CircularProgress size={28} />
//                     </Box>
//                 ) : (
//                     <>
//                         {error && (
//                             <Alert
//                                 severity="error"
//                                 sx={{
//                                     mb: 3,
//                                     borderRadius: 1.5,
//                                     fontSize: '0.875rem'
//                                 }}
//                                 onClose={() => setError('')}
//                             >
//                                 {error}
//                             </Alert>
//                         )}
//                         {success && (
//                             <Alert
//                                 severity="success"
//                                 sx={{
//                                     mb: 3,
//                                     borderRadius: 1.5,
//                                     fontSize: '0.875rem'
//                                 }}
//                                 onClose={() => setSuccess('')}
//                             >
//                                 {success}
//                             </Alert>
//                         )}
//                         <form onSubmit={handleSubmit(onSubmit)}>
//                             {/* Vehicle Info Card - Unchanged */}
//                             <Paper
//                                 elevation={0}
//                                 variant="outlined"
//                                 sx={{
//                                     p: 2.5,
//                                     mb: 3,
//                                     borderRadius: 2
//                                 }}
//                             >
//                                 <Typography
//                                     variant="subtitle2"
//                                     fontWeight={600}
//                                     sx={{
//                                         mb: 2.5,
//                                         display: 'flex',
//                                         alignItems: 'center',
//                                         gap: 1,
//                                         color: 'primary.main'
//                                     }}
//                                 >
//                                     <i className="ri-car-line" style={{ fontSize: '16px' }} />
//                                     Vehicle Information
//                                 </Typography>
//                                 <Grid container spacing={2.5}>
//                                     <Grid item xs={12} sm={6}>
//                                         <Controller
//                                             name="vehicleNo"
//                                             control={control}
//                                             rules={{ required: 'Required' }}
//                                             render={({ field }) => (
//                                                 <TextField
//                                                     {...field}
//                                                     fullWidth
//                                                     label="Vehicle Number"
//                                                     placeholder="MH12AB1234"
//                                                     error={!!errors.vehicleNo}
//                                                     helperText={errors.vehicleNo?.message}
//                                                     size="small"
//                                                 />
//                                             )}
//                                         />
//                                     </Grid>
//                                     <Grid item xs={12} sm={6}>
//                                         <Controller
//                                             name="vehicleModel"
//                                             control={control}
//                                             rules={{ required: 'Required' }}
//                                             render={({ field }) => (
//                                                 <FormControl
//                                                     fullWidth
//                                                     error={!!errors.vehicleModel}
//                                                     size="small"
//                                                     disabled={types.length === 0}
//                                                 >
//                                                     <InputLabel>Vehicle Type</InputLabel>
//                                                     <Select
//                                                         style={{ width: '150px' }}
//                                                         {...field}
//                                                         label="Vehicle Type"
//                                                         MenuProps={{
//                                                             PaperProps: {
//                                                                 sx: {
//                                                                     maxHeight: 300,
//                                                                     minWidth: 600,
//                                                                 }
//                                                             }
//                                                         }}
//                                                     >
//                                                         {types.map(type => (
//                                                             <MenuItem key={type.id} value={type.type}>
//                                                                 {type.type}
//                                                             </MenuItem>
//                                                         ))}
//                                                     </Select>
//                                                     {errors.vehicleModel && (
//                                                         <Typography variant="caption" color="error">
//                                                             {errors.vehicleModel.message}
//                                                         </Typography>
//                                                     )}
//                                                 </FormControl>
//                                             )}
//                                         />
//                                     </Grid>
//                                     <Grid item xs={12} sm={6}>
//                                         <Controller
//                                             name="ownerId"
//                                             control={control}
//                                             rules={{ required: 'Required' }}
//                                             render={({ field }) => (
//                                                 <FormControl
//                                                     fullWidth
//                                                     error={!!errors.ownerId}
//                                                     size="small"
//                                                 >
//                                                     <InputLabel>Owner</InputLabel>
//                                                     <Select {...field} label="Owner"
//                                                         style={{ width: '100px' }}
//                                                     >
//                                                         {owners.map(o => (
//                                                             <MenuItem key={o._id} value={o._id}>
//                                                                 {o.fullName}
//                                                             </MenuItem>
//                                                         ))}
//                                                     </Select>
//                                                     {errors.ownerId && (
//                                                         <Typography variant="caption" color="error">
//                                                             {errors.ownerId.message}
//                                                         </Typography>
//                                                     )}
//                                                 </FormControl>
//                                             )}
//                                         />
//                                     </Grid>
//                                     <Grid item xs={12} sm={6}>
//                                         <Controller
//                                             name="driverId"
//                                             control={control}
//                                             render={({ field }) => (
//                                                 <FormControl fullWidth size="small">
//                                                     <InputLabel>Driver</InputLabel>
//                                                     <Select {...field} label="Driver" style={{ width: '150px' }}
//                                                     >
//                                                         <MenuItem value="">None</MenuItem>
//                                                         {drivers.map(d => (
//                                                             <MenuItem key={d._id} value={d._id}>
//                                                                 {d.name}
//                                                             </MenuItem>
//                                                         ))}
//                                                     </Select>
//                                                 </FormControl>
//                                             )}
//                                         />
//                                     </Grid>
//                                     {selectedDriverMobile && (
//                                         <Grid item xs={12} sm={6}>
//                                             <TextField
//                                                 fullWidth
//                                                 label="Driver Contact"
//                                                 value={selectedDriverMobile}
//                                                 InputProps={{
//                                                     readOnly: true,
//                                                     sx: {
//                                                         backgroundColor: 'grey.50',
//                                                         fontSize: '0.875rem'
//                                                     }
//                                                 }}
//                                                 size="small"
//                                             />
//                                         </Grid>
//                                     )}
//                                     <Grid item xs={12}>
//                                         <Box display="flex" alignItems="center" justifyContent="space-between">
//                                             <Box display="flex" alignItems="center" gap={1}>
//                                                 <Typography variant="body2" fontWeight={500}>
//                                                     Vehicle Status
//                                                 </Typography>
//                                                 <Box
//                                                     sx={{
//                                                         width: 8,
//                                                         height: 8,
//                                                         borderRadius: '50%',
//                                                         backgroundColor: watch('isActive') ? 'success.main' : '#ff4d49'
//                                                     }}
//                                                 />
//                                             </Box>
//                                             <Controller
//                                                 name="isActive"
//                                                 control={control}
//                                                 render={({ field }) => (
//                                                     <Switch
//                                                         checked={field.value}
//                                                         {...field}
//                                                         color="primary"
//                                                         size="small"
//                                                     />
//                                                 )}
//                                             />
//                                         </Box>
//                                     </Grid>
//                                 </Grid>
//                             </Paper>
//                             {/* Documents Card with Upload */}
//                             <Paper
//                                 elevation={0}
//                                 variant="outlined"
//                                 sx={{
//                                     p: 2.5,
//                                     mb: 3,
//                                     borderRadius: 2
//                                 }}
//                             >
//                                 <Typography
//                                     variant="subtitle2"
//                                     fontWeight={600}
//                                     sx={{
//                                         mb: 2.5,
//                                         display: 'flex',
//                                         alignItems: 'center',
//                                         gap: 1,
//                                         color: 'primary.main'
//                                     }}
//                                 >
//                                     <i className="ri-file-list-3-line" style={{ fontSize: '16px' }} />
//                                     Documents
//                                     <Chip
//                                         label={`${documents.length} added`}
//                                         size="small"
//                                         sx={{
//                                             height: 20,
//                                             fontSize: '0.75rem',
//                                             ml: 1
//                                         }}
//                                     />
//                                 </Typography>
//                                 <Box sx={{ mb: 2 }}>
//                                     {documents.map((doc, index) => (
//                                         <Box
//                                             key={index}
//                                             sx={{
//                                                 mb: 2,
//                                                 p: 2,
//                                                 border: '1px dashed',
//                                                 borderColor: 'divider',
//                                                 borderRadius: 1.5,
//                                                 backgroundColor: index % 2 === 0 ? 'transparent' : 'grey.50'
//                                             }}
//                                         >
//                                             <Grid container spacing={2} alignItems="center">
//                                                 {/* Document Type */}
//                                                 <Grid item xs={12} md={3}>
//                                                     <FormControl size="small" fullWidth>
//                                                         <InputLabel>Type</InputLabel>
//                                                         <Select
//                                                             style={{ width: '150px' }}
//                                                             label="Type"
//                                                             value={doc.documentType}
//                                                             onChange={e =>
//                                                                 updateDocument(index, 'documentType', e.target.value)
//                                                             }
//                                                         >
//                                                             {DOCUMENTS.filter(
//                                                                 d =>
//                                                                     !documents.some(
//                                                                         (doc2, i) => i !== index && doc2.documentType === d.key
//                                                                     )
//                                                             ).map(d => (
//                                                                 <MenuItem key={d.key} value={d.key}>
//                                                                     {d.label}
//                                                                 </MenuItem>
//                                                             ))}
//                                                         </Select>
//                                                     </FormControl>
//                                                 </Grid>
//                                                 {/* Expiry Date */}
//                                                 <Grid item xs={12} md={2}>
//                                                     <TextField
//                                                         fullWidth
//                                                         size="small"
//                                                         type="date"
//                                                         label="Expiry"
//                                                         InputLabelProps={{ shrink: true }}
//                                                         value={doc.expiryDate}
//                                                         onChange={e =>
//                                                             updateDocument(index, 'expiryDate', e.target.value)
//                                                         }
//                                                     />
//                                                 </Grid>
//                                                 {/* Upload Button */}
//                                                 <Grid item xs={12} md={3}>
//                                                     <Button
//                                                         fullWidth
//                                                         variant="outlined"
//                                                         component="label"
//                                                         size="small"
//                                                         disabled={uploadingIndex === index}
//                                                         startIcon={<i className="ri-upload-line" />}
//                                                     >
//                                                         {uploadingIndex === index ? 'Uploading...' : 'Upload Document'}
//                                                         <input
//                                                             type="file"
//                                                             hidden
//                                                             accept="image/*"
//                                                             onChange={e =>
//                                                                 handleFileChange(index, e.target.files[0])
//                                                             }
//                                                         />
//                                                     </Button>
//                                                 </Grid>
//                                                 {/* Preview + Download */}
//                                                 <Grid item xs={12} md={3}>
//                                                     <Stack direction="row" spacing={1} alignItems="center">
//                                                         {doc.imageUrl && (
//                                                             <>
//                                                                 <Box
//                                                                     sx={{
//                                                                         width: 50,
//                                                                         height: 50,
//                                                                         borderRadius: 1,
//                                                                         border: '1px solid',
//                                                                         borderColor: 'divider',
//                                                                         overflow: 'hidden'
//                                                                     }}
//                                                                 >
//                                                                     <img
//                                                                         src={doc.imageUrl}
//                                                                         alt="Preview"
//                                                                         style={{
//                                                                             width: '100%',
//                                                                             height: '100%',
//                                                                             objectFit: 'cover'
//                                                                         }}
//                                                                         onError={e => {
//                                                                             e.target.src = '/images/placeholder.jpg'
//                                                                         }}
//                                                                     />
//                                                                 </Box>
//                                                                 <Tooltip title="Download">
//                                                                     <IconButton
//                                                                         size="small"
//                                                                         onClick={() =>
//                                                                             downloadImage(
//                                                                                 doc.imageUrl,
//                                                                                 `${doc.documentType || 'document'}.jpg`
//                                                                             )
//                                                                         }
//                                                                     >
//                                                                         <i className="ri-download-line" />
//                                                                     </IconButton>
//                                                                 </Tooltip>
//                                                             </>
//                                                         )}
//                                                         {doc.file && !doc.imageUrl && (
//                                                             <Typography variant="caption" noWrap>
//                                                                 {doc.file.name}
//                                                             </Typography>
//                                                         )}
//                                                     </Stack>
//                                                 </Grid>
//                                                 {/* Delete */}
//                                                 <Grid item xs={12} md={1} textAlign="right">
//                                                     <IconButton
//                                                         size="small"
//                                                         disabled={documents.length === 1}
//                                                         onClick={() => removeDocument(index)}
//                                                         sx={{
//                                                             color: 'error.main',
//                                                             '&.Mui-disabled': { opacity: 0.3 }
//                                                         }}
//                                                     >
//                                                         <i className="ri-delete-bin-6-line" />
//                                                     </IconButton>
//                                                 </Grid>
//                                             </Grid>
//                                         </Box>
//                                     ))}
//                                 </Box>
//                                 {documents.length < DOCUMENTS.length && (
//                                     <Button
//                                         variant="outlined"
//                                         onClick={addDocument}
//                                         size="small"
//                                         startIcon={<i className="ri-add-line" />}
//                                         sx={{
//                                             borderStyle: 'dashed',
//                                             borderWidth: 1.5
//                                         }}
//                                     >
//                                         Add Document
//                                     </Button>
//                                 )}
//                             </Paper>
//                             {/* Banking Card - Unchanged */}
//                             <Paper
//                                 elevation={0}
//                                 variant="outlined"
//                                 sx={{
//                                     p: 2.5,
//                                     borderRadius: 2
//                                 }}
//                             >
//                                 <Typography
//                                     variant="subtitle2"
//                                     fontWeight={600}
//                                     sx={{
//                                         mb: 2.5,
//                                         display: 'flex',
//                                         alignItems: 'center',
//                                         gap: 1,
//                                         color: 'primary.main'
//                                     }}
//                                 >
//                                     <i className="ri-bank-line" style={{ fontSize: '16px' }} />
//                                     Banking Details
//                                 </Typography>
//                                 <Grid container spacing={2.5}>
//                                     <Grid item xs={12} sm={6}>
//                                         <Controller
//                                             name="bankName"
//                                             control={control}
//                                             render={({ field }) => (
//                                                 <TextField
//                                                     {...field}
//                                                     fullWidth
//                                                     label="Bank Name"
//                                                     size="small"
//                                                 />
//                                             )}
//                                         />
//                                     </Grid>
//                                     <Grid item xs={12} sm={6}>
//                                         <Controller
//                                             name="accountHolderName"
//                                             control={control}
//                                             render={({ field }) => (
//                                                 <TextField
//                                                     {...field}
//                                                     fullWidth
//                                                     label="Account Holder"
//                                                     size="small"
//                                                 />
//                                             )}
//                                         />
//                                     </Grid>
//                                     <Grid item xs={12} sm={6}>
//                                         <Controller
//                                             name="accountNo"
//                                             control={control}
//                                             render={({ field }) => (
//                                                 <TextField
//                                                     {...field}
//                                                     fullWidth
//                                                     label="Account Number"
//                                                     size="small"
//                                                 />
//                                             )}
//                                         />
//                                     </Grid>
//                                     <Grid item xs={12} sm={6}>
//                                         <Controller
//                                             name="ifscCode"
//                                             control={control}
//                                             render={({ field }) => (
//                                                 <TextField
//                                                     {...field}
//                                                     fullWidth
//                                                     label="IFSC Code"
//                                                     size="small"
//                                                 />
//                                             )}
//                                         />
//                                     </Grid>
//                                 </Grid>
//                             </Paper>
//                         </form>
//                     </>
//                 )}
//             </DialogContent>
//             <Divider />
//             <DialogActions sx={{ p: 2.5, pt: 2 }}>
//                 <Button
//                     onClick={handleClose}
//                     variant="outlined"
//                     disabled={isSubmitting}
//                     sx={{
//                         borderRadius: 1.5,
//                         px: 4,
//                         py: 1
//                     }}
//                 >
//                     Cancel
//                 </Button>
//                 <Button
//                     onClick={handleSubmit(onSubmit)}
//                     variant="contained"
//                     disabled={isSubmitting || uploadingIndex !== null}
//                     startIcon={isSubmitting ? <CircularProgress size={16} color="inherit" /> : null}
//                     sx={{
//                         borderRadius: 1.5,
//                         px: 4,
//                         py: 1,
//                         minWidth: 120
//                     }}
//                 >
//                     {isSubmitting ? 'Saving...' : (editData ? 'Update' : 'Save')}
//                 </Button>
//             </DialogActions>
//         </Dialog>
//     )
// }
// export default AddVehicleDrawer
'use client'
// ===================== React =====================
import { useState, useEffect } from 'react'
// ===================== MUI =====================
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import InputLabel from '@mui/material/InputLabel'
import FormControl from '@mui/material/FormControl'
import Switch from '@mui/material/Switch'
import FormControlLabel from '@mui/material/FormControlLabel'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import IconButton from '@mui/material/IconButton'
import Divider from '@mui/material/Divider'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Paper from '@mui/material/Paper'
import Tooltip from '@mui/material/Tooltip'
import Stack from '@mui/material/Stack'
// ===================== RHF =====================
import { useForm, Controller } from 'react-hook-form'
// ===================== Documents Master =====================
const DOCUMENTS = [
    { key: 'RTO_PASSING', label: 'RTO Passing' },
    { key: 'INSURANCE', label: 'Insurance' },
    { key: 'PUC', label: 'PUC' },
    { key: 'PERMIT', label: 'Permit' },
    { key: 'TAX', label: 'Tax' },
    { key: 'AIP', label: 'AIP' },
    { key: 'LICENSE', label: 'License' }
]
const AddVehicleDrawer = ({
    open,
    handleClose,
    refreshData,
    editData = null
}) => {
    // ===================== State =====================
    const [owners, setOwners] = useState([])
    const [types, setTypes] = useState([])
    const [drivers, setDrivers] = useState([])
    const [documents, setDocuments] = useState([{ documentType: '', expiryDate: '', file: null, imageUrl: '', publicId: '' }])
    const [isLoading, setIsLoading] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [uploadingIndex, setUploadingIndex] = useState(null)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [selectedDriverMobile, setSelectedDriverMobile] = useState('')
    // ===================== Form =====================
    const {
        control,
        handleSubmit,
        reset,
        watch,
        setValue,
        formState: { errors }
    } = useForm({
        defaultValues: {
            vehicleNo: '',
            ownerId: '',
            vehicleModel: '', // Changed back to vehicleModel
            driverId: '',
            bankName: '',
            accountNo: '',
            ifscCode: '',
            accountHolderName: '',
            isActive: true,
        }
    })
    const watchDriverId = watch('driverId')
    // ===================== Update Driver Mobile =====================
    useEffect(() => {
        if (watchDriverId) {
            const driver = drivers.find(d => d._id === watchDriverId)
            setSelectedDriverMobile(driver?.contact || driver?.mobile || driver?.phone || 'N/A')
        } else {
            setSelectedDriverMobile('')
        }
    }, [watchDriverId, drivers])
    // ===================== Fetch Owners + Drivers + Types =====================
    useEffect(() => {
        if (open) {
            fetchDropdownData()
        }
    }, [open])
    const fetchDropdownData = async () => {
        try {
            setIsLoading(true)
            setError('')
            // Fetch all data in parallel
            const [formDataRes, typesRes] = await Promise.all([
                fetch('/api/apps/vehicles?action=form-data'),
                fetch('/api/apps/vehicles/types')
            ])
            const formDataJson = await formDataRes.json()
            const typesJson = await typesRes.json()
            if (formDataJson.success) {
                setOwners(formDataJson.data.owners || [])
                setDrivers(formDataJson.data.drivers || [])
            } else {
                setError('Failed to load owners and drivers')
            }
            if (typesJson.success) {
                setTypes(typesJson.data || [])
            } else {
                setError(prev => prev ? `${prev}, and types` : 'Failed to load vehicle types')
            }
        } catch (err) {
            console.error('Fetch error:', err)
            setError('Failed to load dropdown data')
        } finally {
            setIsLoading(false)
        }
    }
    // ===================== Edit Mode Prefill =====================
    useEffect(() => {
        if (editData && open) {
            console.log('Edit Data (full):', JSON.stringify(editData, null, 2)) // Show full object
            console.log('Edit Data keys:', Object.keys(editData || {}))
            // Log all fields that might contain driver info
            Object.keys(editData || {}).forEach(key => {
                if (key.toLowerCase().includes('driver')) {
                    console.log(`Driver field ${key}:`, editData[key])
                }
            })
        }
    }, [editData, open])
    // Separate useEffect to handle form reset after data is loaded
    useEffect(() => {
        if (editData && open && owners.length > 0 && drivers.length > 0 && types.length > 0) {
            console.log('Setting form with edit data...')
            console.log('Drivers available:', drivers)
            // Find owner ID by matching ownerName
            let ownerId = ''
            if (editData.ownerName && owners.length > 0) {
                const foundOwner = owners.find(owner =>
                    owner.fullName?.toLowerCase() === editData.ownerName?.toLowerCase() ||
                    owner.name?.toLowerCase() === editData.ownerName?.toLowerCase()
                )
                ownerId = foundOwner?._id || ''
                console.log('Found owner:', foundOwner, 'ID:', ownerId)
            }
            // Try to find driver ID - check multiple possibilities
            let driverId = ''
            // Option 1: Direct driverId field (check different casing)
            if (editData.driverId) driverId = editData.driverId
            else if (editData.driverID) driverId = editData.driverID
            else if (editData.driver_id) driverId = editData.driver_id
            else if (editData.DriverId) driverId = editData.DriverId
            // Option 2: Check if there's a nested driver object
            if (!driverId && editData.driver && typeof editData.driver === 'object') {
                driverId = editData.driver._id || editData.driver.id
            }
            // Option 3: Try to find by driver name if available
            if (!driverId && editData.driverName && drivers.length > 0) {
                const foundDriver = drivers.find(driver =>
                    driver.name?.toLowerCase() === editData.driverName?.toLowerCase() ||
                    driver.fullName?.toLowerCase() === editData.driverName?.toLowerCase()
                )
                driverId = foundDriver?._id || ''
                console.log('Found driver by name:', foundDriver, 'ID:', driverId)
            }
            console.log('Final driverId to set:', driverId)
            // Reset form with edit data
            reset({
                vehicleNo: editData.vehicleNo || '',
                ownerId: ownerId || editData.ownerId || '',
                vehicleModel: editData.vehicleModel || '',
                driverId: driverId || '',
                bankName: editData.bankName || '',
                accountNo: editData.accountNo || '',
                ifscCode: editData.ifscCode || '',
                accountHolderName: editData.accountHolderName || '',
                isActive: editData.isActive !== undefined ? editData.isActive : true,
            })
            // Set driver mobile if driver found
            if (driverId) {
                const driver = drivers.find(d => d._id === driverId)
                console.log('Driver for mobile:', driver)
                setSelectedDriverMobile(driver?.contact || driver?.mobile || driver?.phone || 'N/A')
            } else {
                setSelectedDriverMobile('')
            }
            // Set documents
            if (editData.documents?.length) {
                setDocuments(
                    editData.documents.map(d => ({
                        documentType: d.documentType || '',
                        expiryDate: d.expiryDate?.slice(0, 10) || '',
                        imageUrl: d.imageUrl || '',
                        publicId: d.publicId || '',
                        file: null
                    }))
                )
            } else {
                setDocuments([{ documentType: '', expiryDate: '', file: null, imageUrl: '', publicId: '' }])
            }
        }
    }, [editData, open, owners, drivers, types, reset])
    // Reset for new vehicle
    useEffect(() => {
        if (!editData && open) {
            reset({
                vehicleNo: '',
                ownerId: '',
                vehicleModel: '',
                driverId: '',
                bankName: '',
                accountNo: '',
                ifscCode: '',
                accountHolderName: '',
                isActive: true,
            })
            setDocuments([{ documentType: '', expiryDate: '', file: null, imageUrl: '', publicId: '' }])
            setSelectedDriverMobile('')
        }
    }, [editData, open, reset])
    // ===================== Document Handlers =====================
    const addDocument = () =>
        setDocuments(prev => [...prev, { documentType: '', expiryDate: '', file: null, imageUrl: '', publicId: '' }])
    const removeDocument = async (index) => {
        // If document has an image, delete it from Cloudinary first
        if (documents[index]?.publicId) {
            await deleteImageFromCloudinary(documents[index].publicId)
        }
        setDocuments(prev => prev.filter((_, i) => i !== index))
    }
    const updateDocument = (index, field, value) => {
        const updated = [...documents]
        updated[index][field] = value
        setDocuments(updated)
    }
    // ===================== Cloudinary Upload =====================
    const uploadToCloudinary = async (file, index) => {
        setUploadingIndex(index)
        const formData = new FormData()
        formData.append('file', file)
        formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'your_upload_preset')
        try {
            const response = await fetch(
                `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'your_cloud_name'}/image/upload`,
                {
                    method: 'POST',
                    body: formData
                }
            )
            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error?.message || 'Upload failed')
            }
            const data = await response.json()
            // Update document with Cloudinary data
            updateDocument(index, 'imageUrl', data.secure_url)
            updateDocument(index, 'publicId', data.public_id)
            updateDocument(index, 'file', null)
            return data
        } catch (error) {
            console.error('Cloudinary upload error:', error)
            setError(`Failed to upload ${file.name}: ${error.message}`)
            return null
        } finally {
            setUploadingIndex(null)
        }
    }
    const deleteImageFromCloudinary = async (publicId) => {
        if (!publicId) return
        try {
            const response = await fetch('/api/cloudinary/delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ publicId })
            })
            if (!response.ok) {
                console.warn('Failed to delete image from Cloudinary')
            }
        } catch (error) {
            console.error('Delete image error:', error)
        }
    }
    const handleFileChange = (index, file) => {
        if (!file) return
        // Check file type
        if (!file.type.startsWith('image/')) {
            setError('Please upload an image file (JPG, PNG, etc.)')
            return
        }
        // Check file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            setError('File size should be less than 5MB')
            return
        }
        // Clear any previous error
        setError('')
        // If there's an existing image, delete it first
        if (documents[index]?.publicId) {
            deleteImageFromCloudinary(documents[index].publicId)
        }
        // Update document with new file
        updateDocument(index, 'file', file)
        updateDocument(index, 'imageUrl', '')
        updateDocument(index, 'publicId', '')
        // Auto-upload to Cloudinary
        uploadToCloudinary(file, index)
    }
    const downloadImage = (url, fileName) => {
        const link = document.createElement('a')
        link.href = url
        link.download = fileName || 'document.jpg'
        link.target = '_blank'
        link.rel = 'noopener noreferrer'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }
    // ===================== Submit =====================
    const onSubmit = async (formData) => {
        try {
            setIsSubmitting(true)
            setError('')
            setSuccess('')
            // First, upload any pending files
            const uploadPromises = documents.map(async (doc, index) => {
                if (doc.file && !doc.imageUrl) {
                    return await uploadToCloudinary(doc.file, index)
                }
                return Promise.resolve()
            })
            await Promise.all(uploadPromises)
            // Filter out empty documents
            const filteredDocuments = documents
                .filter(d => d.documentType && d.expiryDate)
                .map(d => ({
                    documentType: d.documentType,
                    expiryDate: d.expiryDate,
                    imageUrl: d.imageUrl || '',
                    publicId: d.publicId || ''
                }))
            // Prepare payload
            const payload = {
                ...formData,
                documents: filteredDocuments
            }
            // Add ID for edit mode - Use the correct field name from your data
            if (editData) {
                // Based on your console log, editData has 'id' field
                payload.id = editData.id || editData._id
                console.log('Edit vehicle ID:', payload.id)
            }
            console.log('Submitting payload:', payload)
            const res = await fetch('/api/apps/vehicles', {
                method: editData ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })
            const json = await res.json()
            if (!res.ok) {
                throw new Error(json.error || json.message || 'Something went wrong')
            }
            if (!json.success) {
                throw new Error(json.error || 'Operation failed')
            }
            setSuccess(editData ? 'Vehicle updated successfully' : 'Vehicle added successfully')
            setTimeout(() => {
                refreshData?.()
                handleClose()
            }, 1000)
        } catch (err) {
            console.error('Submit error:', err)
            setError(err.message || 'Failed to save vehicle')
        } finally {
            setIsSubmitting(false)
        }
    }
    // ===================== UI =====================
    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="md"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 2,
                    maxHeight: '85vh'
                }
            }}
        >
            <DialogTitle sx={{ p: 3, pb: 2 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box>
                        <Typography variant="h6" fontWeight={600} sx={{ mb: 0.5 }}>
                            {editData ? 'Edit Vehicle' : 'Add New Vehicle'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {editData ? 'Update vehicle details and documents' : 'Enter new vehicle information'}
                        </Typography>
                    </Box>
                    <IconButton
                        onClick={handleClose}
                        size="small"
                        sx={{
                            p: 0.75,
                            '&:hover': {
                                backgroundColor: 'action.hover'
                            }
                        }}
                    >
                        <i className="ri-close-line" />
                    </IconButton>
                </Box>
            </DialogTitle>
            <DialogContent sx={{ p: 3 }}>
                {isLoading ? (
                    <Box
                        display="flex"
                        justifyContent="center"
                        alignItems="center"
                        height={300}
                    >
                        <CircularProgress size={28} />
                        <Typography variant="body2" sx={{ ml: 2 }}>
                            Loading data...
                        </Typography>
                    </Box>
                ) : (
                    <>
                        {error && (
                            <Alert
                                severity="error"
                                sx={{
                                    mb: 3,
                                    borderRadius: 1.5,
                                    fontSize: '0.875rem'
                                }}
                                onClose={() => setError('')}
                            >
                                {error}
                            </Alert>
                        )}
                        {success && (
                            <Alert
                                severity="success"
                                sx={{
                                    mb: 3,
                                    borderRadius: 1.5,
                                    fontSize: '0.875rem'
                                }}
                                onClose={() => setSuccess('')}
                            >
                                {success}
                            </Alert>
                        )}
                        <form onSubmit={handleSubmit(onSubmit)}>
                            {/* Vehicle Info Card */}
                            <Paper
                                elevation={0}
                                variant="outlined"
                                sx={{
                                    p: 2.5,
                                    mb: 3,
                                    borderRadius: 2
                                }}
                            >
                                <Typography
                                    variant="subtitle2"
                                    fontWeight={600}
                                    sx={{
                                        mb: 2.5,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1,
                                        color: 'primary.main'
                                    }}
                                >
                                    <i className="ri-car-line" style={{ fontSize: '16px' }} />
                                    Vehicle Information
                                </Typography>
                                <Grid container spacing={2.5}>
                                    <Grid item xs={12} sm={6}>
                                        <Controller
                                            name="vehicleNo"
                                            control={control}
                                            rules={{ required: 'Vehicle number is required' }}
                                            render={({ field }) => (
                                                <TextField
                                                    style={{ width: '150px' }}

                                                    {...field}
                                                    fullWidth
                                                    label="Vehicle Number"
                                                    placeholder="MH12AB1234"
                                                    error={!!errors.vehicleNo}
                                                    helperText={errors.vehicleNo?.message}
                                                    size="small"
                                                    disabled={isSubmitting}
                                                />
                                            )}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <Controller
                                            name="vehicleModel"
                                            control={control}
                                            rules={{ required: 'Vehicle type is required' }}
                                            render={({ field }) => (
                                                <FormControl
                                                    fullWidth
                                                    error={!!errors.vehicleModel}
                                                    size="small"
                                                    disabled={isSubmitting || types.length === 0}
                                                >
                                                    <InputLabel>Vehicle Type</InputLabel>
                                                    <Select
                                                        {...field}
                                                        label="Vehicle Type"
                                                        style={{ width: '150px' }}
                                                        MenuProps={{
                                                            PaperProps: {
                                                                sx: {
                                                                    maxHeight: 300
                                                                }
                                                            }
                                                        }}
                                                    >
                                                        <MenuItem value="" disabled>
                                                            Select vehicle type
                                                        </MenuItem>
                                                        {types.map((type) => (
                                                            <MenuItem
                                                                key={type.id || type._id || type.value}
                                                                value={type.type || type.name || type.value}
                                                            >
                                                                {type.type || type.name || type.value}
                                                            </MenuItem>
                                                        ))}
                                                    </Select>
                                                    {errors.vehicleModel && (
                                                        <Typography variant="caption" color="error">
                                                            {errors.vehicleModel.message}
                                                        </Typography>
                                                    )}
                                                </FormControl>
                                            )}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <Controller
                                            name="ownerId"
                                            control={control}
                                            rules={{ required: 'Owner is required' }}
                                            render={({ field }) => (
                                                <FormControl
                                                    fullWidth
                                                    error={!!errors.ownerId}
                                                    size="small"
                                                    disabled={isSubmitting}
                                                >
                                                    <InputLabel>Owner</InputLabel>
                                                    <Select
                                                        {...field}
                                                        label="Owner"
                                                        style={{ width: '100px' }}
                                                    >
                                                        <MenuItem value="" disabled>
                                                            Select owner
                                                        </MenuItem>
                                                        {owners.map(owner => (
                                                            <MenuItem key={owner._id} value={owner._id}>
                                                                {owner.fullName || owner.name}
                                                            </MenuItem>
                                                        ))}
                                                    </Select>
                                                    {errors.ownerId && (
                                                        <Typography variant="caption" color="error">
                                                            {errors.ownerId.message}
                                                        </Typography>
                                                    )}
                                                </FormControl>
                                            )}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <Controller
                                            name="driverId"
                                            control={control}
                                            render={({ field }) => (
                                                <FormControl
                                                    fullWidth
                                                    size="small"
                                                    disabled={isSubmitting}
                                                >
                                                    <InputLabel>Driver</InputLabel>
                                                    <Select
                                                        {...field}
                                                        label="Driver"
                                                        style={{ width: '150px' }}
                                                    >
                                                        <MenuItem value="">
                                                            No driver assigned
                                                        </MenuItem>
                                                        {drivers.map(driver => (
                                                            <MenuItem key={driver._id} value={driver._id}>
                                                                {driver.name || driver.fullName}
                                                            </MenuItem>
                                                        ))}
                                                    </Select>
                                                </FormControl>
                                            )}
                                        />
                                    </Grid>
                                    {selectedDriverMobile && (
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                style={{ width: '120px' }}

                                                label="Driver Contact"
                                                value={selectedDriverMobile}
                                                InputProps={{
                                                    readOnly: true,
                                                    sx: {
                                                        backgroundColor: 'grey.50',
                                                        fontSize: '0.875rem'
                                                    }
                                                }}
                                                size="small"
                                            />
                                        </Grid>
                                    )}
                                    <Grid item xs={12}>
                                        <Box display="flex" alignItems="center" justifyContent="space-between">
                                            <Box display="flex" alignItems="center" gap={1}>
                                                <Typography variant="body2" fontWeight={500}>
                                                    Vehicle Status
                                                </Typography>
                                                <Box
                                                    sx={{
                                                        width: 8,
                                                        height: 8,
                                                        borderRadius: '50%',
                                                        backgroundColor: watch('isActive') ? 'success.main' : '#ff4d49'
                                                    }}
                                                />
                                                <Typography variant="caption" color="text.secondary">
                                                    {watch('isActive') ? 'Active' : 'Inactive'}
                                                </Typography>
                                            </Box>
                                            <Controller
                                                name="isActive"
                                                control={control}
                                                render={({ field }) => (
                                                    <Switch
                                                        checked={field.value}
                                                        {...field}
                                                        color="primary"
                                                        size="small"
                                                        disabled={isSubmitting}
                                                    />
                                                )}
                                            />
                                        </Box>
                                    </Grid>
                                </Grid>
                            </Paper>
                            {/* Documents Card */}
                            <Paper
                                elevation={0}
                                variant="outlined"
                                sx={{
                                    p: 2.5,
                                    mb: 3,
                                    borderRadius: 2
                                }}
                            >
                                <Typography
                                    variant="subtitle2"
                                    fontWeight={600}
                                    sx={{
                                        mb: 2.5,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1,
                                        color: 'primary.main'
                                    }}
                                >
                                    <i className="ri-file-list-3-line" style={{ fontSize: '16px' }} />
                                    Documents
                                    <Chip
                                        label={`${documents.length} added`}
                                        size="small"
                                        sx={{
                                            height: 20,
                                            fontSize: '0.75rem',
                                            ml: 1
                                        }}
                                    />
                                </Typography>
                                <Box sx={{ mb: 2 }}>
                                    {documents.map((doc, index) => (
                                        <Box
                                            key={index}
                                            sx={{
                                                mb: 2,
                                                p: 2,
                                                border: '1px dashed',
                                                borderColor: 'divider',
                                                borderRadius: 1.5,
                                                backgroundColor: index % 2 === 0 ? 'transparent' : 'grey.50'
                                            }}
                                        >
                                            <Grid container spacing={2} alignItems="center">
                                                {/* Document Type */}
                                                <Grid item xs={12} md={3}>
                                                    <FormControl size="small" fullWidth>
                                                        <InputLabel>Type</InputLabel>
                                                        <Select
                                                            style={{ width: '150px' }}

                                                            label="Type"
                                                            value={doc.documentType}
                                                            onChange={e =>
                                                                updateDocument(index, 'documentType', e.target.value)
                                                            }
                                                            disabled={isSubmitting || uploadingIndex === index}
                                                        >
                                                            <MenuItem value="" disabled>
                                                                Select document type
                                                            </MenuItem>
                                                            {DOCUMENTS.map(d => (
                                                                <MenuItem
                                                                    key={d.key}
                                                                    value={d.key}
                                                                    disabled={documents.some(
                                                                        (doc2, i) => i !== index && doc2.documentType === d.key
                                                                    )}
                                                                >
                                                                    {d.label}
                                                                </MenuItem>
                                                            ))}
                                                        </Select>
                                                    </FormControl>
                                                </Grid>
                                                {/* Expiry Date */}
                                                <Grid item xs={12} md={2}>
                                                    <TextField
                                                        fullWidth
                                                        size="small"
                                                        type="date"
                                                        label="Expiry Date"
                                                        InputLabelProps={{ shrink: true }}
                                                        value={doc.expiryDate}
                                                        onChange={e =>
                                                            updateDocument(index, 'expiryDate', e.target.value)
                                                        }
                                                        disabled={isSubmitting || uploadingIndex === index}
                                                    />
                                                </Grid>
                                                {/* Upload Button */}
                                                <Grid item xs={12} md={3}>
                                                    <Button
                                                        fullWidth
                                                        variant="outlined"
                                                        component="label"
                                                        size="small"
                                                        disabled={isSubmitting || uploadingIndex === index}
                                                        startIcon={<i className="ri-upload-line" />}
                                                    >
                                                        {uploadingIndex === index ? 'Uploading...' : 'Upload Document'}
                                                        <input
                                                            type="file"
                                                            hidden
                                                            accept="image/*"
                                                            onChange={e =>
                                                                handleFileChange(index, e.target.files?.[0])
                                                            }
                                                        />
                                                    </Button>
                                                </Grid>
                                                {/* Preview + Download */}
                                                <Grid item xs={12} md={3}>
                                                    <Stack direction="row" spacing={1} alignItems="center">
                                                        {doc.imageUrl ? (
                                                            <>
                                                                <Box
                                                                    sx={{
                                                                        width: 50,
                                                                        height: 50,
                                                                        borderRadius: 1,
                                                                        border: '1px solid',
                                                                        borderColor: 'divider',
                                                                        overflow: 'hidden'
                                                                    }}
                                                                >
                                                                    <img
                                                                        src={doc.imageUrl}
                                                                        alt="Document preview"
                                                                        style={{
                                                                            width: '100%',
                                                                            height: '100%',
                                                                            objectFit: 'cover'
                                                                        }}
                                                                        onError={e => {
                                                                            e.target.src = '/images/placeholder.jpg'
                                                                        }}
                                                                    />
                                                                </Box>
                                                                <Tooltip title="Download">
                                                                    <IconButton
                                                                        size="small"
                                                                        onClick={() =>
                                                                            downloadImage(
                                                                                doc.imageUrl,
                                                                                `${doc.documentType || 'document'}.jpg`
                                                                            )
                                                                        }
                                                                        disabled={isSubmitting}
                                                                    >
                                                                        <i className="ri-download-line" />
                                                                    </IconButton>
                                                                </Tooltip>
                                                            </>
                                                        ) : doc.file && !doc.imageUrl ? (
                                                            <Typography variant="caption" color="text.secondary">
                                                                {doc.file.name}
                                                            </Typography>
                                                        ) : (
                                                            <Typography variant="caption" color="text.disabled">
                                                                No file uploaded
                                                            </Typography>
                                                        )}
                                                    </Stack>
                                                </Grid>
                                                {/* Delete Button */}
                                                <Grid item xs={12} md={1} textAlign="right">
                                                    <IconButton
                                                        size="small"
                                                        disabled={documents.length === 1 || isSubmitting || uploadingIndex === index}
                                                        onClick={() => removeDocument(index)}
                                                        sx={{
                                                            color: 'error.main',
                                                            '&.Mui-disabled': { opacity: 0.3 }
                                                        }}
                                                    >
                                                        <i className="ri-delete-bin-6-line" />
                                                    </IconButton>
                                                </Grid>
                                            </Grid>
                                        </Box>
                                    ))}
                                </Box>
                                {documents.length < DOCUMENTS.length && (
                                    <Button
                                        variant="outlined"
                                        onClick={addDocument}
                                        size="small"
                                        disabled={isSubmitting}
                                        startIcon={<i className="ri-add-line" />}
                                        sx={{
                                            borderStyle: 'dashed',
                                            borderWidth: 1.5
                                        }}
                                    >
                                        Add Document
                                    </Button>
                                )}
                            </Paper>
                            {/* Banking Card */}
                            <Paper
                                elevation={0}
                                variant="outlined"
                                sx={{
                                    p: 2.5,
                                    borderRadius: 2
                                }}
                            >
                                <Typography
                                    variant="subtitle2"
                                    fontWeight={600}
                                    sx={{
                                        mb: 2.5,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1,
                                        color: 'primary.main'
                                    }}
                                >
                                    <i className="ri-bank-line" style={{ fontSize: '16px' }} />
                                    Banking Details (Optional)
                                </Typography>
                                <Grid container spacing={2.5}>
                                    <Grid item xs={12} sm={6}>
                                        <Controller
                                            name="bankName"
                                            control={control}
                                            render={({ field }) => (
                                                <TextField
                                                    {...field}
                                                    fullWidth
                                                    label="Bank Name"
                                                    size="small"
                                                    disabled={isSubmitting}
                                                />
                                            )}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <Controller
                                            name="accountHolderName"
                                            control={control}
                                            render={({ field }) => (
                                                <TextField
                                                    {...field}
                                                    fullWidth
                                                    label="Account Holder Name"
                                                    size="small"
                                                    disabled={isSubmitting}
                                                />
                                            )}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <Controller
                                            name="accountNo"
                                            control={control}
                                            render={({ field }) => (
                                                <TextField
                                                    {...field}
                                                    fullWidth
                                                    label="Account Number"
                                                    size="small"
                                                    disabled={isSubmitting}
                                                />
                                            )}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <Controller
                                            name="ifscCode"
                                            control={control}
                                            render={({ field }) => (
                                                <TextField
                                                    {...field}
                                                    fullWidth
                                                    label="IFSC Code"
                                                    size="small"
                                                    disabled={isSubmitting}
                                                />
                                            )}
                                        />
                                    </Grid>
                                </Grid>
                            </Paper>
                        </form>
                    </>
                )}
            </DialogContent>
            <Divider />
            <DialogActions sx={{ p: 2.5, pt: 2 }}>
                <Button
                    onClick={handleClose}
                    variant="outlined"
                    disabled={isSubmitting || uploadingIndex !== null}
                    sx={{
                        borderRadius: 1.5,
                        px: 4,
                        py: 1
                    }}
                >
                    Cancel
                </Button>
                <Button
                    onClick={handleSubmit(onSubmit)}
                    variant="contained"
                    disabled={isSubmitting || uploadingIndex !== null}
                    startIcon={isSubmitting ? <CircularProgress size={16} color="inherit" /> : null}
                    sx={{
                        borderRadius: 1.5,
                        px: 4,
                        py: 1,
                        minWidth: 120
                    }}
                >
                    {isSubmitting ? 'Saving...' : (editData ? 'Update' : 'Save')}
                </Button>
            </DialogActions>
        </Dialog>
    )
}
export default AddVehicleDrawer
