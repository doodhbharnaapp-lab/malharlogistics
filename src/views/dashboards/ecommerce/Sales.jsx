'use client'
// React Imports
import { useState, useEffect } from 'react'
// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
// Components Imports
import OptionMenu from '@core/components/option-menu'
import CustomAvatar from '@core/components/mui/Avatar'
const data = [
  {
    stats: '0',
    color: 'primary',
    title: 'Total Trips',
    icon: 'ri-roadster-line'
  },
  {
    stats: '0',
    color: 'success',
    icon: 'ri-checkbox-circle-line',
    title: 'Active'
  },
  {
    color: 'warning',
    stats: '0',
    title: 'Completed',
    icon: 'ri-check-double-line'
  },
  {
    color: 'error',
    stats: '0',
    title: 'Cancelled',
    icon: 'ri-close-circle-line'
  }
]
const Sales = () => {
  const [tripStats, setTripStats] = useState(data)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  /* ================= API ENDPOINTS ================= */
  const API_BASE = '/api/apps'
  const TRIPS_API = `${API_BASE}/trip/`  // ✅ CORRECTED: 'trips' not 'trip'
  /* ================= FETCH TRIPS ================= */
  const fetchTripData = async () => {
    try {
      setLoading(true)
      const response = await fetch(TRIPS_API)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const result = await response.json()
      if (result.success && result.data) {
        const trips = result.data
        const total = trips.length
        const active = trips.filter(trip => trip.tripStatus === 'active').length
        const completed = trips.filter(trip => trip.tripStatus === 'completed').length
        const cancelled = trips.filter(trip => trip.tripStatus === 'cancelled').length
        setTripStats([
          {
            stats: total.toString(),
            color: 'primary',
            title: 'Total Trips',
            icon: 'ri-roadster-line'
          },
          {
            stats: active.toString(),
            color: 'success',
            icon: 'ri-checkbox-circle-line',
            title: 'Active'
          },
          {
            color: 'warning',
            stats: completed.toString(),
            title: 'Completed',
            icon: 'ri-check-double-line'
          },
          {
            color: 'error',
            stats: cancelled.toString(),
            title: 'Cancelled',
            icon: 'ri-close-circle-line'
          }
        ])
      }
    } catch (err) {
      console.error('Error fetching trip data:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    fetchTripData()
  }, [])
  const handleMenuClick = (option) => {
    if (option === 'Refresh') {
      fetchTripData()
    }
  }
  if (error) {
    return (
      <Card>
        <CardContent>
          <Typography color="error">Error loading trip data: {error}</Typography>
        </CardContent>
      </Card>
    )
  }
  return (
    <Card>
      <CardHeader
        title='Trip Overview'
        action={
          <OptionMenu
            options={['Refresh', 'Share', 'Update']}
            onOptionClick={handleMenuClick}
          />
        }
      />
      <CardContent>
        <div className='flex flex-wrap justify-between gap-4'>
          {tripStats.map((item, index) => (
            <div key={index} className='flex items-center gap-3'>
              <CustomAvatar variant='rounded' skin='light' color={item.color}>
                <i className={item.icon}></i>
              </CustomAvatar>
              <div>
                <Typography variant='h5'>
                  {loading ? '...' : item.stats}
                </Typography>
                <Typography>{item.title}</Typography>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
export default Sales
