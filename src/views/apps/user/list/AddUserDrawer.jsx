'use client'
// React Imports
import { useEffect, useState } from 'react'
// MUI Imports
import Button from '@mui/material/Button'
import Drawer from '@mui/material/Drawer'
import FormControl from '@mui/material/FormControl'
import IconButton from '@mui/material/IconButton'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import TextField from '@mui/material/TextField'
import FormHelperText from '@mui/material/FormHelperText'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import InputAdornment from '@mui/material/InputAdornment'
import CircularProgress from '@mui/material/CircularProgress'
// Third-party Imports
import { useForm, Controller } from 'react-hook-form'
const AddUserDrawer = props => {
  const { open, handleClose, editingUser, refreshData } = props
  const isEditMode = Boolean(editingUser)
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      role: '',
      contact: '',
      isActive: true
    }
  })
  const [loading, setLoading] = useState(false)
  const [isPasswordShown, setIsPasswordShown] = useState(false)
  const [apiError, setApiError] = useState('')
  /* ================= PREFILL EDIT DATA ================= */
  useEffect(() => {
    if (editingUser) {
      reset({
        fullName: editingUser.fullName,
        email: editingUser.email,
        role: editingUser.role,
        contact: editingUser.contact || '',
        isActive: editingUser.isActive
      })
    } else {
      reset({
        fullName: '',
        email: '',
        password: '',
        role: '',
        contact: '',
        isActive: true
      })
    }
  }, [editingUser, reset])
  /* ================= SUBMIT ================= */
  const onSubmit = async data => {
    try {
      setLoading(true)
      setApiError('')
      const payload = isEditMode
        ? {
          id: editingUser.id,
          name: data.fullName,
          role: data.role,
          contact: data.contact,
          isActive: data.isActive,
          ...(data.password && { password: data.password })
        }
        : {
          name: data.fullName,
          email: data.email,
          password: data.password,
          role: data.role,
          contact: data.contact,
          isActive: true
        }
      const response = await fetch('/api/apps/user-list', {
        method: isEditMode ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error || 'Failed to save user')
      }
      refreshData()
      handleClose()
    } catch (err) {
      setApiError(err.message)
    } finally {
      setLoading(false)
    }
  }
  return (
    <Drawer
      open={open}
      anchor='right'
      onClose={handleClose}
      sx={{ '& .MuiDrawer-paper': { width: { xs: 300, sm: 400 } } }}
    >
      <div className='flex items-center justify-between p-5'>
        <Typography variant='h5'>
          {isEditMode ? 'Edit User' : 'Add New User'}
        </Typography>
        <IconButton onClick={handleClose}>
          <i className='ri-close-line text-2xl' />
        </IconButton>
      </div>
      <Divider />
      <div className='p-5'>
        <form className='flex flex-col gap-5' onSubmit={handleSubmit(onSubmit)}>
          <Controller
            name='fullName'
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <TextField
                {...field}
                label='Full Name'
                fullWidth
                error={!!errors.fullName}
                helperText={errors.fullName && 'Required'}
              />
            )}
          />
          <Controller
            name='email'
            control={control}
            rules={{ required: !isEditMode }}
            render={({ field }) => (
              <TextField
                {...field}
                label='Email'
                fullWidth
                disabled={isEditMode}
                error={!!errors.email}
              />
            )}
          />
          <Controller
            name='password'
            control={control}
            rules={{ required: !isEditMode }}
            render={({ field }) => (
              <TextField
                {...field}
                label={isEditMode ? 'New Password (optional)' : 'Password'}
                type={isPasswordShown ? 'text' : 'password'}
                fullWidth
                InputProps={{
                  endAdornment: (
                    <InputAdornment position='end'>
                      <IconButton onClick={() => setIsPasswordShown(v => !v)}>
                        <i className={isPasswordShown ? 'ri-eye-off-line' : 'ri-eye-line'} />
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
            )}
          />
          <FormControl fullWidth error={!!errors.role}>
            <InputLabel>Select Role</InputLabel>
            <Controller
              name='role'
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <Select {...field} label='Select Role'>
                  <MenuItem value='admin'>Admin</MenuItem>
                  <MenuItem value='manager'>Manager</MenuItem>
                  <MenuItem value='driver'>Driver</MenuItem>
                  <MenuItem value='maintainer'>Maintainer</MenuItem>
                  <MenuItem value='client'>Client</MenuItem>
                </Select>
              )}
            />
            {errors.role && <FormHelperText>Required</FormHelperText>}
          </FormControl>
          <Controller
            name='contact'
            control={control}
            render={({ field }) => (
              <TextField {...field} label='Contact' fullWidth />
            )}
          />
          {apiError && (
            <Typography color='error' variant='body2'>
              {apiError}
            </Typography>
          )}
          <div className='flex gap-3'>
            <Button variant='contained' type='submit' disabled={loading}>
              {loading ? <CircularProgress size={20} /> : isEditMode ? 'Update' : 'Create'}
            </Button>
            <Button variant='outlined' color='error' onClick={handleClose}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </Drawer>
  )
}
export default AddUserDrawer
