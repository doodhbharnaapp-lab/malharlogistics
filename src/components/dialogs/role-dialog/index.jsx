// 'use client'
// // React Imports
// import { useState, useEffect } from 'react'
// // MUI Imports
// import Dialog from '@mui/material/Dialog'
// import DialogTitle from '@mui/material/DialogTitle'
// import DialogContent from '@mui/material/DialogContent'
// import Typography from '@mui/material/Typography'
// import IconButton from '@mui/material/IconButton'
// import TextField from '@mui/material/TextField'
// import Checkbox from '@mui/material/Checkbox'
// import FormGroup from '@mui/material/FormGroup'
// import FormControlLabel from '@mui/material/FormControlLabel'
// import DialogActions from '@mui/material/DialogActions'
// import Button from '@mui/material/Button'
// import Alert from '@mui/material/Alert'
// import CircularProgress from '@mui/material/CircularProgress'
// // Style Imports
// import tableStyles from '@core/styles/table.module.css'
// // Default permissions structure
// const defaultPermissions = [
//   { module: 'User Management', access: ['read', 'write', 'create'] },
//   { module: 'Vehicle Owners', access: ['read', 'write', 'create', 'delete'] },
//   { module: 'Disputes Management', access: ['read', 'write', 'create'] },
//   { module: 'Database Management', access: ['read', 'write', 'create'] },
//   { module: 'Financial Management', access: ['read', 'write', 'create'] },
//   { module: 'Reporting', access: ['read', 'write', 'create'] },
//   { module: 'API Control', access: ['read', 'write', 'create'] },
//   { module: 'Repository Management', access: ['read', 'write', 'create'] },
//   { module: 'Payroll', access: ['read', 'write', 'create'] }
// ]
// const RoleDialog = ({ open, setOpen, roleData, onSuccess }) => {
//   // States
//   const [formData, setFormData] = useState({
//     name: '',
//     displayName: '',
//     description: '',
//     permissions: []
//   })
//   const [isLoading, setIsLoading] = useState(false)
//   const [error, setError] = useState('')
//   const [isEditMode, setIsEditMode] = useState(false)
//   // Initialize form when dialog opens or roleData changes
//   useEffect(() => {
//     if (open) {
//       if (roleData) {
//         // Edit mode
//         setIsEditMode(true)
//         setFormData({
//           name: roleData.name || '',
//           displayName: roleData.displayName || '',
//           description: roleData.description || '',
//           permissions: roleData.permissions || []
//         })
//       } else {
//         // Add mode
//         setIsEditMode(false)
//         setFormData({
//           name: '',
//           displayName: '',
//           description: '',
//           permissions: []
//         })
//       }
//       setError('')
//     }
//   }, [open, roleData])
//   const handleClose = () => {
//     setOpen(false)
//     setFormData({
//       name: '',
//       displayName: '',
//       description: '',
//       permissions: []
//     })
//     setError('')
//   }
//   const handleInputChange = (field, value) => {
//     setFormData(prev => ({
//       ...prev,
//       [field]: value
//     }))
//   }
//   const togglePermission = (permissionId) => {
//     setFormData(prev => {
//       const permissions = [...prev.permissions]
//       const index = permissions.indexOf(permissionId)
//       if (index > -1) {
//         // Remove permission
//         permissions.splice(index, 1)
//       } else {
//         // Add permission
//         permissions.push(permissionId)
//       }
//       return { ...prev, permissions }
//     })
//   }
//   const handleSelectAll = (module) => {
//     setFormData(prev => {
//       const permissions = [...prev.permissions]
//       const moduleKey = module.toLowerCase().replace(/\s+/g, '-')
//       const modulePermissions = defaultPermissions.find(p => p.module === module)?.access || []
//       const allModulePerms = modulePermissions.map(access => `${moduleKey}-${access}`)
//       // Check if all module permissions are already selected
//       const allSelected = allModulePerms.every(perm => permissions.includes(perm))
//       if (allSelected) {
//         // Remove all module permissions
//         return {
//           ...prev,
//           permissions: permissions.filter(perm => !allModulePerms.includes(perm))
//         }
//       } else {
//         // Add all module permissions
//         const newPerms = [...new Set([...permissions, ...allModulePerms])]
//         return {
//           ...prev,
//           permissions: newPerms
//         }
//       }
//     })
//   }
//   const handleSelectAllPermissions = () => {
//     setFormData(prev => {
//       // Generate all possible permissions
//       const allPermissions = defaultPermissions.flatMap(p => {
//         const moduleKey = p.module.toLowerCase().replace(/\s+/g, '-')
//         return p.access.map(access => `${moduleKey}-${access}`)
//       })
//       // If all are already selected, clear all
//       if (allPermissions.every(perm => prev.permissions.includes(perm))) {
//         return { ...prev, permissions: [] }
//       } else {
//         // Select all
//         return { ...prev, permissions: allPermissions }
//       }
//     })
//   }
//   const handleSubmit = async (e) => {
//     e.preventDefault()
//     setIsLoading(true)
//     setError('')
//     try {
//       // Validate
//       if (!formData.name.trim()) {
//         throw new Error('Role name is required')
//       }
//       if (!formData.displayName.trim()) {
//         throw new Error('Display name is required')
//       }
//       console.log('🔍 Form Data:', formData)
//       console.log('🔍 isEditMode:', isEditMode)
//       console.log('🔍 roleData:', roleData)
//       let url = '/api/apps/roles'
//       let method = 'POST'
//       if (isEditMode) {
//         // ✅ Get ID from roleData
//         const roleId = roleData?._id || roleData?.id
//         console.log('🔍 Role ID for edit:', roleId)
//         if (!roleId) {
//           throw new Error('Role ID not found for editing')
//         }
//         url = `/api/apps/roles/${roleId}`
//         method = 'PUT'
//       }
//       console.log('🚀 Sending request:', { url, method, body: formData })
//       const response = await fetch(url, {
//         method,
//         headers: {
//           'Content-Type': 'application/json'
//         },
//         body: JSON.stringify(formData)
//       })
//       console.log('📥 Response status:', response.status)
//       console.log('📥 Response headers:', response.headers)
//       // Check if response is JSON
//       const contentType = response.headers.get('content-type')
//       if (!contentType || !contentType.includes('application/json')) {
//         const text = await response.text()
//         console.error('❌ Non-JSON response:', text)
//         throw new Error(`Server returned ${response.status}: ${text.substring(0, 100)}`)
//       }
//       const result = await response.json()
//       console.log('📥 Response data:', result)
//       if (!response.ok) {
//         throw new Error(result.error || 'Failed to save role')
//       }
//       // Success
//       if (onSuccess) {
//         onSuccess()
//       }
//       handleClose()
//     } catch (err) {
//       console.error('❌ Error saving role:', err)
//       setError(err.message)
//     } finally {
//       setIsLoading(false)
//     }
//   }
//   const isPermissionSelected = (module, access) => {
//     const permissionId = `${module.toLowerCase().replace(/\s+/g, '-')}-${access}`
//     return formData.permissions.includes(permissionId)
//   }
//   const isModuleAllSelected = (module) => {
//     const moduleKey = module.toLowerCase().replace(/\s+/g, '-')
//     const modulePermissions = defaultPermissions.find(p => p.module === module)?.access || []
//     const allModulePerms = modulePermissions.map(access => `${moduleKey}-${access}`)
//     return allModulePerms.every(perm => formData.permissions.includes(perm))
//   }
//   const isModuleIndeterminate = (module) => {
//     const moduleKey = module.toLowerCase().replace(/\s+/g, '-')
//     const modulePermissions = defaultPermissions.find(p => p.module === module)?.access || []
//     const allModulePerms = modulePermissions.map(access => `${moduleKey}-${access}`)
//     const selectedCount = allModulePerms.filter(perm => formData.permissions.includes(perm)).length
//     return selectedCount > 0 && selectedCount < allModulePerms.length
//   }
//   const areAllSelected = () => {
//     const allPermissions = defaultPermissions.flatMap(p => {
//       const moduleKey = p.module.toLowerCase().replace(/\s+/g, '-')
//       return p.access.map(access => `${moduleKey}-${access}`)
//     })
//     return allPermissions.every(perm => formData.permissions.includes(perm))
//   }
//   const isIndeterminate = () => {
//     const allPermissions = defaultPermissions.flatMap(p => {
//       const moduleKey = p.module.toLowerCase().replace(/\s+/g, '-')
//       return p.access.map(access => `${moduleKey}-${access}`)
//     })
//     const selectedCount = formData.permissions.length
//     return selectedCount > 0 && selectedCount < allPermissions.length
//   }
//   return (
//     <Dialog fullWidth maxWidth='md' scroll='body' open={open} onClose={handleClose}>
//       <DialogTitle variant='h4' className='flex flex-col gap-2 text-center sm:pbs-16 sm:pbe-6 sm:pli-16'>
//         {isEditMode ? 'Edit Role' : 'Add Role'}
//         <Typography component='span' className='flex flex-col text-center'>
//           Set Role Permissions
//         </Typography>
//       </DialogTitle>
//       <form onSubmit={handleSubmit}>
//         <DialogContent className='overflow-visible pbs-0 sm:pbe-6 sm:pli-16'>
//           <IconButton onClick={handleClose} className='absolute block-start-4 inline-end-4'>
//             <i className='ri-close-line text-textSecondary' />
//           </IconButton>
//           {error && (
//             <Alert severity='error' className='mb-4'>
//               {error}
//             </Alert>
//           )}
//           <div className='flex flex-col gap-4'>
//             <TextField
//               label='Role Name (Internal)'
//               variant='outlined'
//               fullWidth
//               placeholder='e.g., content-manager'
//               value={formData.name}
//               onChange={(e) => handleInputChange('name', e.target.value)}
//               disabled={isEditMode && roleData?.isSystem}
//               helperText={isEditMode && roleData?.isSystem ? 'System role name cannot be changed' : 'Lowercase, use hyphens'}
//               required
//             />
//             <TextField
//               label='Display Name'
//               variant='outlined'
//               fullWidth
//               placeholder='e.g., Content Manager'
//               value={formData.displayName}
//               onChange={(e) => handleInputChange('displayName', e.target.value)}
//               required
//             />
//             <TextField
//               label='Description'
//               variant='outlined'
//               fullWidth
//               placeholder='Describe this role'
//               value={formData.description}
//               onChange={(e) => handleInputChange('description', e.target.value)}
//               multiline
//               rows={2}
//             />
//           </div>
//           <Typography variant='h5' className='plb-5 sm:plb-6'>
//             Role Permissions
//           </Typography>
//           <div className='flex flex-col overflow-x-auto'>
//             <table className={tableStyles.table}>
//               <tbody className='border-be'>
//                 <tr>
//                   <th className='pis-0'>
//                     <Typography className='font-medium whitespace-nowrap grow min-is-[225px]' color='text.primary'>
//                       Administrator Access
//                     </Typography>
//                   </th>
//                   <th className='text-end! pie-0'>
//                     <FormControlLabel
//                       className='mie-0 capitalize'
//                       control={
//                         <Checkbox
//                           onChange={handleSelectAllPermissions}
//                           indeterminate={isIndeterminate()}
//                           checked={areAllSelected()}
//                           disabled={isLoading}
//                         />
//                       }
//                       label='Select All'
//                     />
//                   </th>
//                 </tr>
//                 {defaultPermissions.map((permission, index) => {
//                   const moduleKey = permission.module.toLowerCase().replace(/\s+/g, '-')
//                   return (
//                     <tr key={index}>
//                       <td className='pis-0'>
//                         <div className='flex items-center gap-2'>
//                           <Checkbox
//                             onChange={() => handleSelectAll(permission.module)}
//                             indeterminate={isModuleIndeterminate(permission.module)}
//                             checked={isModuleAllSelected(permission.module)}
//                             disabled={isLoading}
//                           />
//                           <Typography className='font-medium whitespace-nowrap grow min-is-[225px]' color='text.primary'>
//                             {permission.module}
//                           </Typography>
//                         </div>
//                       </td>
//                       <td className='text-end! pie-0'>
//                         <FormGroup className='flex-row justify-end flex-nowrap gap-6'>
//                           {permission.access.map((access) => (
//                             <FormControlLabel
//                               key={`${moduleKey}-${access}`}
//                               className='mie-0'
//                               control={
//                                 <Checkbox
//                                   checked={isPermissionSelected(permission.module, access)}
//                                   onChange={() => togglePermission(`${moduleKey}-${access}`)}
//                                   disabled={isLoading}
//                                 />
//                               }
//                               label={access.charAt(0).toUpperCase() + access.slice(1)}
//                             />
//                           ))}
//                         </FormGroup>
//                       </td>
//                     </tr>
//                   )
//                 })}
//               </tbody>
//             </table>
//           </div>
//         </DialogContent>
//         <DialogActions className='justify-center pbs-0 sm:pbe-16 sm:pli-16'>
//           <Button
//             variant='contained'
//             type='submit'
//             disabled={isLoading}
//             startIcon={isLoading && <CircularProgress size={20} />}
//           >
//             {isLoading ? 'Saving...' : isEditMode ? 'Update Role' : 'Create Role'}
//           </Button>
//           <Button
//             variant='outlined'
//             color='secondary'
//             onClick={handleClose}
//             disabled={isLoading}
//           >
//             Cancel
//           </Button>
//         </DialogActions>
//       </form>
//     </Dialog>
//   )
// }
// export default RoleDialog
// //

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

