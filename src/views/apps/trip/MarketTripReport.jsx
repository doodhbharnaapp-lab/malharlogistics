'use client'
import { useState, useMemo, useRef, useEffect } from 'react'
import {
    Card,
    CardContent,
    Button,
    Typography,
    TextField,
    IconButton,
    Tooltip,
    Box,
    Grid,
    Paper,
    Chip,
    CircularProgress,
    Alert,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Divider
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import tableStyles from '@core/styles/table.module.css'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { useReactToPrint } from 'react-to-print'
const MarketTripReport = () => {
    /* ---------------- STATE ---------------- */
    const [data, setData] = useState([])
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
    const TRIPS_API = `${API_BASE}/trip/market`
    const ADVANCE_API = `${API_BASE}/trip/advance/market`
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
    /* ================= FETCH TRIPS WITH ADVANCE DATA ================= */
    useEffect(() => {
        const fetchTripData = async () => {
            try {
                setLoading(true)
                setError(null)
                // Fetch trips data
                const tripResponse = await fetch(TRIPS_API)
                if (!tripResponse.ok) {
                    throw new Error(`HTTP error! status: ${tripResponse.status}`)
                }
                const tripResult = await tripResponse.json()
                if (tripResult.success && tripResult.data) {
                    // Fetch advance data for each trip
                    const tripsWithAdvances = await Promise.all(
                        tripResult.data.map(async (trip, index) => {
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
                                return {
                                    id: trip._id || index,
                                    srNo: index + 1,
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
                                    advancePaid: totalPaid, // Actual paid amount from advance API
                                    balance: balance,
                                    endDate: trip.createdAt ?
                                        new Date(trip.createdAt).toLocaleDateString('en-IN', {
                                            day: '2-digit',
                                            month: 'short',
                                            year: 'numeric'
                                        }) : 'N/A',
                                    driverInfo: `${trip.driverName || 'N/A'} (${trip.driverMobile || 'N/A'})`,
                                    statusRemarks: trip.statusRemarks || '',
                                    // Additional fields for grouping and filtering
                                    vehicleNo: trip.vehicleNo,
                                    vehicleType: trip.vehicleType,
                                    driverName: trip.driverName,
                                    driverMobile: trip.driverMobile,
                                    tripStatus: trip.tripStatus,
                                    tripType: trip.tripType,
                                    // Advance details
                                    totalPaid: totalPaid,
                                    paidAdvancesCount: paidAdvancesCount,
                                    unpaidAdvancesCount: unpaidAdvancesCount,
                                    // For sorting
                                    sortableDate: trip.tripDate ? new Date(trip.tripDate) : new Date(0)
                                }
                            } catch (advanceError) {
                                console.error(`Error fetching advance for trip ${trip._id}:`, advanceError)
                                // Return trip without advance data if error
                                const balance = (trip.totalAdvanceAmount || 0)
                                return {
                                    id: trip._id || index,
                                    srNo: index + 1,
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
                                    balance: balance,
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
                    )
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
                } else {
                    throw new Error(tripResult.message || 'No data received')
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
        fetchTripData()
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
    // const handlePrint = useReactToPrint({
    //     content: () => componentRef.current,
    //     documentTitle: 'Vehicle_Wise_Trip_Report',
    //     onBeforePrint: () => console.log('Printing...'),
    //     onAfterPrint: () => console.log('Printed!'),
    //     removeAfterPrint: true,
    //     pageStyle: `
    //         @media print {
    //             body { -webkit-print-color-adjust: exact; }
    //             .no-print { display: none !important; }
    //             .vehicle-header {
    //                 background-color: #e3f2fd !important;
    //                 page-break-inside: avoid;
    //             }
    //             .vehicle-totals {
    //                 background-color: #f3e5f5 !important;
    //                 font-weight: bold;
    //             }
    //             .overall-totals {
    //                 background-color: #e8f5e8 !important;
    //                 font-weight: bold;
    //             }
    //         }
    //     `
    // })
    /* ---------------- EXPORT TO PDF WITH VEHICLE GROUPING ---------------- */
    const exportToPDF = () => {
        if (filteredData.length === 0) {
            alert('No data to export!')
            return
        }
        const doc = new jsPDF('landscape')
        let startY = 40
        const vehicleKeys = Object.keys(filteredGroupedData)
        // Header
        doc.setFontSize(16)
        doc.text('VEHICLE WISE TRIP REPORT', 14, 15)
        doc.setFontSize(10)
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 22)
        // Filters applied
        const filtersText = []
        if (filters.fromDate) filtersText.push(`From: ${filters.fromDate}`)
        if (filters.toDate) filtersText.push(`To: ${filters.toDate}`)
        if (filters.vehicleNo) filtersText.push(`Vehicle: ${filters.vehicleNo}`)
        if (filters.lhsNo) filtersText.push(`LHS: ${filters.lhsNo}`)
        if (filtersText.length > 0) {
            doc.text(`Filters: ${filtersText.join(', ')}`, 14, 29)
        }
        // Summary
        doc.text(`Total Vehicles: ${vehicleKeys.length} | Total Trips: ${filteredData.length}`, 14, 36)
        // Loop through each vehicle
        vehicleKeys.forEach((vehicleKey, vehicleIndex) => {
            const vehicleData = filteredGroupedData[vehicleKey]
            // Add vehicle header
            if (vehicleIndex > 0) {
                doc.addPage('landscape')
                startY = 20
            }
            // Vehicle header
            doc.setFontSize(12)
            doc.setTextColor(0, 102, 204)
            doc.text(`Vehicle: ${vehicleData.vehicleNo} (${vehicleData.vehicleType || 'N/A'})`, 14, startY)
            doc.setFontSize(10)
            doc.setTextColor(0, 0, 0)
            doc.text(`Driver: ${vehicleData.driverName || 'N/A'} | Trips: ${vehicleData.trips.length}`, 14, startY + 7)
            // Vehicle totals
            const vehicleTotals = [
                ['', '', '', '', '', '', 'Vehicle Totals:',
                    `${vehicleData.totals.totalDiesel.toFixed(2)}`,
                    `${vehicleData.totals.totalTripAdvance.toFixed(2)}`,
                    `${vehicleData.totals.totalAdvance.toFixed(2)}`,
                    `${vehicleData.totals.totalAdvancePaid.toFixed(2)}`,
                    '',
                    `${vehicleData.totals.totalBalance.toFixed(2)}`,
                    '', '']
            ]
            autoTable(doc, {
                startY: startY + 12,
                head: [
                    ['Sr No', 'Trip Date', 'LHS No.', 'From', 'To', 'Diesel LTR', 'Diesel Rate',
                        'Total Diesel', 'Trip Advance', 'Total Advance', 'Advance Paid', 'End Date',
                        'Balance', 'Driver Info', 'Close Remark']
                ],
                body: vehicleData.trips.map(trip => [
                    trip.srNo,
                    trip.tripDate,
                    trip.lhsNo,
                    trip.from,
                    trip.to,
                    trip.dieselLTR,
                    `${trip.dieselRate.toFixed(2)}`,
                    `${trip.totalDiesel.toFixed(2)}`,
                    `${trip.tripAdvance.toFixed(2)}`,
                    `${trip.totalAdvance.toFixed(2)}`,
                    `${trip.advancePaid.toFixed(2)}`,
                    trip.endDate,
                    `${trip.balance.toFixed(2)}`,
                    trip.driverInfo,
                    trip.statusRemarks || '-'
                ]),
                foot: vehicleTotals,
                theme: 'grid',
                headStyles: { fillColor: [33, 150, 243], textColor: 255 },
                footStyles: { fillColor: [156, 39, 176], textColor: 255, fontStyle: 'bold' },
                styles: { fontSize: 7 },
                margin: { left: 14, right: 14 },
                pageBreak: 'avoid'
            })
            startY = doc.lastAutoTable.finalY + 10
            // Check if we need a new page
            if (startY > 180 && vehicleIndex < vehicleKeys.length - 1) {
                doc.addPage('landscape')
                startY = 20
            }
        })
        // Overall summary page
        doc.addPage('landscape')
        doc.setFontSize(14)
        doc.text('OVERALL SUMMARY', 14, 20)
        doc.setFontSize(10)
        // Overall totals table
        autoTable(doc, {
            startY: 30,
            head: [['Summary', 'Value']],
            body: [
                ['Total Vehicles', vehicleKeys.length],
                ['Total Trips', filteredData.length],
                ['Total Diesel Amount', `${overallTotals.totalDiesel.toFixed(2)}`],
                ['Total Trip Advance', `${overallTotals.totalTripAdvance.toFixed(2)}`],
                ['Total Advance Amount', `${overallTotals.totalAdvance.toFixed(2)}`],
                ['Total Advance Paid', `${overallTotals.totalAdvancePaid.toFixed(2)}`],
                ['Total Outstanding Balance', `${overallTotals.totalBalance.toFixed(2)}`]
            ],
            theme: 'grid',
            headStyles: { fillColor: [76, 175, 80], textColor: 255 },
            styles: { fontSize: 10 },
            margin: { left: 14, right: 14 }
        })
        // Vehicle-wise summary
        autoTable(doc, {
            startY: doc.lastAutoTable.finalY + 20,
            head: [['Vehicle No', 'Vehicle Type', 'Trips', 'Total Advance', 'Paid', 'Balance', 'Status']],
            body: vehicleKeys.map(vehicleKey => {
                const vehicle = filteredGroupedData[vehicleKey]
                const balance = vehicle.totals.totalBalance
                let status = 'Fully Paid'
                let statusColor = [76, 175, 80] // Green
                if (balance === vehicle.totals.totalAdvance) {
                    status = 'Not Paid'
                    statusColor = [244, 67, 54] // Red
                } else if (balance > 0) {
                    status = 'Partial'
                    statusColor = [255, 152, 0] // Orange
                }
                return [
                    vehicle.vehicleNo,
                    vehicle.vehicleType || 'N/A',
                    vehicle.trips.length,
                    `${vehicle.totals.totalAdvance.toFixed(2)}`,
                    `${vehicle.totals.totalAdvancePaid.toFixed(2)}`,
                    `${balance.toFixed(2)}`,
                    status
                ]
            }),
            theme: 'grid',
            headStyles: { fillColor: [33, 150, 243], textColor: 255 },
            bodyStyles: {
                fillColor: (row) => {
                    const balance = filteredGroupedData[vehicleKeys[row.index]].totals.totalBalance
                    const totalAdvance = filteredGroupedData[vehicleKeys[row.index]].totals.totalAdvance
                    if (balance === 0) return [232, 245, 233] // Light green
                    if (balance === totalAdvance) return [255, 235, 238] // Light red
                    return [255, 248, 225] // Light yellow
                }
            },
            styles: { fontSize: 9 },
            margin: { left: 14, right: 14 }
        })
        // Footer
        const pageCount = doc.internal.getNumberOfPages()
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i)
            doc.setFontSize(8)
            doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.width - 30, doc.internal.pageSize.height - 10)
        }
        doc.save(`Vehicle_Wise_Trip_Report_${new Date().toISOString().split('T')[0]}.pdf`)
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
export default MarketTripReport
