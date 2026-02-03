// React Imports
import { useEffect, useRef } from 'react'

// MUI Imports
import Typography from '@mui/material/Typography'
import Accordion from '@mui/material/Accordion'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'
import Grid from '@mui/material/Grid'

// Third-party Imports
import classnames from 'classnames'

// Hook Imports
import { useIntersection } from '@/hooks/useIntersection'

// SVG Imports
import ElementOne from '@/assets/svg/front-pages/landing-page/ElementOne'
import Lines from '@assets/svg/front-pages/landing-page/Lines'

// Styles Imports
import frontCommonStyles from '@views/front-pages/styles.module.css'

const FaqsData = [
  {
    id: 'panel1',
    question: 'How do I track my shipment?',
    answer:
      'You can track your shipment 24/7 using your unique tracking number on our website or mobile app. Simply enter the tracking ID in the tracking portal to view real-time location updates, estimated delivery time, and shipment history. You will also receive automated email and SMS notifications at key milestones.'
  },
  {
    id: 'panel2',
    question: 'How long does delivery take?',
    answer:
      'Delivery times vary by service. Same-day delivery is available in select cities. Express air takes 1–3 days internationally, standard air takes 3–5 days, ocean freight takes 15–45 days, and road transport typically takes 1–7 days regionally. Exact timelines depend on origin, destination, customs clearance, and service level selected.'
  },
  {
    id: 'panel3',
    question: 'What shipping methods do you offer?',
    answer:
      'We offer multiple shipping methods including ocean freight (FCL/LCL), air freight (express and standard), road transport (FTL/LTL), and intermodal solutions. Our team recommends the best option based on your timeline, budget, cargo type, and destination to ensure optimal cost and delivery efficiency.'
  },
  {
    id: 'panel4',
    question: 'Is my shipment insured?',
    answer:
      'Basic carrier liability is included with all shipments. However, we strongly recommend additional cargo insurance for valuable goods. We offer comprehensive insurance options covering loss, damage, and delays at competitive rates, with quick claim processing and minimal documentation.'
  },
  {
    id: 'panel5',
    question: 'How much does shipping cost?',
    answer:
      'Shipping costs depend on weight, dimensions, distance, shipping method, and service level. Use our instant quote calculator to get accurate pricing within seconds. We offer transparent pricing with no hidden fees and volume discounts for regular shippers.'
  },
  {
    id: 'panel6',
    question: 'Can I ship temperature-sensitive goods?',
    answer:
      'Absolutely. We operate a fleet of refrigerated vehicles and containers with precise temperature control for pharmaceuticals, food products, and other temperature-sensitive cargo. Our cold-chain solutions maintain consistent temperatures from origin to destination with real-time monitoring.'
  },
  // {
  //   id: 'panel7',
  //   question: 'Do you handle customs clearance?',
  //   answer:
  //     'Yes. Our customs brokerage team manages all documentation, duty calculations, and clearance procedures for international shipments. We ensure regulatory compliance, manage import/export licenses, and communicate directly with customs authorities to avoid delays.'
  // },
  // {
  //   id: 'panel8',
  //   question: 'Do you offer warehousing services?',
  //   answer:
  //     'Yes, we provide secure warehousing solutions including climate-controlled facilities, advanced inventory management systems, pick-and-pack services, and cross-docking. Our strategically located warehouses help reduce shipping costs and improve distribution efficiency.'
  // }
]


const Faqs = () => {
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
    <section
      id='faq'
      ref={ref}
      className={classnames('flex flex-col gap-16 plb-[100px]', frontCommonStyles.layoutSpacing)}
    >
      <div className='flex flex-col items-center justify-center'>
        <div className='flex is-full justify-center items-center relative'>
          <ElementOne className='absolute inline-end-0' />
          <div className='flex items-center justify-center mbe-6 gap-3'>
            <Lines />
            <Typography variant='h6' className='uppercase'>
              Faq
            </Typography>
          </div>
        </div>
        <div className='flex items-baseline flex-wrap gap-2 mbe-3 sm:mbe-2'>
          <Typography variant='h5'>Frequently asked</Typography>
          <Typography variant='h4' className='font-bold'>
            questions
          </Typography>
        </div>
        <Typography className='font-medium text-center'>
          Browse through these FAQs to find answers to commonly asked questions.
        </Typography>
      </div>
      <Grid container spacing={6}>
        <Grid size={{ xs: 12, lg: 5 }} className='text-center'>
          <img
            src='/images/front-pages/landing-page/sitting-girl-with-laptop.png'
            alt='girl with laptop'
            className='is-[80%] max-is-[320px]'
          />
        </Grid>
        <Grid size={{ xs: 12, lg: 7 }}>
          {FaqsData.map((data, index) => {
            return (
              <Accordion key={index} defaultExpanded={data.active}>
                <AccordionSummary aria-controls={data.id + '-content'} id={data.id + '-header'} className='font-medium'>
                  <Typography component='span'>{data.question}</Typography>
                </AccordionSummary>
                <AccordionDetails>{data.answer}</AccordionDetails>
              </Accordion>
            )
          })}
        </Grid>
      </Grid>
    </section>
  )
}

export default Faqs