// ============================================
// PERMISSIONS CONFIGURATION - UPDATE THIS ONLY
// ============================================
const MODULES = [
  // User Management
  { module: 'User Management', access: ['read', 'write', 'create', 'delete'] },

  // Vehicle Owners
  { module: 'Vehicle Owners', access: ['read', 'write', 'create', 'delete'] },

  // Vehicles
  { module: 'Vehicles', access: ['read', 'write', 'create', 'delete'] },

  // Market Vehicles
  { module: 'Market Vehicles', access: ['read', 'write', 'create', 'delete'] },

  // Trips
  { module: 'Trips', access: ['read', 'write', 'create', 'delete'] },

  // Market Trips
  { module: 'Market Trips', access: ['read', 'write', 'create', 'delete'] },

  // Advance
  { module: 'Advance', access: ['read', 'write', 'create', 'delete', 'diesel-only'] },

  // Market Advance
  { module: 'Market Advance', access: ['read', 'write', 'create', 'delete'] },

  // Disputes Management
  { module: 'Disputes Management', access: ['read', 'write', 'create', 'delete'] },

  // Database Management
  { module: 'Database Management', access: ['read', 'write', 'create', 'delete'] },

  // Financial Management
  { module: 'Financial Management', access: ['read', 'write', 'create', 'delete'] },

  // Reporting
  { module: 'Reporting', access: ['read', 'write', 'create', 'delete'] },

  // API Control
  { module: 'API Control', access: ['read', 'write', 'create', 'delete'] },

  // Repository Management
  { module: 'Repository Management', access: ['read', 'write', 'create', 'delete'] },

  // Payroll
  { module: 'Payroll', access: ['read', 'write', 'create', 'delete'] }
]

