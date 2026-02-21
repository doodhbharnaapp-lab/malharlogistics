'use client'
// React Imports
import { useState, useEffect } from 'react'
// MUI Import
import Tab from '@mui/material/Tab'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Chip from '@mui/material/Chip'
import TabList from '@mui/lab/TabList'
import TabPanel from '@mui/lab/TabPanel'
import Avatar from '@mui/material/Avatar'
import TabContext from '@mui/lab/TabContext'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
// Third-party Imports
import classnames from 'classnames'
// Components Imports
import OptionMenu from '@core/components/option-menu'
import CustomAvatar from '@core/components/mui/Avatar'
// Style Imports
import tableStyles from '@core/styles/table.module.css'
// Icons for different vehicle types
const getVehicleIcon = (model) => {
    // You can map different models to different icons
    const modelLower = model?.toLowerCase() || ''
    if (modelLower.includes('truck') || modelLower.includes('lorry'))
        return '/images/vehicles/truck.png'
    if (modelLower.includes('bus'))
        return '/images/vehicles/bus.png'
    if (modelLower.includes('van'))
        return '/images/vehicles/van.png'
    if (modelLower.includes('car'))
        return '/images/vehicles/car.png'
    if (modelLower.includes('pickup'))
        return '/images/vehicles/pickup.png'
    // Default vehicle icon
    return '/images/vehicles/default-vehicle.png'
}
const TabBasedVehicleModels = () => {
    // State
    const [value, setValue] = useState('')
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [vehicles, setVehicles] = useState([])
    const [models, setModels] = useState({})
    const API_BASE = '/api/apps'
    const VEHICLES_API = `${API_BASE}/vehicles`
    const handleChange = (event, newValue) => {
        setValue(newValue)
    }
    // Fetch vehicles data
    useEffect(() => {
        const fetchVehicles = async () => {
            try {
                setLoading(true)
                const response = await fetch(VEHICLES_API)
                const result = await response.json()
                if (result.success) {
                    const vehiclesData = result.data || []
                    setVehicles(vehiclesData)
                    // Group vehicles by model
                    const groupedByModel = vehiclesData.reduce((acc, vehicle) => {
                        const model = vehicle.model || 'Unknown Model'
                        if (!acc[model]) {
                            acc[model] = []
                        }
                        acc[model].push(vehicle)
                        return acc
                    }, {})
                    setModels(groupedByModel)
                    // Set first model as default if available
                    const modelKeys = Object.keys(groupedByModel)
                    if (modelKeys.length > 0) {
                        setValue(modelKeys[0])
                    }
                } else {
                    setError('Failed to fetch vehicles data')
                }
            } catch (err) {
                console.error('Error fetching vehicles:', err)
                setError('Failed to fetch data from server')
            } finally {
                setLoading(false)
            }
        }
        fetchVehicles()
    }, [])
    // Format currency
    const formatCurrency = (amount) => {
        if (!amount && amount !== 0) return 'N/A'
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount)
    }
    // Get document status
    const getDocumentStatus = (documents) => {
        if (!documents || !Array.isArray(documents)) return { label: 'No Docs', color: 'default' }
        const expiredDocs = documents.filter(doc => doc.isExpired)
        if (expiredDocs.length === 0) return { label: 'All Valid', color: 'success' }
        if (expiredDocs.length === documents.length) return { label: 'All Expired', color: 'error' }
        return { label: 'Some Expired', color: 'warning' }
    }
    const RenderTabAvatar = ({ model, count }) => (
        <Box className='flex flex-col items-center'>
            <Avatar
                variant='rounded'
                className={classnames(
                    value === model ? 'border-solid border-primary' : 'border-dashed',
                    'is-[92px] bs-[86px] border-2 bg-transparent rounded mb-2'
                )}
            >
                <img
                    src={getVehicleIcon(model)}
                    alt={model}
                    width={50}
                    height={40}
                    className='object-contain'
                />
            </Avatar>
            <Typography variant='caption' className='font-medium text-center'>
                {model}
            </Typography>
            <Chip
                label={`${count} ${count === 1 ? 'Vehicle' : 'Vehicles'}`}
                size='small'
                color={value === model ? 'primary' : 'default'}
                variant={value === model ? 'filled' : 'outlined'}
                className='mt-1'
            />
        </Box>
    )
    const RenderTabContent = ({ data }) => {
        return (
            <div className='overflow-x-auto'>
                <table className={tableStyles.table}>
                    <thead className='border-be border-bs'>
                        <tr>
                            <th className='uppercase bg-transparent'>Vehicle No</th>
                            <th className='uppercase bg-transparent'>Owner</th>
                            <th className='uppercase bg-transparent text-end'>Status</th>
                            <th className='uppercase bg-transparent text-end'>Added On</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.length > 0 ? (
                            data.map((vehicle) => (
                                <tr key={vehicle._id}>
                                    <td>
                                        <Typography variant='body2' fontWeight={500}>
                                            {vehicle.vehicleNo}
                                        </Typography>
                                    </td>
                                    <td>
                                        <Box>
                                            <Typography variant='body2'>{vehicle.ownerName}</Typography>
                                            {vehicle.ownerMobile && (
                                                <Typography variant='caption' color='text.secondary'>
                                                    {vehicle.ownerMobile}
                                                </Typography>
                                            )}
                                        </Box>
                                    </td>
                                    <td className='text-end'>
                                        <Chip
                                            label={vehicle.isActive ? 'Active' : 'Inactive'}
                                            color={vehicle.isActive ? 'success' : 'error'}
                                            size='small'
                                            variant='outlined'
                                        />
                                    </td>
                                    <td className='text-end'>
                                        <Typography variant='caption'>
                                            {new Date(vehicle.createdAt).toLocaleDateString('en-IN', {
                                                day: '2-digit',
                                                month: 'short',
                                                year: 'numeric'
                                            })}
                                        </Typography>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={6} className='text-center p-4'>
                                    <Typography color='text.secondary'>
                                        No vehicles found for this model
                                    </Typography>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        )
    }
    if (loading) {
        return (
            <Card>
                <CardHeader title='Own Vehicles by Model' />
                <Box display='flex' justifyContent='center' alignItems='center' minHeight={400}>
                    <CircularProgress />
                </Box>
            </Card>
        )
    }
    if (error) {
        return (
            <Card>
                <CardHeader title='Vehicles by Model' />
                <Box p={3}>
                    <Alert severity='error'>{error}</Alert>
                </Box>
            </Card>
        )
    }
    const modelKeys = Object.keys(models)
    if (modelKeys.length === 0) {
        return (
            <Card>
                <CardHeader title='Vehicles by Model' />
                <Box p={3} textAlign='center'>
                    <Typography color='text.secondary'>No vehicles found</Typography>
                </Box>
            </Card>
        )
    }
    return (
        <Card>
            <CardHeader
                title='Vehicles by Model'
                subheader={`Total ${vehicles.length} Vehicles • ${modelKeys.length} Models`}
                action={
                    <OptionMenu
                        options={[
                            'Sort by Model',
                            'Sort by Count',
                            'Export List',
                            'Refresh Data'
                        ]}
                    />
                }
            />
            <TabContext value={value}>
                <TabList
                    variant='scrollable'
                    scrollButtons='auto'
                    onChange={handleChange}
                    aria-label='vehicle models tabs'
                    className='!border-be-0 pli-5'
                    sx={{
                        '& .MuiTab-root:not(:last-child)': { mr: 4 },
                        '& .MuiTab-root:hover': { border: 0 },
                        '& .MuiTabs-indicator': { display: 'none !important' },
                        '& .MuiTab-root': { minHeight: 'auto', py: 2 }
                    }}
                >
                    {modelKeys.map((model) => (
                        <Tab
                            key={model}
                            disableRipple
                            value={model}
                            className='p-0'
                            label={
                                <RenderTabAvatar
                                    model={model}
                                    count={models[model].length}
                                />
                            }
                        />
                    ))}
                    <Tab
                        disabled
                        value='add'
                        className='p-0'
                        label={
                            <Box className='flex flex-col items-center'>
                                <Avatar variant='rounded' className='is-[92px] bs-[86px] border-2 border-dashed bg-transparent rounded mb-2'>
                                    <div className='flex justify-center items-center bg-actionSelected rounded-lg p-1'>
                                        <i className='ri-add-line text-textSecondary text-[22px]' />
                                    </div>
                                </Avatar>
                                <Typography variant='caption' className='text-center'>
                                    Add Model
                                </Typography>
                            </Box>
                        }
                    />
                </TabList>
                {modelKeys.map((model) => (
                    <TabPanel key={model} sx={{ p: 0 }} value={model}>
                        <RenderTabContent data={models[model]} />
                    </TabPanel>
                ))}
            </TabContext>
            {/* Summary Footer */}
            <Box className='flex justify-between items-center p-4 border-t'>
                <Box display='flex' gap={2}>
                    <Chip
                        label={`Active: ${vehicles.filter(v => v.isActive).length}`}
                        color='success'
                        size='small'
                        variant='outlined'
                    />
                    <Chip
                        label={`Inactive: ${vehicles.filter(v => !v.isActive).length}`}
                        color='error'
                        size='small'
                        variant='outlined'
                    />
                </Box>
                <Button
                    size='small'
                    color='primary'
                    onClick={() => window.location.reload()}
                >
                    Refresh
                </Button>
            </Box>
        </Card>
    )
}
export default TabBasedVehicleModels
