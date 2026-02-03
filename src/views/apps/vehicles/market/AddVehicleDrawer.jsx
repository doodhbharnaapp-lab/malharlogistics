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
// import Select from '@mui/material/Select'
// import MenuItem from '@mui/material/MenuItem'
// import InputLabel from '@mui/material/InputLabel'
// import FormControl from '@mui/material/FormControl'
// // ===================== RHF =====================
// import { useForm, Controller } from 'react-hook-form'
// import { Paper } from '@mui/material'
// // ===================== Documents Master =====================
// const AddVehicleDrawer = ({
//     open,
//     handleClose,
//     refreshData,
//     editData = null
// }) => {
//     // ===================== State =====================
//     const [isSubmitting, setIsSubmitting] = useState(false)
//     const [error, setError] = useState('')
//     const [success, setSuccess] = useState('')
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
//             vehicleModel: '',
//             ownerName: '',
//             ownerMobile: '',
//             driverName: '',
//             driverMobile: '',
//             bankName: '',
//             accountNo: '',
//             ifscCode: '',
//             accountHolderName: '',
//             isActive: true,
//             isMarket: true
//         }
//     })
//     // ===================== Edit Mode Prefill =====================
//     useEffect(() => {
//         if (editData && open) {
//             reset({
//                 vehicleNo: editData.vehicleNo || '',
//                 vehicleModel: editData.model || '',
//                 ownerName: editData.ownerName || '',
//                 ownerMobile: editData.ownerMobile || '',
//                 driverName: editData.driverName || '',
//                 driverMobile: editData.driverMobile || '',
//                 bankName: editData.bankName || '',
//                 accountNo: editData.accountNo || '',
//                 ifscCode: editData.ifscCode || '',
//                 accountHolderName: editData.accountHolderName || '',
//                 isActive: editData.isActive ?? true,
//                 isMarket: editData.isMarket ?? true,
//             })
//         }
//         if (!editData && open) {
//             reset()
//         }
//     }, [editData, open])
//     // ===================== Document Handlers =====================
//     // ===================== Submit =====================
//     const onSubmit = async formData => {
//         try {
//             setIsSubmitting(true)
//             setError('')
//             setSuccess('')
//             const payload = {
//                 ...formData,
//             }
//             if (editData?._id) payload.id = editData._id
//             const res = await fetch('/api/apps/vehicles/market', {
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
//                 <>
//                     {error && (
//                         <Alert
//                             severity="error"
//                             sx={{
//                                 mb: 3,
//                                 borderRadius: 1.5,
//                                 fontSize: '0.875rem'
//                             }}
//                             onClose={() => setError('')}
//                         >
//                             {error}
//                         </Alert>
//                     )}
//                     {success && (
//                         <Alert
//                             severity="success"
//                             sx={{
//                                 mb: 3,
//                                 borderRadius: 1.5,
//                                 fontSize: '0.875rem'
//                             }}
//                             onClose={() => setSuccess('')}
//                         >
//                             {success}
//                         </Alert>
//                     )}
//                     <form onSubmit={handleSubmit(onSubmit)}>
//                         {/* Vehicle Info Card */}
//                         <Paper
//                             elevation={0}
//                             variant="outlined"
//                             sx={{
//                                 p: 2.5,
//                                 mb: 3,
//                                 borderRadius: 2
//                             }}
//                         >
//                             <Typography
//                                 variant="subtitle2"
//                                 fontWeight={600}
//                                 sx={{
//                                     mb: 2.5,
//                                     display: 'flex',
//                                     alignItems: 'center',
//                                     gap: 1,
//                                     color: 'primary.main'
//                                 }}
//                             >
//                                 <i className="ri-car-line" style={{ fontSize: '16px' }} />
//                                 Vehicle Information
//                             </Typography>
//                             <Grid container spacing={2.5}>
//                                 <Grid item xs={12} sm={6}>
//                                     <Controller
//                                         name="vehicleNo"
//                                         control={control}
//                                         rules={{ required: 'Required' }}
//                                         render={({ field }) => (
//                                             <TextField
//                                                 {...field}
//                                                 fullWidth
//                                                 label="Vehicle Number"
//                                                 placeholder="MH12AB1234"
//                                                 error={!!errors.vehicleNo}
//                                                 helperText={errors.vehicleNo?.message}
//                                                 size="small"
//                                             />
//                                         )}
//                                     />
//                                 </Grid>
//                                 <Grid item xs={12} sm={6}>
//                                     <Controller
//                                         name="vehicleModel"
//                                         control={control}
//                                         rules={{ required: 'Required' }}
//                                         render={({ field }) => (
//                                             <TextField
//                                                 {...field}
//                                                 fullWidth
//                                                 label="Vehicle Model"
//                                                 placeholder="Tata Ace"
//                                                 error={!!errors.vehicleModel}
//                                                 helperText={errors.vehicleModel?.message}
//                                                 size="small"
//                                             />
//                                         )}
//                                     />
//                                 </Grid>
//                                 {/* Owner Fields - Changed from dropdown to text field */}
//                                 <Grid item xs={12} sm={6}>
//                                     <Controller
//                                         name="ownerName"
//                                         control={control}
//                                         rules={{ required: 'Required' }}
//                                         render={({ field }) => (
//                                             <TextField
//                                                 {...field}
//                                                 fullWidth
//                                                 label="Owner Name"
//                                                 placeholder="Enter owner name"
//                                                 error={!!errors.ownerName}
//                                                 helperText={errors.ownerName?.message}
//                                                 size="small"
//                                             />
//                                         )}
//                                     />
//                                 </Grid>
//                                 <Grid item xs={12} sm={6}>
//                                     <Controller
//                                         name="ownerMobile"
//                                         control={control}
//                                         rules={{
//                                             required: 'Required',
//                                             pattern: {
//                                                 value: /^[0-9]{10}$/,
//                                                 message: 'Enter valid 10-digit mobile number'
//                                             }
//                                         }}
//                                         render={({ field }) => (
//                                             <TextField
//                                                 {...field}
//                                                 fullWidth
//                                                 label="Owner Mobile"
//                                                 placeholder="9876543210"
//                                                 error={!!errors.ownerMobile}
//                                                 helperText={errors.ownerMobile?.message}
//                                                 size="small"
//                                             />
//                                         )}
//                                     />
//                                 </Grid>
//                                 {/* Driver Fields - Changed from dropdown to text field */}
//                                 <Grid item xs={12} sm={6}>
//                                     <Controller
//                                         name="driverName"
//                                         control={control}
//                                         render={({ field }) => (
//                                             <TextField
//                                                 {...field}
//                                                 fullWidth
//                                                 label="Driver Name"
//                                                 placeholder="Enter driver name"
//                                                 size="small"
//                                             />
//                                         )}
//                                     />
//                                 </Grid>
//                                 <Grid item xs={12} sm={6}>
//                                     <Controller
//                                         name="driverMobile"
//                                         control={control}
//                                         rules={{
//                                             pattern: {
//                                                 value: /^$|^[0-9]{10}$/,
//                                                 message: 'Enter valid 10-digit mobile number'
//                                             }
//                                         }}
//                                         render={({ field }) => (
//                                             <TextField
//                                                 {...field}
//                                                 fullWidth
//                                                 label="Driver Mobile"
//                                                 placeholder="9876543210"
//                                                 error={!!errors.driverMobile}
//                                                 helperText={errors.driverMobile?.message}
//                                                 size="small"
//                                             />
//                                         )}
//                                     />
//                                 </Grid>
//                                 <Grid item xs={12}>
//                                     <Box display="flex" alignItems="center" justifyContent="space-between">
//                                         <Box display="flex" alignItems="center" gap={1}>
//                                             <Typography variant="body2" fontWeight={500}>
//                                                 Vehicle Status
//                                             </Typography>
//                                             <Box
//                                                 sx={{
//                                                     width: 8,
//                                                     height: 8,
//                                                     borderRadius: '50%',
//                                                     backgroundColor: watch('isActive') ? 'success.main' : '#ff4d49'
//                                                 }}
//                                             />
//                                         </Box>
//                                         <Controller
//                                             name="isActive"
//                                             control={control}
//                                             render={({ field }) => (
//                                                 <Switch
//                                                     checked={field.value}
//                                                     {...field}
//                                                     color="primary"
//                                                     size="small"
//                                                 />
//                                             )}
//                                         />
//                                     </Box>
//                                 </Grid>
//                             </Grid>
//                         </Paper>
//                         {/* Documents Card - KEPT AS ORIGINAL */}
//                         {/* Banking Card */}
//                         <Paper
//                             elevation={0}
//                             variant="outlined"
//                             sx={{
//                                 p: 2.5,
//                                 borderRadius: 2
//                             }}
//                         >
//                             <Typography
//                                 variant="subtitle2"
//                                 fontWeight={600}
//                                 sx={{
//                                     mb: 2.5,
//                                     display: 'flex',
//                                     alignItems: 'center',
//                                     gap: 1,
//                                     color: 'primary.main'
//                                 }}
//                             >
//                                 <i className="ri-bank-line" style={{ fontSize: '16px' }} />
//                                 Banking Details
//                             </Typography>
//                             <Grid container spacing={2.5}>
//                                 <Grid item xs={12} sm={6}>
//                                     <Controller
//                                         name="bankName"
//                                         control={control}
//                                         render={({ field }) => (
//                                             <TextField
//                                                 {...field}
//                                                 fullWidth
//                                                 label="Bank Name"
//                                                 size="small"
//                                             />
//                                         )}
//                                     />
//                                 </Grid>
//                                 <Grid item xs={12} sm={6}>
//                                     <Controller
//                                         name="accountHolderName"
//                                         control={control}
//                                         render={({ field }) => (
//                                             <TextField
//                                                 {...field}
//                                                 fullWidth
//                                                 label="Account Holder"
//                                                 size="small"
//                                             />
//                                         )}
//                                     />
//                                 </Grid>
//                                 <Grid item xs={12} sm={6}>
//                                     <Controller
//                                         name="accountNo"
//                                         control={control}
//                                         render={({ field }) => (
//                                             <TextField
//                                                 {...field}
//                                                 fullWidth
//                                                 label="Account Number"
//                                                 size="small"
//                                             />
//                                         )}
//                                     />
//                                 </Grid>
//                                 <Grid item xs={12} sm={6}>
//                                     <Controller
//                                         name="ifscCode"
//                                         control={control}
//                                         render={({ field }) => (
//                                             <TextField
//                                                 {...field}
//                                                 fullWidth
//                                                 label="IFSC Code"
//                                                 size="small"
//                                             />
//                                         )}
//                                     />
//                                 </Grid>
//                             </Grid>
//                         </Paper>
//                     </form>
//                 </>
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
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import InputLabel from '@mui/material/InputLabel'
import FormControl from '@mui/material/FormControl'
// ===================== RHF =====================
import { useForm, Controller } from 'react-hook-form'
import { Paper } from '@mui/material'
// ===================== Documents Master =====================
const AddVehicleDrawer = ({
    open,
    handleClose,
    refreshData,
    editData = null
}) => {
    // ===================== State =====================
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    // ===================== Form =====================
    const {
        control,
        handleSubmit,
        reset,
        watch,
        formState: { errors }
    } = useForm({
        defaultValues: {
            vehicleNo: '',
            vehicleModel: '',
            ownerName: '',
            ownerMobile: '',
            driverName: '',
            driverMobile: '',
            bankName: '',
            accountNo: '',
            ifscCode: '',
            accountHolderName: '',
            isActive: true,
            isMarket: true
        }
    })
    // ===================== Edit Mode Prefill =====================
    useEffect(() => {
        if (editData && open) {
            console.log('Editing vehicle data:', editData) // Debug log
            reset({
                vehicleNo: editData.vehicleNo || '',
                vehicleModel: editData.vehicleModel || editData.model || '', // Support both fields
                ownerName: editData.ownerName || '',
                ownerMobile: editData.ownerMobile || '', // Add this
                driverName: editData.driverName || '',
                driverMobile: editData.driverMobile || '',
                bankName: editData.bankName || '',
                accountNo: editData.accountNo || '',
                ifscCode: editData.ifscCode || '',
                accountHolderName: editData.accountHolderName || '',
                isActive: editData.isActive !== undefined ? editData.isActive : true,
                isMarket: editData.isMarket !== undefined ? editData.isMarket : true,
            })
        }
        if (!editData && open) {
            reset()
        }
    }, [editData, open, reset])
    // ===================== Submit =====================
    const onSubmit = async formData => {
        try {
            setIsSubmitting(true)
            setError('')
            setSuccess('')

            // Prepare payload - map form fields to backend fields
            const payload = {
                // Map vehicleModel to model for backend
                vehicleNo: formData.vehicleNo,
                model: formData.vehicleModel, // Backend expects 'model', not 'vehicleModel'
                ownerName: formData.ownerName,
                ownerMobile: formData.ownerMobile || '',
                driverName: formData.driverName || '',
                driverMobile: formData.driverMobile || '',
                bankName: formData.bankName || '',
                accountNo: formData.accountNo || '',
                ifscCode: formData.ifscCode || '',
                accountHolderName: formData.accountHolderName || '',
                isActive: formData.isActive !== undefined ? formData.isActive : true,
                isMarket: formData.isMarket !== undefined ? formData.isMarket : true,
            }

            // Add ID for edit mode - use id from editData
            if (editData?.id) {
                payload.id = editData.id
            }

            console.log('Submitting payload:', payload) // Debug log

            const res = await fetch('/api/apps/vehicles/market', {
                method: editData ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })

            const json = await res.json()

            if (!res.ok) {
                throw new Error(json.error || json.message || 'Request failed')
            }

            setSuccess(editData ? 'Vehicle updated successfully' : 'Vehicle added successfully')
            setTimeout(() => {
                refreshData?.()
                handleClose()
            }, 1000)

        } catch (err) {
            console.error('Submit error:', err)
            setError(err.message || 'Something went wrong')
        } finally {
            setIsSubmitting(false)
        }
    }

    // ===================== Debug View =====================
    useEffect(() => {
        if (open) {
            console.log('Drawer opened with editData:', editData)
            console.log('Current form values:', watch())
        }
    }, [open, editData, watch])

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
                            {editData ? `Editing: ${editData.vehicleNo}` : 'Enter new vehicle information'}
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
                    <form onSubmit={handleSubmit(onSubmit)} id="vehicle-form">
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
                                                {...field}
                                                fullWidth
                                                label="Vehicle Number"
                                                placeholder="MH12AB1234"
                                                error={!!errors.vehicleNo}
                                                helperText={errors.vehicleNo?.message}
                                                size="small"
                                            />
                                        )}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Controller
                                        name="vehicleModel"
                                        control={control}
                                        rules={{ required: 'Vehicle model is required' }}
                                        render={({ field }) => (
                                            <TextField
                                                {...field}
                                                fullWidth
                                                label="Vehicle Model"
                                                placeholder="Tata Ace, 20 FEET, etc."
                                                error={!!errors.vehicleModel}
                                                helperText={errors.vehicleModel?.message}
                                                size="small"
                                            />
                                        )}
                                    />
                                </Grid>
                                {/* Owner Fields */}
                                <Grid item xs={12} sm={6}>
                                    <Controller
                                        name="ownerName"
                                        control={control}
                                        rules={{ required: 'Owner name is required' }}
                                        render={({ field }) => (
                                            <TextField
                                                {...field}
                                                fullWidth
                                                label="Owner Name"
                                                placeholder="Enter owner name"
                                                error={!!errors.ownerName}
                                                helperText={errors.ownerName?.message}
                                                size="small"
                                            />
                                        )}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Controller
                                        name="ownerMobile"
                                        control={control}
                                        rules={{
                                            required: 'Owner mobile is required',
                                            pattern: {
                                                value: /^[0-9]{10}$/,
                                                message: 'Enter valid 10-digit mobile number'
                                            }
                                        }}
                                        render={({ field }) => (
                                            <TextField
                                                {...field}
                                                fullWidth
                                                label="Owner Mobile"
                                                placeholder="9876543210"
                                                error={!!errors.ownerMobile}
                                                helperText={errors.ownerMobile?.message}
                                                size="small"
                                            />
                                        )}
                                    />
                                </Grid>
                                {/* Driver Fields */}
                                <Grid item xs={12} sm={6}>
                                    <Controller
                                        name="driverName"
                                        control={control}
                                        render={({ field }) => (
                                            <TextField
                                                {...field}
                                                fullWidth
                                                label="Driver Name"
                                                placeholder="Enter driver name"
                                                size="small"
                                            />
                                        )}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Controller
                                        name="driverMobile"
                                        control={control}
                                        rules={{
                                            pattern: {
                                                value: /^$|^[0-9]{10}$/,
                                                message: 'Enter valid 10-digit mobile number'
                                            }
                                        }}
                                        render={({ field }) => (
                                            <TextField
                                                {...field}
                                                fullWidth
                                                label="Driver Mobile"
                                                placeholder="9876543210"
                                                error={!!errors.driverMobile}
                                                helperText={errors.driverMobile?.message}
                                                size="small"
                                            />
                                        )}
                                    />
                                </Grid>
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
                                                />
                                            )}
                                        />
                                    </Box>
                                </Grid>
                            </Grid>
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
                                Banking Details
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
                                                label="Account Holder"
                                                size="small"
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
                                            />
                                        )}
                                    />
                                </Grid>
                            </Grid>
                        </Paper>
                    </form>
                </>
            </DialogContent>
            <Divider />
            <DialogActions sx={{ p: 2.5, pt: 2 }}>
                <Button
                    onClick={handleClose}
                    variant="outlined"
                    disabled={isSubmitting}
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
                    disabled={isSubmitting}
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