// Helper function to generate permission ID
const getPermissionId = (module, access) => {
  const moduleKey = module.toLowerCase().replace(/\s+/g, '-')
  return `${moduleKey}-${access}`
}

// ============================================
// ROLE DIALOG COMPONENT
// ============================================
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
      if (roleData && Object.keys(roleData).length > 0) {
        // Edit mode
        console.log('✏️ Editing role:', roleData)
        setIsEditMode(true)
        setFormData({
          name: roleData.name || '',
          displayName: roleData.displayName || '',
          description: roleData.description || '',
          permissions: roleData.permissions || []
        })
      } else {
        // Add mode
        console.log('➕ Adding new role')
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
    setTimeout(() => {
      setFormData({
        name: '',
        displayName: '',
        description: '',
        permissions: []
      })
      setIsEditMode(false)
      setError('')
    }, 200)
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
        permissions.splice(index, 1)
      } else {
        permissions.push(permissionId)
      }
      return { ...prev, permissions }
    })
  }

  const handleSelectAll = (module) => {
    setFormData(prev => {
      const permissions = [...prev.permissions]
      const moduleConfig = MODULES.find(m => m.module === module)
      if (!moduleConfig) return prev

      const allModulePerms = moduleConfig.access.map(access =>
        getPermissionId(module, access)
      )

      const allSelected = allModulePerms.every(perm => permissions.includes(perm))

      if (allSelected) {
        return {
          ...prev,
          permissions: permissions.filter(perm => !allModulePerms.includes(perm))
        }
      } else {
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
      const allPermissions = MODULES.flatMap(m =>
        m.access.map(access => getPermissionId(m.module, access))
      )

      if (allPermissions.every(perm => prev.permissions.includes(perm))) {
        return { ...prev, permissions: [] }
      } else {
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

      console.log('🔍 Form Data:', formData)
      console.log('🔍 isEditMode:', isEditMode)
      console.log('🔍 roleData:', roleData)

      let url = '/api/apps/roles'
      let method = 'POST'

      if (isEditMode) {
        const roleId = roleData?._id || roleData?.id
        console.log('🔍 Role ID for edit:', roleId)

        if (!roleId) {
          throw new Error('Role ID not found for editing')
        }

        url = `/api/apps/roles/${roleId}`
        method = 'PUT'
      }

      console.log('🚀 Sending request:', { url, method, body: formData })

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      console.log('📥 Response status:', response.status)

      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text()
        console.error('❌ Non-JSON response:', text)
        throw new Error(`Server returned ${response.status}: ${text.substring(0, 100)}`)
      }

      const result = await response.json()
      console.log('📥 Response data:', result)

      if (!response.ok) {
        throw new Error(result.error || 'Failed to save role')
      }

      if (onSuccess) {
        onSuccess()
      }
      handleClose()
    } catch (err) {
      console.error('❌ Error saving role:', err)
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const isPermissionSelected = (module, access) => {
    const permissionId = getPermissionId(module, access)
    return formData.permissions.includes(permissionId)
  }

  const isModuleAllSelected = (module) => {
    const moduleConfig = MODULES.find(m => m.module === module)
    if (!moduleConfig) return false

    const allModulePerms = moduleConfig.access.map(access =>
      getPermissionId(module, access)
    )
    return allModulePerms.every(perm => formData.permissions.includes(perm))
  }

  const isModuleIndeterminate = (module) => {
    const moduleConfig = MODULES.find(m => m.module === module)
    if (!moduleConfig) return false

    const allModulePerms = moduleConfig.access.map(access =>
      getPermissionId(module, access)
    )
    const selectedCount = allModulePerms.filter(perm =>
      formData.permissions.includes(perm)
    ).length
    return selectedCount > 0 && selectedCount < allModulePerms.length
  }

  const areAllSelected = () => {
    const allPermissions = MODULES.flatMap(m =>
      m.access.map(access => getPermissionId(m.module, access))
    )
    return allPermissions.every(perm => formData.permissions.includes(perm))
  }

  const isIndeterminate = () => {
    const allPermissions = MODULES.flatMap(m =>
      m.access.map(access => getPermissionId(m.module, access))
    )
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
              disabled={isEditMode}
              helperText={isEditMode ? 'Role name cannot be changed' : 'Lowercase, use hyphens'}
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

                {MODULES.map((permission, index) => (
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
                            key={`${permission.module}-${access}`}
                            className='mie-0'
                            control={
                              <Checkbox
                                checked={isPermissionSelected(permission.module, access)}
                                onChange={() => togglePermission(
                                  getPermissionId(permission.module, access)
                                )}
                                disabled={isLoading}
                              />
                            }
                            label={access.charAt(0).toUpperCase() + access.slice(1)}
                          />
                        ))}
                      </FormGroup>
                    </td>
                  </tr>
                ))}
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
            {isLoading ? 'Saving...' : (isEditMode ? 'Update Role' : 'Create Role')}
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
