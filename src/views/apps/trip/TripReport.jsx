'use client'
import { useState, useMemo, useRef, useEffect } from 'react'
import { Card, CardContent, Button, Typography, TextField, IconButton, Tooltip, Box, Grid, Paper, Chip, CircularProgress, Alert, Accordion, AccordionSummary, AccordionDetails, Divider } from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import tableStyles from '@core/styles/table.module.css'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { useReactToPrint } from 'react-to-print'
const TripReport = () => {
    /* ---------------- STATE ---------------- */
    const [data, setData] = useState([])
    const [page, setPage] = useState(1)
    const [rowsPerPage, setRowsPerPage] = useState(50)
    const [groupedData, setGroupedData] = useState({}) // Grouped by vehicle
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [expandedVehicles, setExpandedVehicles] = useState({}) // Track expanded vehicles
    const [filters, setFilters] = useState({
        fromDate: '',
        toDate: '',
        vehicleNo: '',
        lhsNo: '',
        fromLocation: '',
        toLocation: '',
        driverName: ''
    })
    const componentRef = useRef()
    /* ================= API ENDPOINTS ================= */
    const API_BASE = '/api/apps'
    const TRIPS_API = `${API_BASE}/trip/`
    const ADVANCE_API = `${API_BASE}/trip/advance`
    /* ================= TABLE COLUMNS ================= */
    const columns = [
        { id: 'srNo', header: 'Sr No', accessor: 'srNo', size: 80 },
        { id: 'tripDate', header: 'Trip Date', accessor: 'tripDate', size: 120 },
        { id: 'lhsNo', header: 'LHS No.', accessor: 'lhsNo', size: 150 },
        { id: 'vehicleNo', header: "Vehicle No", accessor: 'vehicleNo', size: 150 },
        { id: 'from', header: 'From', accessor: 'from', size: 120 },
        {
            id: 'to',
            header: 'To',
            accessor: 'to',
            size: 150,
            cell: (row) => (
                <Tooltip title={row.to}>
                    <span className="truncate max-w-[200px] block">
                        {row.to}
                    </span>
                </Tooltip>
            )
        },
        { id: 'dieselLTR', header: 'Diesel LTR', accessor: 'dieselLTR', size: 100 },
        {
            id: 'dieselRate',
            header: 'Diesel Rate',
            accessor: 'dieselRate',
            size: 110,
            cell: (row) => `${row.dieselRate.toFixed(2)}`
        },
        {
            id: 'totalDiesel',
            header: 'Total Diesel',
            accessor: 'totalDiesel',
            size: 120,
            cell: (row) => `${row.totalDiesel.toFixed(2)}`
        },
        {
            id: 'tripAdvance',
            header: 'Trip Advance',
            accessor: 'tripAdvance',
            size: 120,
            cell: (row) => `${row.tripAdvance.toFixed(2)}`
        },
        {
            id: 'totalAdvance',
            header: 'Total Advance',
            accessor: 'totalAdvance',
            size: 120,
            cell: (row) => `${row.totalAdvance.toFixed(2)}`
        },
        {
            id: 'advancePaid',
            header: 'Advance Paid',
            accessor: 'advancePaid',
            size: 130,
            cell: (row) => (
                <div className="flex flex-col">
                    <span className="font-medium">{row.advancePaid.toFixed(2)}</span>
                    {row.paidAdvancesCount > 0 && (
                        <span className="text-xs text-gray-500">
                            ({row.paidAdvancesCount} paid)
                        </span>
                    )}
                </div>
            )
        },
        { id: 'endDate', header: 'End Date', accessor: 'endDate', size: 120 },
        {
            id: 'balance',
            header: 'Balance',
            accessor: 'balance',
            size: 130,
            cell: (row) => {
                const balance = row.balance || 0
                return (
                    <div className={`p-1 rounded ${balance === 0 ? 'bg-green-50 text-green-700' :
                        balance === row.totalAdvance ? 'bg-red-50 text-red-700' :
                            'bg-yellow-50 text-yellow-700'}`}>
                        <div className="font-bold">{balance.toFixed(2)}</div>
                        {row.unpaidAdvancesCount > 0 && balance > 0 && (
                            <div className="text-xs">
                                ({row.unpaidAdvancesCount} pending)
                            </div>
                        )}
                    </div>
                )
            }
        },
        {
            id: 'driverInfo',
            header: 'Driver Info',
            accessor: 'driverInfo',
            size: 150,
            cell: (row) => (
                <Tooltip title={row.driverInfo}>
                    <span className="truncate max-w-[150px] block">
                        {row.driverInfo}
                    </span>
                </Tooltip>
            )
        },
        {
            id: 'statusRemarks',
            header: 'Close Remark',
            accessor: 'statusRemarks',
            size: 150,
            cell: (row) => row.statusRemarks || '-'
        }
    ]
    // Paginated data
    /* ================= FETCH TRIPS WITH ADVANCE DATA ================= */
    useEffect(() => {
        const fetchAllTripData = async () => {
            try {
                setLoading(true)
                setError(null)
                let allTrips = []
                let currentPage = 1
                let totalPages = 1
                // First, get the first page to know total pages
                const firstResponse = await fetch(`${TRIPS_API}?page=1&limit=100`)
                if (!firstResponse.ok) {
                    throw new Error(`HTTP error! status: ${firstResponse.status}`)
                }
                const firstResult = await firstResponse.json()
                if (firstResult.success && firstResult.data) {
                    // Add first page data
                    allTrips = [...firstResult.data]
                    // Get pagination info from response
                    totalPages = firstResult.totalPages || 1
                    console.log(`Total pages: ${totalPages}, Total records: ${firstResult.totalCount || allTrips.length}`)
                    // Fetch remaining pages if any
                    if (totalPages > 1) {
                        const pagePromises = []
                        for (let page = 2; page <= totalPages; page++) {
                            pagePromises.push(
                                fetch(`${TRIPS_API}?page=${page}&limit=100`)
                                    .then(res => res.json())
                            )
                        }
                        const remainingResults = await Promise.all(pagePromises)
                        remainingResults.forEach(result => {
                            if (result.success && result.data) {
                                allTrips = [...allTrips, ...result.data]
                            }
                        })
                    }
                    console.log(`Total trips fetched: ${allTrips.length}`)
                    // Now fetch advance data for all trips (process in batches to avoid too many requests)
                    const batchSize = 20
                    const tripsWithAdvances = []
                    for (let i = 0; i < allTrips.length; i += batchSize) {
                        const batch = allTrips.slice(i, i + batchSize)
                        const batchPromises = batch.map(async (trip, index) => {
                            try {
                                // Fetch advance data for this trip
                                const advanceResponse = await fetch(
                                    `${ADVANCE_API}?tripId=${trip._id}`
                                )
                                let totalPaid = 0
                                let paidAdvancesCount = 0
                                let unpaidAdvancesCount = 0
                                if (advanceResponse.ok) {
                                    const advanceResult = await advanceResponse.json()
                                    if (advanceResult.success) {
                                        totalPaid = advanceResult.paidAmount || 0
                                        paidAdvancesCount = advanceResult.paidCount || 0
                                        unpaidAdvancesCount = advanceResult.unpaidCount || 0
                                    }
                                }
                                const balance = (trip.totalAdvanceAmount || 0) - totalPaid
                                // return {
                                //     id: trip._id || (i + index),
                                //     srNo: i + index + 1,
                                //     tripDate: trip.tripDate ?
                                //         new Date(trip.tripDate).toLocaleDateString('en-IN', {
                                //             day: '2-digit',
                                //             month: 'short',
                                //             year: 'numeric'
                                //         }) : 'N/A',
                                //     originalDate: trip.tripDate ? new Date(trip.tripDate) : null,
                                //     lhsNo: trip.lhsNo || 'N/A',
                                //     from: trip.fromLocation || 'N/A',
                                //     to: trip.toLocation || 'N/A',
                                //     dieselLTR: trip.dieselLtr || 0,
                                //     dieselRate: trip.dieselRate || 0,
                                //     totalDiesel: trip.totalDieselAmount || 0,
                                //     tripAdvance: trip.advanceAmount || 0,
                                //     totalAdvance: trip.totalAdvanceAmount || 0,
                                //     advancePaid: totalPaid,
                                //     balance: balance,
                                //     endDate: trip.createdAt ?
                                //         new Date(trip.createdAt).toLocaleDateString('en-IN', {
                                //             day: '2-digit',
                                //             month: 'short',
                                //             year: 'numeric'
                                //         }) : 'N/A',
                                //     driverInfo: `${trip.driverName || 'N/A'} (${trip.driverMobile || 'N/A'})`,
                                //     statusRemarks: trip.statusRemarks || '',
                                //     vehicleNo: trip.vehicleNo,
                                //     vehicleType: trip.vehicleType,
                                //     driverName: trip.driverName,
                                //     driverMobile: trip.driverMobile,
                                //     tripStatus: trip.tripStatus,
                                //     tripType: trip.tripType,
                                //     totalPaid: totalPaid,
                                //     paidAdvancesCount: paidAdvancesCount,
                                //     unpaidAdvancesCount: unpaidAdvancesCount,
                                //     sortableDate: trip.tripDate ? new Date(trip.tripDate) : new Date(0)
                                // }
                                return {
                                    id: trip._id || (i + index),
                                    srNo: i + index + 1,
                                    tripDate: trip.tripDate ?
                                        new Date(trip.tripDate).toLocaleDateString('en-IN', {
                                            day: '2-digit',
                                            month: 'short',
                                            year: 'numeric'
                                        }) : 'N/A',
                                    originalDate: trip.tripDate ? new Date(trip.tripDate) : null,
                                    lhsNo: trip.lhsNo || 'N/A',
                                    from: trip.fromLocation || 'N/A',
                                    to: trip.toLocation || 'N/A',
                                    dieselLTR: trip.dieselLtr || 0,
                                    dieselRate: trip.dieselRate || 0,
                                    totalDiesel: trip.totalDieselAmount || 0,
                                    tripAdvance: trip.advanceAmount || 0,
                                    totalAdvance: trip.totalAdvanceAmount || 0,
                                    advancePaid: totalPaid,
                                    balance: balance,
                                    endDate: trip.createdAt ?
                                        new Date(trip.createdAt).toLocaleDateString('en-IN', {
                                            day: '2-digit',
                                            month: 'short',
                                            year: 'numeric'
                                        }) : 'N/A',
                                    driverInfo: `${trip.driverName || 'N/A'} (${trip.driverMobile || 'N/A'})`,
                                    vehicleNo: trip.vehicleNo,
                                    vehicleType: trip.vehicleType,
                                    driverName: trip.driverName,
                                    driverMobile: trip.driverMobile,
                                    tripStatus: trip.tripStatus,
                                    // ⭐ ADD THESE
                                    ifscCode: trip.ifscCode || "",
                                    accountNo: trip.accountNo || "",
                                    bankName: trip.bankName || "",
                                    accountHolderName: trip.accountHolderName || "",
                                    paidAdvancesCount: paidAdvancesCount,
                                    unpaidAdvancesCount: unpaidAdvancesCount,
                                    sortableDate: trip.tripDate ? new Date(trip.tripDate) : new Date(0)
                                }
                            } catch (advanceError) {
                                console.error(`Error fetching advance for trip ${trip._id}:`, advanceError)
                                // Return trip without advance data if error
                                return {
                                    id: trip._id || (i + index),
                                    srNo: i + index + 1,
                                    tripDate: trip.tripDate ?
                                        new Date(trip.tripDate).toLocaleDateString('en-IN', {
                                            day: '2-digit',
                                            month: 'short',
                                            year: 'numeric'
                                        }) : 'N/A',
                                    originalDate: trip.tripDate ? new Date(trip.tripDate) : null,
                                    lhsNo: trip.lhsNo || 'N/A',
                                    from: trip.fromLocation || 'N/A',
                                    to: trip.toLocation || 'N/A',
                                    dieselLTR: trip.dieselLtr || 0,
                                    dieselRate: trip.dieselRate || 0,
                                    totalDiesel: trip.totalDieselAmount || 0,
                                    tripAdvance: trip.advanceAmount || 0,
                                    totalAdvance: trip.totalAdvanceAmount || 0,
                                    advancePaid: 0,
                                    balance: trip.totalAdvanceAmount || 0,
                                    endDate: trip.createdAt ?
                                        new Date(trip.createdAt).toLocaleDateString('en-IN', {
                                            day: '2-digit',
                                            month: 'short',
                                            year: 'numeric'
                                        }) : 'N/A',
                                    driverInfo: `${trip.driverName || 'N/A'} (${trip.driverMobile || 'N/A'})`,
                                    statusRemarks: trip.statusRemarks || '',
                                    vehicleNo: trip.vehicleNo,
                                    vehicleType: trip.vehicleType,
                                    driverName: trip.driverName,
                                    driverMobile: trip.driverMobile,
                                    tripStatus: trip.tripStatus,
                                    tripType: trip.tripType,
                                    totalPaid: 0,
                                    paidAdvancesCount: 0,
                                    unpaidAdvancesCount: 0,
                                    sortableDate: trip.tripDate ? new Date(trip.tripDate) : new Date(0)
                                }
                            }
                        })
                        const batchResults = await Promise.all(batchPromises)
                        tripsWithAdvances.push(...batchResults)
                    }
                    setData(tripsWithAdvances)
                    // Group data by vehicle
                    const grouped = groupDataByVehicle(tripsWithAdvances)
                    setGroupedData(grouped)
                    // Auto-expand first few vehicles
                    const vehicleKeys = Object.keys(grouped)
                    const initialExpanded = {}
                    vehicleKeys.slice(0, 3).forEach(key => {
                        initialExpanded[key] = true
                    })
                    setExpandedVehicles(initialExpanded)
                    console.log(`Final data loaded: ${tripsWithAdvances.length} trips, ${vehicleKeys.length} vehicles`)
                } else {
                    throw new Error(firstResult.message || 'No data received')
                }
            } catch (err) {
                console.error('Error fetching trip data:', err)
                setError(err.message)
                setData([])
                setGroupedData({})
            } finally {
                setLoading(false)
            }
        }
        fetchAllTripData()
    }, [])
    /* ---------------- GROUP DATA BY VEHICLE ---------------- */
    const groupDataByVehicle = (trips) => {
        const groups = {}
        trips.forEach(trip => {
            const vehicleKey = trip.vehicleNo || 'Unknown'
            if (!groups[vehicleKey]) {
                groups[vehicleKey] = {
                    vehicleNo: vehicleKey,
                    vehicleType: trip.vehicleType,
                    driverName: trip.driverName,
                    trips: [],
                    totals: {
                        totalDiesel: 0,
                        totalTripAdvance: 0,
                        totalAdvance: 0,
                        totalAdvancePaid: 0,
                        totalBalance: 0,
                        tripCount: 0
                    }
                }
            }
            groups[vehicleKey].trips.push(trip)
            groups[vehicleKey].totals.totalDiesel += trip.totalDiesel || 0
            groups[vehicleKey].totals.totalTripAdvance += trip.tripAdvance || 0
            groups[vehicleKey].totals.totalAdvance += trip.totalAdvance || 0
            groups[vehicleKey].totals.totalAdvancePaid += trip.advancePaid || 0
            groups[vehicleKey].totals.totalBalance += trip.balance || 0
            groups[vehicleKey].totals.tripCount += 1
        })
        // Sort trips within each vehicle by date
        Object.keys(groups).forEach(vehicleKey => {
            groups[vehicleKey].trips.sort((a, b) => {
                if (!a.sortableDate || !b.sortableDate) return 0
                return b.sortableDate - a.sortableDate // Newest first
            })
            // Update srNo within each vehicle
            groups[vehicleKey].trips.forEach((trip, index) => {
                trip.srNo = index + 1
            })
        })
        return groups
    }
    /* ---------------- FILTERED AND GROUPED DATA ---------------- */
    const { filteredGroupedData, filteredData, overallTotals } = useMemo(() => {
        // First filter all trips
        const allFilteredTrips = data.filter(trip => {
            // Date filtering
            if (filters.fromDate && trip.originalDate) {
                const fromDate = new Date(filters.fromDate)
                fromDate.setHours(0, 0, 0, 0)
                if (trip.originalDate < fromDate) return false
            }
            if (filters.toDate && trip.originalDate) {
                const toDate = new Date(filters.toDate)
                toDate.setHours(23, 59, 59, 999)
                if (trip.originalDate > toDate) return false
            }
            // LHS No filtering
            if (filters.lhsNo && !trip.lhsNo.toLowerCase().includes(filters.lhsNo.toLowerCase())) {
                return false
            }
            // From location filtering
            if (filters.fromLocation && !trip.from.toLowerCase().includes(filters.fromLocation.toLowerCase())) {
                return false
            }
            // To location filtering
            if (filters.toLocation && !trip.to.toLowerCase().includes(filters.toLocation.toLowerCase())) {
                return false
            }
            // Driver name filtering
            if (filters.driverName && !trip.driverInfo.toLowerCase().includes(filters.driverName.toLowerCase())) {
                return false
            }
            // Vehicle No filtering
            if (filters.vehicleNo && !trip.vehicleNo?.toLowerCase().includes(filters.vehicleNo.toLowerCase())) {
                return false
            }
            return true
        })
        // Group filtered trips by vehicle
        const grouped = groupDataByVehicle(allFilteredTrips)
        // Calculate overall totals
        const totals = allFilteredTrips.reduce((acc, trip) => ({
            totalDiesel: acc.totalDiesel + (trip.totalDiesel || 0),
            totalTripAdvance: acc.totalTripAdvance + (trip.tripAdvance || 0),
            totalAdvance: acc.totalAdvance + (trip.totalAdvance || 0),
            totalAdvancePaid: acc.totalAdvancePaid + (trip.advancePaid || 0),
            totalBalance: acc.totalBalance + (trip.balance || 0),
            totalTrips: acc.totalTrips + 1,
            totalVehicles: Object.keys(grouped).length
        }), {
            totalDiesel: 0,
            totalTripAdvance: 0,
            totalAdvance: 0,
            totalAdvancePaid: 0,
            totalBalance: 0,
            totalTrips: 0,
            totalVehicles: 0
        })
        totals.totalVehicles = Object.keys(grouped).length
        return {
            filteredGroupedData: grouped,
            filteredData: allFilteredTrips,
            overallTotals: totals
        }
    }, [data, filters])
    const paginatedVehicles = useMemo(() => {
        const vehicleKeys = Object.keys(filteredGroupedData)
        const startIndex = (page - 1) * rowsPerPage
        const endIndex = startIndex + rowsPerPage
        const paginatedKeys = vehicleKeys.slice(startIndex, endIndex)
        const paginated = {}
        paginatedKeys.forEach(key => {
            paginated[key] = filteredGroupedData[key]
        })
        return {
            vehicles: paginated,
            totalPages: Math.ceil(vehicleKeys.length / rowsPerPage),
            totalVehicles: vehicleKeys.length,
            startIndex: startIndex + 1,
            endIndex: Math.min(endIndex, vehicleKeys.length)
        }
    }, [filteredGroupedData, page, rowsPerPage])
    /* ---------------- TOGGLE VEHICLE EXPAND ---------------- */
    const handleVehicleToggle = (vehicleNo) => {
        setExpandedVehicles(prev => ({
            ...prev,
            [vehicleNo]: !prev[vehicleNo]
        }))
    }
    const expandAll = () => {
        const allExpanded = {}
        Object.keys(filteredGroupedData).forEach(key => {
            allExpanded[key] = true
        })
        setExpandedVehicles(allExpanded)
    }
    const collapseAll = () => {
        setExpandedVehicles({})
    }
    /* ---------------- FILTER HANDLERS ---------------- */
    const handleFilterChange = (field, value) => {
        setFilters(prev => ({
            ...prev,
            [field]: value
        }))
    }
    const resetFilters = () => {
        setFilters({
            fromDate: '',
            toDate: '',
            vehicleNo: '',
            lhsNo: '',
            fromLocation: '',
            toLocation: '',
            driverName: ''
        })
    }
    /* ---------------- PRINT FUNCTIONALITY ---------------- */
    /* ---------------- EXPORT TO PDF WITH VEHICLE GROUPING ---------------- */
    const exportToPDF = () => {
        const allowedStatus = ["closed", "completed", "cancelled"]
        const closedTrips = filteredData.filter(trip =>
            allowedStatus.includes((trip.tripStatus || "").toLowerCase())
        )
        if (closedTrips.length === 0) {
            alert("No closed/completed/cancelled trips to export!")
            return
        }
        const doc = new jsPDF("landscape")
        closedTrips.forEach((trip, index) => {
            if (index !== 0) doc.addPage()
            const pageWidth = doc.internal.pageSize.width
            // Title
            doc.setFontSize(16)
            doc.text("Trip Details", pageWidth / 2, 15, { align: "center" })
            doc.setFontSize(9)
            doc.text(`Print Date : ${new Date().toLocaleString()}`, pageWidth - 70, 15)
            // Trip info table
            autoTable(doc, {
                startY: 20,
                theme: "grid",
                styles: { fontSize: 9 },
                body: [
                    ["Trip Start", String(trip.tripDate || ""), "Trip End", String(trip.endDate || "")],
                    ["Vehicle No", String(trip.vehicleNo || ""), "Vehicle Type", String(trip.vehicleType || "")],
                    ["From", String(trip.from || ""), "To", String(trip.to || "")],
                    ["IFSC Code", String(trip.ifscCode || ""), "Account No", String(trip.accountNo || "")],
                    ["Bank Name", String(trip.bankName || ""), "A/C Holder Name", String(trip.accountHolderName || "")],
                    ["Diesel LTR", String(trip.dieselLTR || 0), "Advance", String(trip.tripAdvance || 0)],
                    ["Diesel Rate", String(trip.dieselRate || 0), "Total Advance", String(trip.totalAdvance || 0)],
                    ["Total Diesel", String(trip.totalDiesel || 0), "Advance Paid", String(trip.advancePaid || 0)],
                    ["LHS No.", String(trip.lhsNo || ""), "Balance Advance", Number(trip.balance || 0).toFixed(2)],
                    ["Driver Info", String(trip.driverInfo || ""), "", ""],
                    ["Close Remark", String(trip.statusRemarks || ""), "", ""]
                ],
                columnStyles: {
                    0: { fontStyle: "bold" },
                    2: { fontStyle: "bold" }
                }
            })
            const paidStartY = doc.lastAutoTable.finalY + 10
            // Paid advance title
            doc.setFontSize(11)
            doc.text("Paid Advance Info.", 14, paidStartY)
            const paidAdvances = (trip.advances || []).filter(a => a.paid)
            autoTable(doc, {
                startY: paidStartY + 2,
                head: [["Date", "Type", "Amount", "Remark"]],
                body: paidAdvances.map(a => [
                    String(a.date || ""),
                    String(a.type || ""),
                    String(a.amount || 0),
                    String(a.remark || "")
                ]),
                theme: "grid",
                styles: { fontSize: 9 },
                headStyles: { fillColor: [70, 90, 140] }
            })
            const unpaidAdvances = (trip.advances || []).filter(a => !a.paid)
            // Unpaid title
            doc.text("Unpaid Advance Info.", pageWidth / 2 + 10, paidStartY)
            autoTable(doc, {
                startY: paidStartY + 2,
                margin: { left: pageWidth / 2 },
                head: [["Date", "Type", "Amount", "Remark"]],
                body: unpaidAdvances.map(a => [
                    String(a.date || ""),
                    String(a.type || ""),
                    String(a.amount || 0),
                    String(a.remark || "")
                ]),
                theme: "grid",
                styles: { fontSize: 9 },
                headStyles: { fillColor: [70, 90, 140] }
            })
        })
        doc.save(`ClosedTrips_${closedTrips.length}.pdf`)
    }
    /* ---------------- UI ---------------- */
    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <CircularProgress />
            </Box>
        )
    }
    if (error) {
        return (
            <Alert severity="error" className="mb-4">
                Error loading trip data: {error}
            </Alert>
        )
    }
    return (
        <>
            <Card className="mb-4 no-print">
                <CardContent>
                    <Typography variant="h5" className="mb-4">
                        Trip Report
                    </Typography>
                    <br />
                    <Grid
                        container
                        spacing={2}
                        alignItems="center"
                        wrap="nowrap"   // 👈 forces one line
                    >
                        <Grid item>
                            <TextField
                                label="From Date"
                                type="date"
                                value={filters.fromDate}
                                onChange={(e) => handleFilterChange('fromDate', e.target.value)}
                                size="small"
                                InputLabelProps={{ shrink: true }}
                                sx={{ width: 150 }}
                            />
                        </Grid>
                        <Grid item>
                            <TextField
                                label="To Date"
                                type="date"
                                value={filters.toDate}
                                onChange={(e) => handleFilterChange('toDate', e.target.value)}
                                size="small"
                                InputLabelProps={{ shrink: true }}
                                sx={{ width: 150 }}
                            />
                        </Grid>
                        <Grid item>
                            <TextField
                                label="Vehicle No"
                                value={filters.vehicleNo}
                                onChange={(e) => handleFilterChange('vehicleNo', e.target.value)}
                                size="small"
                                placeholder="MH12AB1234"
                                sx={{ width: 160 }}
                            />
                        </Grid>
                        <Grid item>
                            <TextField
                                label="LHS No"
                                value={filters.lhsNo}
                                onChange={(e) => handleFilterChange('lhsNo', e.target.value)}
                                size="small"
                                placeholder="FO-12-RC-1234"
                                sx={{ width: 170 }}
                            />
                        </Grid>
                        {/* Export PDF */}
                        <Grid item>
                            <Tooltip title="Export to PDF">
                                <IconButton onClick={exportToPDF} color="primary">
                                    <i className="ri-printer-line" />
                                </IconButton>
                            </Tooltip>
                        </Grid>
                        {/* Reset */}
                        <Grid item>
                            <Button
                                variant="outlined"
                                onClick={resetFilters}
                                size="small"
                            >
                                Reset
                            </Button>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>
            {/* Pagination Controls */}
            {Object.keys(filteredGroupedData).length > 0 && (
                <Card className="mb-4 no-print">
                    <CardContent>
                        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
                            {/* Left side - Showing info */}
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                                <Typography variant="body2">
                                    Showing <strong>{paginatedVehicles.startIndex}</strong> to <strong>{paginatedVehicles.endIndex}</strong> of <strong>{paginatedVehicles.totalVehicles}</strong> vehicles
                                </Typography>
                                {/* Rows per page selector */}
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Typography variant="body2">Show:</Typography>
                                    <select
                                        value={rowsPerPage}
                                        onChange={(e) => {
                                            setRowsPerPage(Number(e.target.value))
                                            setPage(1)
                                        }}
                                        style={{
                                            padding: '4px 8px',
                                            borderRadius: '4px',
                                            border: '1px solid #ccc',
                                            backgroundColor: 'white'
                                        }}
                                    >
                                        <option value={10}>10</option>
                                        <option value={25}>25</option>
                                        <option value={50}>50</option>
                                        <option value={100}>100</option>
                                    </select>
                                </Box>
                            </Box>
                            {/* Right side - Pagination buttons */}
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                                <Button
                                    variant="outlined"
                                    size="small"
                                    onClick={() => setPage(1)}
                                    disabled={page === 1}
                                >
                                    First
                                </Button>
                                <Button
                                    variant="outlined"
                                    size="small"
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                >
                                    Previous
                                </Button>
                                <Typography variant="body2" sx={{ mx: 1 }}>
                                    Page <strong>{page}</strong> of <strong>{paginatedVehicles.totalPages}</strong>
                                </Typography>
                                <Button
                                    variant="outlined"
                                    size="small"
                                    onClick={() => setPage(p => Math.min(paginatedVehicles.totalPages, p + 1))}
                                    disabled={page === paginatedVehicles.totalPages}
                                >
                                    Next
                                </Button>
                                <Button
                                    variant="outlined"
                                    size="small"
                                    onClick={() => setPage(paginatedVehicles.totalPages)}
                                    disabled={page === paginatedVehicles.totalPages}
                                >
                                    Last
                                </Button>
                            </Box>
                        </Box>
                        {/* Quick page jump (optional) */}
                        {paginatedVehicles.totalPages > 5 && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
                                <Typography variant="body2">Go to page:</Typography>
                                <TextField
                                    type="number"
                                    size="small"
                                    value={page}
                                    onChange={(e) => {
                                        const newPage = parseInt(e.target.value)
                                        if (newPage >= 1 && newPage <= paginatedVehicles.totalPages) {
                                            setPage(newPage)
                                        }
                                    }}
                                    inputProps={{
                                        min: 1,
                                        max: paginatedVehicles.totalPages,
                                        style: { width: '60px', textAlign: 'center' }
                                    }}
                                />
                                <Button
                                    variant="contained"
                                    size="small"
                                    onClick={() => {
                                        // Page already updates via onChange
                                    }}
                                >
                                    Go
                                </Button>
                            </Box>
                        )}
                    </CardContent>
                </Card>
            )}
            <br />
            {/* Report Content */}
            <div ref={componentRef}>
                <Card>
                    <CardContent>
                        {/* Header Information */}
                        <div className="header-info mb-6 p-4 bg-blue-50 rounded-lg">
                            <Typography variant="h6" className="mb-2">Vehicle Wise Trip Report</Typography>
                            <Grid container spacing={2}>
                                <Grid size={{ xs: 12, sm: 4 }}>
                                    <Typography variant="body2">
                                        <strong>Generated on:</strong> {new Date().toLocaleDateString()}
                                    </Typography>
                                </Grid>
                                <Grid size={{ xs: 12, sm: 4 }}>
                                    <Typography variant="body2">
                                        <strong>Vehicles:</strong> {Object.keys(filteredGroupedData).length}
                                    </Typography>
                                </Grid>
                                <Grid size={{ xs: 12, sm: 4 }}>
                                    <Typography variant="body2">
                                        <strong>Trips:</strong> {filteredData.length}
                                    </Typography>
                                </Grid>
                            </Grid>
                        </div>
                        {/* Action Buttons */}
                        {/* Vehicle-wise accordions */}
                        {Object.keys(filteredGroupedData).length === 0 ? (
                            <Alert severity="info">No trips found for the selected filters.</Alert>
                        ) : (
                            Object.keys(filteredGroupedData).map(vehicleKey => {
                                const vehicleData = filteredGroupedData[vehicleKey]
                                const isExpanded = expandedVehicles[vehicleKey] || false
                                return (
                                    <Accordion
                                        key={vehicleKey}
                                        expanded={isExpanded}
                                        onChange={() => handleVehicleToggle(vehicleKey)}
                                        className="mb-4 vehicle-header"
                                    >
                                        <AccordionDetails>
                                            <Divider className="mb-4" />
                                            {/* Vehicle trips table - USING SIMPLE MANUAL APPROACH */}
                                            <div className="overflow-x-auto">
                                                <table className={tableStyles.table}>
                                                    <thead>
                                                        <tr>
                                                            {columns.map(column => (
                                                                <th key={column.id} style={{ width: column.size }}>
                                                                    {column.header}
                                                                </th>
                                                            ))}
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {vehicleData.trips.map((trip, index) => (
                                                            <tr key={trip.id || index}>
                                                                {columns.map(column => (
                                                                    <td key={`${trip.id}-${column.id}`} style={{ width: column.size }}>
                                                                        {column.cell ? column.cell(trip) : trip[column.accessor]}
                                                                    </td>
                                                                ))}
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                    <tfoot>
                                                        <tr className="vehicle-totals bg-purple-50">
                                                            <td colSpan={2}><strong>Vehicle Totals</strong></td>
                                                            <td></td>
                                                            <td></td>
                                                            <td></td>
                                                            <td></td>
                                                            <td></td>
                                                            <td><strong>{vehicleData.totals.totalDiesel.toFixed(2)}</strong></td>
                                                            <td><strong>{vehicleData.totals.totalTripAdvance.toFixed(2)}</strong></td>
                                                            <td><strong>{vehicleData.totals.totalAdvance.toFixed(2)}</strong></td>
                                                            <td><strong>{vehicleData.totals.totalAdvancePaid.toFixed(2)}</strong></td>
                                                            <td></td>
                                                            <td>
                                                                <strong className={`${vehicleData.totals.totalBalance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                                                    {vehicleData.totals.totalBalance.toFixed(2)}
                                                                </strong>
                                                            </td>
                                                            <td colSpan={3}></td>
                                                        </tr>
                                                    </tfoot>
                                                </table>
                                            </div>
                                        </AccordionDetails>
                                    </Accordion>
                                )
                            })
                        )}
                        {/* Overall Summary */}
                        {Object.keys(filteredGroupedData).length > 0 && (
                            <div className="mt-8">
                                <Card className="overall-totals bg-green-50">
                                    <CardContent>
                                        <Typography variant="h6" className="mb-4">Overall Summary</Typography>
                                        <Grid container spacing={3}>
                                            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                                <Paper elevation={0} className="p-3 text-center bg-white">
                                                    <Typography variant="caption" color="textSecondary">Total Vehicles</Typography>
                                                    <Typography variant="h5" className="text-blue-600">
                                                        {Object.keys(filteredGroupedData).length}
                                                    </Typography>
                                                </Paper>
                                            </Grid>
                                            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                                <Paper elevation={0} className="p-3 text-center bg-white">
                                                    <Typography variant="caption" color="textSecondary">Total Trips</Typography>
                                                    <Typography variant="h5" className="text-purple-600">
                                                        {filteredData.length}
                                                    </Typography>
                                                </Paper>
                                            </Grid>
                                            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                                <Paper elevation={0} className="p-3 text-center bg-white">
                                                    <Typography variant="caption" color="textSecondary">Total Advance Paid</Typography>
                                                    <Typography variant="h5" className="text-green-600">
                                                        {overallTotals.totalAdvancePaid.toFixed(2)}
                                                    </Typography>
                                                </Paper>
                                            </Grid>
                                            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                                <Paper elevation={0} className="p-3 text-center bg-white">
                                                    <Typography variant="caption" color="textSecondary">Outstanding Balance</Typography>
                                                    <Typography variant="h5" className={overallTotals.totalBalance > 0 ? "text-red-600" : "text-green-600"}>
                                                        {overallTotals.totalBalance.toFixed(2)}
                                                    </Typography>
                                                </Paper>
                                            </Grid>
                                        </Grid>
                                        {/* Detailed overall totals */}
                                        <div className="mt-6">
                                            <Typography variant="subtitle2" className="mb-2">Financial Summary:</Typography>
                                            <Grid container spacing={2}>
                                                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                                    <Typography variant="body2">
                                                        <strong>Total Diesel:</strong> {overallTotals.totalDiesel.toFixed(2)}
                                                    </Typography>
                                                </Grid>
                                                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                                    <Typography variant="body2">
                                                        <strong>Total Trip Advance:</strong> {overallTotals.totalTripAdvance.toFixed(2)}
                                                    </Typography>
                                                </Grid>
                                                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                                    <Typography variant="body2">
                                                        <strong>Total Advance:</strong> {overallTotals.totalAdvance.toFixed(2)}
                                                    </Typography>
                                                </Grid>
                                                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                                    <Typography variant="body2">
                                                        <strong>Total Balance:</strong> {overallTotals.totalBalance.toFixed(2)}
                                                    </Typography>
                                                </Grid>
                                            </Grid>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    )
}
export default TripReport
