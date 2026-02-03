'use client'
// React Imports
import { useState } from 'react'
// Next Imports
import Link from 'next/link'
// MUI Imports
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Slider from '@mui/material/Slider'
import Chip from '@mui/material/Chip'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
// Third-party Imports
import classnames from 'classnames'
import { styled } from '@mui/material/styles';
// Styles Imports
import frontCommonStyles from '@views/front-pages/styles.module.css'
// SVG Imports
import Lines from '@assets/svg/front-pages/landing-page/Lines'
import Curve from '@assets/svg/front-pages/landing-page/Curve'
import Arrow from '@assets/svg/front-pages/landing-page/Arrow'
import ElementTwo from '@/assets/svg/front-pages/landing-page/ElementTwo'
// ----------------------------------------------------------------------
const features = [
  {
    icon: '🚚',
    title: 'Real-Time GPS Tracking',
    description: 'Monitor shipments 24/7 with live location updates and accurate ETAs.',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  },
  {
    icon: '🔒',
    title: 'Secure & Insured',
    description: 'Comprehensive insurance and security protocols protect your cargo.',
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  },
  {
    icon: '🌱',
    title: 'Eco-Friendly Fleet',
    description: 'Modern low-emission vehicles supporting sustainable logistics.',
    gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  },
  {
    icon: '❄️',
    title: 'Temperature Control',
    description: 'Refrigerated vehicles for pharmaceuticals and sensitive goods.',
    gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  },
];

// Pricing Plans Data
const pricingPlans = [
  {
    title: 'Basic Plan',
    price: 20,
    features: ['Timeline', 'Basic search', 'Live chat widget', 'Email marketing', 'Custom Forms', 'Traffic analytics'],
    supportType: 'Basic',
    supportMedium: 'Only Email',
    respondTime: 'AVG. Time: 24h',
    current: false
  },
  {
    title: 'Favourite Plan',
    price: 51,
    features: [
      'Everything in basic',
      'Timeline with database',
      'Advanced search',
      'Marketing automation',
      'Advanced chatbot',
      'Campaign management'
    ],
    supportType: 'Standard',
    supportMedium: 'Email & Chat',
    respondTime: 'AVG. Time: 6h',
    current: true
  },
  {
    title: 'Standard Plan',
    price: 99,
    features: [
      'Campaign management',
      'Timeline with database',
      'Fuzzy search',
      'A/B testing sanbox',
      'Custom permissions',
      'Social media automation'
    ],
    supportType: 'Exclusive',
    supportMedium: 'Email, Chat & Google Meet',
    respondTime: 'Live Support',
    current: false
  }
];

// Styled Card with hover animation
const FeatureCard = styled(Card)(({ theme }) => ({
  height: '100%',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  cursor: 'pointer',
  border: '1px solid',
  borderColor: theme.palette.divider,
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: '0 12px 28px rgba(0,0,0,0.12)',
    borderColor: theme.palette.primary.main,
  },
}));

// Icon wrapper with pulse animation
const IconWrapper = styled(Box)(({ theme }) => ({
  fontSize: '3rem',
  width: 80,
  height: 80,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '16px',
  background: `linear-gradient(135deg, ${theme.palette.primary.light}15 0%, ${theme.palette.primary.main}25 100%)`,
  flexShrink: 0,
  transition: 'transform 0.3s ease',
  '.feature-card:hover &': {
    transform: 'scale(1.1) rotate(5deg)',
  },
}));

// Animated section title
const SectionTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  marginBottom: theme.spacing(6),
  position: 'relative',
  paddingBottom: theme.spacing(2),
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 80,
    height: 4,
    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
    borderRadius: 2,
  },
}));

// ----------------------------------------------------------------------
const PricingPlan = () => {
  const [val, setVal] = useState(458)
  return (
    <section
      id='pricing-plans'
      className={classnames('flex flex-col gap-12 plb-[100px]', frontCommonStyles.layoutSpacing)}
    >
      {/* ===================== HEADING ===================== */}
      <div className='flex flex-col items-center text-center'>
        <div className='relative flex justify-center mbe-6'>
          <ElementTwo className='absolute inline-start-0' />
          <div className='flex items-center gap-3'>
            <Lines />
            <Typography variant='h6' className='uppercase'>
              Transportation Excellence
            </Typography>
          </div>
        </div>
        <Typography variant='h4' className='font-bold mbe-2'>
          Advanced Fleet & Technology
        </Typography>
        <Typography className='font-medium max-w-[700px]'>
          State-of-the-art vehicles and cutting-edge tracking systems ensure your cargo reaches its destination safely and on time.
        </Typography>
      </div>
      {/* ===================== SLIDER ===================== */}
      <div className='text-center'>
        <Divider />
      </div>
      {/* ===================== WHY CHOOSE TRANSPORTATION ===================== */}
      <Box sx={{ py: 8 }}>
        <Grid container spacing={6} alignItems="center">
          {/* LEFT - Why Choose Our Transportation */}
          <Grid item xs={12} lg={6}>
            <Box>
              <SectionTitle variant="h3">
                Why Choose Our Transportation?
              </SectionTitle>
              <Stack spacing={3}>
                {features.map((feature, index) => (
                  <FeatureCard
                    key={index}
                    className="feature-card"
                    elevation={0}
                    sx={{
                      animation: `slideIn 0.5s ease-out ${index * 0.1}s both`,
                      '@keyframes slideIn': {
                        from: {
                          opacity: 0,
                          transform: 'translateX(-30px)',
                        },
                        to: {
                          opacity: 1,
                          transform: 'translateX(0)',
                        },
                      },
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ display: 'flex', gap: 3, alignItems: 'flex-start' }}>
                        <IconWrapper>
                          {feature.icon}
                        </IconWrapper>
                        <Box sx={{ flex: 1 }}>
                          <Typography
                            variant="h6"
                            sx={{
                              fontWeight: 600,
                              mb: 1,
                              color: 'text.primary',
                            }}
                          >
                            {feature.title}
                          </Typography>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ lineHeight: 1.7 }}
                          >
                            {feature.description}
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </FeatureCard>
                ))}
              </Stack>
            </Box>
          </Grid>
          {/* RIGHT - Image */}
          <Grid item xs={12} lg={6}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100%',
                position: 'relative',
                animation: 'fadeInScale 0.8s ease-out',
                '@keyframes fadeInScale': {
                  from: {
                    opacity: 0,
                    transform: 'scale(0.9)',
                  },
                  to: {
                    opacity: 1,
                    transform: 'scale(1)',
                  },
                },
              }}
            >
              {/* Decorative background blur */}
              <Box
                sx={{
                  position: 'absolute',
                  width: '80%',
                  height: '80%',
                  background: 'linear-gradient(135deg, #667eea40 0%, #764ba240 100%)',
                  filter: 'blur(60px)',
                  borderRadius: '50%',
                  zIndex: 0,
                }}
              />
              {/* Main Image */}
              <Box
                component="img"
                src="https://i.ibb.co/gbTTnSCh/7657a844-074d-479c-baa5-b0315366c2e0.png"
                alt="Transportation Infographic"
                sx={{
                  width: '100%',
                  maxWidth: 550,
                  height: 'auto',
                  borderRadius: 4,
                  boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
                  position: 'relative',
                  zIndex: 1,
                  transition: 'transform 0.3s ease',
                  '&:hover': {
                    transform: 'scale(1.02)',
                  },
                }}
              />
            </Box>
          </Grid>
        </Grid>
      </Box>
      {/* ===================== PRICING CARDS ===================== */}

    </section>
  )
}
export default PricingPlan
