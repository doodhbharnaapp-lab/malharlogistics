'use client'
// React Imports
import { useState, useEffect } from 'react'
// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
// Components Imports
import OptionMenu from '@core/components/option-menu'
import CustomAvatar from '@core/components/mui/Avatar'

// Styled card for stats
const StatsCard = ({ children, color }) => {
    return (
        <Card
            sx={{
                borderLeft: '4px solid',
                borderColor: `${color}.main`,
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 3
                }
            }}
        >
            {children}
        </Card>
    )
}

const MarketTrip = () => {
    const [tripStats, setTripStats] = useState([
        {
            stats: '0',
            color: 'primary',
            title: 'Total Trips',
            icon: 'ri-roadster-line',
            description: 'All market trips'
        },
        {
            stats: '0',
            color: 'success',
            icon: 'ri-checkbox-circle-line',
            title: 'Active',
            description: 'Currently active trips'
        },
        {
            color: 'warning',
            stats: '0',
            title: 'Completed',
            icon: 'ri-check-double-line',
            description: 'Successfully completed'
        },
        {
            color: 'error',
            stats: '0',
            title: 'Cancelled',
            icon: 'ri-close-circle-line',
            description: 'Cancelled trips'
        }
    ])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    /* ================= API ENDPOINTS ================= */
    const API_BASE = '/api/apps'
    const TRIPS_API = `${API_BASE}/trip/market`  // ✅ CORRECTED: 'trips' not 'trip'
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
                        icon: 'ri-roadster-line',
                    },
                    {
                        stats: active.toString(),
                        color: 'success',
                        icon: 'ri-checkbox-circle-line',
                        title: 'Active',
                    },
                    {
                        color: 'warning',
                        stats: completed.toString(),
                        title: 'Completed',
                        icon: 'ri-check-double-line',
                    },
                    {
                        color: 'error',
                        stats: cancelled.toString(),
                        title: 'Cancelled',
                        icon: 'ri-close-circle-line',
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

    if (loading) {
        return (
            <Card>
                <CardHeader
                    title='Market Trip Overview'
                    action={
                        <OptionMenu
                            options={['Refresh', 'Share', 'Update']}
                            onOptionClick={handleMenuClick}
                        />
                    }
                />
                <CardContent>
                    <Grid container spacing={3} justifyContent="center">
                        <Grid item xs={12} textAlign="center">
                            <CircularProgress />
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                                Loading trip statistics...
                            </Typography>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>
        )
    }

    if (error) {
        return (
            <Card>
                <CardHeader
                    title='Market Trip Overview'
                    action={
                        <OptionMenu
                            options={['Refresh', 'Share', 'Update']}
                            onOptionClick={handleMenuClick}
                        />
                    }
                />
                <CardContent>
                    <Alert severity="error" sx={{ mb: 2 }}>
                        Error loading trip data: {error}
                    </Alert>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader
                title='Market Trip Overview'
                subheader="Statistics for market trips"
                action={
                    <OptionMenu
                        options={['Refresh', 'Share', 'Update']}
                        onOptionClick={handleMenuClick}
                    />
                }
            />
            <CardContent>
                <Grid container spacing={3}>
                    {tripStats.map((item, index) => (
                        <Grid item xs={12} sm={6} md={3} key={index}>
                            <StatsCard color={item.color}>
                                <CardContent>
                                    <div className='flex items-center justify-between mb-2'>
                                        <div>
                                            <Typography variant='h5' color={`${item.color}.main`}>
                                                {item.stats}
                                            </Typography>
                                            <Typography variant='body2' color='text.secondary'>
                                                {item.title}
                                            </Typography>
                                        </div>
                                        <CustomAvatar
                                            variant='rounded'
                                            skin='light'
                                            color={item.color}
                                            sx={{ width: 44, height: 44 }}
                                        >
                                            <i className={item.icon}></i>
                                        </CustomAvatar>
                                    </div>
                                    <Typography variant='caption' color='text.secondary'>
                                        {item.description}
                                    </Typography>
                                </CardContent>
                            </StatsCard>
                        </Grid>
                    ))}
                </Grid>


            </CardContent>
        </Card>
    )
}

export default MarketTrip
