<Autocomplete
    freeSolo
    options={getAvailableVehicles.map(v => v.vehicleNo).filter(Boolean)}
    value={form.vehicleNo}
    onChange={(_, newValue, reason) => {
        console.log('onChange triggered:', { newValue, reason })
        // Only fetch details if it's a valid selection from dropdown (reason === 'selectOption')
        // or if it's a clear action (reason === 'clear')
        if (reason === 'selectOption' && newValue) {
            fetchVehicleDetails(newValue)
        } else if (reason === 'clear' || !newValue) {
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
        // For freeSolo input (manual typing), we don't fetch immediately
        // Wait for blur or explicit selection
    }}
    onInputChange={(_, newValue, reason) => {
        console.log('onInputChange triggered:', { newValue, reason })
        // Only update form on input if clearing or when it's not a select action
        if (reason === 'clear' || reason === 'input') {
            // Don't immediately call handleFormChange here
            // Just update the form state for the input value
            setForm(prev => ({ ...prev, vehicleNo: newValue }))

            // Clear vehicle details if input is cleared
            if (!newValue) {
                setVehicleDetails(null)
            }
        }
    }}
    onBlur={(e) => {
        const inputValue = e.target.value
        console.log('onBlur triggered:', inputValue)
        // If user typed manually and vehicle exists, fetch details
        if (inputValue && getAvailableVehicles.some(v => v.vehicleNo === inputValue)) {
            fetchVehicleDetails(inputValue)
        }
    }}
    renderInput={(params) => (
        <TextField
            {...params}
            label="Vehicle No*"
            required
            disabled={formLoading}
            size="small"
            // Add key to force re-render when value changes
            key={`vehicle-input-${form.vehicleNo}`}
        />
    )}
    // Disable auto-select
    autoSelect={false}
    // Don't automatically highlight the first option
    autoHighlight={false}
    // Don't automatically select the first option
    autoComplete={false}
    // Force clear on blur if value doesn't match
    clearOnBlur={false}
    // Handle selection better
    handleHomeEndKeys={false}
/>
/* ================= VEHICLE AUTO-COMPLETE ================= */
const fetchVehicleDetails = async (vehicleNo) => {
    console.log('fetchVehicleDetails called with:', vehicleNo)
    if (!vehicleNo) {
        setVehicleDetails(null)
        return
    }
    try {
        setFormLoading(true)
        const response = await fetch(`${VEHICLES_API}?vehicleNo=${encodeURIComponent(vehicleNo)}`)
        const result = await response.json()
        if (result.success && result.data) {
            const vehicle = Array.isArray(result.data) ? result.data[0] : result.data
            if (vehicle) {
                console.log('Found vehicle:', vehicle.vehicleNo)
                const hasActiveTrip = getActiveVehicleNumbers.includes(vehicleNo)
                const isEditingCurrentVehicle = editingItem && editingItem.vehicleNo === vehicleNo

                console.log('hasActiveTrip:', hasActiveTrip, 'isEditingCurrentVehicle:', isEditingCurrentVehicle)

                if (hasActiveTrip && !isEditingCurrentVehicle && !editingItem) {
                    showSnackbar(`Vehicle ${vehicleNo} already has an active trip.`, 'warning')
                    setForm(prev => ({ ...prev, vehicleNo: '' }))
                    setVehicleDetails(null)
                    return
                }

                setVehicleDetails(vehicle)
                setForm(prev => ({
                    ...prev,
                    vehicleNo: vehicle.vehicleNo || vehicleNo,
                    driverName: vehicle.driverName || vehicle.driverDetails?.name || vehicle.accountHolderName || '',
                    driverMobile: vehicle.driverMobile || vehicle.driverDetails?.mobile || '',
                    vehicleType: vehicle.model || vehicle.vehicleType || '',
                    bankName: vehicle.bankName || '',
                    ifscCode: vehicle.ifscCode || '',
                    accountNo: vehicle.accountNo || '',
                    accountHolderName: vehicle.accountHolderName || vehicle.driverName || ''
                }))
                console.log('Vehicle details set successfully')
            }
        } else {
            console.log('No vehicle found for:', vehicleNo)
            // If no vehicle found, clear the details but keep the vehicle number
            setVehicleDetails(null)
            setForm(prev => ({
                ...prev,
                driverName: '',
                driverMobile: '',
                vehicleType: '',
                bankName: '',
                ifscCode: '',
                accountNo: '',
                accountHolderName: ''
            }))
        }
    } catch (error) {
        console.error('Error fetching vehicle details:', error)
        showSnackbar('Error loading vehicle details', 'error')
    } finally {
        setFormLoading(false)
    }
}










/* ================= API ENDPOINTS ================= */
const API_BASE = '/api/apps'
const TRIPS_API = `${API_BASE}/trip`
const ADVANCES_API = `${API_BASE}/trip/advance`
const ADVANCES_DATE_API = `${ADVANCES_API}/date` // Add this

/* ================= FETCH TODAY'S ADVANCES ================= */
const fetchTodayAdvances = async () => {
    try {
        setProceedLoading(true)
        const formattedDate = selectedDate.toISOString().split('T')[0]

        console.log('Fetching advances for date:', formattedDate) // Debug log

        const response = await fetch(`${ADVANCES_DATE_API}?date=${formattedDate}`)

        console.log('Response status:', response.status) // Debug log

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }

        const result = await response.json()
        console.log('API Response:', result) // Debug log

        if (result.success) {
            setTodayAdvances(result.data || [])
            // Optional: Also store vehicles grouped data if needed
            // setVehiclesData(result.vehicles || [])
        } else {
            showSnackbar(result.message || 'Failed to fetch advances', 'error')
            setTodayAdvances([])
        }
    } catch (error) {
        console.error('Error fetching today\'s advances:', error)
        showSnackbar(`Error fetching advances: ${error.message}`, 'error')
        setTodayAdvances([])
    } finally {
        setProceedLoading(false)
    }
}

