'use client'
import { useState, useMemo, useRef, useEffect } from 'react'
import {
    Card,
    CardContent,
    Typography,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    TextField,
    MenuItem,
    Divider,
    IconButton,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    CircularProgress,
    Alert,
    Snackbar,
    Autocomplete,
    Grid,
    Box,
    Tabs,
    Tab,
    Paper
} from '@mui/material'
import {
    createColumnHelper,
    getCoreRowModel,
    useReactTable,
    flexRender
} from '@tanstack/react-table'
import tableStyles from '@core/styles/table.module.css'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
/* ================= CONSTANTS ================= */
const advanceTypes = [
    '1st Advance',
    '2nd Advance',
    '3rd Advance',
    '4th Advance',
    'Diesel 1',
    'Diesel 2'
]
const columnHelper = createColumnHelper()
/* ================================================= */
const AdvanceRegister = () => {
    /* ================= STATE ================= */
    const [rows, setRows] = useState([])
    const [allTrips, setAllTrips] = useState([]) // Store all trips for filtering
    const [loading, setLoading] = useState(true)
    const [open, setOpen] = useState(false)
    const [proceedOpen, setProceedOpen] = useState(false) // For proceed advances modal
    const [tabValue, setTabValue] = useState(0) // 0: Main Table, 1: Proceed Advances
    const [selectedDate, setSelectedDate] = useState(new Date())
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
    })
    const [trip, setTrip] = useState({
        id: null,
        _id: null,
        vehicleNo: '',
        vehicleType: '',
        fromLocation: '',
        toLocation: '',
        lhsNo: '',
        ifscCode: '',
        bankName: '',
        accountNo: '',
        accountHolderName: '',
        driverName: '',
        driverMobile: '',
        dieselLtr: '',
        dieselRate: '',
        totalDieselAmount: '',
        totalAdvanceAmount: 0,
        advanceAmount: 0,
        advances: [],
        tripStatus: '' // Add trip status
    })
    const [advanceForm, setAdvanceForm] = useState({
        advanceType: '',
        amount: '',
        remark: '',
        date: new Date().toISOString().split('T')[0] // Current date by default
    })
    const [formLoading, setFormLoading] = useState(false)
    const [proceedLoading, setProceedLoading] = useState(false)
    const [bulkProcessing, setBulkProcessing] = useState(false) // Add this new state
    const printRef = useRef()
    const [isPrinting, setIsPrinting] = useState(false)
    const [todayAdvances, setTodayAdvances] = useState([]) // Advances for today
    /* ================= API ENDPOINTS ================= */
    const API_BASE = '/api/apps'
    const TRIPS_API = `${API_BASE}/trip`
    const ADVANCES_API = `${API_BASE}/trip/advance`
    const ADVANCES_DATE_API = `${ADVANCES_API}/date`
    /* ================= FETCH TRIPS ================= */
    useEffect(() => {
        fetchTrips()
    }, [])
    /* ================= FETCH TODAY'S ADVANCES ================= */
    useEffect(() => {
        if (tabValue === 1) {
            fetchTodayAdvances()
        }
    }, [tabValue, selectedDate])
    const fetchTrips = async () => {
        try {
            setLoading(true)
            const response = await fetch(TRIPS_API)
            const result = await response.json()
            if (result.success) {
                // Store all trips
                const allTripsData = result.data || []
                setAllTrips(allTripsData)
                // Filter only active trips (tripStatus === 'active')
                const activeTrips = allTripsData.filter(trip =>
                    trip.tripStatus === 'active' || trip.tripStatus === 'Active'
                )
                // Fetch advances for each active trip
                const tripsWithAdvances = await Promise.all(
                    activeTrips.map(async (trip) => {
                        try {
                            const advancesResponse = await fetch(`${ADVANCES_API}?tripId=${trip._id || trip.id}`)
                            const advancesResult = await advancesResponse.json()
                            // Calculate total paid and available balance
                            const advances = advancesResult.success ? advancesResult.data : []
                            const totalPaid = advances
                                .filter(a => a.status === 'paid')
                                .reduce((s, a) => s + Number(a.amount || 0), 0)
                            const totalProposed = advances
                                .filter(a => a.status === 'unpaid')
                                .reduce((s, a) => s + Number(a.amount || 0), 0)
                            const balance = (trip.totalAdvanceAmount || 0) - totalPaid
                            const availableBalance = balance - totalProposed // Available for new advances
                            return {
                                ...trip,
                                advances: advances,
                                totalAdvancePaid: totalPaid,
                                totalProposed: totalProposed,
                                balance: balance,
                                availableBalance: availableBalance
                            }
                        } catch (error) {
                            console.error(`Error fetching advances for trip ${trip._id}:`, error)
                            return {
                                ...trip,
                                advances: [],
                                totalAdvancePaid: 0,
                                totalProposed: 0,
                                balance: trip.totalAdvanceAmount || 0,
                                availableBalance: trip.totalAdvanceAmount || 0
                            }
                        }
                    })
                )
                setRows(tripsWithAdvances || [])
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
    /* ================= FETCH TODAY'S ADVANCES FOR PROCESSING ================= */
    const fetchTodayAdvances = async () => {
        try {
            setProceedLoading(true)
            const formattedDate = selectedDate.toISOString().split('T')[0]
            const response = await fetch(`${ADVANCES_DATE_API}?date=${formattedDate}`)
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`)
            }
            const result = await response.json()
            if (result.success) {
                setTodayAdvances(result.data || [])
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
    /* ================= FETCH TRIP WITH ADVANCES ================= */
    const fetchTripWithAdvances = async (tripId) => {
        try {
            setFormLoading(true)
            // Fetch trip details
            const tripResponse = await fetch(`${TRIPS_API}?id=${tripId}`)
            const tripResult = await tripResponse.json()
            if (!tripResult.success || !tripResult.data) {
                showSnackbar('Trip not found', 'error')
                return null
            }
            // Fetch advances for this trip
            const advancesResponse = await fetch(`${ADVANCES_API}?tripId=${tripId}`)
            const advancesResult = await advancesResponse.json()
            const advances = advancesResult.success ? advancesResult.data : []
            // Calculate totals
            const totalPaid = advances
                .filter(a => a.status === 'paid')
                .reduce((s, a) => s + Number(a.amount || 0), 0)
            const totalProposed = advances
                .filter(a => a.status === 'unpaid')
                .reduce((s, a) => s + Number(a.amount || 0), 0)
            const totalAdvance = Array.isArray(tripResult.data) ? tripResult.data[0].totalAdvanceAmount : tripResult.data.totalAdvanceAmount
            const balance = totalAdvance - totalPaid
            const availableBalance = balance - totalProposed
            return {
                trip: Array.isArray(tripResult.data)
                    ? tripResult.data[0]
                    : tripResult.data,
                advances: advances,
                totalPaid: totalPaid,
                totalProposed: totalProposed,
                balance: balance,
                availableBalance: availableBalance
            }
        } catch (error) {
            console.error('Error fetching trip with advances:', error)
            showSnackbar('Error loading trip details', 'error')
            return null
        } finally {
            setFormLoading(false)
        }
    }
    /* ================= GET AVAILABLE ADVANCE TYPES ================= */
    // const getAvailableAdvanceTypes = () => {
    //     if (!trip.advances || trip.advances.length === 0) {
    //         return advanceTypes
    //     }
    //     // Get all advance types already used in this trip
    //     const usedTypes = trip.advances.map(adv => adv.advanceType)
    //     // Filter out already used types
    //     return advanceTypes.filter(type => !usedTypes.includes(type))
    // }
    /* ================= GET AVAILABLE ADVANCE TYPES ================= */
    /* ================= GET AVAILABLE ADVANCE TYPES ================= */
    const getAvailableAdvanceTypes = () => {
        if (!trip.advances || trip.advances.length === 0) {
            return advanceTypes
        }

        // Get all advance types already used on the selected date
        const usedTypesOnSelectedDate = trip.advances
            .filter(adv => adv.date === advanceForm.date)
            .map(adv => adv.advanceType)

        // Filter out types used on the selected date
        return advanceTypes.filter(type => !usedTypesOnSelectedDate.includes(type))
    }
    /* ================= CALCULATIONS ================= */
    const totalDiesel = Number(trip.dieselLtr || 0) * Number(trip.dieselRate || 0)
    // Calculate only PAID advances
    const totalAdvancePaid = trip.advances
        .filter(a => a.status === 'paid')
        .reduce((s, a) => s + Number(a.amount || 0), 0)
    // Calculate UNPAID/Proposed advances
    const totalProposedUnpaid = trip.advances
        .filter(a => a.status !== 'paid')
        .reduce((s, a) => s + Number(a.amount || 0), 0)
    const totalAdvanceAmount = trip.totalAdvanceAmount || 0
    const balance = totalAdvanceAmount - totalAdvancePaid
    const availableBalance = balance - totalProposedUnpaid // Available for new advances
    /* ================= ADD / EDIT ================= */
    const openAdd = () => {
        setTrip({
            id: null,
            _id: null,
            vehicleNo: '',
            vehicleType: '',
            fromLocation: '',
            toLocation: '',
            lhsNo: '',
            ifscCode: '',
            bankName: '',
            accountNo: '',
            accountHolderName: '',
            driverName: '',
            driverMobile: '',
            dieselLtr: '',
            dieselRate: '',
            totalDieselAmount: '',
            totalAdvanceAmount: 0,
            advanceAmount: 0,
            advances: [],
            tripStatus: ''
        })
        setOpen(true)
    }
    const openEdit = async (row) => {
        try {
            if (!row._id && !row.id) {
                showSnackbar('Trip ID is required', 'error')
                return
            }
            // Check if trip is active
            if (row.tripStatus && row.tripStatus !== 'active' && row.tripStatus !== 'Active') {
                showSnackbar(`Cannot edit trip with status: ${row.tripStatus}. Only active trips can be managed.`, 'error')
                return
            }
            const tripId = row._id || row.id
            const data = await fetchTripWithAdvances(tripId)
            if (data) {
                const { trip: tripData, advances, totalPaid, totalProposed, balance: tripBalance, availableBalance: availBalance } = data
                setTrip({
                    id: tripData.id || null,
                    _id: tripData._id || tripId,
                    vehicleNo: tripData.vehicleNo || '',
                    vehicleType: tripData.vehicleType || '',
                    fromLocation: tripData.fromLocation || '',
                    toLocation: tripData.toLocation || '',
                    lhsNo: tripData.lhsNo || '',
                    ifscCode: tripData.ifscCode || '',
                    bankName: tripData.bankName || '',
                    accountNo: tripData.accountNo || '',
                    accountHolderName: tripData.accountHolderName || '',
                    driverName: tripData.driverName || '',
                    driverMobile: tripData.driverMobile || '',
                    dieselLtr: tripData.dieselLtr || 0,
                    dieselRate: tripData.dieselRate || 0,
                    totalDieselAmount: tripData.totalDieselAmount || 0,
                    totalAdvanceAmount: tripData.totalAdvanceAmount || 0,
                    advances: advances,
                    advanceAmount: tripData.advanceAmount || 0,
                    tripStatus: tripData.tripStatus || '',
                    totalPaid: totalPaid,
                    totalProposed: totalProposed,
                    balance: tripBalance,
                    availableBalance: availBalance
                })
                setOpen(true)
            }
        } catch (error) {
            console.error('Error opening edit:', error)
            showSnackbar('Error loading trip details', 'error')
        }
    }
    /* ================= ADD ADVANCE (as UNPAID) ================= */
    // const addAdvance = async () => {
    //     if (!advanceForm.advanceType || !advanceForm.amount || !trip._id || !trip.vehicleNo) {
    //         showSnackbar('Please fill all required fields', 'warning')
    //         return
    //     }
    //     // Check if trip is active
    //     if (trip.tripStatus && trip.tripStatus !== 'active' && trip.tripStatus !== 'Active') {
    //         showSnackbar(`Cannot add advance to trip with status: ${trip.tripStatus}`, 'error')
    //         return
    //     }
    //     const amount = Number(advanceForm.amount)
    //     // Check if proposed amount exceeds available balance
    //     if (amount > availableBalance) {
    //         showSnackbar(`Cannot exceed available balance (${availableBalance.toFixed(2)})`, 'error')
    //         return
    //     }
    //     // Check if amount is positive
    //     if (amount <= 0) {
    //         showSnackbar('Amount must be greater than 0', 'error')
    //         return
    //     }
    //     try {
    //         setFormLoading(true)
    //         const response = await fetch(ADVANCES_API, {
    //             method: 'POST',
    //             headers: { 'Content-Type': 'application/json' },
    //             body: JSON.stringify({
    //                 tripId: trip._id,
    //                 vehicleNo: trip.vehicleNo,
    //                 advanceType: advanceForm.advanceType,
    //                 amount: amount,
    //                 remark: advanceForm.remark,
    //                 date: advanceForm.date, // Use selected date
    //                 status: 'unpaid'  // Default status is unpaid
    //             })
    //         })
    //         const result = await response.json()
    //         if (result.success) {
    //             // Refresh advances for this trip
    //             const data = await fetchTripWithAdvances(trip._id)
    //             if (data) {
    //                 setTrip(prev => ({
    //                     ...prev,
    //                     advances: data.advances,
    //                     totalPaid: data.totalPaid,
    //                     totalProposed: data.totalProposed,
    //                     balance: data.balance,
    //                     availableBalance: data.availableBalance
    //                 }))
    //             }
    //             // Reset advance form with cleared advance type (to force refresh of available types)
    //             setAdvanceForm({
    //                 advanceType: '',
    //                 amount: '',
    //                 remark: '',
    //                 date: new Date().toISOString().split('T')[0]
    //             })
    //             showSnackbar('Advance proposed successfully', 'success')
    //             // Refresh the main table data
    //             await fetchTrips()
    //         } else {
    //             showSnackbar(result.error || 'Failed to add advance', 'error')
    //         }
    //     } catch (error) {
    //         console.error('Error adding advance:', error)
    //         showSnackbar('Error adding advance', 'error')
    //     } finally {
    //         setFormLoading(false)
    //     }
    // }
    /* ================= ADD ADVANCE (as UNPAID) ================= */
    /* ================= ADD ADVANCE (as UNPAID) ================= */
    /* ================= ADD ADVANCE (as UNPAID) ================= */
    const addAdvance = async () => {
        if (!advanceForm.advanceType || !advanceForm.amount || !trip._id || !trip.vehicleNo) {
            showSnackbar('Please fill all required fields', 'warning')
            return
        }

        // Check if trip is active
        if (trip.tripStatus && trip.tripStatus !== 'active' && trip.tripStatus !== 'Active') {
            showSnackbar(`Cannot add advance to trip with status: ${trip.tripStatus}`, 'error')
            return
        }

        const amount = Number(advanceForm.amount)

        // Check if proposed amount exceeds available balance
        if (amount > availableBalance) {
            showSnackbar(`Cannot exceed available balance (${availableBalance.toFixed(2)})`, 'error')
            return
        }

        // Check if amount is positive
        if (amount <= 0) {
            showSnackbar('Amount must be greater than 0', 'error')
            return
        }

        try {
            setFormLoading(true)
            const response = await fetch(ADVANCES_API, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tripId: trip._id,
                    vehicleNo: trip.vehicleNo,
                    advanceType: advanceForm.advanceType,
                    amount: amount,
                    remark: advanceForm.remark,
                    date: advanceForm.date,
                    status: 'unpaid'
                })
            })

            const result = await response.json()

            if (result.success) {
                // Refresh advances for this trip
                const data = await fetchTripWithAdvances(trip._id)
                if (data) {
                    setTrip(prev => ({
                        ...prev,
                        advances: data.advances,
                        totalPaid: data.totalPaid,
                        totalProposed: data.totalProposed,
                        balance: data.balance,
                        availableBalance: data.availableBalance
                    }))
                }

                // Reset advance form
                setAdvanceForm({
                    advanceType: '',
                    amount: '',
                    remark: '',
                    date: new Date().toISOString().split('T')[0]
                })
                showSnackbar('Advance proposed successfully', 'success')

                // Refresh the main table data
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
    /* ================= MARK ADVANCE AS PAID ================= */
    const markAdvanceAsPaid = async (advanceId) => {
        try {
            setProceedLoading(true)
            const response = await fetch(ADVANCES_API, {
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
    /* ================= DELETE ADVANCE ================= */
    const deleteAdvance = async (advanceId) => {
        if (!advanceId) return
        if (!confirm('Are you sure you want to delete this advance?')) return
        try {
            setFormLoading(true)
            const response = await fetch(ADVANCES_API, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ advanceId })
            })
            const result = await response.json()
            if (result.success) {
                // Refresh advances for this trip
                const data = await fetchTripWithAdvances(trip._id)
                if (data) {
                    setTrip(prev => ({
                        ...prev,
                        advances: data.advances,
                        totalPaid: data.totalPaid,
                        totalProposed: data.totalProposed,
                        balance: data.balance,
                        availableBalance: data.availableBalance
                    }))
                }
                showSnackbar('Advance deleted successfully', 'success')
                // Refresh the main table data
                await fetchTrips()
                // Refresh today's advances if on that tab
                if (tabValue === 1) {
                    await fetchTodayAdvances()
                }
            } else {
                showSnackbar(result.error || 'Failed to delete advance', 'error')
            }
        } catch (error) {
            console.error('Error deleting advance:', error)
            showSnackbar('Error deleting advance', 'error')
        } finally {
            setFormLoading(false)
        }
    }
    /* ================= EXPORT TO PDF FUNCTION ================= */
    const exportToPDF = () => {
        try {
            // Create new PDF document with larger format
            const doc = new jsPDF({
                orientation: 'landscape',
                unit: 'mm',
                format: 'a3' // Use A3 for better visibility
            })

            const currentDate = new Date().toLocaleDateString('en-IN')
            const currentTime = new Date().toLocaleTimeString('en-IN', {
                hour: '2-digit',
                minute: '2-digit'
            })

            // Add header
            doc.setFillColor(25, 118, 210)
            doc.rect(0, 0, doc.internal.pageSize.width, 40, 'F')

            // Title
            doc.setTextColor(255, 255, 255)
            doc.setFontSize(20)
            doc.setFont('helvetica', 'bold')
            doc.text('ADVANCE REGISTER REPORT', doc.internal.pageSize.width / 2, 20, { align: 'center' })

            // Subtitle
            doc.setFontSize(11)
            doc.setFont('helvetica', 'normal')
            doc.text(`Generated on: ${currentDate} at ${currentTime}`, doc.internal.pageSize.width / 2, 32, { align: 'center' })

            // Prepare table data
            const tableData = rows.map((trip, index) => {
                // Calculate amounts
                const paidAdvances = trip.advances?.filter(a => a.status === 'paid') || []
                const unpaidAdvances = trip.advances?.filter(a => a.status !== 'paid') || []

                const totalAdvancePaid = paidAdvances.reduce((s, a) => s + Number(a.amount || 0), 0)
                const totalUnpaid = unpaidAdvances.reduce((s, a) => s + Number(a.amount || 0), 0)
                const balance = (trip.totalAdvanceAmount || 0) - totalAdvancePaid

                // Get trip date
                let tripDate = trip.createdAt ? new Date(trip.createdAt).toLocaleDateString('en-IN') : 'N/A'
                if (!tripDate || tripDate === 'Invalid Date') {
                    const dates = trip.advances?.map(a => a.date).filter(d => d) || []
                    if (dates.length > 0) {
                        dates.sort()
                        tripDate = dates[0]
                    }
                }

                // Get latest unpaid advance amount
                const latestUnpaidAdvance = unpaidAdvances.length > 0
                    ? Number(unpaidAdvances[unpaidAdvances.length - 1]?.amount || 0).toFixed(2)
                    : '0.00'

                // Format account number for privacy
                const formattedAccountNo = trip.accountNo
                    ? trip.accountNo.length > 8
                        ? `XXXX${trip.accountNo.slice(-4)}`
                        : trip.accountNo
                    : 'N/A'

                // Get latest remark
                const latestRemark = unpaidAdvances.length > 0
                    ? (unpaidAdvances[unpaidAdvances.length - 1]?.remark || 'N/A')
                    : 'N/A'

                // Format amounts with thousand separators
                const formatAmount = (amount) => {
                    return parseFloat(amount).toLocaleString('en-IN', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                    })
                }

                return [
                    (index + 1).toString(), // Sr. No.
                    tripDate, // Trip Date
                    trip.lhsNo || 'N/A', // LHS No.
                    trip.vehicleNo || 'N/A', // Vehicle No
                    trip.fromLocation || 'N/A', // From
                    trip.toLocation || 'N/A', // To
                    formatAmount(trip.totalAdvanceAmount || 0), // Total Advance
                    formatAmount(totalAdvancePaid), // Advance Paid
                    formatAmount(latestUnpaidAdvance), // Advance (Unpaid)
                    formatAmount(balance), // Balance
                    trip.ifscCode || 'N/A', // IFSC Code
                    formattedAccountNo, // Account No
                    trip.bankName || 'N/A', // Bank Name
                    trip.accountHolderName || 'N/A', // Account Holder Name
                    latestRemark.substring(0, 50) // Remark (truncate if too long)
                ]
            })

            // Define column widths - optimized for A3 landscape
            const columnWidths = [
                15,  // 0: Sr. No.
                25,  // 1: Trip Date
                25,  // 2: LHS No.
                28,  // 3: Vehicle No
                25,  // 4: From
                25,  // 5: To
                28,  // 6: Total Advance
                28,  // 7: Advance Paid
                28,  // 9: Balance
                25,  // 10: IFSC Code
                35,  // 11: Account No
                30,  // 12: Bank Name
                30,  // 13: Account Holder
                30,  // 8: Advance (Unpaid)
                30   // 14: Remark
            ]

            // AutoTable configuration
            autoTable(doc, {
                startY: 45,
                head: [
                    [
                        'Sr. No.',
                        'Trip Date',
                        'LHS No.',
                        'Vehicle No',
                        'From',
                        'To',
                        'Total Advance',
                        'Advance Paid',
                        'Advance (Unpaid)',
                        'Balance',
                        'IFSC Code',
                        'Account No',
                        'Bank Name',
                        'Account Holder',
                        'Remark'
                    ]
                ],
                body: tableData,
                theme: 'grid',
                headStyles: {
                    fillColor: [41, 128, 185], // Blue header
                    textColor: 255,
                    fontSize: 9,
                    fontStyle: 'bold',
                    halign: 'center',
                    cellPadding: 4,
                    lineWidth: 0.5,
                    lineColor: [255, 255, 255]
                },
                bodyStyles: {
                    fontSize: 8,
                    cellPadding: 3,
                    lineColor: [200, 200, 200],
                    lineWidth: 0.2,
                    textColor: [50, 50, 50]
                },
                alternateRowStyles: {
                    fillColor: [245, 245, 245]
                },
                columnStyles: {
                    0: {
                        cellWidth: columnWidths[0],
                        halign: 'center',
                        valign: 'middle'
                    },
                    1: {
                        cellWidth: columnWidths[1],
                        halign: 'center'
                    },
                    2: {
                        cellWidth: columnWidths[2],
                        halign: 'center'
                    },
                    3: {
                        cellWidth: columnWidths[3],
                        halign: 'center'
                    },
                    4: {
                        cellWidth: columnWidths[4],
                        halign: 'center'
                    },
                    5: {
                        cellWidth: columnWidths[5],
                        halign: 'center'
                    },
                    6: {
                        cellWidth: columnWidths[6],
                        halign: 'right',
                        fontStyle: 'bold'
                    },
                    7: {
                        cellWidth: columnWidths[7],
                        halign: 'right',
                        fontStyle: 'bold'
                    },
                    8: {
                        cellWidth: columnWidths[8],
                        halign: 'right',
                        fontStyle: 'bold',
                        fillColor: [255, 243, 205] // Highlight unpaid advances
                    },
                    9: {
                        cellWidth: columnWidths[9],
                        halign: 'right',
                        fontStyle: 'bold'
                    },
                    10: {
                        cellWidth: columnWidths[10],
                        halign: 'center'
                    },
                    11: {
                        cellWidth: columnWidths[11],
                        halign: 'center'
                    },
                    12: {
                        cellWidth: columnWidths[12],
                        halign: 'center'
                    },
                    13: {
                        cellWidth: columnWidths[13],
                        halign: 'center'
                    },
                    14: {
                        cellWidth: columnWidths[14],
                        halign: 'left'
                    }
                },
                styles: {
                    overflow: 'linebreak',
                    cellWidth: 'auto',
                    minCellHeight: 8,
                    valign: 'middle'
                },
                margin: {
                    left: 5,
                    right: 5,
                    top: 45,
                    bottom: 40
                },
                tableWidth: 'auto',
                didParseCell: function (data) {
                    // Skip header rows
                    if (data.row.index < 0) return;

                    // Convert cell text to string for processing
                    let cellText = '';
                    if (Array.isArray(data.cell.text)) {
                        cellText = data.cell.text.join(' ');
                    } else if (typeof data.cell.text === 'string') {
                        cellText = data.cell.text;
                    } else if (data.cell.text != null) {
                        cellText = String(data.cell.text);
                    }

                    // Color code balance column
                    if (data.column.index === 9) {
                        // Remove commas and convert to number
                        const balanceText = cellText.replace(/,/g, '');
                        const balance = parseFloat(balanceText);

                        if (!isNaN(balance)) {
                            if (balance < 0) {
                                data.cell.styles.fillColor = [255, 230, 230]; // Light red
                                data.cell.styles.textColor = [255, 0, 0];
                            } else if (balance === 0) {
                                data.cell.styles.fillColor = [230, 255, 230]; // Light green
                                data.cell.styles.textColor = [0, 128, 0];
                            }
                        }
                    }

                    // Highlight if unpaid advance exists
                    if (data.column.index === 8) {
                        // Remove commas and convert to number
                        const unpaidText = cellText.replace(/,/g, '');
                        const unpaid = parseFloat(unpaidText);

                        if (!isNaN(unpaid) && unpaid > 0) {
                            data.cell.styles.textColor = [220, 53, 69]; // Red for pending
                        }
                    }
                },
                didDrawPage: function (data) {
                    // Footer
                    const pageCount = doc.internal.getNumberOfPages();
                    const pageHeight = doc.internal.pageSize.height;

                    // Footer separator
                    doc.setDrawColor(180, 180, 180);
                    doc.setLineWidth(0.3);
                    doc.line(10, pageHeight - 20, doc.internal.pageSize.width - 10, pageHeight - 20);

                    // Page number
                    doc.setFontSize(9);
                    doc.setTextColor(100);
                    doc.setFont('helvetica', 'normal');
                    doc.text(
                        `Page ${data.pageNumber} of ${pageCount}`,
                        doc.internal.pageSize.width / 2,
                        pageHeight - 10,
                        { align: 'center' }
                    );

                    // Company footer
                    doc.setFontSize(8);
                    doc.text(
                        '© Transport Management System',
                        doc.internal.pageSize.width / 2,
                        pageHeight - 5,
                        { align: 'center' }
                    );
                }
            })

            // Calculate totals
            const totalAdvanceSum = rows.reduce((sum, trip) => sum + (trip.totalAdvanceAmount || 0), 0)
            const totalPaidSum = rows.reduce((sum, trip) => {
                const paidAdvances = trip.advances?.filter(a => a.status === 'paid') || []
                return sum + paidAdvances.reduce((s, a) => s + Number(a.amount || 0), 0)
            }, 0)
            const totalUnpaidSum = rows.reduce((sum, trip) => {
                const unpaidAdvances = trip.advances?.filter(a => a.status !== 'paid') || []
                return sum + unpaidAdvances.reduce((s, a) => s + Number(a.amount || 0), 0)
            }, 0)
            const totalBalanceSum = rows.reduce((sum, trip) => {
                const paidAdvances = trip.advances?.filter(a => a.status === 'paid') || []
                const totalPaid = paidAdvances.reduce((s, a) => s + Number(a.amount || 0), 0)
                return sum + ((trip.totalAdvanceAmount || 0) - totalPaid)
            }, 0)

            // Add summary section
            const finalY = doc.lastAutoTable.finalY || 50

            doc.setFillColor(248, 249, 250)
            doc.rect(5, finalY + 5, doc.internal.pageSize.width - 10, 35, 'F')

            // Draw border around summary
            doc.setDrawColor(200, 200, 200)
            doc.setLineWidth(0.3)
            doc.rect(5, finalY + 5, doc.internal.pageSize.width - 10, 35)

            doc.setFontSize(12)
            doc.setTextColor(33, 37, 41)
            doc.setFont('helvetica', 'bold')
            doc.text('SUMMARY', 10, finalY + 15)

            doc.setDrawColor(200, 200, 200)
            doc.setLineWidth(0.2)
            doc.line(10, finalY + 18, 60, finalY + 18)

            // Format numbers for summary
            const formatCurrency = (amount) => {
                return amount.toLocaleString('en-IN', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                })
            }

            // Financial summary in two columns
            doc.setFontSize(9)
            doc.setFont('helvetica', 'normal')

            // Left column
            doc.text([
                `Total Trips: ${rows.length}`,
                `Total Advance Amount: ${formatCurrency(totalAdvanceSum)}`,
                `Total Paid: ${formatCurrency(totalPaidSum)}`
            ], 10, finalY + 25)

            // Right column
            doc.text([
                `Total Unpaid: ${formatCurrency(totalUnpaidSum)}`,
                `Total Balance: ${formatCurrency(totalBalanceSum)}`,
                `Report Date: ${currentDate}`
            ], doc.internal.pageSize.width / 2, finalY + 25)

            // Add trip status summary
            const activeTrips = rows.filter(t => t.tripStatus === 'active' || t.tripStatus === 'Active').length
            const completedTrips = rows.filter(t => t.tripStatus === 'completed' || t.tripStatus === 'Completed').length
            const otherStatusTrips = rows.length - activeTrips - completedTrips

            doc.setFont('helvetica', 'italic')
            doc.setTextColor(108, 117, 125)
            doc.setFontSize(8)
            doc.text(
                `Status: Active: ${activeTrips} | Completed: ${completedTrips} | Other: ${otherStatusTrips}`,
                10,
                finalY + 35
            )

            // Save the PDF
            const fileName = `Advance_Register_${new Date().toISOString().split('T')[0]}.pdf`
            doc.save(fileName)

            showSnackbar('PDF exported successfully!', 'success')

        } catch (error) {
            console.error('Error exporting to PDF:', error)
            showSnackbar('Failed to export PDF: ' + error.message, 'error')
        }
    }
    /* ================= OPEN PROCEED ADVANCES MODAL ================= */
    const openProceedAdvances = () => {
        setProceedOpen(true)
        fetchTodayAdvances()
    }
    const buildTripPrintHTML = (trip) => {
        const paidAdvances = trip.advances.filter(a => a.status === 'paid')
        const unpaidAdvances = trip.advances.filter(a => a.status !== 'paid')
        const totalPaid = paidAdvances.reduce((s, a) => s + Number(a.amount || 0), 0)
        const totalUnpaid = unpaidAdvances.reduce((s, a) => s + Number(a.amount || 0), 0)
        const totalDiesel =
            Number(trip.dieselLtr || 0) * Number(trip.dieselRate || 0)
        const balance = Number(trip.totalAdvanceAmount || 0) - totalPaid
        return `
<!DOCTYPE html>
<html>
<head>
  <title>Trip Advance Sheet</title>
  <style>
    body { font-family: Arial, sans-serif; font-size: 13px; }
    h2 { text-align: center; margin-bottom: 10px; }
    .print-date { text-align: right; font-size: 12px; margin-bottom: 10px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 12px; }
    td, th { border: 1px solid #333; padding: 6px; }
    th { background: #4f6fa8; color: #fff; font-weight: bold; text-align: center; }
    .label { font-weight: bold; width: 20%; background: #f5f5f5; }
    .value { width: 30%; }
    .section-title {
      background: #4f6fa8;
      color: #fff;
      font-weight: bold;
      text-align: center;
    }
    .total-row td {
      font-weight: bold;
      background: #e8f5e9;
    }
  </style>
</head>
<body>
  <h2>Trip Details</h2>
  <div class="print-date">
    Print Date: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}
  </div>
  <!-- TRIP DETAILS TABLE -->
  <table>
    <tr>
      <td class="label">Vehicle No</td><td>${trip.vehicleNo}</td>
      <td class="label">Vehicle Type</td><td>${trip.vehicleType}</td>
    </tr>
    <tr>
      <td class="label">From</td><td>${trip.fromLocation}</td>
      <td class="label">To</td><td>${trip.toLocation}</td>
    </tr>
    <tr>
      <td class="label">LHS No</td><td>${trip.lhsNo}</td>
      <td class="label">Driver Name</td><td>${trip.driverName}</td>
    </tr>
    <tr>
      <td class="label">Driver Mobile</td><td>${trip.driverMobile || 'N/A'}</td>
      <td class="label">Bank Name</td><td>${trip.bankName || 'N/A'}</td>
    </tr>
    <tr>
      <td class="label">Account No</td><td>${trip.accountNo || 'N/A'}</td>
      <td class="label">Account Holder</td><td>${trip.accountHolderName || 'N/A'}</td>
    </tr>
    <tr>
      <td class="label">IFSC Code</td><td>${trip.ifscCode || 'N/A'}</td>
      <td class="label">Status</td><td>${trip.tripStatus || 'Active'}</td>
    </tr>
    <tr>
      <td class="label">Diesel LTR</td><td>${trip.dieselLtr}</td>
      <td class="label">Diesel Rate</td><td>${trip.dieselRate}</td>
    </tr>
    <tr>
      <td class="label">Total Diesel</td><td>${totalDiesel.toFixed(2)}</td>
      <td class="label">Advance Amount</td><td>${trip.advanceAmount.toFixed(2)}</td>
    </tr>
    <tr>
      <td class="label">Total Advance</td><td>${trip.totalAdvanceAmount.toFixed(2)}</td>
      <td class="label">Advance Paid</td><td>${totalPaid.toFixed(2)}</td>
    </tr>
    <tr>
      <td class="label">Balance Advance</td><td>${balance.toFixed(2)}</td>
      <td></td>
    </tr>
  </table>
  <!-- PAID ADVANCES -->
  <table>
    <tr><th colspan="4">Paid Advance Info</th></tr>
    <tr>
      <th>Date</th><th>Type</th><th>Amount</th><th>Remark</th>
    </tr>
    ${paidAdvances.map(a => `
      <tr>
        <td>${a.date}</td>
        <td>${a.advanceType}</td>
        <td>${a.amount}</td>
        <td>${a.remark || ''}</td>
      </tr>
    `).join('')}
    <tr class="total-row">
      <td colspan="2">Total</td>
      <td colspan="2">${totalPaid.toFixed(2)}</td>
    </tr>
  </table>
  <!-- UNPAID ADVANCES -->
  <table>
    <tr><th colspan="4">Unpaid Advance Info</th></tr>
    <tr>
      <th>Date</th><th>Type</th><th>Amount</th><th>Remark</th>
    </tr>
    ${unpaidAdvances.length === 0 ? `
      <tr><td colspan="4" style="text-align:center">No Unpaid Advances</td></tr>
    ` : unpaidAdvances.map(a => `
      <tr>
        <td>${a.date}</td>
        <td>${a.advanceType}</td>
        <td>${a.amount}</td>
        <td>${a.remark || ''}</td>
      </tr>
    `).join('')}
    <tr class="total-row">
      <td colspan="2">Total</td>
      <td colspan="2">${totalUnpaid.toFixed(2)}</td>
    </tr>
  </table>
</body>
</html>
`
    }
    /* ================= PRINT ================= */
    const handleTripPrint = () => {
        if (!trip._id) {
            showSnackbar('Trip not selected', 'warning')
            return
        }
        const printWindow = window.open('', '_blank', 'width=900,height=650')
        printWindow.document.write(buildTripPrintHTML(trip))
        printWindow.document.close()
        printWindow.onload = () => {
            printWindow.focus()
            printWindow.print()
        }
    }
    /* ================= SNACKBAR ================= */
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
    /* ================= CLOSE MODALS ================= */
    const handleCloseModal = async () => {
        setOpen(false)
        await fetchTrips()
    }
    const handleCloseProceedModal = async () => {
        setProceedOpen(false)
        await fetchTrips()
    }
    /* ================= TABLE COLUMNS ================= */
    const columns = useMemo(
        () => [
            columnHelper.accessor('vehicleNo', { header: 'Vehicle No' }),
            columnHelper.accessor('vehicleType', { header: 'Vehicle Type' }),
            columnHelper.accessor('fromLocation', { header: 'From' }),
            columnHelper.accessor('toLocation', { header: 'To' }),
            columnHelper.accessor('lhsNo', { header: 'LHS No' }),
            columnHelper.accessor('driverName', { header: 'Driver' }),
            columnHelper.display({
                header: 'Total Advance',
                cell: ({ row }) => {
                    const totalAdvanceAmount = Number(row.original.totalAdvanceAmount || 0)
                    return `${totalAdvanceAmount.toFixed(2)}`
                }
            }),
            columnHelper.display({
                header: 'Paid',
                cell: ({ row }) => {
                    const totalAdvancePaid = row.original.totalAdvancePaid || 0
                    return `${totalAdvancePaid.toFixed(2)}`
                }
            }),
            columnHelper.display({
                header: 'Balance',
                cell: ({ row }) => {
                    const balance = row.original.balance || 0
                    const color = balance === 0 ? 'success.main' : balance > 0 ? 'warning.main' : 'error.main'
                    return (
                        <Typography color={color} fontWeight="bold">
                            {balance.toFixed(2)}
                        </Typography>
                    )
                }
            }),
            columnHelper.display({
                header: 'Available',
                cell: ({ row }) => {
                    const available = row.original.availableBalance || 0
                    const color = available > 0 ? 'info.main' : 'text.disabled'
                    return (
                        <Typography color={color} fontWeight="bold">
                            {available.toFixed(2)}
                        </Typography>
                    )
                }
            }),
            columnHelper.display({
                header: 'Action',
                cell: ({ row }) => {
                    const status = row.original.tripStatus || 'active'
                    const isActive = status === 'active' || status === 'Active'
                    const balance = row.original.balance || 0
                    const hasBalance = balance > 0
                    return (
                        <Button
                            size="small"
                            variant="outlined"
                            onClick={() => openEdit(row.original)}
                            disabled={loading || !isActive || !hasBalance}
                            title={
                                !isActive ? `Trip is ${status}. Cannot manage advances.` :
                                    !hasBalance ? 'Trip balance is 0. Cannot manage advances.' :
                                        'View/Manage Advances'
                            }
                        >
                            {isActive && hasBalance ? 'View/Manage' :
                                !hasBalance ? 'No Balance' : 'View Only'}
                        </Button>
                    )
                }
            })
        ],
        [loading]
    )
    const table = useReactTable({
        data: rows,
        columns,
        getCoreRowModel: getCoreRowModel()
    })
    /* ================= BULK PROCEED FOR SELECTED DATE ================= */
    const bulkProceedSelectedDateAdvances = async () => {
        try {
            setBulkProcessing(true)
            if (!selectedDate) {
                showSnackbar('Please select a date first', 'warning')
                return
            }
            const formattedDate = selectedDate.toISOString().split('T')[0]
            // Fetch ALL advances for selected date (not just unpaid)
            const response = await fetch(`${ADVANCES_DATE_API}?date=${formattedDate}`)
            if (!response.ok) {
                throw new Error(`Failed to fetch advances for ${formattedDate}`)
            }
            const result = await response.json()
            if (!result.success || !result.data || result.data.length === 0) {
                showSnackbar(`No advances found for ${formattedDate}`, 'info')
                return
            }
            const allAdvances = result.data
            const unpaidAdvances = allAdvances.filter(adv => adv.status === 'unpaid')
            const paidAdvances = allAdvances.filter(adv => adv.status === 'paid')
            if (unpaidAdvances.length === 0) {
                showSnackbar(`All ${paidAdvances.length} advances are already paid for ${formattedDate}`, 'info')
                return
            }
            // Show confirmation with details
            const confirmationMessage = `Proceed ${unpaidAdvances.length} unpaid advances for ${formattedDate} as paid?\n\n` +
                `• Total advances: ${allAdvances.length}\n` +
                `• Already paid: ${paidAdvances.length}\n` +
                `• To be processed: ${unpaidAdvances.length}\n\n` +
                `Paid advances will be skipped automatically.`
            if (!confirm(confirmationMessage)) {
                return
            }
            // Get all advance IDs (API will filter unpaid ones)
            const allAdvanceIds = allAdvances.map(adv => adv._id)
            // Call bulk paid API
            const bulkResponse = await fetch(`${ADVANCES_API}/bulk`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    advanceIds: allAdvanceIds, // Send all IDs, API will filter
                    date: formattedDate
                })
            })
            if (!bulkResponse.ok) {
                const errorText = await bulkResponse.text()
                console.error('Bulk API error response:', errorText)
                throw new Error(`Bulk API error: ${bulkResponse.status}`)
            }
            const bulkResult = await bulkResponse.json()
            if (bulkResult.success) {
                let successMessage = `✅ Processed ${bulkResult.count} advances for ${formattedDate}`
                if (bulkResult.alreadyPaid) {
                    successMessage += ` (${bulkResult.alreadyPaid} were already paid)`
                }
                if (bulkResult.details?.skipped) {
                    successMessage += ` (${bulkResult.details.skipped} skipped)`
                }
                showSnackbar(successMessage, 'success')
                // Refresh data
                await fetchTrips()
                // Refresh current view
                await fetchTodayAdvances()
            } else {
                showSnackbar(bulkResult.error || 'Failed to process advances', 'error')
                // Show detailed error if available
                if (bulkResult.limitExceededTrips) {
                    console.error('Limit exceeded trips:', bulkResult.limitExceededTrips)
                }
            }
        } catch (error) {
            console.error('Error in bulk proceed selected date:', error)
            showSnackbar(`Error: ${error.message}`, 'error')
        } finally {
            setBulkProcessing(false)
        }
    }
    /* ================= RENDER ================= */
    return (
        <>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
                {/* ================= TABS ================= */}
                <Card>
                    <CardContent>
                        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                            <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
                                <Tab label="Advance Register" />
                                <Tab label="Proceed Advances" />
                            </Tabs>
                        </Box>
                        {tabValue === 0 ? (
                            /* ================= MAIN ADVANCE TABLE ================= */
                            <>
                                <div className="flex justify-between items-center mt-4">
                                    <Typography variant="h5">Advance Register</Typography>
                                    <div className="flex gap-2 items-center">
                                        {loading && <CircularProgress size={20} />}
                                        <Button
                                            variant="contained"
                                            onClick={openAdd}
                                            disabled={loading}
                                            startIcon={<i className="ri-add-line" />}
                                        >
                                            Add Advance
                                        </Button>
                                        <Button
                                            variant="outlined"
                                            onClick={exportToPDF}
                                            disabled={loading || rows.length === 0}
                                            startIcon={<i className="ri-file-download-line" />}
                                            sx={{ ml: 1 }}
                                        >
                                            Export PDF
                                        </Button>
                                        {/* REMOVED the modal button - use only the bulk proceed button */}
                                    </div>
                                </div>
                                {/* Info Alert */}
                                {loading ? (
                                    <div className="flex justify-center p-8">
                                        <CircularProgress />
                                    </div>
                                ) : rows.length === 0 ? (
                                    <div className="p-8 text-center">
                                        <Typography color="textSecondary">
                                            No active trips found. Please create active trips first.
                                        </Typography>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto mt-4">
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
                            </>
                        ) : (
                            /* ================= PROCEED ADVANCES SECTION ================= */
                            <>
                                <div className="flex justify-between items-center mt-4">
                                    <Typography variant="h5">Proceed Advances</Typography>
                                    <div className="flex gap-2 items-center">
                                        <DatePicker
                                            label="Select Date"
                                            value={selectedDate}
                                            onChange={(newDate) => setSelectedDate(newDate)}
                                            slotProps={{ textField: { size: 'small' } }}
                                            format="dd/MM/yyyy"
                                        />
                                        <Button
                                            variant="contained"
                                            onClick={fetchTodayAdvances}
                                            disabled={proceedLoading || bulkProcessing}
                                            startIcon={proceedLoading && <CircularProgress size={16} />}
                                        >
                                            Refresh
                                        </Button>
                                        <Button
                                            variant="contained"
                                            color="secondary"
                                            onClick={bulkProceedSelectedDateAdvances}
                                            disabled={proceedLoading || bulkProcessing || !selectedDate}
                                            startIcon={bulkProcessing ? <CircularProgress size={16} /> : <i className="ri-check-double-line" />}
                                        >
                                            {bulkProcessing ? 'Processing...' : 'Proceed Advances'}
                                        </Button>
                                        <Button
                                            variant="outlined"
                                            onClick={exportToPDF}
                                            disabled={loading || rows.length === 0}
                                            startIcon={<i className="ri-file-download-line" />}
                                            sx={{ ml: 1 }}
                                        >
                                            Export PDF
                                        </Button>
                                    </div>
                                </div>
                                {proceedLoading ? (
                                    <div className="flex justify-center p-8">
                                        <CircularProgress />
                                    </div>
                                ) : todayAdvances.length === 0 ? (
                                    <div className="p-8 text-center">
                                        <Typography color="textSecondary">
                                            No advances found for {selectedDate.toLocaleDateString()}
                                        </Typography>
                                    </div>
                                ) : (
                                    <Table className="mt-4">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell><strong>Vehicle No</strong></TableCell>
                                                <TableCell><strong>Driver</strong></TableCell>
                                                <TableCell><strong>Advance Type</strong></TableCell>
                                                <TableCell><strong>Amount</strong></TableCell>
                                                <TableCell><strong>Date</strong></TableCell>
                                                <TableCell><strong>Status</strong></TableCell>
                                                <TableCell><strong>Action</strong></TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {todayAdvances.map((advance, index) => (
                                                <TableRow key={advance._id || index}>
                                                    <TableCell>{advance.vehicleNo}</TableCell>
                                                    <TableCell>{advance.driverName || 'N/A'}</TableCell>
                                                    <TableCell>{advance.advanceType}</TableCell>
                                                    <TableCell>{advance.amount}</TableCell>
                                                    <TableCell>{advance.date}</TableCell>
                                                    <TableCell>
                                                        <Typography
                                                            color={advance.status === 'paid' ? 'success.main' : 'warning.main'}
                                                            fontWeight="bold"
                                                        >
                                                            {advance.status === 'paid' ? 'PAID' : 'UNPAID'}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        {advance.status === 'unpaid' ? (
                                                            <Button
                                                                variant="contained"
                                                                color="success"
                                                                size="small"
                                                                onClick={() => markAdvanceAsPaid(advance._id)}
                                                                disabled={proceedLoading}
                                                            >
                                                                Mark as Paid
                                                            </Button>
                                                        ) : (
                                                            <Typography color="textSecondary" variant="body2">
                                                                Already Processed
                                                            </Typography>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                )}
                            </>
                        )}
                    </CardContent>
                </Card>
                {/* ================= ADD/MANAGE ADVANCE MODAL ================= */}
                <Dialog
                    open={open}
                    maxWidth="xl"
                    fullWidth
                    onClose={handleCloseModal}
                >
                    <DialogTitle>
                        {trip._id ? `Advance Entry - ${trip.vehicleNo}` : 'Add New Advance'}
                        {trip._id && trip.tripStatus && trip.tripStatus !== 'active' && (
                            <Typography color="error" variant="body2" sx={{ ml: 2, display: 'inline' }}>
                                (Trip is {trip.tripStatus} - Read Only)
                            </Typography>
                        )}
                        {formLoading && <CircularProgress size={20} sx={{ ml: 2 }} />}
                        <IconButton
                            onClick={handleCloseModal}
                            style={{ float: 'right' }}
                            disabled={formLoading}
                        >
                            ✕
                        </IconButton>
                    </DialogTitle>
                    <DialogContent dividers>
                        {!trip._id ? (
                            /* SELECT TRIP FOR ADDING ADVANCE */
                            <div className="flex flex-col gap-4">
                                <Typography variant="h6" className="mb-3">Select a Trip</Typography>
                                <Autocomplete
                                    options={rows.filter(row => row.vehicleNo && row.availableBalance > 0)}
                                    getOptionLabel={(option) => `${option.vehicleNo} - ${option.driverName || ''} (Available: ${option.availableBalance.toFixed(2)})`}
                                    value={null}
                                    onChange={(_, newValue) => {
                                        if (newValue) {
                                            openEdit(newValue)
                                        }
                                    }}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Search by Vehicle No or Driver"
                                            placeholder="Type to search..."
                                            fullWidth
                                        />
                                    )}
                                    renderOption={(props, option) => (
                                        <li {...props}>
                                            <div>
                                                <Typography variant="body2">{option.vehicleNo}</Typography>
                                                <Typography variant="caption" color="textSecondary">
                                                    {option.driverName} | {option.fromLocation} → {option.toLocation} | Available: {option.availableBalance.toFixed(2)}
                                                </Typography>
                                            </div>
                                        </li>
                                    )}
                                />
                            </div>
                        ) : (
                            /* EXISTING TRIP ADVANCE MANAGEMENT */
                            <>
                                <Grid container spacing={4}>
                                    {/* LEFT SIDE - TRIP DETAILS */}
                                    <Grid item xs={12} md={7}>
                                        <Typography variant="h6" sx={{ mb: 2, color: 'text.secondary' }}>
                                            Trip Details
                                        </Typography>
                                        <Grid container spacing={2}>
                                            <Grid item xs={12} sm={6} md={4}>
                                                <TextField
                                                    label="Vehicle No"
                                                    value={trip.vehicleNo}
                                                    size="small"
                                                    fullWidth
                                                    InputProps={{ readOnly: true }}
                                                />
                                            </Grid>
                                            <Grid item xs={12} sm={6} md={4}>
                                                <TextField
                                                    label="Vehicle Type"
                                                    value={trip.vehicleType}
                                                    size="small"
                                                    fullWidth
                                                    InputProps={{ readOnly: true }}
                                                />
                                            </Grid>
                                            <Grid item xs={12} sm={6} md={4}>
                                                <TextField
                                                    label="From"
                                                    value={trip.fromLocation}
                                                    size="small"
                                                    fullWidth
                                                    InputProps={{ readOnly: true }}
                                                />
                                            </Grid>
                                            <Grid item xs={12} sm={6} md={4}>
                                                <TextField
                                                    label="To"
                                                    value={trip.toLocation}
                                                    size="small"
                                                    fullWidth
                                                    InputProps={{ readOnly: true }}
                                                />
                                            </Grid>
                                            <Grid item xs={12} sm={6} md={4}>
                                                <TextField
                                                    label="LHS No"
                                                    value={trip.lhsNo}
                                                    size="small"
                                                    fullWidth
                                                    InputProps={{ readOnly: true }}
                                                />
                                            </Grid>
                                            <Grid item xs={12} sm={6} md={4}>
                                                <TextField
                                                    label="IFSC Code"
                                                    value={trip.ifscCode || 'N/A'}
                                                    size="small"
                                                    fullWidth
                                                    InputProps={{ readOnly: true }}
                                                />
                                            </Grid>
                                            <Grid item xs={12} sm={6} md={4}>
                                                <TextField
                                                    label="Account Number"
                                                    value={trip.accountNo || 'N/A'}
                                                    size="small"
                                                    fullWidth
                                                    InputProps={{ readOnly: true }}
                                                />
                                            </Grid>
                                            <Grid item xs={12} sm={6} md={4}>
                                                <TextField
                                                    label="Account Holder"
                                                    value={trip.accountHolderName || 'N/A'}
                                                    size="small"
                                                    fullWidth
                                                    InputProps={{ readOnly: true }}
                                                />
                                            </Grid>
                                            <Grid item xs={12} sm={6} md={4}>
                                                <TextField
                                                    label="Bank Name"
                                                    value={trip.bankName || 'N/A'}
                                                    size="small"
                                                    fullWidth
                                                    InputProps={{ readOnly: true }}
                                                />
                                            </Grid>
                                            <Grid item xs={12} sm={6} md={4}>
                                                <TextField
                                                    label="Driver Name"
                                                    value={trip.driverName}
                                                    size="small"
                                                    fullWidth
                                                    InputProps={{ readOnly: true }}
                                                />
                                            </Grid>
                                            <Grid item xs={12} sm={6} md={4}>
                                                <TextField
                                                    label="Driver Mobile"
                                                    value={trip.driverMobile || 'N/A'}
                                                    size="small"
                                                    fullWidth
                                                    InputProps={{ readOnly: true }}
                                                />
                                            </Grid>
                                        </Grid>
                                    </Grid>
                                    {/* RIGHT SIDE - CALCULATIONS */}
                                    <Grid item xs={12} md={5}>
                                        <Typography variant="h6" sx={{ mb: 2, color: 'text.secondary' }}>
                                            Calculations
                                        </Typography>
                                        <Grid container spacing={2}>
                                            <Grid item xs={12}>
                                                <TextField
                                                    label="Diesel Ltr"
                                                    value={trip.dieselLtr.toFixed(2)}
                                                    size="small"
                                                    fullWidth
                                                    InputProps={{ readOnly: true }}
                                                />
                                            </Grid>
                                            <Grid item xs={12}>
                                                <TextField
                                                    label="Diesel Rate"
                                                    value={trip.dieselRate.toFixed(2)}
                                                    size="small"
                                                    fullWidth
                                                    InputProps={{ readOnly: true }}
                                                />
                                            </Grid>
                                            <Grid item xs={12}>
                                                <TextField
                                                    label="Total Diesel Amount"
                                                    value={trip.totalDieselAmount.toFixed(2)}
                                                    size="small"
                                                    fullWidth
                                                    InputProps={{ readOnly: true }}
                                                />
                                            </Grid>
                                            <Grid item xs={12}>
                                                <TextField
                                                    label="Advance Amount"
                                                    value={trip.advanceAmount.toFixed(2)}
                                                    size="small"
                                                    fullWidth
                                                    InputProps={{ readOnly: true }}
                                                />
                                            </Grid>
                                            <Grid item xs={12}>
                                                <TextField
                                                    label="Total Advance Amount"
                                                    value={totalAdvanceAmount.toFixed(2)}
                                                    size="small"
                                                    fullWidth
                                                    InputProps={{
                                                        readOnly: true,
                                                        sx: { fontWeight: 600 }
                                                    }}
                                                />
                                            </Grid>
                                            <Grid item xs={12} sm={6}>
                                                <TextField
                                                    label="Paid Advances"
                                                    value={totalAdvancePaid.toFixed(2)}
                                                    size="small"
                                                    fullWidth
                                                    InputProps={{
                                                        readOnly: true,
                                                        sx: { fontWeight: 600, color: 'success.main' }
                                                    }}
                                                />
                                            </Grid>
                                            <Grid item xs={12} sm={6}>
                                                <TextField
                                                    label="Proposed/Unpaid"
                                                    value={totalProposedUnpaid.toFixed(2)}
                                                    size="small"
                                                    fullWidth
                                                    InputProps={{
                                                        readOnly: true,
                                                        sx: { fontWeight: 600, color: 'warning.main' }
                                                    }}
                                                />
                                            </Grid>
                                            <Grid item xs={12}>
                                                <TextField
                                                    label="Balance"
                                                    value={balance.toFixed(2)}
                                                    size="small"
                                                    fullWidth
                                                    InputProps={{
                                                        readOnly: true,
                                                        sx: {
                                                            fontWeight: 700,
                                                            color: balance < 0 ? 'red' :
                                                                balance === 0 ? 'success.main' :
                                                                    'primary.main'
                                                        }
                                                    }}
                                                />
                                            </Grid>
                                            <Grid item xs={12}>
                                                <TextField
                                                    label="Available for New Advances"
                                                    value={availableBalance.toFixed(2)}
                                                    size="small"
                                                    fullWidth
                                                    InputProps={{
                                                        readOnly: true,
                                                        sx: {
                                                            fontWeight: 700,
                                                            color: availableBalance > 0 ? 'success.main' : 'error.main'
                                                        }
                                                    }}
                                                    helperText={availableBalance <= 0 ? "No balance available for new advances" : "Maximum amount you can propose"}
                                                />
                                            </Grid>
                                        </Grid>
                                    </Grid>
                                </Grid>
                                <Divider className="my-4" />
                                {/* ADVANCE ENTRY SECTION - Only show if trip is active AND has available balance */}
                                {trip.tripStatus === 'active' || trip.tripStatus === 'Active' ? (
                                    availableBalance > 0 ? (
                                        <>
                                            <Typography variant="h6" className="mb-3">Add New Advance (Available: {availableBalance.toFixed(2)})</Typography>
                                            <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
                                                <TextField
                                                    select
                                                    label="Advance Type"
                                                    value={advanceForm.advanceType}
                                                    onChange={e =>
                                                        setAdvanceForm({ ...advanceForm, advanceType: e.target.value })
                                                    }
                                                    fullWidth
                                                    disabled={formLoading}
                                                >
                                                    <MenuItem value="">Select Type</MenuItem>
                                                    {getAvailableAdvanceTypes().map(t => (
                                                        <MenuItem key={t} value={t}>{t}</MenuItem>
                                                    ))}
                                                    {getAvailableAdvanceTypes().length === 0 && (
                                                        <MenuItem value="" disabled>All advance types already used</MenuItem>
                                                    )}
                                                </TextField>
                                                <TextField
                                                    label="Amount"
                                                    type="number"
                                                    value={advanceForm.amount}
                                                    fullWidth
                                                    disabled={formLoading}
                                                    onChange={e => {
                                                        const value = e.target.value
                                                        // Validate amount doesn't exceed available balance
                                                        const numValue = parseFloat(value) || 0
                                                        if (numValue > availableBalance) {
                                                            showSnackbar(`Amount cannot exceed available balance (${availableBalance.toFixed(2)})`, 'warning')
                                                        }
                                                        setAdvanceForm(prev => ({
                                                            ...prev,
                                                            amount: value
                                                        }))
                                                    }}
                                                    inputProps={{ min: 0, max: availableBalance, step: 0.01 }}
                                                    helperText={`Max: ${availableBalance.toFixed(2)}`}
                                                    error={parseFloat(advanceForm.amount || 0) > availableBalance}
                                                />
                                                <DatePicker
                                                    label="Date"
                                                    value={new Date(advanceForm.date)}
                                                    onChange={(newDate) => {
                                                        const formattedDate = newDate.toISOString().split('T')[0]
                                                        setAdvanceForm(prev => ({
                                                            ...prev,
                                                            date: formattedDate
                                                        }))
                                                    }}
                                                    slotProps={{ textField: { fullWidth: true } }}
                                                    format="dd/MM/yyyy"
                                                />
                                                <TextField
                                                    label="Remark"
                                                    value={advanceForm.remark}
                                                    onChange={e =>
                                                        setAdvanceForm({ ...advanceForm, remark: e.target.value })
                                                    }
                                                    fullWidth
                                                    disabled={formLoading}
                                                />
                                                <Button
                                                    variant="contained"
                                                    onClick={addAdvance}
                                                    fullWidth
                                                    disabled={formLoading || !advanceForm.advanceType || !advanceForm.amount ||
                                                        getAvailableAdvanceTypes().length === 0 ||
                                                        parseFloat(advanceForm.amount || 0) > availableBalance ||
                                                        parseFloat(advanceForm.amount || 0) <= 0}
                                                    startIcon={formLoading && <CircularProgress size={16} />}
                                                >
                                                    Add Advance
                                                </Button>
                                            </div>
                                        </>
                                    ) : (
                                        <Alert severity="warning" sx={{ mb: 3 }}>
                                            No available balance for new advances. Available: {availableBalance.toFixed(2)}
                                        </Alert>
                                    )
                                ) : (
                                    <Alert severity="warning" sx={{ mb: 3 }}>
                                        This trip is {trip.tripStatus}. Cannot add new advances. You can only view existing advances.
                                    </Alert>
                                )}
                                {/* ADVANCES TABLE */}
                                {trip.advances && trip.advances.length > 0 && (
                                    <>
                                        <Typography variant="h6" className="mt-6 mb-3">Existing Advances</Typography>
                                        <Table size="small" className="mt-2">
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell><strong>Type</strong></TableCell>
                                                    <TableCell><strong>Amount</strong></TableCell>
                                                    <TableCell><strong>Date</strong></TableCell>
                                                    <TableCell><strong>Status</strong></TableCell>
                                                    <TableCell><strong>Remark</strong></TableCell>
                                                    <TableCell><strong>Action</strong></TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {trip.advances.map((advance, index) => (
                                                    <TableRow key={advance._id || index}>
                                                        <TableCell>{advance.advanceType}</TableCell>
                                                        <TableCell>{advance.amount}</TableCell>
                                                        <TableCell>{advance.date || 'N/A'}</TableCell>
                                                        <TableCell>
                                                            <Typography
                                                                variant="body2"
                                                                color={advance.status === 'paid' ? 'success.main' : 'warning.main'}
                                                                fontWeight="bold"
                                                            >
                                                                {advance.status === 'paid' ? 'PAID' : 'UNPAID'}
                                                            </Typography>
                                                        </TableCell>
                                                        <TableCell>{advance.remark}</TableCell>
                                                        <TableCell>
                                                            {advance.status === 'unpaid' &&
                                                                (trip.tripStatus === 'active' || trip.tripStatus === 'Active') ? (
                                                                <Button
                                                                    color="error"
                                                                    size="small"
                                                                    onClick={() => deleteAdvance(advance._id)}
                                                                    disabled={formLoading}
                                                                    sx={{ mr: 1 }}
                                                                >
                                                                    Delete
                                                                </Button>
                                                            ) : (
                                                                <Typography variant="body2" color="textSecondary">
                                                                    {advance.status === 'paid' ? 'Processed' : 'Cannot delete'}
                                                                </Typography>
                                                            )}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </>
                                )}
                            </>
                        )}
                        <div className="flex justify-end gap-2 mt-4">
                            <Button
                                variant="contained"
                                onClick={handleCloseModal}
                                disabled={formLoading}
                            >
                                Close
                            </Button>
                            {trip._id && (
                                <Button
                                    variant="outlined"
                                    color="primary"
                                    onClick={handleTripPrint}
                                >
                                    Print Trip Sheet
                                </Button>
                            )}
                        </div>
                    </DialogContent>
                </Dialog>
                {/* ================= PROCEED ADVANCES MODAL ================= */}
                <Dialog
                    open={proceedOpen}
                    maxWidth="lg"
                    fullWidth
                    onClose={handleCloseProceedModal}
                >
                    <DialogTitle>
                        Proceed Advances - {selectedDate.toLocaleDateString()}
                        {proceedLoading && <CircularProgress size={20} sx={{ ml: 2 }} />}
                        <IconButton
                            onClick={handleCloseProceedModal}
                            style={{ float: 'right' }}
                            disabled={proceedLoading}
                        >
                            ✕
                        </IconButton>
                    </DialogTitle>
                    <DialogContent dividers>
                        <div className="flex justify-between items-center mb-4">
                            <DatePicker
                                label="Select Date"
                                value={selectedDate}
                                onChange={(newDate) => setSelectedDate(newDate)}
                                slotProps={{ textField: { size: 'small', sx: { width: 200 } } }}
                                format="dd/MM/yyyy"
                            />
                            <Button
                                variant="outlined"
                                onClick={fetchTodayAdvances}
                                disabled={proceedLoading}
                            >
                                Refresh
                            </Button>
                        </div>
                        {proceedLoading ? (
                            <div className="flex justify-center p-8">
                                <CircularProgress />
                            </div>
                        ) : todayAdvances.length === 0 ? (
                            <div className="p-8 text-center">
                                <Typography color="textSecondary">
                                    No advances found for {selectedDate.toLocaleDateString()}
                                </Typography>
                            </div>
                        ) : (
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell><strong>Vehicle No</strong></TableCell>
                                        <TableCell><strong>Driver</strong></TableCell>
                                        <TableCell><strong>Advance Type</strong></TableCell>
                                        <TableCell><strong>Amount</strong></TableCell>
                                        <TableCell><strong>Date</strong></TableCell>
                                        <TableCell><strong>Status</strong></TableCell>
                                        <TableCell><strong>Action</strong></TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {todayAdvances.map((advance, index) => (
                                        <TableRow key={advance._id || index}>
                                            <TableCell>{advance.vehicleNo}</TableCell>
                                            <TableCell>{advance.driverName || 'N/A'}</TableCell>
                                            <TableCell>{advance.advanceType}</TableCell>
                                            <TableCell>{advance.amount}</TableCell>
                                            <TableCell>{advance.date}</TableCell>
                                            <TableCell>
                                                <Typography
                                                    color={advance.status === 'paid' ? 'success.main' : 'warning.main'}
                                                    fontWeight="bold"
                                                >
                                                    {advance.status === 'paid' ? 'PAID' : 'UNPAID'}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                {advance.status === 'unpaid' ? (
                                                    <Button
                                                        variant="contained"
                                                        color="success"
                                                        size="small"
                                                        onClick={() => markAdvanceAsPaid(advance._id)}
                                                        disabled={proceedLoading}
                                                    >
                                                        Mark as Paid
                                                    </Button>
                                                ) : (
                                                    <Typography color="textSecondary" variant="body2">
                                                        Already Processed
                                                    </Typography>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                        <div className="flex justify-end gap-2 mt-4">
                            <Button
                                variant="contained"
                                onClick={handleCloseProceedModal}
                                disabled={proceedLoading}
                            >
                                Close
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </LocalizationProvider>
            {/* ================= SNACKBAR ================= */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={2000}
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
export default AdvanceRegister
