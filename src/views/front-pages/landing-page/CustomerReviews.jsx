// React Imports
import { useState } from 'react'

// MUI Imports
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Badge from '@mui/material/Badge'
import Rating from '@mui/material/Rating'
import { useKeenSlider } from 'keen-slider/react'
import classnames from 'classnames'

// Styled Component Imports
import AppKeenSlider from '@/libs/styles/AppKeenSlider'

// SVG Imports
import Lines from '@assets/svg/front-pages/landing-page/Lines'
import Levis from '@assets/svg/front-pages/landing-page/Levis'
import Continental from '@assets/svg/front-pages/landing-page/Continental'
import Eckerd from '@assets/svg/front-pages/landing-page/Eckerd'
import Dribbble from '@assets/svg/front-pages/landing-page/Dribbble'
import Airbnb from '@assets/svg/front-pages/landing-page/Airbnb'

// Styles Imports
import frontCommonStyles from '@views/front-pages/styles.module.css'

// Data
const data = [
  {
    desc: 'Malhar Logistics has been our trusted transport partner for years. Their on-time delivery and professional handling make them extremely reliable.',
    svg: <Eckerd color='#2882C3' />,
    rating: 5,
    name: 'Rohit Sharma',
    position: 'Operations Manager, FMCG Company'
  },
  {
    desc: 'We regularly ship goods across states, and Malhar Logistics ensures safe and timely delivery every single time.',
    svg: <Levis color='#A8112E' />,
    rating: 5,
    name: 'Amit Verma',
    position: 'Founder, Wholesale Distribution'
  },
  {
    desc: 'Excellent coordination and real-time updates throughout transit. Their logistics team is highly responsive and professional.',
    svg: <Airbnb color='#FF5A60' />,
    rating: 4,
    name: 'Neha Kulkarni',
    position: 'Supply Chain Head, Manufacturing Unit'
  },
  {
    desc: 'Malhar Logistics handles our bulk transportation efficiently. Their fleet quality and driver professionalism are impressive.',
    svg: <Continental color='#F39409' />,
    rating: 5,
    name: 'Sandeep Patil',
    position: 'Project Manager, Infrastructure Firm'
  },
  {
    desc: 'Cost-effective logistics services with zero compromise on safety. Highly recommended for long-distance transport.',
    svg: <Dribbble color='#ea4c89' />,
    rating: 5,
    name: 'Vikram Desai',
    position: 'Owner, Trading Business'
  },
  {
    desc: 'Their team understands logistics challenges very well. Shipments always arrive as committed, without delays.',
    svg: <Eckerd color='#2882C3' />,
    rating: 5,
    name: 'Pooja Mehta',
    position: 'Procurement Lead, Retail Chain'
  },
  {
    desc: 'Reliable, transparent pricing and excellent customer support. Malhar Logistics is our go-to transport service provider.',
    svg: <Levis color='#A8112E' />,
    rating: 5,
    name: 'Kunal Joshi',
    position: 'Business Owner, Industrial Supplies'
  },
  {
    desc: 'From pickup to delivery, the process is smooth and well-coordinated. Real-time tracking gives complete peace of mind.',
    svg: <Airbnb color='#FF5A60' />,
    rating: 4,
    name: 'Anjali Rao',
    position: 'Logistics Coordinator, E-commerce'
  },
  {
    desc: 'Professional drivers, well-maintained vehicles, and timely delivery. Malhar Logistics sets a high standard.',
    svg: <Continental color='#F39409' />,
    rating: 5,
    name: 'Mahesh Kulkarni',
    position: 'Factory Manager, Auto Parts Manufacturing'
  },
  {
    desc: 'Malhar Logistics delivers exactly what they promise. Safe handling, prompt service, and excellent communication.',
    svg: <Dribbble color='#ea4c89' />,
    rating: 5,
    name: 'Rahul Nair',
    position: 'Founder, Export Trading Company'
  }
]


