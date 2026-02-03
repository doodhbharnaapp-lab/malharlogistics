'use client'
// React Imports
import { useState, useEffect } from 'react'
// MUI Imports
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import TextField from '@mui/material/TextField'
import Checkbox from '@mui/material/Checkbox'
import FormGroup from '@mui/material/FormGroup'
import FormControlLabel from '@mui/material/FormControlLabel'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
// Style Imports
import tableStyles from '@core/styles/table.module.css'
// Default permissions structure
const defaultPermissions = [
  { module: 'User Management', access: ['read', 'write', 'create'] },
  { module: 'Content Management', access: ['read', 'write', 'create'] },
  { module: 'Disputes Management', access: ['read', 'write', 'create'] },
  { module: 'Database Management', access: ['read', 'write', 'create'] },
  { module: 'Financial Management', access: ['read', 'write', 'create'] },
  { module: 'Reporting', access: ['read', 'write', 'create'] },
  { module: 'API Control', access: ['read', 'write', 'create'] },
  { module: 'Repository Management', access: ['read', 'write', 'create'] },
  { module: 'Payroll', access: ['read', 'write', 'create'] }
]
const RoleDialog = ({ open, setOpen, roleData, onSuccess }) => {
  // States
  const [formData, setFormData] = useState({
    name: '',
    displayName: '',
    description: '',
    permissions: []
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [isEditMode, setIsEditMode] = useState(false)
  // Initialize form when dialog opens or roleData changes
  useEffect(() => {
    if (open) {
      if (roleData) {
        // Edit mode
        setIsEditMode(true)
        setFormData({
          name: roleData.name || '',
          displayName: roleData.displayName || '',
          description: roleData.description || '',
          permissions: roleData.permissions || []
        })
      } else {
        // Add mode
        setIsEditMode(false)
        setFormData({
          name: '',
          displayName: '',
          description: '',
          permissions: []
        })
      }
      setError('')
    }
  }, [open, roleData])
  const handleClose = () => {
    setOpen(false)
    setFormData({
      name: '',
      displayName: '',
      description: '',
      permissions: []
    })
    setError('')
  }
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }
  const togglePermission = (permissionId) => {
    setFormData(prev => {
      const permissions = [...prev.permissions]
      const index = permissions.indexOf(permissionId)
      if (index > -1) {
        // Remove permission
        permissions.splice(index, 1)
      } else {
        // Add permission
        permissions.push(permissionId)
      }
      return { ...prev, permissions }
    })
  }
  const handleSelectAll = (module) => {
    setFormData(prev => {
      const permissions = [...prev.permissions]
      const moduleKey = module.toLowerCase().replace(/\s+/g, '-')
      const modulePermissions = defaultPermissions.find(p => p.module === module)?.access || []
      const allModulePerms = modulePermissions.map(access => `${moduleKey}-${access}`)
      // Check if all module permissions are already selected
      const allSelected = allModulePerms.every(perm => permissions.includes(perm))
      if (allSelected) {
        // Remove all module permissions
        return {
          ...prev,
          permissions: permissions.filter(perm => !allModulePerms.includes(perm))
        }
      } else {
        // Add all module permissions
        const newPerms = [...new Set([...permissions, ...allModulePerms])]
        return {
          ...prev,
          permissions: newPerms
        }
      }
    })
  }
  const handleSelectAllPermissions = () => {
    setFormData(prev => {
      // Generate all possible permissions
      const allPermissions = defaultPermissions.flatMap(p => {
        const moduleKey = p.module.toLowerCase().replace(/\s+/g, '-')
        return p.access.map(access => `${moduleKey}-${access}`)
      })
      // If all are already selected, clear all
      if (allPermissions.every(perm => prev.permissions.includes(perm))) {
        return { ...prev, permissions: [] }
      } else {
        // Select all
        return { ...prev, permissions: allPermissions }
      }
    })
  }
  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    try {
      // Validate
      if (!formData.name.trim()) {
        throw new Error('Role name is required')
      }
      if (!formData.displayName.trim()) {
        throw new Error('Display name is required')
      }
      const url = isEditMode
        ? `/api/apps/roles/${roleData._id || roleData.name}`
        : '/api/apps/roles'
      const method = isEditMode ? 'PUT' : 'POST'
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })
      const result = await response.json()
      if (!response.ok) {
        throw new Error(result.error || 'Failed to save role')
      }
      // Success
      if (onSuccess) {
        onSuccess()
      }
      handleClose()
    } catch (err) {
      console.error('Error saving role:', err)
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }
  const isPermissionSelected = (module, access) => {
    const permissionId = `${module.toLowerCase().replace(/\s+/g, '-')}-${access}`
    return formData.permissions.includes(permissionId)
  }
  const isModuleAllSelected = (module) => {
    const moduleKey = module.toLowerCase().replace(/\s+/g, '-')
    const modulePermissions = defaultPermissions.find(p => p.module === module)?.access || []
    const allModulePerms = modulePermissions.map(access => `${moduleKey}-${access}`)
    return allModulePerms.every(perm => formData.permissions.includes(perm))
  }
  const isModuleIndeterminate = (module) => {
    const moduleKey = module.toLowerCase().replace(/\s+/g, '-')
    const modulePermissions = defaultPermissions.find(p => p.module === module)?.access || []
    const allModulePerms = modulePermissions.map(access => `${moduleKey}-${access}`)
    const selectedCount = allModulePerms.filter(perm => formData.permissions.includes(perm)).length
    return selectedCount > 0 && selectedCount < allModulePerms.length
  }
  const areAllSelected = () => {
    const allPermissions = defaultPermissions.flatMap(p => {
      const moduleKey = p.module.toLowerCase().replace(/\s+/g, '-')
      return p.access.map(access => `${moduleKey}-${access}`)
    })
    return allPermissions.every(perm => formData.permissions.includes(perm))
  }
  const isIndeterminate = () => {
    const allPermissions = defaultPermissions.flatMap(p => {
      const moduleKey = p.module.toLowerCase().replace(/\s+/g, '-')
      return p.access.map(access => `${moduleKey}-${access}`)
    })
    const selectedCount = formData.permissions.length
    return selectedCount > 0 && selectedCount < allPermissions.length
  }
  return (
    <Dialog fullWidth maxWidth='md' scroll='body' open={open} onClose={handleClose}>
      <DialogTitle variant='h4' className='flex flex-col gap-2 text-center sm:pbs-16 sm:pbe-6 sm:pli-16'>
        {isEditMode ? 'Edit Role' : 'Add Role'}
        <Typography component='span' className='flex flex-col text-center'>
          Set Role Permissions
        </Typography>
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent className='overflow-visible pbs-0 sm:pbe-6 sm:pli-16'>
          <IconButton onClick={handleClose} className='absolute block-start-4 inline-end-4'>
            <i className='ri-close-line text-textSecondary' />
          </IconButton>
          {error && (
            <Alert severity='error' className='mb-4'>
              {error}
            </Alert>
          )}
          <div className='flex flex-col gap-4'>
            <TextField
              label='Role Name (Internal)'
              variant='outlined'
              fullWidth
              placeholder='e.g., content-manager'
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              disabled={isEditMode && roleData?.isSystem}
              helperText={isEditMode && roleData?.isSystem ? 'System role name cannot be changed' : 'Lowercase, use hyphens'}
              required
            />
            <TextField
              label='Display Name'
              variant='outlined'
              fullWidth
              placeholder='e.g., Content Manager'
              value={formData.displayName}
              onChange={(e) => handleInputChange('displayName', e.target.value)}
              required
            />
            <TextField
              label='Description'
              variant='outlined'
              fullWidth
              placeholder='Describe this role'
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              multiline
              rows={2}
            />
          </div>
          <Typography variant='h5' className='plb-5 sm:plb-6'>
            Role Permissions
          </Typography>
          <div className='flex flex-col overflow-x-auto'>
            <table className={tableStyles.table}>
              <tbody className='border-be'>
                <tr>
                  <th className='pis-0'>
                    <Typography className='font-medium whitespace-nowrap grow min-is-[225px]' color='text.primary'>
                      Administrator Access
                    </Typography>
                  </th>
                  <th className='text-end! pie-0'>
                    <FormControlLabel
                      className='mie-0 capitalize'
                      control={
                        <Checkbox
                          onChange={handleSelectAllPermissions}
                          indeterminate={isIndeterminate()}
                          checked={areAllSelected()}
                          disabled={isLoading}
                        />
                      }
                      label='Select All'
                    />
                  </th>
                </tr>
                {defaultPermissions.map((permission, index) => {
                  const moduleKey = permission.module.toLowerCase().replace(/\s+/g, '-')
                  return (
                    <tr key={index}>
                      <td className='pis-0'>
                        <div className='flex items-center gap-2'>
                          <Checkbox
                            onChange={() => handleSelectAll(permission.module)}
                            indeterminate={isModuleIndeterminate(permission.module)}
                            checked={isModuleAllSelected(permission.module)}
                            disabled={isLoading}
                          />
                          <Typography className='font-medium whitespace-nowrap grow min-is-[225px]' color='text.primary'>
                            {permission.module}
                          </Typography>
                        </div>
                      </td>
                      <td className='text-end! pie-0'>
                        <FormGroup className='flex-row justify-end flex-nowrap gap-6'>
                          {permission.access.map((access) => (
                            <FormControlLabel
                              key={`${moduleKey}-${access}`}
                              className='mie-0'
                              control={
                                <Checkbox
                                  checked={isPermissionSelected(permission.module, access)}
                                  onChange={() => togglePermission(`${moduleKey}-${access}`)}
                                  disabled={isLoading}
                                />
                              }
                              label={access.charAt(0).toUpperCase() + access.slice(1)}
                            />
                          ))}
                        </FormGroup>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </DialogContent>
        <DialogActions className='justify-center pbs-0 sm:pbe-16 sm:pli-16'>
          <Button
            variant='contained'
            type='submit'
            disabled={isLoading}
            startIcon={isLoading && <CircularProgress size={20} />}
          >
            {isLoading ? 'Saving...' : isEditMode ? 'Update Role' : 'Create Role'}
          </Button>
          <Button
            variant='outlined'
            color='secondary'
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}
export default RoleDialog
