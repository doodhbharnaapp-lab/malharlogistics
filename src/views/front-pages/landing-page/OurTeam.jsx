// 'use client'

// // MUI Imports
// import Typography from '@mui/material/Typography'
// import Grid from '@mui/material/Grid'
// import Button from '@mui/material/Button'
// import Box from '@mui/material/Box'
// import { styled, keyframes } from '@mui/material/styles'

// // Styles Imports
// import frontCommonStyles from '@views/front-pages/styles.module.css'

// // Services Data
// const services = [
//   {
//     icon: '🚢',
//     title: 'Ocean Freight',
//     desc: 'Cost-effective sea transportation for large shipments worldwide with comprehensive tracking.',
//     points: ['Full Container Load (FCL)', 'Less Container Load (LCL)', 'Door-to-Door Service', 'Custom Clearance'],
//     color: '#0EA5E9',
//     bgGradient: 'linear-gradient(135deg, #0EA5E9 0%, #06B6D4 100%)'
//   },
//   {
//     icon: '✈️',
//     title: 'Air Freight',
//     desc: 'Express air cargo services for time-sensitive shipments across global destinations.',
//     points: ['Express Delivery', 'Temperature Controlled', 'Dangerous Goods Handling', 'Charter Services'],
//     color: '#8B5CF6',
//     bgGradient: 'linear-gradient(135deg, #8B5CF6 0%, #A855F7 100%)'
//   },
//   {
//     icon: '🚛',
//     title: 'Road Transport',
//     desc: 'Reliable ground transportation with real-time tracking for domestic and regional deliveries.',
//     points: ['Full Truckload (FTL)', 'Less Than Truckload (LTL)', 'Refrigerated Transport', 'Heavy Haul'],
//     color: '#F59E0B',
//     bgGradient: 'linear-gradient(135deg, #F59E0B 0%, #F97316 100%)'
//   },
//   {
//     icon: '🏭',
//     title: 'Warehousing',
//     desc: 'Secure storage facilities with advanced inventory management and distribution services.',
//     points: ['Climate Controlled Storage', 'Inventory Management', 'Pick & Pack Services', 'Cross Docking'],
//     color: '#10B981',
//     bgGradient: 'linear-gradient(135deg, #10B981 0%, #14B8A6 100%)'
//   },
//   {
//     icon: '📦',
//     title: 'E-commerce Logistics',
//     desc: 'End-to-end fulfillment solutions designed for online retailers and marketplaces.',
//     points: ['Order Fulfillment', 'Returns Management', 'Same-Day Delivery', 'Multi-Channel Integration'],
//     color: '#EC4899',
//     bgGradient: 'linear-gradient(135deg, #EC4899 0%, #F43F5E 100%)'
//   },
//   {
//     icon: '📋',
//     title: 'Customs Brokerage',
//     desc: 'Expert customs clearance and compliance services for smooth international trade.',
//     points: ['Documentation Support', 'Duty & Tax Calculation', 'Compliance Consulting', 'Import/Export License'],
//     color: '#6366F1',
//     bgGradient: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)'
//   }
// ]

// // Animations
// const fadeInUp = keyframes`
//   from {
//     opacity: 0;
//     transform: translateY(30px);
//   }
//   to {
//     opacity: 1;
//     transform: translateY(0);
//   }
// `

// const float = keyframes`
//   0%, 100% {
//     transform: translateY(0);
//   }
//   50% {
//     transform: translateY(-10px);
//   }
// `

// // Styled Components
// const SectionWrapper = styled(Box)(({ theme }) => ({
//   position: 'relative',
//   overflow: 'hidden',
//   background: 'linear-gradient(180deg, #FAFBFC 0%, #FFFFFF 50%, #F8FAFC 100%)',
//   '&::before': {
//     content: '""',
//     position: 'absolute',
//     top: 0,
//     left: '-50%',
//     width: '200%',
//     height: '100%',
//     background: 'radial-gradient(circle at 30% 20%, rgba(59, 130, 246, 0.03) 0%, transparent 50%), radial-gradient(circle at 70% 80%, rgba(139, 92, 246, 0.03) 0%, transparent 50%)',
//     pointerEvents: 'none'
//   }
// }))

