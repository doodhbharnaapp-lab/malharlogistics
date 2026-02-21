// 'use client'
// // React Imports
// import { useEffect, useState } from 'react'
// // MUI Imports
// import Card from '@mui/material/Card'
// import CardContent from '@mui/material/CardContent'
// import Grid from '@mui/material/Grid'
// import Typography from '@mui/material/Typography'
// import AvatarGroup from '@mui/material/AvatarGroup'
// import IconButton from '@mui/material/IconButton'
// import Button from '@mui/material/Button'
// import CircularProgress from '@mui/material/CircularProgress'
// import Alert from '@mui/material/Alert'
// // Component Imports
// import RoleDialog from '@components/dialogs/role-dialog'
// import OpenDialogOnElementClick from '@components/dialogs/OpenDialogOnElementClick'
// import Link from '@components/Link'
// import CustomAvatar from '@core/components/mui/Avatar'
// const RoleCards = () => {
//   // States
//   const [roleData, setRoleData] = useState([])
//   const [isLoading, setIsLoading] = useState(true)
//   const [error, setError] = useState('')
//   // Fetch roles data
//   useEffect(() => {
//     const fetchRoles = async () => {
//       try {
//         setIsLoading(true)
//         setError('')
//         console.log('🔄 Fetching roles from API...')
//         const response = await fetch('/api/apps/roles')
//         if (!response.ok) {
//           if (response.status === 401) {
//             setError('Please login to view roles')
//             return
//           }
//           if (response.status === 403) {
//             setError('Admin access required')
//             return
//           }
//           throw new Error(`API error: ${response.status}`)
//         }
//         const result = await response.json()
//         if (result.success) {
//           console.log(`✅ Got ${result.data.length} roles`)
//           setRoleData(result.data)
//         } else {
//           throw new Error(result.message || 'Failed to fetch roles')
//         }
//       } catch (err) {
//         console.error('❌ Error fetching roles:', err)
//         setError(err.message || 'Failed to load roles')
//       } finally {
//         setIsLoading(false)
//       }
//     }
//     fetchRoles()
//   }, [])
//   // Vars
//   const typographyProps = (role) => ({
//     children: 'Edit Role',
//     component: Link,
//     color: 'primary',
//     onClick: e => e.preventDefault(),
//     sx: { cursor: 'pointer' }
//   })
//   const CardProps = {
//     className: 'cursor-pointer bs-full',
//     children: (
//       <Grid container className='bs-full'>
//         <Grid size={{ xs: 5 }}>
//           <div className='flex items-end justify-center bs-full'>
//             <img alt='add-role' src='/images/illustrations/characters/9.png' height={130} />
//           </div>
//         </Grid>
//         <Grid size={{ xs: 7 }}>
//           <CardContent>
//             <div className='flex flex-col items-end gap-4 text-right'>
//               <Button variant='contained' size='small'>
//                 Add Role
//               </Button>
//               <Typography>
//                 Add new role, <br />
//                 if it doesn&#39;t exist.
//               </Typography>
//             </div>
//           </CardContent>
//         </Grid>
//       </Grid>
//     )
//   }
//   // Loading state
//   if (isLoading) {
//     return (
//       <Grid container spacing={6}>
//         <Grid size={{ xs: 12 }}>
//           <Card>
//             <CardContent className='flex justify-center items-center p-6'>
//               <CircularProgress />
//               <Typography className='ml-3'>Loading roles...</Typography>
//             </CardContent>
//           </Card>
//         </Grid>
//       </Grid>
//     )
//   }
//   // Error state
//   if (error) {
//     return (
//       <Grid container spacing={6}>
//         <Grid size={{ xs: 12 }}>
//           <Card>
//             <CardContent>
//               <Alert severity='error'>{error}</Alert>
//               <Button
//                 variant='outlined'
//                 onClick={() => window.location.reload()}
//                 sx={{ mt: 2 }}
//               >
//                 Retry
//               </Button>
//             </CardContent>
//           </Card>
//         </Grid>
//       </Grid>
//     )
//   }
//   // Function to get avatar fallback based on role
//   const getAvatarUrl = (avatar, index, roleTitle) => {
//     if (avatar) {
//       return avatar.startsWith('http') ? avatar : `/images/avatars/${avatar}`
//     }
//     // Fallback to numbered avatars based on index
//     const avatarFiles = ['1.png', '2.png', '3.png', '4.png', '5.png', '6.png', '7.png']
//     return `/images/avatars/${avatarFiles[index % avatarFiles.length]}`
//   }
//   return (
//     <>
//       <Grid container spacing={6}>
//         {roleData.map((item, index) => (
//           <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={index}>
//             <Card>
//               <CardContent className='flex flex-col gap-4'>
//                 <div className='flex items-center justify-between'>
//                   <Typography className='grow'>{`Total ${item.totalUsers} users`}</Typography>
//                   <AvatarGroup total={item.totalUsers}>
//                     {item.avatars.slice(0, 3).map((avatar, avatarIndex) => (
//                       <CustomAvatar
//                         key={avatarIndex}
//                         alt={item.title}
//                         src={getAvatarUrl(avatar, avatarIndex, item.title)}
//                         size={40}
//                       />
//                     ))}
//                     {item.avatars.length === 0 && item.totalUsers > 0 && (
//                       <CustomAvatar
//                         alt={item.title}
//                         size={40}
//                         sx={{ bgcolor: 'primary.main' }}
//                       >
//                         {item.title.charAt(0)}
//                       </CustomAvatar>
//                     )}
//                   </AvatarGroup>
//                 </div>
//                 <div className='flex justify-between items-center'>
//                   <div className='flex flex-col items-start gap-1'>
//                     <Typography variant='h5'>{item.title}</Typography>
//                     <OpenDialogOnElementClick
//                       element={Typography}
//                       elementProps={typographyProps(item)}
//                       dialog={RoleDialog}
//                       dialogProps={{
//                         title: item.title,
//                         role: item.role,
//                         userCount: item.totalUsers
//                       }}
//                     />
//                   </div>
//                   <IconButton>
//                     <i className='ri-file-copy-line text-secondary' />
//                   </IconButton>
//                 </div>
//               </CardContent>
//             </Card>
//           </Grid>
//         ))}
//         {/* Add Role Card */}
//         <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
//           <OpenDialogOnElementClick
//             element={Card}
//             elementProps={CardProps}
//             dialog={RoleDialog}
//           />
//         </Grid>
//       </Grid>
//     </>
//   )
// }
// export default RoleCards
'use client'
// React Imports
import { useEffect, useState } from 'react'
// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import AvatarGroup from '@mui/material/AvatarGroup'
import IconButton from '@mui/material/IconButton'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
// Component Imports
import RoleDialog from '@components/dialogs/role-dialog'
import OpenDialogOnElementClick from '@components/dialogs/OpenDialogOnElementClick'
import Link from '@components/Link'
import CustomAvatar from '@core/components/mui/Avatar'

