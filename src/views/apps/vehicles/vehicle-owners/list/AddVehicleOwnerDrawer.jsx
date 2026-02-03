// React Imports
import { useState } from 'react'
// MUI Imports
import Button from '@mui/material/Button'
import Drawer from '@mui/material/Drawer'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import TextField from '@mui/material/TextField'
import Switch from '@mui/material/Switch'
import FormControlLabel from '@mui/material/FormControlLabel'
import Typography from '@mui/material/Typography'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
// Third-party Imports
import PerfectScrollbar from 'react-perfect-scrollbar'
import { useForm, Controller } from 'react-hook-form'
const AddVehicleOwnerDrawer = props => {
    // Props
    const { open, handleClose, setData, customerData, isVehicleOwner = false } = props
    // States
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    // Hooks
    const {
        control,
        reset: resetForm,
        handleSubmit,
        formState: { errors }
    } = useForm({
        defaultValues: {
            fullName: '',
            mobile: '',
            isActive: true
        }
    })
    const onSubmit = async data => {
        try {
            setIsSubmitting(true)
            setError('')
            setSuccess('')
            console.log('Submitting vehicle owner:', data)
            // If it's for vehicle owners, use the API
            if (isVehicleOwner) {
                const response = await fetch('/api/apps/vehicles/vehicle-owner', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                })
                const result = await response.json()
                if (!response.ok) {
                    throw new Error(result.error || result.message || 'Failed to add vehicle owner')
                }
                setSuccess('Vehicle owner added successfully!')
                // Refresh the data
                if (setData) {
                    // You might want to fetch fresh data or add locally
                    const newOwner = {
                        id: result.data._id || Date.now().toString(),
                        ownerId: `VO${String((customerData?.length || 0) + 1).padStart(3, '0')}`,
                        ownerName: data.fullName,
                        mobile: data.mobile,
                        isActive: data.isActive
                    }
                    setData(prev => [...(prev || []), newOwner])
                }
                // Close after 2 seconds
                setTimeout(() => {
                    handleReset()
                }, 2000)
            } else {
                // Original customer logic (keep for compatibility)
                const newData = {
                    id: (customerData?.length && customerData?.length + 1) || 1,
                    customer: data.fullName,
                    customerId: customerData?.[Math.floor(Math.random() * 100) + 1]?.customerId ?? '1',
                    email: data.email,
                    country: data.country || 'India',
                    countryCode: 'st',
                    countryFlag: `/images/cards/${data.country || 'india'}.png`,
                    order: Math.floor(Math.random() * 1000) + 1,
                    totalSpent: Math.floor(Math.random() * (1000000 - 100) + 100) / 100,
                    avatar: `/images/avatars/${Math.floor(Math.random() * 8) + 1}.png`
                }
                setData([...(customerData ?? []), newData])
                handleClose()
            }
        } catch (err) {
            console.error('Error adding vehicle owner:', err)
            setError(err.message || 'Failed to add vehicle owner')
        } finally {
            setIsSubmitting(false)
        }
    }
    const handleReset = () => {
        handleClose()
        resetForm({ fullName: '', mobile: '', isActive: true })
        setError('')
        setSuccess('')
    }
    return (
        <Drawer
            open={open}
            anchor='right'
            variant='temporary'
            onClose={handleReset}
            ModalProps={{ keepMounted: true }}
            sx={{ '& .MuiDrawer-paper': { width: { xs: 300, sm: 400 } } }}
        >
            <div className='flex items-center justify-between p-5'>
                <Typography variant='h5'>
                    {isVehicleOwner ? 'Add Vehicle Owner' : 'Add a Customer'}
                </Typography>
                <IconButton size='small' onClick={handleReset} disabled={isSubmitting}>
                    <i className='ri-close-line text-2xl' />
                </IconButton>
            </div>
            <Divider />
            <PerfectScrollbar options={{ wheelPropagation: false, suppressScrollX: true }}>
                <div className='p-5'>
                    {error && (
                        <Alert severity='error' className='mb-4'>
                            {error}
                        </Alert>
                    )}
                    {success && (
                        <Alert severity='success' className='mb-4'>
                            {success}
                        </Alert>
                    )}
                    <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-5'>
                        <Typography color='text.primary' className='font-medium'>
                            {isVehicleOwner ? 'Vehicle Owner Information' : 'Basic Information'}
                        </Typography>
                        <Controller
                            name='fullName'
                            control={control}
                            rules={{ required: 'Owner name is required' }}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    fullWidth
                                    label={isVehicleOwner ? 'Owner Full Name' : 'Full Name'}
                                    placeholder='John Doe'
                                    error={!!errors.fullName}
                                    helperText={errors.fullName?.message}
                                    disabled={isSubmitting}
                                />
                            )}
                        />
                        <Controller
                            name='mobile'
                            control={control}
                            rules={{
                                required: 'Mobile number is required',
                                pattern: {
                                    value: /^[0-9]{10}$/,
                                    message: 'Please enter a valid 10-digit mobile number'
                                }
                            }}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    fullWidth
                                    type='tel'
                                    label='Mobile Number'
                                    placeholder='9876543210'
                                    error={!!errors.mobile}
                                    helperText={errors.mobile?.message}
                                    disabled={isSubmitting}
                                />
                            )}
                        />
                        {isVehicleOwner && (
                            <>
                                <Controller
                                    name='isActive'
                                    control={control}
                                    render={({ field }) => (
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    {...field}
                                                    checked={field.value}
                                                    color='primary'
                                                    disabled={isSubmitting}
                                                />
                                            }
                                            label={
                                                <div className='flex flex-col'>
                                                    <Typography color='text.primary' className='font-medium'>
                                                        Active Status
                                                    </Typography>
                                                    <Typography variant='body2' color='text.secondary'>
                                                        {field.value ? 'Owner is active' : 'Owner is inactive'}
                                                    </Typography>
                                                </div>
                                            }
                                            labelPlacement='start'
                                            className='justify-between m-0'
                                        />
                                    )}
                                />
                                <Typography variant='body2' color='text.secondary' className='mt-2'>
                                    Active owners can manage their vehicles and receive notifications.
                                </Typography>
                            </>
                        )}
                        {!isVehicleOwner && (
                            <>
                                <Controller
                                    name='email'
                                    control={control}
                                    rules={{ required: 'Email is required' }}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            fullWidth
                                            type='email'
                                            label='Email Address'
                                            placeholder='johndoe@gmail.com'
                                            error={!!errors.email}
                                            helperText={errors.email?.message}
                                            disabled={isSubmitting}
                                        />
                                    )}
                                />
                                {/* Original customer fields can be added here if needed */}
                            </>
                        )}
                        <div className='flex items-center gap-4 mt-4'>
                            <Button
                                variant='contained'
                                type='submit'
                                disabled={isSubmitting}
                                startIcon={isSubmitting && <CircularProgress size={20} />}
                            >
                                {isSubmitting ? 'Adding...' : isVehicleOwner ? 'Add Owner' : 'Add Customer'}
                            </Button>
                            <Button
                                variant='outlined'
                                color='error'
                                type='button'
                                onClick={handleReset}
                                disabled={isSubmitting}
                            >
                                Cancel
                            </Button>
                        </div>
                    </form>
                </div>
            </PerfectScrollbar>
        </Drawer>
    )
}
export default AddVehicleOwnerDrawer