// const ServiceCard = styled(Box)(({ theme, servicecolor }) => ({
//   position: 'relative',
//   background: '#FFFFFF',
//   borderRadius: 24,
//   padding: '40px 32px',
//   height: '100%',
//   display: 'flex',
//   flexDirection: 'column',
//   border: '1px solid rgba(0, 0, 0, 0.06)',
//   boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
//   transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
//   animation: `${fadeInUp} 0.6s ease-out forwards`,
//   opacity: 0,
//   overflow: 'hidden',
//   '&::before': {
//     content: '""',
//     position: 'absolute',
//     top: 0,
//     left: 0,
//     width: '100%',
//     height: '6px',
//     background: servicecolor,
//     transform: 'scaleX(0)',
//     transformOrigin: 'left',
//     transition: 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)'
//   },
//   '&:hover': {
//     transform: 'translateY(-12px) scale(1.02)',
//     boxShadow: `0 20px 60px ${servicecolor}25`,
//     borderColor: `${servicecolor}40`,
//     '&::before': {
//       transform: 'scaleX(1)'
//     },
//     '& .service-icon': {
//       transform: 'scale(1.15) rotate(-5deg)',
//       filter: 'drop-shadow(0 8px 16px rgba(0, 0, 0, 0.15))'
//     },
//     '& .learn-more': {
//       gap: '12px',
//       color: servicecolor
//     },
//     '& .arrow-icon': {
//       transform: 'translateX(4px)'
//     }
//   }
// }))

// const IconWrapper = styled(Box)(({ servicecolor }) => ({
//   width: 88,
//   height: 88,
//   borderRadius: 22,
//   display: 'flex',
//   alignItems: 'center',
//   justifyContent: 'center',
//   fontSize: '3rem',
//   marginBottom: 28,
//   background: `${servicecolor}15`,
//   position: 'relative',
//   transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
//   '&::after': {
//     content: '""',
//     position: 'absolute',
//     inset: -2,
//     borderRadius: 24,
//     background: servicecolor,
//     opacity: 0.1,
//     filter: 'blur(20px)',
//     zIndex: -1
//   }
// }))

// const FeatureItem = styled(Box)(({ theme }) => ({
//   display: 'flex',
//   alignItems: 'flex-start',
//   gap: 12,
//   marginBottom: 12,
//   paddingLeft: 4,
//   transition: 'transform 0.3s ease',
//   '&:hover': {
//     transform: 'translateX(4px)'
//   }
// }))

// const CheckIcon = styled(Box)(({ servicecolor }) => ({
//   minWidth: 20,
//   height: 20,
//   borderRadius: '50%',
//   background: `${servicecolor}20`,
//   display: 'flex',
//   alignItems: 'center',
//   justifyContent: 'center',
//   fontSize: '11px',
//   fontWeight: 700,
//   color: servicecolor,
//   marginTop: 2
// }))

// const LearnMoreButton = styled(Box)(({ theme }) => ({
//   display: 'inline-flex',
//   alignItems: 'center',
//   gap: 8,
//   fontWeight: 600,
//   fontSize: '15px',
//   color: '#1F2937',
//   cursor: 'pointer',
//   marginTop: 'auto',
//   paddingTop: 8,
//   transition: 'all 0.3s ease',
//   '& .arrow-icon': {
//     transition: 'transform 0.3s ease',
//     fontSize: '18px'
//   }
// }))

// const OurServices = () => {
//   return (
//     <SectionWrapper component='section' id='services' className='plb-[100px]'>
//       <div className={frontCommonStyles.layoutSpacing}>
//         {/* Section Header */}
//         <Box sx={{ textAlign: 'center', mb: 10, position: 'relative', zIndex: 1 }}>
//           <Typography
//             sx={{
//               fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
//               fontSize: '14px',
//               fontWeight: 700,
//               letterSpacing: '3px',
//               textTransform: 'uppercase',
//               background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
//               WebkitBackgroundClip: 'text',
//               WebkitTextFillColor: 'transparent',
//               mb: 2
//             }}
//           >
//             Our Services
//           </Typography>

//           <Typography
//             sx={{
//               fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
//               fontSize: { xs: '36px', md: '52px' },
//               fontWeight: 800,
//               lineHeight: 1.2,
//               color: '#0F172A',
//               mb: 3,
//               letterSpacing: '-0.02em'
//             }}
//           >
//             Complete Logistics
//             <br />
//             <Box
//               component='span'
//               sx={{
//                 background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
//                 WebkitBackgroundClip: 'text',
//                 WebkitTextFillColor: 'transparent'
//               }}
//             >
//               Solutions
//             </Box>
//           </Typography>