const RoleCards = () => {
  // States
  const [roleData, setRoleData] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedRole, setSelectedRole] = useState(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  // Fetch roles data
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        setIsLoading(true)
        setError('')
        console.log('🔄 Fetching roles from API...')
        const response = await fetch('/api/apps/roles')
        if (!response.ok) {
          if (response.status === 401) {
            setError('Please login to view roles')
            return
          }
          if (response.status === 403) {
            setError('Admin access required')
            return
          }
          throw new Error(`API error: ${response.status}`)
        }
        const result = await response.json()
        if (result.success) {
          console.log(`✅ Got ${result.data.length} roles`)
          setRoleData(result.data)
        } else {
          throw new Error(result.message || 'Failed to fetch roles')
        }
      } catch (err) {
        console.error('❌ Error fetching roles:', err)
        setError(err.message || 'Failed to load roles')
      } finally {
        setIsLoading(false)
      }
    }
    fetchRoles()
  }, [])

  // Handle edit role
  const handleEditRole = (role) => {
    console.log('🔍 Edit clicked:', role)
    setSelectedRole(role)
    setDialogOpen(true)
  }

  // Handle add role
  const handleAddRole = () => {
    console.log('➕ Add new role')
    setSelectedRole(null)
    setDialogOpen(true)
  }

  // Handle success
  const handleSuccess = () => {
    console.log('✅ Role saved, refreshing...')
    // Refresh roles list
    fetchRoles()
    setDialogOpen(false)
  }

  // Vars
  const getAvatarUrl = (avatar, index, roleTitle) => {
    if (avatar) {
      return avatar.startsWith('http') ? avatar : `/images/avatars/${avatar}`
    }
    const avatarFiles = ['1.png', '2.png', '3.png', '4.png', '5.png', '6.png', '7.png']
    return `/images/avatars/${avatarFiles[index % avatarFiles.length]}`
  }

  // Loading state
  if (isLoading) {
    return (
      <Grid container spacing={6}>
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardContent className='flex justify-center items-center p-6'>
              <CircularProgress />
              <Typography className='ml-3'>Loading roles...</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    )
  }

  // Error state
  if (error) {
    return (
      <Grid container spacing={6}>
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardContent>
              <Alert severity='error'>{error}</Alert>
              <Button
                variant='outlined'
                onClick={() => window.location.reload()}
                sx={{ mt: 2 }}
              >
                Retry
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    )
  }

  return (
    <>
      <Grid container spacing={6}>
        {roleData.map((item, index) => (
          <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={item._id || index}>
            <Card>
              <CardContent className='flex flex-col gap-4'>
                <div className='flex items-center justify-between'>
                  <Typography className='grow'>{`Total ${item.totalUsers || 0} users`}</Typography>
                  <AvatarGroup total={item.totalUsers || 0}>
                    {item.avatars?.slice(0, 3).map((avatar, avatarIndex) => (
                      <CustomAvatar
                        key={avatarIndex}
                        alt={item.title || item.displayName}
                        src={getAvatarUrl(avatar, avatarIndex, item.title)}
                        size={40}
                      />
                    ))}
                    {(!item.avatars || item.avatars.length === 0) && (item.totalUsers > 0) && (
                      <CustomAvatar
                        alt={item.title || item.displayName}
                        size={40}
                        sx={{ bgcolor: 'primary.main' }}
                      >
                        {(item.title || item.displayName || 'R').charAt(0)}
                      </CustomAvatar>
                    )}
                  </AvatarGroup>
                </div>

                <div className='flex justify-between items-center'>
                  <div className='flex flex-col items-start gap-1'>
                    <Typography variant='h5'>
                      {item.displayName || item.title || item.name}
                    </Typography>

                    {/* EDIT BUTTON - Direct click handler */}
                    <Button
                      variant='text'
                      color='primary'
                      onClick={() => handleEditRole(item)}
                      sx={{ p: 0, minWidth: 'auto' }}
                    >
                      Edit Role
                    </Button>
                  </div>

                  <IconButton>
                    <i className='ri-file-copy-line text-secondary' />
                  </IconButton>
                </div>
              </CardContent>
            </Card>
          </Grid>
        ))}

        {/* Add Role Card */}
        <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
          <Card
            className='cursor-pointer bs-full'
            onClick={handleAddRole}
          >
            <Grid container className='bs-full'>
              <Grid size={{ xs: 5 }}>
                <div className='flex items-end justify-center bs-full'>
                  <img alt='add-role' src='/images/illustrations/characters/9.png' height={130} />
                </div>
              </Grid>
              <Grid size={{ xs: 7 }}>
                <CardContent>
                  <div className='flex flex-col items-end gap-4 text-right'>
                    <Button variant='contained' size='small'>
                      Add Role
                    </Button>
                    <Typography>
                      Add new role, <br />
                      if it doesn&#39;t exist.
                    </Typography>
                  </div>
                </CardContent>
              </Grid>
            </Grid>
          </Card>
        </Grid>
      </Grid>

      {/* Role Dialog */}
      <RoleDialog
        open={dialogOpen}
        setOpen={setDialogOpen}
        roleData={selectedRole}
        onSuccess={handleSuccess}
      />
    </>
  )
}

export default RoleCards
