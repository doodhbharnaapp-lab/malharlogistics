// 'use client'
// // React Imports
// import { useState } from 'react'
// // Next Imports
// import Link from 'next/link'
// import { useParams } from 'next/navigation'
// // MUI Imports
// import Typography from '@mui/material/Typography'
// import TextField from '@mui/material/TextField'
// import IconButton from '@mui/material/IconButton'
// import InputAdornment from '@mui/material/InputAdornment'
// import Checkbox from '@mui/material/Checkbox'
// import Button from '@mui/material/Button'
// import FormControlLabel from '@mui/material/FormControlLabel'
// import Divider from '@mui/material/Divider'
// // Third-party Imports
// import classnames from 'classnames'
// // Component Imports
// import Logo from '@components/layout/shared/Logo'
// // Hook Imports
// import { useImageVariant } from '@core/hooks/useImageVariant'
// import { useSettings } from '@core/hooks/useSettings'
// // Util Imports
// import { getLocalizedUrl } from '@/utils/i18n'
// const Register = ({ mode }) => {
//   // States
//   const [isPasswordShown, setIsPasswordShown] = useState(false)
//   // Vars
//   const darkImg = '/images/pages/auth-v2-mask-2-dark.png'
//   const lightImg = '/images/pages/auth-v2-mask-2-light.png'
//   const darkIllustration = '/images/illustrations/auth/v2-register-dark.png'
//   const lightIllustration = '/images/illustrations/auth/illustrator.png'
//   const borderedDarkIllustration = '/images/illustrations/auth/v2-register-dark-border.png'
//   const borderedLightIllustration = '/images/illustrations/auth/v2-register-light-border.png'
//   // Hooks
//   const { settings } = useSettings()
//   const { lang: locale } = useParams()
//   const authBackground = useImageVariant(mode, lightImg, darkImg)
//   const characterIllustration = useImageVariant(
//     mode,
//     lightIllustration,
//     darkIllustration,
//     borderedLightIllustration,
//     borderedDarkIllustration
//   )
//   const handleClickShowPassword = () => setIsPasswordShown(show => !show)
//   return (
//     <div className='flex bs-full justify-center'>
//       <div
//         className={classnames(
//           'flex bs-full items-center justify-center flex-1 min-bs-[100dvh] relative p-6 max-md:hidden',
//           {
//             'border-ie': settings.skin === 'bordered'
//           }
//         )}
//       >
//         <div className='pli-6 max-lg:mbs-40 lg:mbe-24'>
//           <img
//             src={characterIllustration}
//             alt='character-illustration'
//             className='max-bs-[650px] max-is-full bs-auto'
//           />
//         </div>
//         <img src={authBackground} className='absolute bottom-[4%] z-[-1] is-full max-md:hidden' />
//       </div>
//       <div className='flex justify-center items-center bs-full bg-backgroundPaper !min-is-full p-6 md:!min-is-[unset] md:p-12 md:is-[480px]'>
//         <Link
//           href={getLocalizedUrl('/', locale)}
//           className='absolute block-start-5 sm:block-start-[38px] inline-start-6 sm:inline-start-[38px]'
//         >
//           {/* <Logo /> */}
//         </Link>
//         <div className='flex flex-col gap-5 is-full sm:is-auto md:is-full sm:max-is-[400px] md:max-is-[unset] mbs-11 sm:mbs-14 md:mbs-0'>
//           <div>
//             <Typography variant='h4' style={{ color: "#666cff", textAlign: "center" }}>Sign up</Typography>
//             <Typography className='mbs-1' style={{ textAlign: "center" }}>Enter your details and create account</Typography>
//           </div>
//           <form noValidate autoComplete='off' onSubmit={e => e.preventDefault()} className='flex flex-col gap-5'>
//             <TextField autoFocus fullWidth label='Full Name' />
//             <TextField fullWidth label='Email' />
//             <TextField
//               fullWidth
//               label='Password'
//               type={isPasswordShown ? 'text' : 'password'}
//               slotProps={{
//                 input: {
//                   endAdornment: (
//                     <InputAdornment position='end'>
//                       <IconButton edge='end' onClick={handleClickShowPassword} onMouseDown={e => e.preventDefault()}>
//                         <i className={isPasswordShown ? 'ri-eye-off-line' : 'ri-eye-line'} />
//                       </IconButton>
//                     </InputAdornment>
//                   )
//                 }
//               }}
//             />
//             <div className='flex justify-between items-center gap-3'>
//               <FormControlLabel
//                 control={<Checkbox />}
//                 label={
//                   <>
//                     <span>I agree to </span>
//                     <Link className='text-primary' href='/' onClick={e => e.preventDefault()}>
//                       privacy policy & terms
//                     </Link>
//                   </>
//                 }
//               />
//             </div>
//             <Button fullWidth variant='contained' type='submit'>
//               Sign Up
//             </Button>
//             <Divider className='gap-3 text-textPrimary'></Divider>
//             <div className='flex justify-center items-center flex-wrap gap-2'>
//               <Typography>Already have an account?</Typography>
//               <Typography component={Link} href='/login' color='primary.main'>
//                 Sign in instead
//               </Typography>
//             </div>
//           </form>
//         </div>
//       </div>
//     </div>
//   )
// }
// export default Register
'use client'
// React Imports
import { useState } from 'react'
// Next Imports
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
// MUI Imports
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import Checkbox from '@mui/material/Checkbox'
import Button from '@mui/material/Button'
import FormControlLabel from '@mui/material/FormControlLabel'
import Divider from '@mui/material/Divider'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
// Third-party Imports
import classnames from 'classnames'
// Component Imports
import Logo from '@components/layout/shared/Logo'
// Hook Imports
import { useImageVariant } from '@core/hooks/useImageVariant'
import { useSettings } from '@core/hooks/useSettings'
// Util Imports
import { getLocalizedUrl } from '@/utils/i18n'
const Register = ({ mode }) => {
  // States
  const [isPasswordShown, setIsPasswordShown] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    terms: false
  })
  // Hooks
  const router = useRouter()
  const { settings } = useSettings()
  const { lang: locale } = useParams()
  // Vars
  const darkImg = '/images/pages/auth-v2-mask-2-dark.png'
  const lightImg = '/images/pages/auth-v2-mask-2-light.png'
  const darkIllustration = '/images/illustrations/auth/v2-register-dark.png'
  const lightIllustration = '/images/illustrations/auth/illustrator.png'
  const borderedDarkIllustration = '/images/illustrations/auth/v2-register-dark-border.png'
  const borderedLightIllustration = '/images/illustrations/auth/v2-register-light-border.png'
  const authBackground = useImageVariant(mode, lightImg, darkImg)
  const characterIllustration = useImageVariant(
    mode,
    lightIllustration,
    darkIllustration,
    borderedLightIllustration,
    borderedDarkIllustration
  )
  const handleClickShowPassword = () => setIsPasswordShown(show => !show)
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    // Clear errors when user types
    if (error) setError('')
  }
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')
    // Client-side validation
    if (!formData.name || !formData.email || !formData.password) {
      setError('All fields are required')
      setLoading(false)
      return
    }
    if (!formData.terms) {
      setError('You must agree to the privacy policy and terms')
      setLoading(false)
      return
    }
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.message || 'Registration failed')
      }
      if (data.success) {
        setSuccess(data.message)
        // Option 1: Redirect to login page after 2 seconds
        setTimeout(() => {
          router.push('/login')
        }, 2000)
        // Option 2: Automatically log them in and redirect to dashboard
        // You would need to implement session/JWT token here
        // Option 3: Show success message and clear form
        setFormData({
          name: '',
          email: '',
          password: '',
          terms: false
        })
      } else {
        setError(data.message)
      }
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }
  return (
    <div className='flex bs-full justify-center'>
      <div
        className={classnames(
          'flex bs-full items-center justify-center flex-1 min-bs-[100dvh] relative p-6 max-md:hidden',
          {
            'border-ie': settings.skin === 'bordered'
          }
        )}
      >
        <div className='pli-6 max-lg:mbs-40 lg:mbe-24'>
          <img
            src={characterIllustration}
            alt='character-illustration'
            className='max-bs-[650px] max-is-full bs-auto'
          />
        </div>
        <img src={authBackground} className='absolute bottom-[4%] z-[-1] is-full max-md:hidden' />
      </div>
      <div className='flex justify-center items-center bs-full bg-backgroundPaper !min-is-full p-6 md:!min-is-[unset] md:p-12 md:is-[480px]'>
        <Link
          href={getLocalizedUrl('/', locale)}
          className='absolute block-start-5 sm:block-start-[38px] inline-start-6 sm:inline-start-[38px]'
        >
          <Logo />
        </Link>
        <div className='flex flex-col gap-5 is-full sm:is-auto md:is-full sm:max-is-[400px] md:max-is-[unset] mbs-11 sm:mbs-14 md:mbs-0'>
          <div>
            <Typography variant='h4' style={{ color: "#666cff", textAlign: "center" }}>Sign up</Typography>
            <Typography className='mbs-1' style={{ textAlign: "center" }}>Enter your details and create account</Typography>
          </div>
          {/* Success Message */}
          {success && (
            <Alert severity="success" onClose={() => setSuccess('')}>
              {success}
            </Alert>
          )}
          {/* Error Message */}
          {error && (
            <Alert severity="error" onClose={() => setError('')}>
              {error}
            </Alert>
          )}
          <form noValidate autoComplete='off' onSubmit={handleSubmit} className='flex flex-col gap-5'>
            <TextField
              autoFocus
              fullWidth
              label='Full Name'
              name="name"
              value={formData.name}
              onChange={handleChange}
              disabled={loading}
              required
            />
            <TextField
              fullWidth
              label='Email'
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              disabled={loading}
              required
            />
            <TextField
              fullWidth
              label='Password'
              type={isPasswordShown ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position='end'>
                      <IconButton
                        edge='end'
                        onClick={handleClickShowPassword}
                        onMouseDown={e => e.preventDefault()}
                        disabled={loading}
                      >
                        <i className={isPasswordShown ? 'ri-eye-off-line' : 'ri-eye-line'} />
                      </IconButton>
                    </InputAdornment>
                  )
                }
              }}
              required
            />
            <div className='flex justify-between items-center gap-3'>
              <FormControlLabel
                control={
                  <Checkbox
                    name="terms"
                    checked={formData.terms}
                    onChange={handleChange}
                    disabled={loading}
                  />
                }
                label={
                  <>
                    <span>I agree to </span>
                    <Link className='text-primary' href='/privacy' onClick={e => e.preventDefault()}>
                      privacy policy & terms
                    </Link>
                  </>
                }
              />
            </div>
            <Button
              fullWidth
              variant='contained'
              type='submit'
              disabled={loading}
              startIcon={loading && <CircularProgress size={20} color="inherit" />}
            >
              {loading ? 'Creating Account...' : 'Sign Up'}
            </Button>
            <Divider className='gap-3 text-textPrimary'></Divider>
            <div className='flex justify-center items-center flex-wrap gap-2'>
              <Typography>Already have an account?</Typography>
              <Typography component={Link} href='/login' color='primary.main'>
                Sign in instead
              </Typography>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
export default Register