//           <Typography
//             sx={{
//               fontFamily: '"SF Pro Text", -apple-system, BlinkMacSystemFont, sans-serif',
//               fontSize: '18px',
//               lineHeight: 1.8,
//               color: '#64748B',
//               maxWidth: 680,
//               mx: 'auto',
//               fontWeight: 400
//             }}
//           >
//             Reliable, scalable, and cost-effective logistics services tailored to your business needs
//           </Typography>
//         </Box>

//         {/* Services Grid */}
//         <Grid container spacing={4}>
//           {services.map((service, index) => (
//             <Grid item xs={12} sm={6} md={4} key={index}>
//               <ServiceCard
//                 servicecolor={service.color}
//                 sx={{
//                   animationDelay: `${index * 0.1}s`
//                 }}
//               >
//                 <IconWrapper className='service-icon' servicecolor={service.color}>
//                   {service.icon}
//                 </IconWrapper>

//                 <Typography
//                   sx={{
//                     fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
//                     fontSize: '24px',
//                     fontWeight: 700,
//                     color: '#0F172A',
//                     mb: 2,
//                     letterSpacing: '-0.01em'
//                   }}
//                 >
//                   {service.title}
//                 </Typography>

//                 <Typography
//                   sx={{
//                     fontFamily: '"SF Pro Text", -apple-system, BlinkMacSystemFont, sans-serif',
//                     fontSize: '15px',
//                     lineHeight: 1.7,
//                     color: '#64748B',
//                     mb: 4,
//                     fontWeight: 400
//                   }}
//                 >
//                   {service.desc}
//                 </Typography>

//                 <Box sx={{ mb: 4 }}>
//                   {service.points.map((point, i) => (
//                     <FeatureItem key={i}>
//                       <CheckIcon servicecolor={service.color}>✓</CheckIcon>
//                       <Typography
//                         sx={{
//                           fontFamily: '"SF Pro Text", -apple-system, BlinkMacSystemFont, sans-serif',
//                           fontSize: '14px',
//                           lineHeight: 1.6,
//                           color: '#475569',
//                           fontWeight: 500
//                         }}
//                       >
//                         {point}
//                       </Typography>
//                     </FeatureItem>
//                   ))}
//                 </Box>

//                 <LearnMoreButton className='learn-more'>
//                   Learn More
//                   <span className='arrow-icon'>→</span>
//                 </LearnMoreButton>
//               </ServiceCard>
//             </Grid>
//           ))}
//         </Grid>
//       </div>
//     </SectionWrapper>
//   )
// }

// export default OurServices
// React Imports
import { useEffect, useRef } from 'react'
// MUI Imports
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import { styled } from '@mui/material/styles'
// Hook Imports
import { useIntersection } from '@/hooks/useIntersection'
// SVG Imports
import ElementOne from '@/assets/svg/front-pages/landing-page/ElementOne'
import Lines from '@assets/svg/front-pages/landing-page/Lines'
// Styles Imports
import frontCommonStyles from '@views/front-pages/styles.module.css'

