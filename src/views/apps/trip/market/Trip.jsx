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
    Autocomplete
} from '@mui/material'
import {
    createColumnHelper,
    getCoreRowModel,
    flexRender,
    useReactTable
} from '@tanstack/react-table'
import tableStyles from '@core/styles/table.module.css'
/* ---------------- CONSTANTS ---------------- */
const tripTypes = [
    { id: 1, label: 'Regular' },
    { id: 2, label: 'Special' },
    { id: 3, label: 'Emergency' }
]
const columnHelper = createColumnHelper()
const TripInfo = () => {
    /* ---------------- STATE ---------------- */
    const [data, setData] = useState([])
    const [loading, setLoading] = useState(true)
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
    })
    const [dialogOpen, setDialogOpen] = useState(false)
    const [editingItem, setEditingItem] = useState(null)
    const [formLoading, setFormLoading] = useState(false)
    const [locations, setLocations] = useState([])
    const [vehiclesList, setVehiclesList] = useState([])
    const [routes, setRoutes] = useState([]);
    const [routeOptions, setRouteOptions] = useState([]);
    // Form state
    const [form, setForm] = useState({
        vehicleNo: '',
        driverName: '',
        vehicleType: '',
        driverMobile: '',
        fromLocation: '',
        lhsNo: '',
        toLocation: '',
        tripType: '',
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
        tripDate: new Date().toISOString().split('T')[0]
    })
    // Store original vehicle and route data for readonly fields
    const [vehicleDetails, setVehicleDetails] = useState(null)
    const [routeDetails, setRouteDetails] = useState(null)
    /* ---------------- API ENDPOINTS ---------------- */
    const API_BASE = '/api/apps'
    const TRIPS_API = `${API_BASE}/trip/market`
    const VEHICLES_API = `${API_BASE}/vehicles/market`
    const LOCATIONS_API = `${API_BASE}/location/info`
    /* ---------------- HELPER: Get active vehicle numbers ---------------- */
    const getActiveVehicleNumbers = useMemo(() => {
        // Extract vehicle numbers that have active trips
        return data
            .filter(trip => trip.tripStatus === 'active')
            .map(trip => trip.vehicleNo)
            .filter(Boolean);
    }, [data]);
    /* ---------------- HELPER: Filter available vehicles ---------------- */
    const getAvailableVehicles = useMemo(() => {
        if (!editingItem) {
            // When adding new trip, exclude vehicles with active trips
            return vehiclesList.filter(vehicle =>
                !getActiveVehicleNumbers.includes(vehicle.vehicleNo)
            );
        } else {
            // When editing, include the current vehicle (even if active)
            // and all other non-active vehicles
            const currentVehicleNo = editingItem.vehicleNo;
            return vehiclesList.filter(vehicle =>
                vehicle.vehicleNo === currentVehicleNo ||
                !getActiveVehicleNumbers.includes(vehicle.vehicleNo)
            );
        }
    }, [vehiclesList, getActiveVehicleNumbers, editingItem]);
    /* ---------------- FETCH INITIAL DATA ---------------- */
    useEffect(() => {
        fetchTrips()
        fetchLookupData()
    }, [])
    const fetchTrips = async () => {
        try {
            setLoading(true)
            const response = await fetch(TRIPS_API)
            const result = await response.json()
            if (result.success) {
                setData(result.data || [])
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
            const vehiclesResponse = await fetch(VEHICLES_API);
            const vehiclesResult = await vehiclesResponse.json();
            if (vehiclesResult.success) {
                setVehiclesList(vehiclesResult.data || []);
            }
            // Fetch routes
            const routesResponse = await fetch(LOCATIONS_API);
            const routesResult = await routesResponse.json();
            if (routesResult.success) {
                // Store all routes for matching
                setRoutes(routesResult.data || []);
                // Create a map for route selection (for dropdowns)
                const routeOptions = routesResult.data?.map(route => ({
                    id: route._id,
                    routeCode: route.routeCode,
                    displayText: `${route.fromLocation.locationName} → ${route.viaTo.locationName} (${route.routeCode})`,
                    fromLocation: route.fromLocation.locationName,
                    toLocation: route.viaTo.locationName,
                    vehicleType: route.vehicleType?.vehicleType,
                    dieselLtr: route.dieselLtr,
                    advanceAmount: route.advanceAmount
                })) || [];
                setRouteOptions(routeOptions);
            }
        } catch (error) {
            console.error('Error fetching lookup data:', error);
            showSnackbar('Error loading dropdown data', 'error');
        }
    };
    /* ================= VEHICLE AUTO-COMPLETE ================= */
    const fetchVehicleDetails = async (vehicleNo) => {
        if (!vehicleNo) {
            setVehicleDetails(null)
            return
        }
        try {
            setFormLoading(true)
            // Fetch vehicle details
            const response = await fetch(`${VEHICLES_API}?vehicleNo=${encodeURIComponent(vehicleNo)}`)
            const result = await response.json()
            if (result.success && result.data) {
                const vehicle = Array.isArray(result.data) ? result.data[0] : result.data
                if (vehicle) {
                    const hasActiveTrip = getActiveVehicleNumbers.includes(vehicleNo);
                    const isEditingCurrentVehicle = editingItem && editingItem.vehicleNo === vehicleNo;
                    if (hasActiveTrip && !isEditingCurrentVehicle && !editingItem) {
                        showSnackbar(`Vehicle ${vehicleNo} already has an active trip. Please complete the current trip first.`, 'warning');
                        // Clear the vehicle selection
                        setForm(prev => ({
                            ...prev,
                            vehicleNo: ''
                        }));
                        setVehicleDetails(null);
                        return;
                    }
                    // Store vehicle details
                    setVehicleDetails(vehicle)
                    // Auto-fill readonly fields
                    setForm(prev => ({
                        ...prev,
                        vehicleNo: vehicle.vehicleNo || vehicleNo,
                        // Driver details (readonly)
                        driverName: vehicle.driverName ||
                            vehicle.driverDetails?.name ||
                            vehicle.accountHolderName ||
                            '',
                        driverMobile: vehicle.driverMobile ||
                            vehicle.driverDetails?.mobile ||
                            '',
                        // Vehicle type (readonly)
                        vehicleType: vehicle.vehicleModel ||
                            vehicle.vehicleType ||
                            '',
                        // Bank details (readonly)
                        bankName: vehicle.bankName || '',
                        ifscCode: vehicle.ifscCode || '',
                        accountNo: vehicle.accountNo || '',
                        accountHolderName: vehicle.accountHolderName ||
                            vehicle.driverName ||
                            ''
                    }))
                    showSnackbar('Vehicle details loaded successfully', 'success')
                } else {
                    showSnackbar('Vehicle not found', 'warning')
                    setVehicleDetails(null)
                }
            } else {
                showSnackbar('Vehicle not found in system', 'warning')
                setVehicleDetails(null)
            }
        } catch (error) {
            console.error('Error fetching vehicle details:', error)
            showSnackbar('Error loading vehicle details', 'error')
            setVehicleDetails(null)
        } finally {
            setFormLoading(false)
        }
    }
    /* ================= ROUTE AUTO-COMPLETE ================= */
    const fetchRouteDetails = async (fromLocation, toLocation, vehicleType) => {
        if (!fromLocation || !toLocation) {
            setRouteDetails(null)
            return
        }
        try {
            setFormLoading(true)
            // Fetch all routes
            const response = await fetch(LOCATIONS_API)
            const result = await response.json()
            if (result.success && result.data) {
                const routes = result.data
                let matchedRoute = null
                // First try exact match with vehicle type
                if (vehicleType) {
                    matchedRoute = routes.find(route =>
                        route.fromLocation?.locationName === fromLocation &&
                        route.viaTo?.locationName === toLocation &&
                        route.vehicleType?.vehicleType === vehicleType
                    )
                }
                // If no exact match, try without vehicle type
                if (!matchedRoute) {
                    matchedRoute = routes.find(route =>
                        route.fromLocation?.locationName === fromLocation &&
                        route.viaTo?.locationName === toLocation
                    )
                }
                if (matchedRoute) {
                    // Store route details
                    setRouteDetails(matchedRoute)
                    // Auto-fill readonly fields
                    setForm(prev => ({
                        ...prev,
                        // Vehicle type from route (if not already set)
                        vehicleType: matchedRoute.vehicleType?.vehicleType || prev.vehicleType,
                        // Diesel and advance (readonly)
                        dieselLtr: matchedRoute.dieselLtr || '',
                        advanceAmount: matchedRoute.advanceAmount || ''
                    }))
                    showSnackbar('Route details loaded successfully', 'success')
                } else {
                    showSnackbar('Route not found for selected locations', 'warning')
                    setRouteDetails(null)
                    // Clear route-specific fields
                    setForm(prev => ({
                        ...prev,
                        dieselLtr: '',
                        advanceAmount: ''
                    }))
                }
            }
        } catch (error) {
            console.error('Error fetching route details:', error)
            showSnackbar('Error loading route details', 'error')
            setRouteDetails(null)
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
    /* ---------------- FORM HANDLERS ---------------- */
    const handleFormChange = (field, value) => {
        const updatedForm = { ...form, [field]: value }
        setForm(updatedForm)
        // Auto-fetch vehicle details when vehicleNo changes
        if (field === 'vehicleNo' && value) {
            fetchVehicleDetails(value)
        }
        // Auto-fetch route details when both locations are entered
        if ((field === 'fromLocation' || field === 'toLocation' || field === 'vehicleType') &&
            updatedForm.fromLocation && updatedForm.toLocation) {
            fetchRouteDetails(
                updatedForm.fromLocation,
                updatedForm.toLocation,
                updatedForm.vehicleType
            )
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
            tripType: '',
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
            tripDate: new Date().toISOString().split('T')[0]
        })
        setDialogOpen(true)
    }
    const openEditDialog = async (row) => {
        try {
            setFormLoading(true)
            // Fetch single trip details
            const response = await fetch(`${TRIPS_API}?id=${row._id || row.id}`)
            const result = await response.json()
            if (result.success && result.data) {
                const trip = result.data
                setEditingItem(trip)
                // Load vehicle and route details for the trip
                if (trip.vehicleNo) {
                    fetchVehicleDetails(trip.vehicleNo)
                }
                if (trip.fromLocation && trip.toLocation) {
                    fetchRouteDetails(trip.fromLocation, trip.toLocation, trip.vehicleType)
                }
                setForm({
                    vehicleNo: trip.vehicleNo || '',
                    driverName: trip.driverName || '',
                    vehicleType: trip.vehicleType || '',
                    driverMobile: trip.driverMobile || '',
                    fromLocation: trip.fromLocation || '',
                    lhsNo: trip.lhsNo || '',
                    toLocation: trip.toLocation || '',
                    tripType: trip.tripType || '',
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
                    tripDate: trip.tripDate || new Date().toISOString().split('T')[0]
                })
                setDialogOpen(true)
            } else {
                showSnackbar('Failed to load trip details', 'error')
            }
        } catch (error) {
            console.error('Error loading trip details:', error)
            showSnackbar('Error loading trip details', 'error')
        } finally {
            setFormLoading(false)
        }
    }
    /* ---------------- API SUBMIT HANDLERS ---------------- */
    const handleSubmit = async () => {
        // Validation
        if (!form.vehicleNo || !form.driverName || !form.fromLocation || !form.toLocation) {
            showSnackbar('Please fill in all required fields', 'error')
            return
        }
        try {
            setFormLoading(true)
            // Prepare data for API
            const submitData = {
                vehicleNo: form.vehicleNo,
                driverName: form.driverName,
                vehicleType: form.vehicleType,
                driverMobile: form.driverMobile,
                fromLocation: form.fromLocation,
                lhsNo: form.lhsNo,
                toLocation: form.toLocation,
                tripType: form.tripType,
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
                // Update existing trip
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
                    fetchTrips() // Refresh data
                    setDialogOpen(false)
                } else {
                    showSnackbar(result.error || 'Failed to update trip', 'error')
                }
            } else {
                // Check if vehicle already has active trip
                const hasActiveTrip = getActiveVehicleNumbers.includes(form.vehicleNo);
                if (hasActiveTrip) {
                    showSnackbar(`Vehicle ${form.vehicleNo} already has an active trip. Please complete the current trip first.`, 'error');
                    setFormLoading(false);
                    return;
                }
                // Create new trip
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
                    fetchTrips() // Refresh data
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
                fetchTrips() // Refresh data
            } else {
                showSnackbar(result.error || 'Failed to delete trip', 'error')
            }
        } catch (error) {
            console.error('Error deleting trip:', error)
            showSnackbar('Error deleting trip: ' + error.message, 'error')
        }
    }
    /* ---------------- SNACKBAR HANDLER ---------------- */
    const showSnackbar = (message, severity = 'success') => {
        setSnackbar({
            open: true,
            message,
            severity
        })
    }
    const handleCloseSnackbar = () => {
        setSnackbar(prev => ({ ...prev, open: false }))
    }
    /* ---------------- TABLE COLUMNS ---------------- */
    const columns = useMemo(
        () => [
            columnHelper.accessor('_id', {
                header: 'Trip ID',
                cell: ({ row }) => row.original._id?.substring(0, 8) || row.original.id
            }),
            columnHelper.accessor('vehicleNo', { header: 'Vehicle No.' }),
            columnHelper.accessor('driverName', {
                header: 'Driver Name',
                cell: ({ row }) => (
                    <Tooltip title={row.original.driverName}>
                        <span className="truncate max-w-[150px] block">
                            {row.original.driverName}
                        </span>
                    </Tooltip>
                )
            }),
            columnHelper.accessor('vehicleType', { header: 'Vehicle Type' }),
            columnHelper.accessor('fromLocation', { header: 'From' }),
            columnHelper.accessor('toLocation', { header: 'To' }),
            columnHelper.accessor('tripType', { header: 'Trip Type' }),
            columnHelper.accessor('dieselLtr', { header: 'Diesel (Ltr)' }),
            columnHelper.accessor('totalDieselAmount', {
                header: 'Diesel Amount',
                cell: ({ row }) => `${row.original.totalDieselAmount || 0}`
            }),
            columnHelper.accessor('advanceAmount', {
                header: 'Advance',
                cell: ({ row }) => `${row.original.advanceAmount || 0}`
            }),
            columnHelper.accessor('tripStatus', {
                header: 'Status',
                cell: ({ row }) => (
                    <Chip
                        label={(row.original.tripStatus || 'active').toUpperCase()}
                        color={row.original.tripStatus === 'active' ? 'success' :
                            row.original.tripStatus === 'completed' ? 'primary' : 'warning'}
                        size="small"
                    />
                )
            }),
            columnHelper.accessor('tripDate', { header: 'Trip Date' }),
            columnHelper.display({
                id: 'actions',
                header: 'Actions',
                cell: ({ row }) => (
                    <div className="flex gap-2">
                        <Tooltip title="Edit Trip">
                            <IconButton onClick={() => openEditDialog(row.original)}>
                                <i className="ri-edit-line text-primary" />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Trip">
                            <IconButton onClick={() => handleDelete(row.original._id || row.original.id)}>
                                <i className="ri-delete-bin-line text-error" />
                            </IconButton>
                        </Tooltip>
                    </div>
                )
            })
        ],
        []
    )
    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel()
    })
    /* ---------------- UI ---------------- */
    return (
        <>
            <Card>
                <CardContent className="flex justify-between items-center">
                    <Typography variant="h5">Trip Information</Typography>
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
                ) : data.length === 0 ? (
                    <div className="p-8 text-center">
                        <Typography color="textSecondary">No trips found. Create your first trip!</Typography>
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
            {/* ---------------- DIALOG ---------------- */}
            <Dialog
                open={dialogOpen}
                onClose={() => !formLoading && setDialogOpen(false)}
                fullWidth
                maxWidth="md"
            >
                <DialogTitle>
                    {editingItem ? 'Edit Trip Information' : 'Add New Trip'}
                    {formLoading && <CircularProgress size={20} sx={{ ml: 2 }} />}
                </DialogTitle>
                <DialogContent className="flex flex-col gap-4 pt-4">
                    <div className="grid grid-cols-2 gap-4">
                        {/* Vehicle No (Editable) */}
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
                                if (!newValue) {
                                    setVehicleDetails(null)
                                }
                                handleFormChange('vehicleNo', newValue)
                            }}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Vehicle No*"
                                    required
                                    disabled={formLoading}
                                    helperText={
                                        editingItem
                                            ? "Editing current trip - vehicle can't be changed"
                                            : "Select vehicle to auto-fill details"
                                    }
                                    placeholder="Type or select vehicle"
                                />
                            )}
                        />
                        {/* Driver Name (Readonly from vehicle) */}
                        <TextField
                            label="Driver Name*"
                            value={form.driverName}
                            InputProps={{
                                readOnly: !!vehicleDetails,
                            }}
                            fullWidth
                            required
                            disabled={formLoading}
                            helperText={vehicleDetails ? "Auto-filled from vehicle" : ""}
                        />
                        {/* Vehicle Type (Readonly from vehicle/route) */}
                        <TextField
                            label="Vehicle Type"
                            value={form.vehicleType}
                            InputProps={{
                                readOnly: !!vehicleDetails || !!routeDetails,
                            }}
                            fullWidth
                            disabled={formLoading}
                            helperText={
                                vehicleDetails ? "From vehicle" :
                                    routeDetails ? "From route" : ""
                            }
                        />
                        {/* Driver Mobile (Readonly from vehicle) */}
                        <TextField
                            label="Driver Mobile"
                            type="tel"
                            value={form.driverMobile}
                            InputProps={{
                                readOnly: !!vehicleDetails,
                            }}
                            fullWidth
                            disabled={formLoading}
                            helperText={vehicleDetails ? "Auto-filled from vehicle" : ""}
                        />
                        {/* From Location (Editable) */}
                        {/* <Autocomplete
                            freeSolo
                            options={locations.map(loc => loc.name)}
                            value={form.fromLocation}
                            onChange={(_, newValue) => handleFormChange('fromLocation', newValue || '')}
                            onInputChange={(_, newValue) => handleFormChange('fromLocation', newValue)}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="From Location*"
                                    required
                                    disabled={formLoading}
                                    helperText="Select location to auto-fill route details"
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
                                    // When a route is selected, auto-fill all fields
                                    setForm(prev => ({
                                        ...prev,
                                        selectedRoute: newValue,
                                        fromLocation: newValue.fromLocation,
                                        toLocation: newValue.toLocation,
                                        vehicleType: newValue.vehicleType || prev.vehicleType,
                                        dieselLtr: newValue.dieselLtr || '',
                                        advanceAmount: newValue.advanceAmount || '',
                                        routeCode: newValue.routeCode
                                    }));
                                    setRouteDetails(newValue);
                                } else {
                                    // Clear route-related fields
                                    setForm(prev => ({
                                        ...prev,
                                        selectedRoute: null,
                                        fromLocation: '',
                                        toLocation: '',
                                        dieselLtr: '',
                                        advanceAmount: '',
                                        routeCode: ''
                                    }));
                                    setRouteDetails(null);
                                }
                            }}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Select Route*"
                                    required
                                    disabled={formLoading}
                                    helperText="Select a route to auto-fill locations and details"
                                    placeholder="Search by location or route code"
                                />
                            )}
                        />
                        {/* LHS No (Editable) */}
                        <TextField
                            label="LHS No."
                            value={form.lhsNo}
                            onChange={e => handleFormChange('lhsNo', e.target.value)}
                            fullWidth
                            disabled={formLoading}
                        />
                        {/* To Location (Editable) */}
                        {/* <Autocomplete
                            freeSolo
                            options={locations.map(loc => loc.name)}
                            value={form.toLocation}
                            onChange={(_, newValue) => handleFormChange('toLocation', newValue || '')}
                            onInputChange={(_, newValue) => handleFormChange('toLocation', newValue)}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="To Location*"
                                    required
                                    disabled={formLoading}
                                    helperText="Select location to auto-fill route details"
                                />
                            )}
                        /> */}
                        {/* Trip Type (Editable) */}
                        <TextField
                            select
                            label="Trip Type"
                            value={form.tripType}
                            onChange={e => handleFormChange('tripType', e.target.value)}
                            fullWidth
                            disabled={formLoading}
                        >
                            <MenuItem value="">Select Trip Type</MenuItem>
                            {tripTypes.map(t => (
                                <MenuItem key={t.id} value={t.label}>
                                    {t.label}
                                </MenuItem>
                            ))}
                        </TextField>
                        {/* Diesel Ltr (Readonly from route) */}
                        <TextField
                            label="Diesel (Ltr)"
                            type="number"
                            value={form.dieselLtr}
                            onChange={e => handleDieselChange('dieselLtr', e.target.value)}
                            InputProps={{
                                readOnly: !!routeDetails,
                            }}
                            fullWidth
                            disabled={formLoading}
                            helperText={routeDetails ? "Auto-filled from route" : ""}
                        />
                        {/* Diesel Rate (Editable) */}
                        <TextField
                            label="Diesel Rate"
                            type="number"
                            value={form.dieselRate}
                            onChange={e => handleDieselChange('dieselRate', e.target.value)}
                            fullWidth
                            disabled={formLoading}
                        />
                        {/* Total Diesel Amount (Auto-calculated) */}
                        <TextField
                            label="Total Diesel Amount"
                            value={form.totalDieselAmount}
                            InputProps={{
                                readOnly: true,
                                startAdornment: <span className="mr-2"></span>
                            }}
                            fullWidth
                            disabled={formLoading}
                            helperText="Auto-calculated: Diesel Ltr × Rate"
                        />
                        {/* Advance Amount (Readonly from route) */}
                        <TextField
                            label="Advance Amount"
                            type="number"
                            value={form.advanceAmount}
                            onChange={e => handleFormChange('advanceAmount', e.target.value)}
                            InputProps={{
                                readOnly: !!routeDetails,
                            }}
                            fullWidth
                            disabled={formLoading}
                            helperText={routeDetails ? "Auto-filled from route" : ""}
                        />
                        {/* Bank Name (Readonly from vehicle) */}
                        <TextField
                            label="Bank Name"
                            value={form.bankName}
                            InputProps={{
                                readOnly: !!vehicleDetails,
                            }}
                            fullWidth
                            disabled={formLoading}
                            helperText={vehicleDetails ? "Auto-filled from vehicle" : ""}
                        />
                        {/* IFSC Code (Readonly from vehicle) */}
                        <TextField
                            label="IFSC Code"
                            value={form.ifscCode}
                            InputProps={{
                                readOnly: !!vehicleDetails,
                            }}
                            fullWidth
                            disabled={formLoading}
                            helperText={vehicleDetails ? "Auto-filled from vehicle" : ""}
                        />
                        {/* Account No (Readonly from vehicle) */}
                        <TextField
                            label="Account No."
                            value={form.accountNo}
                            InputProps={{
                                readOnly: !!vehicleDetails,
                            }}
                            fullWidth
                            disabled={formLoading}
                            helperText={vehicleDetails ? "Auto-filled from vehicle" : ""}
                        />
                        {/* Account Holder Name (Readonly from vehicle) */}
                        <TextField
                            label="Account Holder Name"
                            value={form.accountHolderName}
                            InputProps={{
                                readOnly: !!vehicleDetails,
                            }}
                            fullWidth
                            disabled={formLoading}
                            helperText={vehicleDetails ? "Auto-filled from vehicle" : ""}
                        />
                        {/* Trip Date (Editable) */}
                        <TextField
                            label="Trip Date"
                            type="date"
                            value={form.tripDate}
                            onChange={e => handleFormChange('tripDate', e.target.value)}
                            InputLabelProps={{ shrink: true }}
                            fullWidth
                            disabled={formLoading}
                        />
                        {/* Total Advance Amount (Auto-calculated) */}
                        <TextField
                            label="Total Advance Amount"
                            value={form.totalAdvanceAmount || form.advanceAmount || 0}
                            InputProps={{
                                readOnly: true,
                                startAdornment: <span className="mr-2"></span>
                            }}
                            fullWidth
                            disabled={formLoading}
                        />
                        {/* Trip Status (Editable) */}
                        <div className="flex justify-between items-center col-span-2">
                            <Typography>Trip Status</Typography>
                            <RadioGroup
                                row
                                value={form.tripStatus}
                                onChange={e => handleFormChange('tripStatus', e.target.value)}
                            >
                                <FormControlLabel
                                    value="active"
                                    control={<Radio />}
                                    label="Active"
                                    disabled={formLoading}
                                />
                                <FormControlLabel
                                    value="completed"
                                    control={<Radio />}
                                    label="Completed"
                                    disabled={formLoading}
                                />
                                <FormControlLabel
                                    value="cancelled"
                                    control={<Radio />}
                                    label="Cancelled"
                                    disabled={formLoading}
                                />
                            </RadioGroup>
                        </div>
                    </div>
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
                        disabled={formLoading}
                        startIcon={formLoading && <CircularProgress size={16} />}
                    >
                        {editingItem ? 'Update Trip' : 'Create Trip'}
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
