'use client'
// React Imports
import { useState } from 'react'
// Next Imports
import Link from 'next/link'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
// NextAuth
import { signIn } from 'next-auth/react'
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
import { Controller, useForm } from 'react-hook-form'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { object, minLength, string, email, pipe, nonEmpty } from 'valibot'
import classnames from 'classnames'
// Component Imports
import Logo from '@components/layout/shared/Logo'
// Config Imports
import themeConfig from '@configs/themeConfig'
// Hook Imports
import { useImageVariant } from '@core/hooks/useImageVariant'
import { useSettings } from '@core/hooks/useSettings'
// Util Imports
import { getLocalizedUrl } from '@/utils/i18n'
const schema = object({
  email: pipe(string(), minLength(1, 'Email is required'), email('Please enter a valid email address')),
  password: pipe(
    string(),
    nonEmpty('Password is required'),
    minLength(5, 'Password must be at least 5 characters')
  )
})
const Login = ({ mode }) => {
  // States
  const [isPasswordShown, setIsPasswordShown] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  // Vars
  const darkImg = '/images/pages/auth-v2-mask-1-dark.png'
  const lightImg = '/images/pages/auth-v2-mask-1-light.png'
  const darkIllustration = '/images/illustrations/auth/v2-login-dark.png'
  const lightIllustration = '/images/illustrations/auth/illustrator.png'
  const borderedDarkIllustration = '/images/illustrations/auth/v2-login-dark-border.png'
  const borderedLightIllustration = '/images/illustrations/auth/v2-login-light-border.png'
  // Hooks
  const router = useRouter()
  const searchParams = useSearchParams()
  const { lang: locale } = useParams()
  const { settings } = useSettings()
  // Form
  const {
    control,
    handleSubmit,
    formState: { errors },
    setError
  } = useForm({
    resolver: valibotResolver(schema),
    defaultValues: {
      email: '',
      password: ''
    }
  })
  const authBackground = useImageVariant(mode, lightImg, darkImg)
  const characterIllustration = useImageVariant(
    mode,
    lightIllustration,
    darkIllustration,
    borderedLightIllustration,
    borderedDarkIllustration
  )
  const handleClickShowPassword = () => setIsPasswordShown(show => !show)
  const onSubmit = async (data) => {
    setIsLoading(true)
    setErrorMessage('')
    try {
      // Get redirect URL from params or use default
      const redirectTo = searchParams.get('redirectTo') ||
        searchParams.get('redirect') ||
        `/${locale || 'en'}/dashboards/logistics`
      console.log('Attempting login with redirect:', redirectTo)
      // Sign in with NextAuth
      const result = await signIn('credentials', {
        email: data.email.toLowerCase().trim(),
        password: data.password,
        redirect: false,
        callbackUrl: redirectTo
      })
      console.log('Sign in result:', result)
      if (result?.error) {
        // Handle different error cases
        if (result.error.includes('credentials')) {
          setErrorMessage('Invalid email or password')
        } else {
          setErrorMessage(result.error)
        }
      } else if (result?.ok && result?.url) {
        // Login successful - redirect
        console.log('Login successful, redirecting to:', result.url)
        router.push(result.url)
      } else {
        setErrorMessage('Login failed. Please try again.')
      }
    } catch (error) {
      console.error('Login error:', error)
      setErrorMessage('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }
  return (
    <div className='flex bs-full justify-center'>
      {/* Left side with illustration */}
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
            className='max-bs-[673px] max-is-full bs-auto'
          />
        </div>
        <img src={authBackground} className='absolute bottom-[4%] z-[-1] is-full max-md:hidden' />
      </div>
      {/* Right side with login form */}
      <div className='flex justify-center items-center bs-full bg-backgroundPaper !min-is-full p-6 md:!min-is-[unset] md:p-12 md:is-[480px]'>
        <div className='absolute block-start-5 sm:block-start-[38px] inline-start-6 sm:inline-start-[38px]'>
          {/* <Logo /> */}
        </div>
        <div className='flex flex-col gap-5 is-full sm:is-auto md:is-full sm:max-is-[400px] md:max-is-[unset]'>
          <div>
            <Typography variant='h4' style={{ color: "#666cff", textAlign: "center" }}>
              Hi, Welcome Back
            </Typography>
            <Typography style={{ textAlign: "center" }}>
              Enter your credentials to continue
            </Typography>
          </div>
          {errorMessage && (
            <Alert severity='error' onClose={() => setErrorMessage('')}>
              {errorMessage}
            </Alert>
          )}
          <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-5'>
            <Controller
              name='email'
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  autoFocus
                  type='email'
                  label='Email'
                  placeholder='Enter your email'
                  error={!!errors.email}
                  helperText={errors.email?.message}
                  disabled={isLoading}
                />
              )}
            />
            <Controller
              name='password'
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label='Password'
                  type={isPasswordShown ? 'text' : 'password'}
                  placeholder='Enter your password'
                  error={!!errors.password}
                  helperText={errors.password?.message}
                  disabled={isLoading}
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position='end'>
                          <IconButton
                            edge='end'
                            onClick={handleClickShowPassword}
                            onMouseDown={e => e.preventDefault()}
                            aria-label='toggle password visibility'
                            disabled={isLoading}
                          >
                            <i className={isPasswordShown ? 'ri-eye-off-line' : 'ri-eye-line'} />
                          </IconButton>
                        </InputAdornment>
                      )
                    }
                  }}
                />
              )}
            />
            <div className='flex justify-between items-center flex-wrap gap-x-3 gap-y-1'>
              <FormControlLabel
                control={<Checkbox defaultChecked disabled={isLoading} />}
                label='Remember me'
              />
              <Typography
                className='text-end'
                color='primary.main'
                component={Link}
                href={getLocalizedUrl('/forgot-password', locale)}
                style={{ pointerEvents: isLoading ? 'none' : 'auto', opacity: isLoading ? 0.5 : 1 }}
              >
                Forgot password?
              </Typography>
            </div>
            <Button
              fullWidth
              variant='contained'
              type='submit'
              disabled={isLoading}
              startIcon={isLoading && <CircularProgress size={20} color="inherit" />}
            >
              {isLoading ? 'Logging in...' : 'Log In'}
            </Button>
            <Divider className='gap-3'>
            </Divider>
          </form>
        </div>
      </div>
    </div>
  )
}
export default Login
