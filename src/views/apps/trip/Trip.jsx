'use client'
import { useState, useMemo, useEffect } from 'react'
import {
    Card,
    CardContent,
    Button,
    Typography,
    TextField,
    Chip,
    IconButton,
    Tooltip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    MenuItem,
    Radio,
    RadioGroup,
    FormControlLabel,
    CircularProgress,
    Alert,
    Snackbar,
    Autocomplete,
    Box,
    Divider,
    ToggleButton,
    ToggleButtonGroup
} from '@mui/material'
import {
    createColumnHelper,
    getCoreRowModel,
    flexRender,
    useReactTable
} from '@tanstack/react-table'
import tableStyles from '@core/styles/table.module.css'
/* ---------------- CONSTANTS ---------------- */
const columnHelper = createColumnHelper()
const TripInfo = () => {
    /* ---------------- STATE ---------------- */
    const [allData, setAllData] = useState([]) // Store all trips
    const [loading, setLoading] = useState(true)
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
    })
    const [dialogOpen, setDialogOpen] = useState(false)
    const [editingItem, setEditingItem] = useState(null)
    const [formLoading, setFormLoading] = useState(false)
    const [vehiclesList, setVehiclesList] = useState([])
    const [routes, setRoutes] = useState([])
    const [routeOptions, setRouteOptions] = useState([])
    // Add new state for view mode
    const [viewMode, setViewMode] = useState('active') // 'active' or 'all'
    // Status change dialog state
    const [statusDialogOpen, setStatusDialogOpen] = useState(false)
    const [statusDialogData, setStatusDialogData] = useState({
        trip: null,
        newStatus: '',
        remarks: '',
        loading: false
    })
    // Form state
    const [form, setForm] = useState({
        vehicleNo: '',
        driverName: '',
        driverMobile: '',
        vehicleType: '',
        fromLocation: '',
        lhsNo: '',
        toLocation: '',
        tripType: 'Regular',
        dieselLtr: '',
        dieselRate: '',
        totalDieselAmount: 0,
        bankName: '',
        ifscCode: '',
        accountNo: '',
        accountHolderName: '',
        advanceAmount: '',
        totalAdvanceAmount: 0,
        tripStatus: 'active',
        tripDate: new Date().toISOString().split('T')[0],
        initialRemarks: '',
        routeCode: '',           // ← Add this
        distanceKm: 0,            // ← Add this
        selectedRoute: null       // ← Keep this for UI
    });
    const [vehicleDetails, setVehicleDetails] = useState(null)
    const [routeDetails, setRouteDetails] = useState(null)
    /* ---------------- API ENDPOINTS ---------------- */
    const API_BASE = '/api/apps'
    const TRIPS_API = `${API_BASE}/trip`
    const ADVANCES_API = `${API_BASE}/trip/advance`
    const VEHICLES_API = `${API_BASE}/vehicles`
    const LOCATIONS_API = `${API_BASE}/location/info`
    /* ---------------- FILTERED DATA ---------------- */
    // Filter data based on view mode
    const filteredData = useMemo(() => {
        if (viewMode === 'active') {
            return allData.filter(trip =>
                trip.tripStatus === 'active'
            )
        }
        return allData // Show all trips
    }, [allData, viewMode])
    /* ---------------- HELPER: Get active vehicle numbers ---------------- */
    const getActiveVehicleNumbers = useMemo(() => {
        return allData
            .filter(trip => trip.tripStatus === 'active')
            .map(trip => trip.vehicleNo)
            .filter(Boolean)
    }, [allData])
    /* ---------------- HELPER: Filter available vehicles ---------------- */
    const getAvailableVehicles = useMemo(() => {
        if (!editingItem) {
            return vehiclesList.filter(vehicle =>
                !getActiveVehicleNumbers.includes(vehicle.vehicleNo)
            )
        } else {
            const currentVehicleNo = editingItem.vehicleNo
            return vehiclesList.filter(vehicle =>
                vehicle.vehicleNo === currentVehicleNo ||
                !getActiveVehicleNumbers.includes(vehicle.vehicleNo)
            )
        }
    }, [vehiclesList, getActiveVehicleNumbers, editingItem])
    /* ---------------- HELPER: Check if trip can have status actions ---------------- */
    const canHaveStatusActions = (tripStatus) => {
        return tripStatus === 'active'
    }
    /* ---------------- FETCH INITIAL DATA ---------------- */
    useEffect(() => {
        fetchTrips()
        fetchLookupData()
    }, [])
    // const fetchTrips = async () => {
    //     try {
    //         setLoading(true)
    //         const response = await fetch(TRIPS_API)
    //         const result = await response.json()
    //         if (result.success) {
    //             setAllData(result.data || [])
    //         } else {
    //             showSnackbar('Failed to fetch trips: ' + (result.error || result.message), 'error')
    //         }
    //     } catch (error) {
    //         console.error('Error fetching trips:', error)
    //         showSnackbar('Error fetching trips: ' + error.message, 'error')
    //     } finally {
    //         setLoading(false)
    //     }
    // }
    const fetchTrips = async () => {
        try {
            setLoading(true)
            const response = await fetch(TRIPS_API)
            const result = await response.json()
            if (result.success) {
                // For each trip, fetch its advance data
                const tripsWithAdvances = await Promise.all(
                    result.data.map(async (trip) => {
                        try {
                            const advanceResponse = await fetch(
                                `${ADVANCES_API}?tripId=${trip._id}`
                            )
                            const advanceResult = await advanceResponse.json()
                            if (advanceResult.success) {
                                // Calculate paid amount and balance
                                const totalPaid = advanceResult.paidAmount || 0
                                return {
                                    ...trip,
                                    totalPaid: totalPaid,
                                    balance: trip.totalAdvanceAmount - totalPaid,
                                    paidAdvancesCount: advanceResult.paidCount || 0,
                                    unpaidAdvancesCount: advanceResult.unpaidCount || 0,
                                    // Optionally include advance details if needed
                                    advanceDetails: advanceResult.data || []
                                }
                            } else {
                                // If advance API fails, return trip without advance data
                                return {
                                    ...trip,
                                    totalPaid: 0,
                                    balance: trip.totalAdvanceAmount,
                                    paidAdvancesCount: 0,
                                    unpaidAdvancesCount: 0,
                                    advanceDetails: []
                                }
                            }
                        } catch (advanceError) {
                            console.error(`Error fetching advance for trip ${trip._id}:`, advanceError)
                            return {
                                ...trip,
                                totalPaid: 0,
                                balance: trip.totalAdvanceAmount,
                                paidAdvancesCount: 0,
                                unpaidAdvancesCount: 0,
                                advanceDetails: []
                            }
                        }
                    })
                )
                setAllData(tripsWithAdvances || [])
            } else {
                showSnackbar('Failed to fetch trips: ' + (result.error || result.message), 'error')
            }
        } catch (error) {
            console.error('Error fetching trips:', error)
            showSnackbar('Error fetching trips: ' + error.message, 'error')
        } finally {
            setLoading(false)
        }
    }
    const fetchLookupData = async () => {
        try {
            // Fetch vehicles
            const vehiclesResponse = await fetch(VEHICLES_API)
            const vehiclesResult = await vehiclesResponse.json()
            if (vehiclesResult.success) {
                setVehiclesList(vehiclesResult.data || [])
            }
            // Fetch routes
            const routesResponse = await fetch(LOCATIONS_API)
            const routesResult = await routesResponse.json()
            if (routesResult.success) {
                setRoutes(routesResult.data || [])
                const routeOptions = routesResult.data?.map(route => ({
                    id: route._id,
                    routeCode: route.routeCode,
                    displayText: `${route.fromLocation?.locationName || ''} → ${route.viaTo?.locationName || ''} (${route.routeCode || ''})`,
                    fromLocation: route.fromLocation?.locationName || '',
                    toLocation: route.viaTo?.locationName || '',
                    dieselLtr: route.dieselLtr,
                    advanceAmount: route.advanceAmount
                })) || []
                setRouteOptions(routeOptions)
            }
        } catch (error) {
            console.error('Error fetching lookup data:', error)
            showSnackbar('Error loading dropdown data', 'error')
        }
    }
    /* ---------------- VIEW MODE HANDLER ---------------- */
    const handleViewModeChange = (event, newMode) => {
        if (newMode !== null) {
            setViewMode(newMode)
        }
    }
    //================================= Add this function in your component=============================================================
    const checkVehicleTripCount = async (vehicleNo, currentTripId = null) => {
        if (!vehicleNo) {
            return {
                totalCount: 0,
                activeCount: 0,
                activeTrips: [],
                trips: [],
                canCreate: true,
                message: ''
            }
        }
        try {
            console.log('Checking trips for vehicle:', vehicleNo, 'Current trip ID:', currentTripId)
            const response = await fetch(`${TRIPS_API}?vehicleNo=${encodeURIComponent(vehicleNo)}`)
            const result = await response.json()
            console.log('Trip check API response for', vehicleNo, ':', result)
            if (result.success && Array.isArray(result.data)) {
                // Filter trips for this specific vehicle only
                const vehicleTrips = result.data.filter(trip =>
                    trip.vehicleNo === vehicleNo && !trip.isDeleted
                )
                // Filter out current trip if editing
                const trips = currentTripId
                    ? vehicleTrips.filter(trip =>
                        trip._id !== currentTripId && trip.id !== currentTripId
                    )
                    : vehicleTrips
                // Count active trips
                const activeTrips = trips.filter(trip => trip.tripStatus === 'active')
                console.log(`Vehicle ${vehicleNo}: Found ${trips.length} total trips, ${activeTrips.length} active`)
                return {
                    totalCount: trips.length,
                    activeCount: activeTrips.length,
                    activeTrips: activeTrips,
                    trips: trips,
                    canCreate: activeTrips.length < 2,
                    message: activeTrips.length >= 2
                        ? `Vehicle ${vehicleNo} already has ${activeTrips.length} active trips. Maximum 2 active trips allowed.`
                        : ''
                }
            }
            return {
                totalCount: 0,
                activeCount: 0,
                activeTrips: [],
                trips: [],
                canCreate: true,
                message: ''
            }
        } catch (error) {
            console.error('Error checking vehicle trips:', error)
            return {
                totalCount: 0,
                activeCount: 0,
                activeTrips: [],
                trips: [],
                canCreate: true,
                message: ''
            }
        }
    }
    const fetchVehicleDetails = async (vehicleNo) => {
        if (!vehicleNo) {
            setVehicleDetails(null)
            return
        }
        try {
            setFormLoading(true)
            console.log('Fetching details for vehicle:', vehicleNo)
            // Fetch vehicle details
            const response = await fetch(`${VEHICLES_API}?vehicleNo=${encodeURIComponent(vehicleNo)}`)
            const result = await response.json()
            console.log('Vehicle details response:', result)
            if (result.success && result.data) {
                // Handle both array and single object responses
                const vehicle = Array.isArray(result.data)
                    ? result.data.find(v => v.vehicleNo === vehicleNo)
                    : result.data
                if (vehicle) {
                    console.log('Vehicle found:', vehicle)
                    // Make sure we're updating with the CORRECT vehicle
                    if (vehicle.vehicleNo === vehicleNo) {
                        setVehicleDetails(vehicle)
                        setForm(prev => ({
                            ...prev,
                            vehicleNo: vehicle.vehicleNo,
                            driverName: vehicle.driverName || vehicle.driverDetails?.name || vehicle.accountHolderName || '',
                            driverMobile: vehicle.driverMobile || vehicle.driverDetails?.mobile || '',
                            vehicleType: vehicle.model || vehicle.vehicleType || '',
                            bankName: vehicle.bankName || '',
                            ifscCode: vehicle.ifscCode || '',
                            accountNo: vehicle.accountNo || '',
                            accountHolderName: vehicle.accountHolderName || vehicle.driverName || ''
                        }))
                        showSnackbar(`Vehicle ${vehicleNo} details loaded`, 'success')
                    } else {
                        console.error('Vehicle number mismatch:', vehicle.vehicleNo, '!=', vehicleNo)
                        showSnackbar('Error: Vehicle number mismatch', 'error')
                        setForm(prev => ({ ...prev, vehicleNo: '' }))
                    }
                } else {
                    console.log('No vehicle found with number:', vehicleNo)
                    showSnackbar(`Vehicle ${vehicleNo} not found`, 'error')
                    setForm(prev => ({ ...prev, vehicleNo: '' }))
                }
            } else {
                console.log('API returned no data for vehicle:', vehicleNo)
                showSnackbar(`Vehicle ${vehicleNo} not found in database`, 'error')
                setForm(prev => ({ ...prev, vehicleNo: '' }))
            }
        } catch (error) {
            console.error('Error fetching vehicle details:', error)
            showSnackbar('Error loading vehicle details', 'error')
            setForm(prev => ({ ...prev, vehicleNo: '' }))
        } finally {
            setFormLoading(false)
        }
    }
    /* ================= ROUTE AUTO-COMPLETE ================= */
    const fetchRouteDetails = async (fromLocation, toLocation) => {
        if (!fromLocation || !toLocation) {
            setRouteDetails(null)
            return
        }
        try {
            setFormLoading(true)
            const response = await fetch(LOCATIONS_API)
            const result = await response.json()
            if (result.success && result.data) {
                const routes = result.data
                const matchedRoute = routes.find(route =>
                    route.fromLocation?.locationName === fromLocation &&
                    route.viaTo?.locationName === toLocation
                )
                if (matchedRoute) {
                    setRouteDetails(matchedRoute)
                    setForm(prev => ({
                        ...prev,
                        dieselLtr: matchedRoute.dieselLtr || '',
                        advanceAmount: matchedRoute.advanceAmount || ''
                    }))
                    showSnackbar('Route details loaded', 'success')
                } else {
                    showSnackbar('No matching route found', 'error')
                }
            }
        } catch (error) {
            console.error('Error fetching route details:', error)
            showSnackbar('Error loading route details', 'error')
        } finally {
            setFormLoading(false)
        }
    }
    /* ---------------- CALCULATIONS ---------------- */
    const calculateTotalDieselAmount = (dieselLtr, dieselRate) => {
        if (dieselLtr && dieselRate) {
            return (parseFloat(dieselLtr) * parseFloat(dieselRate)).toFixed(2)
        }
        return ''
    }
    const handleDieselChange = (field, value) => {
        const updatedForm = { ...form, [field]: value }
        if ((field === 'dieselLtr' || field === 'dieselRate') &&
            updatedForm.dieselLtr && updatedForm.dieselRate) {
            updatedForm.totalDieselAmount = calculateTotalDieselAmount(
                updatedForm.dieselLtr,
                updatedForm.dieselRate
            )
        }
        setForm(updatedForm)
    }
    // ================Add this function to validate trip date=========================================
    const validateTripDate = async (vehicleNo, selectedDate) => {
        if (!vehicleNo || !selectedDate) return true
        try {
            const response = await fetch(`${TRIPS_API}?vehicleNo=${encodeURIComponent(vehicleNo)}`)
            const result = await response.json()
            if (result.success && result.data) {
                // Filter out current trip if editing
                const trips = editingItem?._id || editingItem?.id
                    ? result.data.filter(trip => trip._id !== editingItem._id && trip.id !== editingItem.id)
                    : result.data
                const tripOnSameDate = trips.some(trip => trip.tripDate === selectedDate)
                if (tripOnSameDate) {
                    showSnackbar(`Vehicle ${vehicleNo} already has a trip on ${selectedDate}. Please select a different date.`, 'warning')
                    return false
                }
            }
            return true
        } catch (error) {
            console.error('Error validating trip date:', error)
            return true
        }
    }
    /* ---------------- FORM HANDLERS ---------------- */
    const handleFormChange = async (field, value) => {
        // For regular fields, just update the form
        if (field !== 'vehicleNo' && field !== 'tripDate') {
            const updatedForm = { ...form, [field]: value }
            setForm(updatedForm)
            // Handle route changes
            if ((field === 'fromLocation' || field === 'toLocation') &&
                updatedForm.fromLocation && updatedForm.toLocation) {
                fetchRouteDetails(
                    updatedForm.fromLocation,
                    updatedForm.toLocation
                )
            }
            return
        }
        // Handle vehicle number change
        if (field === 'vehicleNo') {
            console.log('Vehicle number changed to:', value) // Debug log
            // Clear form first if value is empty
            if (!value) {
                setForm(prev => ({ ...prev, vehicleNo: '' }))
                setVehicleDetails(null)
                return
            }
            // Update the form with new vehicle number immediately
            setForm(prev => ({ ...prev, vehicleNo: value }))
            setVehicleDetails(null)
            try {
                setFormLoading(true)
                // Get current date
                const currentDate = form.tripDate || new Date().toISOString().split('T')[0]
                // Check trips for THIS vehicle (using the new value directly)
                console.log('Checking trips for NEW vehicle:', value)
                const tripCheck = await checkVehicleTripCount(
                    value, // Use the new value directly, not from state
                    editingItem?._id || editingItem?.id
                )
                console.log('Trip check result for', value, ':', tripCheck)
                // For new trips, validate
                if (!editingItem) {
                    // Check for trip on same date
                    const tripOnSameDate = tripCheck.trips.some(trip =>
                        trip.tripDate === currentDate
                    )
                    if (tripOnSameDate) {
                        showSnackbar(`Vehicle ${value} already has a trip on ${currentDate}. Please select a different date or vehicle.`, 'warning')
                        setForm(prev => ({ ...prev, vehicleNo: '' }))
                        setFormLoading(false)
                        return
                    }
                    // Check active trip count
                    if (tripCheck.activeCount >= 2) {
                        showSnackbar(`Vehicle ${value} already has ${tripCheck.activeCount} active trips. Maximum 2 allowed.`, 'warning')
                        setForm(prev => ({ ...prev, vehicleNo: '' }))
                        setFormLoading(false)
                        return
                    }
                }
                // If all validations pass, fetch vehicle details for THIS vehicle
                console.log('All validations passed for', value, '- fetching details')
                await fetchVehicleDetails(value) // Pass the new value directly
            } catch (error) {
                console.error('Error validating vehicle:', error)
                setForm(prev => ({ ...prev, vehicleNo: '' }))
                setFormLoading(false)
            }
        }
        // Handle date change
        if (field === 'tripDate') {
            // Update the date
            setForm(prev => ({ ...prev, tripDate: value }))
            // If we have a vehicle selected, validate the new date
            if (form.vehicleNo && !editingItem) {
                try {
                    setFormLoading(true)
                    // Check trips for the CURRENT vehicle
                    const tripCheck = await checkVehicleTripCount(
                        form.vehicleNo,
                        editingItem?._id || editingItem?.id
                    )
                    const tripOnSameDate = tripCheck.trips.some(trip =>
                        trip.tripDate === value
                    )
                    if (tripOnSameDate) {
                        showSnackbar(`Vehicle ${form.vehicleNo} already has a trip on ${value}. Please select a different date.`, 'warning')
                        // Revert to previous date
                        setForm(prev => ({
                            ...prev,
                            tripDate: prev.tripDate || new Date().toISOString().split('T')[0]
                        }))
                    }
                } catch (error) {
                    console.error('Error validating date:', error)
                } finally {
                    setFormLoading(false)
                }
            }
        }
    }
    /* ---------------- DIALOG HANDLERS ---------------- */
    const openAddDialog = () => {
        setEditingItem(null)
        setVehicleDetails(null)
        setRouteDetails(null)
        setForm({
            vehicleNo: '',
            driverName: '',
            vehicleType: '',
            driverMobile: '',
            fromLocation: '',
            lhsNo: '',
            toLocation: '',
            routeCode: '',
            dieselLtr: '',
            ifscCode: '',
            dieselRate: '',
            accountNo: '',
            totalDieselAmount: '',
            bankName: '',
            advanceAmount: '',
            accountHolderName: '',
            totalAdvanceAmount: '',
            tripStatus: 'active',
            tripDate: new Date().toISOString().split('T')[0],
            selectedRoute: null
        })
        setDialogOpen(true)
    }
    const openEditDialog = async (row) => {
        try {
            setFormLoading(true)
            const response = await fetch(`${TRIPS_API}?id=${row._id || row.id}`)
            const result = await response.json()
            if (result.success && result.data) {
                const trip = result.data
                setEditingItem(trip)
                if (trip.vehicleNo) {
                    fetchVehicleDetails(trip.vehicleNo)
                }
                if (trip.fromLocation && trip.toLocation) {
                    fetchRouteDetails(trip.fromLocation, trip.toLocation)
                }
                // Create a route object from trip data
                // Create a route object from trip data
                const routeObj = trip.fromLocation && trip.toLocation ? {
                    id: trip._id || trip.id,
                    routeCode: trip.routeCode || '',  // ← Make sure this is included
                    displayText: `${trip.fromLocation} → ${trip.toLocation}`,
                    fromLocation: trip.fromLocation,
                    toLocation: trip.toLocation,
                    dieselLtr: trip.dieselLtr || '',
                    advanceAmount: trip.advanceAmount || ''
                } : null
                setForm({
                    vehicleNo: trip.vehicleNo || '',
                    driverName: trip.driverName || '',
                    vehicleType: trip.vehicleType || '',
                    driverMobile: trip.driverMobile || '',
                    fromLocation: trip.fromLocation || '',
                    lhsNo: trip.lhsNo || '',
                    toLocation: trip.toLocation || '',
                    routeCode: '',
                    dieselLtr: trip.dieselLtr || '',
                    ifscCode: trip.ifscCode || '',
                    dieselRate: trip.dieselRate || '',
                    accountNo: trip.accountNo || '',
                    totalDieselAmount: trip.totalDieselAmount || '',
                    bankName: trip.bankName || '',
                    advanceAmount: trip.advanceAmount || '',
                    accountHolderName: trip.accountHolderName || '',
                    totalAdvanceAmount: trip.totalAdvanceAmount || trip.advanceAmount || '',
                    tripStatus: trip.tripStatus || 'active',
                    tripDate: trip.tripDate || new Date().toISOString().split('T')[0],
                    routeCode: trip.routeCode || '',  // ← Also set it directly
                    selectedRoute: routeObj // Set the created route object
                })
                setDialogOpen(true)
            }
        } catch (error) {
            console.error('Error loading trip details:', error)
            showSnackbar('Error loading trip details', 'error')
        } finally {
            setFormLoading(false)
        }
    }
    /* ---------------- STATUS CHANGE DIALOG HANDLERS ---------------- */
    const openStatusChangeDialog = (trip, newStatus) => {
        setStatusDialogData({
            trip,
            newStatus,
            remarks: '',
            loading: false
        })
        setStatusDialogOpen(true)
    }
    const closeStatusChangeDialog = () => {
        setStatusDialogOpen(false)
        setStatusDialogData({
            trip: null,
            newStatus: '',
            remarks: '',
            loading: false
        })
    }
    const handleStatusChangeSubmit = async () => {
        const { trip, newStatus, remarks } = statusDialogData
        if (!remarks.trim()) {
            showSnackbar('Remarks are mandatory for status change', 'error')
            return
        }
        if (!trip) {
            showSnackbar('No trip selected', 'error')
            return
        }
        try {
            setStatusDialogData(prev => ({ ...prev, loading: true }))
            const response = await fetch(TRIPS_API, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id: trip._id || trip.id,
                    tripStatus: newStatus,
                    statusRemarks: remarks.trim(),
                    statusChangedAt: new Date().toISOString()
                })
            })
            const result = await response.json()
            if (result.success) {
                const statusText = newStatus === 'completed' ? 'completed' :
                    newStatus === 'cancelled' ? 'cancelled' : 'closed'
                showSnackbar(`Trip marked as ${statusText}`, 'success')
                fetchTrips()
                closeStatusChangeDialog()
            } else {
                showSnackbar(result.error || `Failed to mark trip as ${newStatus}`, 'error')
            }
        } catch (error) {
            console.error('Error updating trip status:', error)
            showSnackbar('Error updating trip status', 'error')
        } finally {
            setStatusDialogData(prev => ({ ...prev, loading: false }))
        }
    }
    /* ---------------- DELETE HANDLER ---------------- */
    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this trip record?')) return
        try {
            const response = await fetch(TRIPS_API, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id })
            })
            const result = await response.json()
            if (result.success) {
                showSnackbar('Trip deleted successfully', 'success')
                fetchTrips()
            } else {
                showSnackbar(result.error || 'Failed to delete trip', 'error')
            }
        } catch (error) {
            console.error('Error deleting trip:', error)
            showSnackbar('Error deleting trip: ' + error.message, 'error')
        }
    }
    /* ---------------- API SUBMIT HANDLERS ---------------- */
    const handleSubmit = async () => {
        if (!form.vehicleNo || !form.driverName || !form.fromLocation || !form.toLocation) {
            showSnackbar('Please fill in all required fields', 'error')
            return
        }
        try {
            setFormLoading(true)
            // Final validation for trip count and date
            const tripCheck = await checkVehicleTripCount(
                form.vehicleNo,
                editingItem?._id || editingItem?.id
            )
            if (!editingItem) {
                // Check 1: Active trip count (max 2)
                if (tripCheck.activeCount >= 2) {
                    showSnackbar(`Vehicle ${form.vehicleNo} already has ${tripCheck.activeCount} active trips. Maximum 2 active trips allowed.`, 'error')
                    setFormLoading(false)
                    return
                }
                // Check 2: Same date trip (including non-active)
                const tripOnSameDate = tripCheck.trips.some(trip =>
                    trip.tripDate === form.tripDate
                )
                if (tripOnSameDate) {
                    showSnackbar(`Vehicle ${form.vehicleNo} already has a trip on ${form.tripDate}. Please select a different date.`, 'error')
                    setFormLoading(false)
                    return
                }
            }
            const submitData = {
                vehicleNo: form.vehicleNo,
                driverName: form.driverName,
                vehicleType: form.vehicleType,
                driverMobile: form.driverMobile,
                fromLocation: form.fromLocation,
                lhsNo: form.lhsNo,
                toLocation: form.toLocation,
                routeCode: form.routeCode,
                dieselLtr: form.dieselLtr,
                ifscCode: form.ifscCode,
                dieselRate: form.dieselRate,
                accountNo: form.accountNo,
                totalDieselAmount: form.totalDieselAmount,
                bankName: form.bankName,
                advanceAmount: form.advanceAmount,
                accountHolderName: form.accountHolderName,
                totalAdvanceAmount: form.totalAdvanceAmount || form.advanceAmount || 0,
                tripStatus: form.tripStatus,
                tripDate: form.tripDate
            }
            let response, result
            if (editingItem) {
                response = await fetch(TRIPS_API, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        id: editingItem._id || editingItem.id,
                        ...submitData
                    })
                })
                result = await response.json()
                if (result.success) {
                    showSnackbar('Trip updated successfully', 'success')
                    fetchTrips()
                    setDialogOpen(false)
                } else {
                    showSnackbar(result.error || 'Failed to update trip', 'error')
                }
            } else {
                response = await fetch(TRIPS_API, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(submitData)
                })
                result = await response.json()
                if (result.success) {
                    showSnackbar('Trip created successfully', 'success')
                    fetchTrips()
                    setDialogOpen(false)
                } else {
                    showSnackbar(result.error || 'Failed to create trip', 'error')
                }
            }
        } catch (error) {
            console.error('Error saving trip:', error)
            showSnackbar('Error saving trip: ' + error.message, 'error')
        } finally {
            setFormLoading(false)
        }
    }
    /* ---------------- SNACKBAR HANDLER ---------------- */
    const showSnackbar = (message, severity = 'success') => {
        setSnackbar({ open: true, message, severity })
    }
    const handleCloseSnackbar = () => {
        setSnackbar(prev => ({ ...prev, open: false }))
    }
    /* ---------------- TABLE COLUMNS ---------------- */
    const columns = useMemo(
        () => [
            columnHelper.display({
                id: 'actions',
                header: 'Actions',
                cell: ({ row }) => {
                    const trip = row.original
                    const canChangeStatus = canHaveStatusActions(trip.tripStatus)
                    const hasBalance = ((trip.totalAdvanceAmount || 0) - (trip.totalPaid || 0)) > 0
                    return (
                        <div className="flex gap-2">
                            {canChangeStatus && (
                                <>
                                    <Tooltip title="Close Trip">
                                        <IconButton onClick={() => openStatusChangeDialog(trip, 'closed')}>
                                            <i className="ri-shut-down-line text-info" />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Cancel Trip">
                                        <IconButton onClick={() => openStatusChangeDialog(trip, 'cancelled')}>
                                            <i className="ri-close-circle-line text-warning" />
                                        </IconButton>
                                    </Tooltip>
                                </>
                            )}
                            {/* Add Advance Payment Button */}
                            {/* <Tooltip title={canChangeStatus ? "Edit Trip" : "View Trip (Read-only)"}>
                                <span>
                                    <IconButton
                                        onClick={() => openEditDialog(trip)}
                                        disabled={!canChangeStatus}
                                    >
                                        <i className={`ri-edit-line ${canChangeStatus ? 'text-primary' : 'text-gray-400'}`} />
                                    </IconButton>
                                </span>
                            </Tooltip>
                            <Tooltip title={canChangeStatus ? "Delete Trip" : "Cannot delete closed/cancelled trips"}>
                                <span>
                                    <IconButton
                                        onClick={() => canChangeStatus ? handleDelete(trip._id || trip.id) : null}
                                        disabled={!canChangeStatus}
                                    >
                                        <i className={`ri-delete-bin-line ${canChangeStatus ? 'text-error' : 'text-gray-400'}`} />
                                    </IconButton>
                                </span>
                            </Tooltip> */}
                            {!canChangeStatus && (
                                <Tooltip title={`Trip is ${trip.tripStatus}. No further actions allowed.`}>
                                    <Chip
                                        label="Finalized"
                                        size="small"
                                        color="default"
                                        variant="outlined"
                                    />
                                </Tooltip>
                            )}
                        </div>
                    )
                }
            }),
            columnHelper.accessor('tripDate', {
                header: 'Trip Date',
                cell: ({ row }) => {
                    const date = row.original.tripDate
                    return date ? new Date(date).toLocaleDateString('en-IN') : '-'
                }
            }),
            // Your existing columns...
            columnHelper.accessor('vehicleNo', { header: 'Vehicle No.' }),
            columnHelper.accessor('lhsNo', { header: 'LHS No.' }),
            columnHelper.accessor('vehicleType', { header: 'Vehicle Type' }),
            columnHelper.accessor('fromLocation', { header: 'From' }),
            columnHelper.accessor('toLocation', { header: 'To' }),
            columnHelper.accessor('routeCode', { header: 'route Code' }),
            columnHelper.accessor('dieselLtr', { header: 'Litre' }),
            columnHelper.accessor('dieselRate', { header: 'Rate' }),
            columnHelper.accessor('totalDieselAmount', {
                header: 'Diesel Amount',
                cell: ({ row }) => `${row.original.totalDieselAmount || 0}`
            }),
            columnHelper.accessor('advanceAmount', {
                header: 'Advance',
                cell: ({ row }) => `${row.original.advanceAmount || 0}`
            }),
            // Total Advance Amount Column
            columnHelper.accessor('totalAdvanceAmount', {
                header: 'Total Advance',
                cell: ({ row }) => `${row.original.totalAdvanceAmount || 0}`
            }),
            // Paid Amount Column
            columnHelper.display({
                id: 'paidAmount',
                header: 'Paid',
                cell: ({ row }) => {
                    const trip = row.original
                    const totalPaid = trip.totalPaid || 0
                    const paidCount = trip.paidAdvancesCount || 0
                    return (
                        <div className="flex flex-col">
                            <span className="font-medium">{totalPaid}</span>
                            {/* {paidCount > 0 && (
                                <span className="text-xs text-gray-500">
                                    ({paidCount} advance{paidCount > 1 ? 's' : ''})
                                </span>
                            )} */}
                        </div>
                    )
                }
            }),
            // Balance Column
            columnHelper.display({
                id: 'balance',
                header: 'Balance',
                cell: ({ row }) => {
                    const trip = row.original
                    const totalAdvance = trip.totalAdvanceAmount || 0
                    const totalPaid = trip.totalPaid || 0
                    const balance = totalAdvance - totalPaid
                    const unpaidCount = trip.unpaidAdvancesCount || 0
                    // Determine styling based on balance
                    const getBalanceStatus = () => {
                        if (balance === 0) return 'fully-paid'
                        if (balance === totalAdvance) return 'not-paid'
                        return 'partially-paid'
                    }
                    const status = getBalanceStatus()
                    const statusColors = {
                        'fully-paid': 'text-green-600 bg-green-50',
                        'not-paid': 'text-red-600 bg-red-50',
                        'partially-paid': 'text-amber-600 bg-amber-50'
                    }
                    const statusLabels = {
                        'fully-paid': 'Fully Paid',
                        'not-paid': 'Not Paid',
                        'partially-paid': 'Partially Paid'
                    }
                    return (
                        <Tooltip title={statusLabels[status]}>
                            <div className={`flex flex-col p-1 rounded ${statusColors[status]}`}>
                                <span className="font-bold">{balance.toFixed(2)}</span>
                            </div>
                        </Tooltip>
                    )
                }
            }),
            // Add a Balance Summary Chip in Status column
            columnHelper.accessor('tripStatus', {
                header: 'Status',
                cell: ({ row }) => {
                    const trip = row.original
                    const balance = (trip.totalAdvanceAmount || 0) - (trip.totalPaid || 0)
                    return (
                        <div className="flex flex-col gap-1">
                            <Chip
                                label={(trip.tripStatus || 'active').toUpperCase()}
                                color={trip.tripStatus === 'active' ? 'success' :
                                    trip.tripStatus === 'cancelled' ? 'error' :
                                        trip.tripStatus === 'closed' ? 'primary' : 'default'}
                                size="small"
                            />
                            {balance === 0 && trip.totalAdvanceAmount > 0 && (
                                <Chip
                                    label="Advance Paid"
                                    color="success"
                                    size="small"
                                    variant="outlined"
                                />
                            )}
                        </div>
                    )
                }
            }),
            columnHelper.accessor('statusRemarks', {
                header: 'Remarks',
                cell: ({ row }) => (
                    <Tooltip title={row.original.statusRemarks || 'No remarks'}>
                        <span style={{
                            display: 'inline-block',
                            maxWidth: '200px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                        }}>
                            {row.original.statusRemarks || '-'}
                        </span>
                    </Tooltip>
                )
            }),
        ],
        []
    )
    const table = useReactTable({
        data: filteredData, // Use filtered data instead of allData
        columns,
        getCoreRowModel: getCoreRowModel()
    })
    /* ---------------- UI ---------------- */
    return (
        <>
            <Card>
                <CardContent className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <Typography variant="h5">Trip Information</Typography>
                        <ToggleButtonGroup
                            value={viewMode}
                            exclusive
                            onChange={handleViewModeChange}
                            size="small"
                        >
                            <ToggleButton value="active">
                                Active Trips Only
                            </ToggleButton>
                            <ToggleButton value="all">
                                Show All Trips
                            </ToggleButton>
                        </ToggleButtonGroup>
                        <Chip
                            label={`${filteredData.length} trip(s)`}
                            size="small"
                            color="primary"
                            variant="outlined"
                        />
                    </div>
                    <div className="flex gap-2 items-center">
                        {loading && <CircularProgress size={20} />}
                        <Button
                            variant="contained"
                            onClick={openAddDialog}
                            startIcon={<i className="ri-add-line" />}
                            disabled={loading}
                        >
                            Add New Trip
                        </Button>
                    </div>
                </CardContent>
                {loading ? (
                    <div className="flex justify-center p-8">
                        <CircularProgress />
                    </div>
                ) : filteredData.length === 0 ? (
                    <div className="p-8 text-center">
                        {viewMode === 'active' ? (
                            <Typography color="textSecondary">
                                No active trips found. {allData.length > 0 ? `There are ${allData.length} closed/cancelled trips.` : 'Create your first trip!'}
                            </Typography>
                        ) : (
                            <Typography color="textSecondary">No trips found. Create your first trip!</Typography>
                        )}
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className={tableStyles.table}>
                            <thead>
                                {table.getHeaderGroups().map(hg => (
                                    <tr key={hg.id}>
                                        {hg.headers.map(h => (
                                            <th key={h.id}>
                                                {flexRender(h.column.columnDef.header, h.getContext())}
                                            </th>
                                        ))}
                                    </tr>
                                ))}
                            </thead>
                            <tbody>
                                {table.getRowModel().rows.map(row => (
                                    <tr key={row.id}>
                                        {row.getVisibleCells().map(cell => (
                                            <td key={cell.id}>
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>
            {/* ---------------- ADD/EDIT DIALOG ---------------- */}
            <Dialog
                open={dialogOpen}
                onClose={() => !formLoading && setDialogOpen(false)}
                fullWidth
                maxWidth="lg"
            >
                <DialogTitle>
                    {editingItem ? 'Edit Trip Information' : 'Add New Trip'}
                    {formLoading && <CircularProgress size={20} sx={{ ml: 2 }} />}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 2 }}>
                        {/* Vehicle & Driver Information */}
                        <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
                            Vehicle & Driver Information
                        </Typography>
                        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2, mb: 3 }}>
                            <Autocomplete
                                freeSolo
                                options={getAvailableVehicles.map(v => v.vehicleNo).filter(Boolean)}
                                value={form.vehicleNo}
                                onChange={(_, newValue) => {
                                    if (newValue) {
                                        fetchVehicleDetails(newValue)
                                    } else {
                                        setVehicleDetails(null)
                                        setForm(prev => ({
                                            ...prev,
                                            vehicleNo: '',
                                            driverName: '',
                                            driverMobile: '',
                                            vehicleType: '',
                                            bankName: '',
                                            ifscCode: '',
                                            accountNo: '',
                                            accountHolderName: ''
                                        }))
                                    }
                                }}
                                onInputChange={(_, newValue) => {
                                    if (!newValue) setVehicleDetails(null)
                                    handleFormChange('vehicleNo', newValue)
                                }}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Vehicle No*"
                                        required
                                        disabled={formLoading}
                                        size="small"
                                    />
                                )}
                            />
                            <TextField
                                label="Driver Name*"
                                value={form.driverName}
                                InputProps={{ readOnly: !!vehicleDetails }}
                                required
                                disabled={formLoading}
                                size="small"
                            />
                            <TextField
                                label="Driver Mobile"
                                value={form.driverMobile}
                                InputProps={{ readOnly: !!vehicleDetails }}
                                disabled={formLoading}
                                size="small"
                            />
                            <TextField
                                label="Vehicle Type"
                                value={form.vehicleType}
                                InputProps={{
                                    readOnly: true,
                                }}
                                disabled={formLoading}
                                size="small"
                            />
                        </Box>
                        <Divider sx={{ my: 3 }} />
                        {/* Route Information */}
                        <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
                            Route Information
                        </Typography>
                        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2, mb: 3 }}>
                            {/* <Autocomplete
                                freeSolo
                                options={routeOptions}
                                getOptionLabel={(option) =>
                                    typeof option === 'string' ? option : option.displayText
                                }
                                value={form.selectedRoute || null}
                                onChange={(_, newValue) => {
                                    if (newValue) {
                                        setForm(prev => ({
                                            ...prev,
                                            selectedRoute: newValue,
                                            fromLocation: newValue.fromLocation,
                                            toLocation: newValue.toLocation,
                                            dieselLtr: newValue.dieselLtr || '',
                                            advanceAmount: newValue.advanceAmount || ''
                                        }))
                                        setRouteDetails(newValue)
                                    } else {
                                        setForm(prev => ({
                                            ...prev,
                                            selectedRoute: null,
                                            fromLocation: '',
                                            toLocation: '',
                                            dieselLtr: '',
                                            advanceAmount: ''
                                        }))
                                        setRouteDetails(null)
                                    }
                                }}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Select Route*"
                                        required
                                        disabled={formLoading}
                                        size="small"
                                    />
                                )}
                            /> */}
                            <Autocomplete
                                freeSolo
                                options={routeOptions}
                                getOptionLabel={(option) =>
                                    typeof option === 'string' ? option : option.displayText
                                }
                                value={form.selectedRoute || null}
                                onChange={(_, newValue) => {
                                    if (newValue) {
                                        setForm(prev => ({
                                            ...prev,
                                            selectedRoute: newValue,
                                            fromLocation: newValue.fromLocation,
                                            toLocation: newValue.toLocation,
                                            dieselLtr: newValue.dieselLtr || '',
                                            advanceAmount: newValue.advanceAmount || '',
                                            routeCode: newValue.routeCode || ''  // ← ADD THIS LINE
                                        }))
                                        setRouteDetails(newValue)
                                    } else {
                                        setForm(prev => ({
                                            ...prev,
                                            selectedRoute: null,
                                            fromLocation: '',
                                            toLocation: '',
                                            dieselLtr: '',
                                            advanceAmount: '',
                                            routeCode: ''  // ← ADD THIS LINE
                                        }))
                                        setRouteDetails(null)
                                    }
                                }}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Select Route*"
                                        required
                                        disabled={formLoading}
                                        size="small"
                                    />
                                )}
                            />
                            <TextField
                                label="LHS No."
                                value={form.lhsNo}
                                onChange={e => handleFormChange('lhsNo', e.target.value)}
                                disabled={formLoading}
                                size="small"
                            />
                            <TextField
                                label="Trip Date"
                                type="date"
                                value={form.tripDate}
                                onChange={e => handleFormChange('tripDate', e.target.value)}
                                InputLabelProps={{ shrink: true }}
                                disabled={formLoading}
                                size="small"
                            />
                        </Box>
                        <Divider sx={{ my: 3 }} />
                        {/* Diesel & Financial Information */}
                        <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
                            Diesel & Financial Information
                        </Typography>
                        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2, mb: 3 }}>
                            <TextField
                                label="Diesel (Ltr)"
                                type="number"
                                value={form.dieselLtr}
                                onChange={e => handleDieselChange('dieselLtr', e.target.value)}
                                InputProps={{ readOnly: !!routeDetails }}
                                disabled={formLoading}
                                size="small"
                                InputLabelProps={{ shrink: true }}
                            />
                            <TextField
                                label="Diesel Rate"
                                type="number"
                                value={form.dieselRate}
                                onChange={e => handleDieselChange('dieselRate', e.target.value)}
                                disabled={formLoading}
                                size="small"
                                InputLabelProps={{ shrink: true }}
                            />
                            <TextField
                                label="Total Diesel Amount"
                                value={form.totalDieselAmount}
                                InputProps={{
                                    readOnly: true,
                                    startAdornment: <span className="mr-2"></span>
                                }}
                                disabled={formLoading}
                                size="small"
                            />
                            <TextField
                                label="Advance Amount"
                                type="number"
                                value={form.advanceAmount}
                                onChange={e => handleFormChange('advanceAmount', e.target.value)}
                                InputProps={{ readOnly: !!routeDetails }}
                                disabled={formLoading}
                                size="small"
                                InputLabelProps={{ shrink: true }}
                            />
                            <TextField
                                label="Total Advance Amount"
                                value={
                                    (Number(form.advanceAmount) || 0) +
                                    (Number(form.totalDieselAmount) || 0)
                                }
                                InputProps={{
                                    readOnly: true,
                                    startAdornment: <span className="mr-2"></span>
                                }}
                                disabled={formLoading}
                                size="small"
                            />
                        </Box>
                        <Divider sx={{ my: 3 }} />
                        {/* Bank Details */}
                        <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
                            Bank Details
                        </Typography>
                        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2, mb: 3 }}>
                            <TextField
                                label="Bank Name"
                                value={form.bankName}
                                InputProps={{ readOnly: !!vehicleDetails }}
                                disabled={formLoading}
                                size="small"
                            />
                            <TextField
                                label="IFSC Code"
                                value={form.ifscCode}
                                InputProps={{ readOnly: !!vehicleDetails }}
                                disabled={formLoading}
                                size="small"
                            />
                            <TextField
                                label="Account No."
                                value={form.accountNo}
                                InputProps={{ readOnly: !!vehicleDetails }}
                                disabled={formLoading}
                                size="small"
                            />
                            <TextField
                                label="Account Holder Name"
                                value={form.accountHolderName}
                                InputProps={{ readOnly: !!vehicleDetails }}
                                disabled={formLoading}
                                size="small"
                            />
                        </Box>
                        <Divider sx={{ my: 3 }} />
                        {/* Trip Status - UPDATED */}
                        <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
                            Trip Status
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <RadioGroup
                                row
                                value={form.tripStatus}
                                onChange={e => handleFormChange('tripStatus', e.target.value)}
                            >
                                {/* For ADD mode (creating new trip): Show only "Active" */}
                                {!editingItem ? (
                                    <FormControlLabel
                                        value="active"
                                        control={<Radio />}
                                        label="Active"
                                        disabled={formLoading}
                                    />
                                ) : (
                                    /* For EDIT mode: Show all status options based on current trip status */
                                    <>
                                        {form.tripStatus === 'active' && (
                                            <FormControlLabel
                                                value="active"
                                                control={<Radio />}
                                                label="Active"
                                                disabled={formLoading}
                                            />
                                        )}
                                        <FormControlLabel
                                            value="cancelled"
                                            control={<Radio />}
                                            label="Cancelled"
                                            disabled={formLoading || !canHaveStatusActions(editingItem.tripStatus)}
                                        />
                                        <FormControlLabel
                                            value="closed"
                                            control={<Radio />}
                                            label="Closed"
                                            disabled={formLoading || !canHaveStatusActions(editingItem.tripStatus)}
                                        />
                                    </>
                                )}
                            </RadioGroup>
                        </Box>
                        {/* Warning message for non-active trips in EDIT mode */}
                        {editingItem && !canHaveStatusActions(editingItem.tripStatus) && (
                            <Alert severity="warning" sx={{ mt: 2 }}>
                                This trip is already {editingItem.tripStatus}. You can only view the details.
                            </Alert>
                        )}
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => setDialogOpen(false)}
                        disabled={formLoading}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleSubmit}
                        disabled={formLoading || (editingItem && !canHaveStatusActions(editingItem.tripStatus))}
                        startIcon={formLoading && <CircularProgress size={16} />}
                    >
                        {editingItem ? 'Update Trip' : 'Create Trip'}
                    </Button>
                </DialogActions>
            </Dialog>
            {/* ---------------- STATUS CHANGE DIALOG ---------------- */}
            <Dialog
                open={statusDialogOpen}
                onClose={() => !statusDialogData.loading && closeStatusChangeDialog()}
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle>
                    Change Trip Status
                    {statusDialogData.loading && <CircularProgress size={20} sx={{ ml: 2 }} />}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 2 }}>
                        <Typography variant="body1" gutterBottom>
                            Trip: <strong>{statusDialogData.trip?.vehicleNo}</strong> - {statusDialogData.trip?.fromLocation} → {statusDialogData.trip?.toLocation}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                            Current Status: <strong>{statusDialogData.trip?.tripStatus?.toUpperCase()}</strong>
                        </Typography>
                        <Typography variant="body2" gutterBottom sx={{ mt: 2, mb: 1 }}>
                            New Status: <strong>{statusDialogData.newStatus?.toUpperCase()}</strong>
                        </Typography>
                        <Alert severity="info" sx={{ mb: 2 }}>
                            Once marked as {statusDialogData.newStatus}, this trip cannot be changed again.
                        </Alert>
                        <TextField
                            label="Remarks*"
                            value={statusDialogData.remarks}
                            onChange={(e) => setStatusDialogData(prev => ({
                                ...prev,
                                remarks: e.target.value
                            }))}
                            fullWidth
                            multiline
                            rows={4}
                            placeholder="Enter remarks for status change..."
                            required
                            error={!statusDialogData.remarks.trim()}
                            helperText={!statusDialogData.remarks.trim() ? "Remarks are mandatory" : ""}
                            disabled={statusDialogData.loading}
                            sx={{ mt: 2 }}
                        />
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                            *Remarks are required to document the reason for status change
                        </Typography>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={closeStatusChangeDialog}
                        disabled={statusDialogData.loading}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleStatusChangeSubmit}
                        disabled={statusDialogData.loading || !statusDialogData.remarks.trim()}
                        startIcon={statusDialogData.loading && <CircularProgress size={16} />}
                        color={
                            statusDialogData.newStatus === 'completed' ? 'success' :
                                statusDialogData.newStatus === 'cancelled' ? 'warning' :
                                    statusDialogData.newStatus === 'closed' ? 'info' : 'primary'
                        }
                    >
                        Confirm {statusDialogData.newStatus === 'completed' ? 'Complete' :
                            statusDialogData.newStatus === 'cancelled' ? 'Cancel' :
                                statusDialogData.newStatus === 'closed' ? 'Close' : 'Update'}
                    </Button>
                </DialogActions>
            </Dialog>
            {/* ---------------- SNACKBAR ---------------- */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert
                    onClose={handleCloseSnackbar}
                    severity={snackbar.severity}
                    variant="filled"
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </>
    )
}
export default TripInfo