/* ================= MARK ADVANCE AS PAID ================= */
const markAdvanceAsPaid = async (advanceId) => {
    try {
        setProceedLoading(true)
        const response = await fetch(ADVANCES_API, { // Main endpoint, not /status
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                advanceId,
                status: 'paid'
            })
        })

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }

        const result = await response.json()
        if (result.success) {
            showSnackbar('Advance marked as paid successfully', 'success')
            // Refresh today's advances
            await fetchTodayAdvances()
            // Refresh main trips data
            await fetchTrips()
        } else {
            showSnackbar(result.error || 'Failed to mark as paid', 'error')
        }
    } catch (error) {
        console.error('Error marking advance as paid:', error)
        showSnackbar('Error marking advance as paid', 'error')
    } finally {
        setProceedLoading(false)
    }
}

/* ================= ADD ADVANCE ================= */
const addAdvance = async () => {
    if (!advanceForm.advanceType || !advanceForm.amount || !trip._id || !trip.vehicleNo) {
        showSnackbar('Please fill all required fields', 'warning')
        return
    }

    const amount = Number(advanceForm.amount)

    try {
        setFormLoading(true)
        const response = await fetch(ADVANCES_API, { // Main endpoint
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                tripId: trip._id,
                vehicleNo: trip.vehicleNo,
                advanceType: advanceForm.advanceType,
                amount: amount,
                remark: advanceForm.remark,
                date: advanceForm.date,
                status: 'unpaid'  // Default status is unpaid
            })
        })

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }

        const result = await response.json()
        if (result.success) {
            // Refresh advances for this trip
            const data = await fetchTripWithAdvances(trip._id)
            if (data) {
                setTrip(prev => ({
                    ...prev,
                    advances: data.advances
                }))
            }
            setAdvanceForm({
                advanceType: '',
                amount: '',
                remark: '',
                date: new Date().toISOString().split('T')[0]
            })
            showSnackbar('Advance proposed successfully', 'success')
            // Refresh all data
            await fetchTrips()
        } else {
            showSnackbar(result.error || 'Failed to add advance', 'error')
        }
    } catch (error) {
        console.error('Error adding advance:', error)
        showSnackbar('Error adding advance', 'error')
    } finally {
        setFormLoading(false)
    }
}
