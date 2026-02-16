const handleSubmit = async () => {
    if (!form.vehicleNo || !form.driverName || !form.fromLocation || !form.toLocation) {
        showSnackbar('Please fill in all required fields', 'error')
        return
    }

    try {
        setFormLoading(true)

        // Final validation for trip count and date


        if (!editingItem) {
            // Check active trip count
            if (tripCheck.activeCount >= 2) {
                showSnackbar(`Vehicle ${form.vehicleNo} already has ${tripCheck.activeCount} active trips. Maximum 2 active trips allowed.`, 'error')
                setFormLoading(false)
                return
            }

            // Check for same date trip (including non-active)
            const tripOnSameDate = tripCheck.trips.some(trip =>
                trip.tripDate === form.tripDate
            )

            if (tripOnSameDate) {
                showSnackbar(`Vehicle ${form.vehicleNo} already has a trip on ${form.tripDate}. Please select a different date.`, 'error')
                setFormLoading(false)
                return
            }
        }

// ... rest of your submit logic