const CustomerReviews = () => {
  // States
  const [loaded, setLoaded] = useState(false)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [details, setDetails] = useState()

  // Hooks
  const [sliderRef, instanceRef] = useKeenSlider(
    {
      loop: true,
      slideChanged: slider => setCurrentSlide(slider.track.details.rel),
      created: () => setLoaded(true),
      detailsChanged: s => setDetails(s.track.details),
      slides: {
        perView: 4,
        origin: 'center'
      },
      breakpoints: {
        '(max-width: 1200px)': {
          slides: {
            perView: 3,
            spacing: 26,
            origin: 'center'
          }
        },
        '(max-width: 900px)': {
          slides: {
            perView: 2,
            spacing: 26,
            origin: 'center'
          }
        },
        '(max-width: 600px)': {
          slides: {
            perView: 1,
            spacing: 26,
            origin: 'center'
          }
        }
      }
    },
    [
      slider => {
        let timeout
        const mouseOver = false

        function clearNextTimeout() {
          clearTimeout(timeout)
        }

        function nextTimeout() {
          clearTimeout(timeout)
          if (mouseOver) return
          timeout = setTimeout(() => {
            slider.next()
          }, 2000)
        }

        slider.on('created', nextTimeout)
        slider.on('dragStarted', clearNextTimeout)
        slider.on('animationEnded', nextTimeout)
        slider.on('updated', nextTimeout)
      }
    ]
  )

  const scaleStyle = idx => {
    if (!details) return {}
    const activeSlideIndex = details.rel

    return {
      transition: 'transform 0.2s ease-in-out, opacity 0.2s ease-in-out',
      ...(activeSlideIndex === idx ? { transform: 'scale(1)', opacity: 1 } : { transform: 'scale(0.9)', opacity: 0.5 })
    }
  }

  return (
    <section className='flex flex-col gap-16 plb-[100px]'>
      <div className={classnames('flex flex-col items-center justify-center', frontCommonStyles.layoutSpacing)}>
        <div className='flex items-center justify-center mbe-6 gap-3'>
          <Lines />
          <Typography color='text.primary' className='font-medium uppercase'>
            Real Customers Reviews
          </Typography>
        </div>
        <div className='flex items-baseline flex-wrap gap-2 mbe-3 sm:mbe-2'>
          <Typography variant='h4' className='font-bold'>
            Success stories
          </Typography>
          <Typography variant='h5'>from clients</Typography>
        </div>
        <Typography className='font-medium text-center'>
          See what our customers have to say about their experience.
        </Typography>
      </div>
      <AppKeenSlider>
        <>
          <div ref={sliderRef} className='keen-slider mbe-6'>
            {data.map((item, index) => (
              <div key={index} className='keen-slider__slide flex p-6 sm:p-4'>
                <Card elevation={8} className='flex items-center' style={scaleStyle(index)}>
                  <CardContent className='p-8 items-center mlb-auto'>
                    <div className='flex flex-col gap-4 items-center justify-center text-center'>
                      {item.svg}
                      <Typography color='text.primary'>{item.desc}</Typography>
                      <Rating value={item.rating} readOnly />
                      <div>
                        <Typography color='text.primary' className='font-medium'>
                          {item.name}
                        </Typography>
                        <Typography variant='body2'>{item.position}</Typography>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
          {loaded && instanceRef.current && (
            <div className='swiper-dots'>
              {[...Array(instanceRef.current.track.details.slides.length).keys()].map(idx => {
                return (
                  <Badge
                    key={idx}
                    variant='dot'
                    component='div'
                    className={classnames({ active: currentSlide === idx })}
                    onClick={() => instanceRef.current?.moveToIdx(idx)}
                  />
                )
              })}
            </div>
          )}
        </>
      </AppKeenSlider>
      <div className='flex flex-wrap items-center justify-center gap-x-16 gap-y-6 mli-3'>
        <Levis color='var(--mui-palette-text-secondary)' />
        <Continental color='var(--mui-palette-text-secondary)' />
        <Airbnb color='var(--mui-palette-text-secondary)' />
        <Eckerd color='var(--mui-palette-text-secondary)' />
        <Dribbble color='var(--mui-palette-text-secondary)' />
      </div>
    </section>
  )
}

export default CustomerReviews
