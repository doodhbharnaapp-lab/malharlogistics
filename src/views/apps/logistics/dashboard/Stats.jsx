'use client'
// MUI Imports
import Grid from '@mui/material/Grid'
import MuiCard from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import { styled } from '@mui/material/styles'
import { useEffect, useState } from 'react'
// Component Imports
import CustomAvatar from '@core/components/mui/Avatar'
// Styled Card Component
const Card = styled(MuiCard)(({ color }) => ({
    transition: 'border 0.3s ease-in-out, box-shadow 0.3s ease-in-out, margin 0.3s ease-in-out',
    borderBottomWidth: '2px',
    borderBottomColor: `var(--mui-palette-${color}-darkerOpacity)`,
    '[data-skin="bordered"] &:hover': {
        boxShadow: 'none'
    },
    '&:hover': {
        borderBottomWidth: '3px',
        borderBottomColor: `var(--mui-palette-${color}-main) !important`,
        boxShadow: 'var(--mui-customShadows-xl)',
        marginBlockEnd: '-1px'
    }
}))
// Icon mapping for different cards
const iconMap = [
    'ri-error-warning-line',
    'ri-car-line',
    'ri-tools-line',
    'ri-time-line'
]
// Main Component
const StatsCard = () => {
    const [statsData, setStatsData] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    /* ================= API ENDPOINTS ================= */
    const API_BASE = '/api/apps'
    const TRIPS_API = `${API_BASE}/location/info`  // ✅ CORRECTED: 'trips' not 'trip'
    const VEHICLES_API = `${API_BASE}/vehicles`
    /* ================= FETCH TRIPS ================= */
    // Function to calculate expired documents
    const calculateExpiredDocuments = (vehicles) => {
        if (!vehicles || !Array.isArray(vehicles)) return 0
        let expiredCount = 0
        vehicles.forEach(vehicle => {
            if (vehicle.documents && Array.isArray(vehicle.documents)) {
                const hasExpired = vehicle.documents.some(doc => doc.isExpired === true)
                if (hasExpired) {
                    expiredCount++
                }
            }
        })
        return expiredCount
    }
    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true)
                // Fetch location count
                const locationResponse = await fetch(TRIPS_API)
                const locationData = await locationResponse.json()
                // Fetch vehicles data
                const vehiclesResponse = await fetch(VEHICLES_API)
                const vehiclesData = await vehiclesResponse.json()
                if (locationData.success && vehiclesData.success) {
                    const totalVehicles = vehiclesData.data?.length || 0
                    const expiredDocuments = calculateExpiredDocuments(vehiclesData.data)
                    setStatsData([
                        {
                            title: 'Vehicles with Expired Documents',
                            stats: expiredDocuments.toString(),
                            color: 'error'
                        },
                    ])
                } else {
                    throw new Error('Failed to fetch data from APIs')
                }
            } catch (err) {
                console.error('Error fetching stats:', err)
                setError(err.message)
                // Fallback to dummy data if API fails
                setStatsData([
                    { title: 'Total Vehicles', stats: '2,840', color: 'error' },
                    { title: 'Active Vehicles', stats: '2,312', color: 'success' },
                ])
            } finally {
                setLoading(false)
            }
        }
        fetchStats()
    }, [])
    if (loading) {
        return (
            <Grid container spacing={6}>
                {[1, 2, 3, 4].map((index) => (
                    <Grid item xs={12} sm={6} md={3} key={index}>
                        <Card color="primary">
                            <CardContent className='flex flex-col gap-2'>
                                <div className='flex items-center gap-4'>
                                    <CustomAvatar color="primary" skin='light' variant='rounded'>
                                        <i className={iconMap[index - 1] || 'ri-error-warning-line'} />
                                    </CustomAvatar>
                                    <Typography variant='h4'>Loading...</Typography>
                                </div>
                                <div className='flex flex-col'>
                                    <Typography color='text.primary'>Loading data...</Typography>
                                </div>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        )
    }
    if (error) {
        return (
            <Grid container spacing={6}>
                <Grid item xs={12}>
                    <Typography color="error">
                        Error loading stats: {error}
                    </Typography>
                </Grid>
            </Grid>
        )
    }
    return (
        <Grid container spacing={6}>
            {statsData.map((item, index) => {
                const { title, stats, color = 'primary' } = item
                const iconClass = iconMap[index] || 'ri-car-line'
                return (
                    <Grid item xs={12} sm={6} md={3} key={index}>
                        <Card color={color}>
                            <CardContent className='flex flex-col gap-2'>
                                <div className='flex items-center gap-4'>
                                    <CustomAvatar color={color} skin='light' variant='rounded'>
                                        <i className={iconClass} />
                                    </CustomAvatar>
                                    <Typography variant='h4' style={{ color: '#ff4d49' }}>{stats}</Typography>
                                </div>
                                <div className='flex flex-col'>
                                    <Typography color='text.primary'>{title}</Typography>
                                </div>
                            </CardContent>
                        </Card>
                    </Grid>
                )
            })}
        </Grid>
    )
}
export default StatsCard
