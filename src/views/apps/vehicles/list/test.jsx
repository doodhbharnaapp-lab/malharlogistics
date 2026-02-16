const addAdvance = async () => {
    if (!advanceForm.advanceType || !advanceForm.amount || !trip._id || !trip.vehicleNo) {
        showSnackbar('Please fill all required fields', 'warning')
        return
    }

    // NEW: Check if advance already exists on this date
    if (checkAdvanceExistsOnDate(advanceForm.date, advanceForm.advanceType)) {
        showSnackbar(
            `Cannot propose another "${advanceForm.advanceType}" on ${new Date(advanceForm.date).toLocaleDateString()}. ` +
            `Please select a different date.`,
            'error'
        )
        return
    }

    // Check if trip is active
    if (trip.tripStatus && trip.tripStatus !== 'active' && trip.tripStatus !== 'Active') {
        showSnackbar(`Cannot add advance to trip with status: ${trip.tripStatus}`, 'error')
        return
    }

    // ... rest of your existing addAdvance code
}