// Services Data
const services = [
  {
    icon: '🚢',
    title: 'Ocean Freight',
    description: 'Cost-effective sea transportation for large shipments worldwide with comprehensive tracking.',
    features: [
      'Full Container Load (FCL)',
      'Less Container Load (LCL)',
      'Door-to-Door Service',
      'Custom Clearance'
    ],
    color: 'var(--mui-palette-primary-mainOpacity)'
  },
  {
    icon: '✈️',
    title: 'Air Freight',
    description: 'Express air cargo services for time-sensitive shipments across global destinations.',
    features: [
      'Express Delivery',
      'Temperature Controlled',
      'Dangerous Goods Handling',
      'Charter Services'
    ],
    color: 'var(--mui-palette-error-mainOpacity)'
  },
  {
    icon: '🚛',
    title: 'Road Transport',
    description: 'Reliable ground transportation with real-time tracking for domestic and regional deliveries.',
    features: [
      'Full Truckload (FTL)',
      'Less Than Truckload (LTL)',
      'Refrigerated Transport',
      'Heavy Haul'
    ],
    color: 'var(--mui-palette-success-mainOpacity)'
  },
  {
    icon: '🏭',
    title: 'Warehousing',
    description: 'Secure storage facilities with advanced inventory management and distribution services.',
    features: [
      'Climate Controlled Storage',
      'Inventory Management',
      'Pick & Pack Services',
      'Cross Docking'
    ],
    color: 'var(--mui-palette-info-mainOpacity)'
  },
  {
    icon: '📦',
    title: 'E-commerce Logistics',
    description: 'End-to-end fulfillment solutions designed for online retailers and marketplaces.',
    features: [
      'Order Fulfillment',
      'Returns Management',
      'Same-Day Delivery',
      'Multi-Channel Integration'
    ],
    color: 'var(--mui-palette-warning-mainOpacity)'
  },
  {
    icon: '📋',
    title: 'Customs Brokerage',
    description: 'Expert customs clearance and compliance services for smooth international trade.',
    features: [
      'Documentation Support',
      'Duty & Tax Calculation',
      'Compliance Consulting',
      'Import/Export License'
    ],
    color: 'var(--mui-palette-secondary-mainOpacity)'
  }
]

const ServiceCard = styled('div')`
  transition: all 0.3s ease;
  &:hover {
    transform: translateY(-8px);
    border-color: ${props => props.color};
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  }
`

const OurServices = () => {
  // Refs
  const skipIntersection = useRef(true)
  const ref = useRef(null)

  // Hooks
  const { updateIntersections } = useIntersection()

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (skipIntersection.current) {
          skipIntersection.current = false
          return
        }
        updateIntersections({ [entry.target.id]: entry.isIntersecting })
      },
      { threshold: 0.35 }
    )
    ref.current && observer.observe(ref.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <section id='services' className='plb-[100px] bg-backgroundPaper' ref={ref}>
      <div className={frontCommonStyles.layoutSpacing}>
        <div className='flex flex-col items-center justify-center'>
          <div className='flex is-full justify-center relative'>
            <ElementOne className='absolute inline-end-0' />
            <div className='flex items-center justify-center mbe-6 gap-3'>
              <Lines />
              <Typography variant='h6' className='uppercase'>
                Our Services
              </Typography>
            </div>
          </div>
          <div className='flex items-baseline flex-wrap gap-2 mbe-3 sm:mbe-2'>
            <Typography variant='h4' className='font-bold'>
              Comprehensive
            </Typography>
            <Typography variant='h5'> Logistics Solutions</Typography>
          </div>
          <Typography className='font-medium text-center max-w-3xl'>
            End-to-end supply chain services designed to streamline your operations and enhance efficiency
          </Typography>
        </div>

        <Grid container spacing={6} className='pbs-[100px]'>
          {services.map((service, index) => (
            <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={index}>
              <ServiceCard
                className='border rounded-xl p-6 h-full flex flex-col bg-paper transition-all duration-300 hover:shadow-lg'
                color={service.color}
              >
                <div className='flex flex-col items-start justify-start h-full'>
                  {/* Service Icon */}
                  <div
                    className='flex items-center justify-center bs-16 is-16 rounded-full mbe-4 text-3xl'
                    style={{ backgroundColor: service.color }}
                  >
                    {service.icon}
                  </div>

                  {/* Service Title */}
                  <Typography variant='h5' className='font-bold mbe-2'>
                    {service.title}
                  </Typography>

                  {/* Service Description */}
                  <Typography className='mbe-4 text-textSecondary'>
                    {service.description}
                  </Typography>

                  {/* Service Features */}
                  <div className='flex-grow'>
                    <ul className='space-y-2 mbe-6'>
                      {service.features.map((feature, idx) => (
                        <li key={idx} className='flex items-start'>
                          <i className='ri-check-line text-primary text-lg mie-2 mt-0.5' />
                          <Typography variant='body2'>{feature}</Typography>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Learn More Button */}
                  <Button
                    variant='outlined'
                    className='mt-auto'
                    endIcon={<i className='ri-arrow-right-line' />}
                    onClick={() => console.log(`Learn more about ${service.title}`)}
                  >
                    Learn More
                  </Button>
                </div>
              </ServiceCard>
            </Grid>
          ))}
        </Grid>
      </div>
    </section>
  )
}

export default OurServices
