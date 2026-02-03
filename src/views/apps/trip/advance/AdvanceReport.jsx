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
    Paper,
    Chip,
    MenuItem,
    InputAdornment,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    FormControl,
    InputLabel,
    Select,
    Alert,
    Snackbar,
    CircularProgress
} from '@mui/material'
import {
    createColumnHelper,
    getCoreRowModel,
    flexRender,
    useReactTable
} from '@tanstack/react-table'
import tableStyles from '@core/styles/table.module.css'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { useReactToPrint } from 'react-to-print'
/* ================= CONSTANTS ================= */
const columnHelper = createColumnHelper()
/* ================================================= */
const TripAdvanceReport = () => {
    /* ================= STATE ================= */
    const [rows, setRows] = useState([])
    const [loading, setLoading] = useState(true)
    const [filters, setFilters] = useState({
        search: '',
        vehicleNo: '',
        fromDate: '',
        toDate: '',
        advanceStatus: '',
        driverName: '',
        bankName: '',
        showOnly: '' // New filter: withPaid, paidOnly, pendingOnly
    })
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
    })
    const [viewDetailsDialog, setViewDetailsDialog] = useState(false)
    const [selectedTrip, setSelectedTrip] = useState(null)
    const reportRef = useRef()
    const componentRef = useRef() // For printing
    /* ================= API ENDPOINTS ================= */
    const API_BASE = '/api/apps'
    const TRIPS_API = `${API_BASE}/trip`
    const ADVANCES_API = `${API_BASE}/trip/advance`
    /* ================= FETCH TRIPS WITH ADVANCES ================= */
    useEffect(() => {
        fetchTripsWithAdvances()
    }, [])
    const fetchTripsWithAdvances = async () => {
        try {
            setLoading(true)
            const response = await fetch(TRIPS_API)
            const result = await response.json()
            if (result.success) {
                // Fetch advances for each trip
                const tripsWithAdvances = await Promise.all(
                    (result.data || []).map(async (trip) => {
                        try {
                            const advancesResponse = await fetch(`${ADVANCES_API}?tripId=${trip._id || trip.id}`)
                            const advancesResult = await advancesResponse.json()
                            // Calculate totals and separate advances
                            const advances = advancesResult.success ? advancesResult.data : []
                            const paidAdvances = advances.filter(a => a.status === 'paid')
                            const unpaidAdvances = advances.filter(a => a.status === 'unpaid')
                            const totalAdvancePaid = paidAdvances.reduce((s, a) => s + Number(a.amount || 0), 0)
                            const totalAdvanceUnpaid = unpaidAdvances.reduce((s, a) => s + Number(a.amount || 0), 0)
                            // Determine status - "paid" only when ALL advances are paid
                            let advanceStatus = 'none'
                            if (paidAdvances.length > 0 && unpaidAdvances.length === 0) {
                                advanceStatus = 'paid'  // All advances are paid
                            } else if (unpaidAdvances.length > 0) {
                                advanceStatus = 'pending'  // Has unpaid advances
                            }
                            return {
                                _id: trip._id,
                                tripDate: trip.createdAt ? new Date(trip.createdAt).toLocaleDateString() : 'N/A',
                                tripDateObj: trip.createdAt ? new Date(trip.createdAt) : new Date(),
                                lhsNo: trip.lhsNo || 'N/A',
                                vehicleNo: trip.vehicleNo || '',
                                from: trip.fromLocation || '',
                                to: trip.toLocation || '',
                                dieselLTR: trip.dieselLtr || 0,
                                dieselRate: trip.dieselRate || 0,
                                totalDiesel: (trip.dieselLtr || 0) * (trip.dieselRate || 0),
                                totalAdvance: trip.totalAdvanceAmount || 0,
                                advancePaid: totalAdvancePaid,
                                advanceUnpaid: totalAdvanceUnpaid,
                                balance: (trip.totalAdvanceAmount || 0) - totalAdvancePaid,
                                driverName: trip.driverName || '',
                                driverMobile: trip.driverMobile || '',
                                bankName: trip.bankName || '',
                                accountNo: trip.accountNo || '',
                                ifscCode: trip.ifscCode || '',
                                advanceStatus: advanceStatus,
                                remark: trip.remark || '',
                                processedBy: trip.processedBy || '',
                                processedDate: trip.processedDate || '',
                                // Store advances separately
                                paidAdvances: paidAdvances,      // Only paid advances
                                unpaidAdvances: unpaidAdvances,  // Only unpaid advances
                                allAdvances: advances           // All advances
                            }
                        } catch (error) {
                            console.error(`Error fetching advances for trip ${trip._id}:`, error)
                            return null
                        }
                    })
                )
                // Filter out null values and set rows
                setRows(tripsWithAdvances.filter(trip => trip !== null) || [])
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
    /* ================= FILTERED DATA ================= */
    const filteredData = useMemo(() => {
        return rows.filter(item => {
            // Search filter (Vehicle No, LHS No, or Driver Name)
            if (filters.search) {
                const searchLower = filters.search.toLowerCase()
                if (!item.vehicleNo.toLowerCase().includes(searchLower) &&
                    !item.lhsNo.toLowerCase().includes(searchLower) &&
                    !item.driverName.toLowerCase().includes(searchLower)) {
                    return false
                }
            }
            // Vehicle No filter
            if (filters.vehicleNo && !item.vehicleNo.includes(filters.vehicleNo)) {
                return false
            }
            // Date range filter
            if (filters.fromDate) {
                const fromDate = new Date(filters.fromDate)
                fromDate.setHours(0, 0, 0, 0)
                const itemDate = new Date(item.tripDateObj)
                itemDate.setHours(0, 0, 0, 0)
                if (itemDate < fromDate) return false
            }
            if (filters.toDate) {
                const toDate = new Date(filters.toDate)
                toDate.setHours(23, 59, 59, 999)
                const itemDate = new Date(item.tripDateObj)
                itemDate.setHours(0, 0, 0, 0)
                if (itemDate > toDate) return false
            }
            // Advance Status filter
            if (filters.advanceStatus) {
                if (filters.advanceStatus === 'paid' && item.advanceStatus !== 'paid') return false
                if (filters.advanceStatus === 'pending' && item.advanceStatus !== 'pending') return false
                if (filters.advanceStatus === 'none' && item.advanceStatus !== 'none') return false
            }
            // Driver Name filter
            if (filters.driverName && !item.driverName.toLowerCase().includes(filters.driverName.toLowerCase())) {
                return false
            }
            // Bank Name filter
            if (filters.bankName && !item.bankName.toLowerCase().includes(filters.bankName.toLowerCase())) {
                return false
            }
            // Show Only filter
            if (filters.showOnly === 'withPaid') {
                if (!item.paidAdvances || item.paidAdvances.length === 0) return false
            }
            if (filters.showOnly === 'paidOnly') {
                if (item.advanceStatus !== 'paid') return false
            }
            if (filters.showOnly === 'pendingOnly') {
                if (item.advanceStatus !== 'pending') return false
            }
            return true
        })
    }, [rows, filters])
    /* ================= TOTALS CALCULATION ================= */
    const totals = useMemo(() => {
        return filteredData.reduce((acc, item) => ({
            totalDieselAmount: acc.totalDieselAmount + item.totalDiesel,
            totalAdvanceAmount: acc.totalAdvanceAmount + item.totalAdvance,
            totalAdvancePaid: acc.totalAdvancePaid + item.advancePaid,
            totalAdvanceUnpaid: acc.totalAdvanceUnpaid + item.advanceUnpaid,
            totalBalance: acc.totalBalance + item.balance,
            count: acc.count + 1,
            paidCount: acc.paidCount + (item.advanceStatus === 'paid' ? 1 : 0),
            pendingCount: acc.pendingCount + (item.advanceStatus === 'pending' ? 1 : 0),
            noneCount: acc.noneCount + (item.advanceStatus === 'none' ? 1 : 0),
            totalPaidAdvances: acc.totalPaidAdvances + (item.paidAdvances?.length || 0)
        }), {
            totalDieselAmount: 0,
            totalAdvanceAmount: 0,
            totalAdvancePaid: 0,
            totalAdvanceUnpaid: 0,
            totalBalance: 0,
            count: 0,
            paidCount: 0,
            pendingCount: 0,
            noneCount: 0,
            totalPaidAdvances: 0
        })
    }, [filteredData])
    /* ================= FILTER HANDLERS ================= */
    const handleFilterChange = (field, value) => {
        setFilters(prev => ({
            ...prev,
            [field]: value
        }))
    }
    const resetFilters = () => {
        setFilters({
            search: '',
            vehicleNo: '',
            fromDate: '',
            toDate: '',
            advanceStatus: '',
            driverName: '',
            bankName: '',
            showOnly: ''
        })
    }
    /* ================= VIEW TRIP DETAILS (Only Paid Advances) ================= */
    const openTripDetails = (trip) => {
        setSelectedTrip(trip)
        setViewDetailsDialog(true)
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
    /* ================= EXPORT TO PDF (Only Paid Advances) ================= */
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
    /* ================= REFRESH DATA ================= */
    const handleRefresh = async () => {
        setLoading(true)
        await fetchTripsWithAdvances()
        showSnackbar('Report data refreshed successfully', 'info')
    }
    /* ================= TABLE COLUMNS ================= */
    const columns = useMemo(
        () => [
            columnHelper.display({
                id: 'index',
                header: 'No.',
                cell: ({ row }) => row.index + 1
            }),
            columnHelper.accessor('tripDate', {
                header: 'Trip Date',
                cell: ({ row }) => (
                    <Typography variant="body2">
                        {row.original.tripDate}
                    </Typography>
                )
            }),
            columnHelper.accessor('lhsNo', {
                header: 'LHS No.',
                cell: ({ row }) => (
                    <Tooltip title="LHS Number">
                        <Typography variant="body2" fontWeight="medium">
                            {row.original.lhsNo}
                        </Typography>
                    </Tooltip>
                )
            }),
            columnHelper.accessor('vehicleNo', {
                header: 'Vehicle No',
                cell: ({ row }) => (
                    <Typography variant="body2" color="primary" fontWeight="medium">
                        {row.original.vehicleNo}
                    </Typography>
                )
            }),
            columnHelper.accessor('from', {
                header: 'From',
                cell: ({ row }) => (
                    <Typography variant="body2">
                        {row.original.from}
                    </Typography>
                )
            }),
            columnHelper.accessor('to', {
                header: 'To',
                cell: ({ row }) => (
                    <Tooltip title={row.original.to}>
                        <Typography variant="body2" className="truncate max-w-[150px]">
                            {row.original.to}
                        </Typography>
                    </Tooltip>
                )
            }),
            columnHelper.accessor('driverName', {
                header: 'Driver',
                cell: ({ row }) => (
                    <Tooltip title={`Mobile: ${row.original.driverMobile || 'N/A'}`}>
                        <Typography variant="body2" className="truncate max-w-[120px]">
                            {row.original.driverName}
                        </Typography>
                    </Tooltip>
                )
            }),
            columnHelper.accessor('totalAdvance', {
                header: 'Total Advance',
                cell: ({ row }) => (
                    <Typography variant="body2" fontWeight="medium" color="primary">
                        {row.original.totalAdvance}
                    </Typography>
                )
            }),
            columnHelper.accessor('advancePaid', {
                header: 'Paid',
                cell: ({ row }) => (
                    <Tooltip title={`${row.original.paidAdvances?.length || 0} paid advances`}>
                        <Typography variant="body2" color="success.main" fontWeight="medium">
                            {row.original.advancePaid}
                        </Typography>
                    </Tooltip>
                )
            }),
            columnHelper.accessor('advanceUnpaid', {
                header: 'Unpaid',
                cell: ({ row }) => (
                    <Typography variant="body2" color="warning.main" fontWeight="medium">
                        {row.original.advanceUnpaid}
                    </Typography>
                )
            }),
            columnHelper.accessor('balance', {
                header: 'Balance',
                cell: ({ row }) => (
                    <Chip
                        label={`${row.original.balance}`}
                        size="small"
                        color={row.original.balance > 0 ? 'warning' : 'success'}
                        variant="outlined"
                    />
                )
            }),
            columnHelper.accessor('advanceStatus', {
                header: 'Status',
                cell: ({ row }) => {
                    const status = row.original.advanceStatus
                    const colors = {
                        paid: 'success',
                        pending: 'warning',
                        none: 'default'
                    }
                    const labels = {
                        paid: 'PAID',
                        pending: 'PENDING',
                        none: 'NO ADVANCE'
                    }
                    return (
                        <Chip
                            label={labels[status] || status.toUpperCase()}
                            color={colors[status] || 'default'}
                            size="small"
                            variant="filled"
                        />
                    )
                }
            }),
            columnHelper.accessor('bankName', {
                header: 'Bank',
                cell: ({ row }) => (
                    <Tooltip title={`A/C: ${row.original.accountNo || 'N/A'} | IFSC: ${row.original.ifscCode || 'N/A'}`}>
                        <Typography variant="body2" className="truncate max-w-[100px]">
                            {row.original.bankName}
                        </Typography>
                    </Tooltip>
                )
            }),
            columnHelper.display({
                id: 'paidCount',
                header: 'Paid Adv',
                cell: ({ row }) => (
                    <Chip
                        label={row.original.paidAdvances?.length || 0}
                        size="small"
                        color="success"
                        variant="outlined"
                    />
                )
            }),
            columnHelper.display({
                id: 'actions',
                header: 'Details',
                cell: ({ row }) => (
                    <div className="flex gap-1">
                        <Tooltip title="View Paid Advance Details">
                            <IconButton
                                size="small"
                                onClick={() => openTripDetails(row.original)}
                                color="info"
                                disabled={!row.original.paidAdvances || row.original.paidAdvances.length === 0}
                            >
                                <i className="ri-eye-line text-sm" />
                            </IconButton>
                        </Tooltip>
                    </div>
                )
            })
        ],
        []
    )
    const table = useReactTable({
        data: filteredData,
        columns,
        getCoreRowModel: getCoreRowModel()
    })
    /* ================= RENDER ================= */
    return (
        <>
            {/* ================= MAIN REPORT ================= */}
            <Card>
                <CardContent>
                    {/* Top Action Bar */}
                    <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        {/* Left Side: Title */}
                        <Typography variant="h5" color="primary">
                            Trip Advance Report
                        </Typography>
                        {/* Right Side: Action Buttons */}
                        <div className="flex flex-wrap gap-2">
                            <Button
                                variant="outlined"
                                onClick={handleRefresh}
                                startIcon={loading ? <CircularProgress size={16} /> : <i className="ri-refresh-line" />}
                                disabled={loading}
                            >
                                Refresh
                            </Button>
                            <Button
                                variant="contained"
                                color="success"
                                onClick={exportToPDF}
                                disabled={filteredData.filter(item => item.paidAdvances?.length > 0).length === 0}
                                startIcon={<i className="ri-file-pdf-line" />}
                            >
                                Export PDF (Paid)
                            </Button>
                        </div>
                    </div>
                    {/* Search Bar */}
                    <div className="mb-4">
                        <TextField
                            placeholder="Search by Vehicle No, LHS No, or Driver Name"
                            value={filters.search}
                            onChange={(e) => handleFilterChange('search', e.target.value)}
                            fullWidth
                            size="small"
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <i className="ri-search-line text-gray-400" />
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </div>
                    {/* Filters */}
                    <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
                        <TextField
                            label="From Date"
                            type="date"
                            value={filters.fromDate}
                            onChange={(e) => handleFilterChange('fromDate', e.target.value)}
                            size="small"
                            InputLabelProps={{ shrink: true }}
                            fullWidth
                        />
                        <TextField
                            label="To Date"
                            type="date"
                            value={filters.toDate}
                            onChange={(e) => handleFilterChange('toDate', e.target.value)}
                            size="small"
                            InputLabelProps={{ shrink: true }}
                            fullWidth
                        />

                        <FormControl size="small" fullWidth>
                            <InputLabel>Show Only</InputLabel>
                            <Select
                                value={filters.showOnly}
                                onChange={(e) => handleFilterChange('showOnly', e.target.value)}
                                label="Show Only"
                            >
                                <MenuItem value="">All Trips</MenuItem>
                                <MenuItem value="withPaid">With Paid Advances</MenuItem>
                                <MenuItem value="paidOnly">Fully Paid Only</MenuItem>
                                <MenuItem value="pendingOnly">Pending Advances</MenuItem>
                            </Select>
                        </FormControl>
                    </div>
                    <div className="mb-6 flex flex-wrap gap-3">
                        <Button
                            size="small"
                            onClick={resetFilters}
                            startIcon={<i className="ri-close-line" />}
                            variant="outlined"
                        >
                            Clear Filters
                        </Button>
                    </div>
                    {/* Summary Cards */}
                    <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
                        <Paper elevation={1} className="p-3 bg-blue-50">
                            <Typography variant="caption" color="textSecondary">Total Advance Amount</Typography>
                            <Typography variant="h6" color="primary">{totals.totalAdvanceAmount}</Typography>
                        </Paper>
                        <Paper elevation={1} className="p-3 bg-green-50">
                            <Typography variant="caption" color="textSecondary">Total Paid</Typography>
                            <Typography variant="h6" color="success.main">{totals.totalAdvancePaid}</Typography>
                        </Paper>
                        <Paper elevation={1} className="p-3 bg-orange-50">
                            <Typography variant="caption" color="textSecondary">Total Unpaid</Typography>
                            <Typography variant="h6" color="warning.main">{totals.totalAdvanceUnpaid}</Typography>
                        </Paper>
                        <Paper elevation={1} className="p-3 bg-purple-50">
                            <Typography variant="caption" color="textSecondary">Total Balance</Typography>
                            <Typography variant="h6" color="secondary">{totals.totalBalance}</Typography>
                        </Paper>
                        <Paper elevation={1} className="p-3 bg-teal-50">
                            <Typography variant="caption" color="textSecondary">Paid Advances</Typography>
                            <Typography variant="h6" color="success.dark">{totals.totalPaidAdvances}</Typography>
                        </Paper>
                    </div>
                    {/* Status Summary */}
                    <div className="mb-6 flex flex-wrap gap-3">
                        <Chip
                            label={`Total Trips: ${totals.count}`}
                            color="primary"
                            variant="outlined"
                        />
                        <Chip
                            label={`Paid Trips: ${totals.paidCount}`}
                            color="success"
                            variant="outlined"
                        />
                        <Chip
                            label={`Pending Trips: ${totals.pendingCount}`}
                            color="warning"
                            variant="outlined"
                        />
                        <Chip
                            label={`No Advance: ${totals.noneCount}`}
                            color="default"
                            variant="outlined"
                        />
                    </div>
                    {/* Hidden print container */}
                    <div style={{ display: 'none' }}>
                        <div ref={componentRef} className="print-container">
                            <h1 style={{ textAlign: 'center', marginBottom: '20px' }}>Trip Advance Report</h1>
                            <div style={{ marginBottom: '10px' }}>
                                <p>Generated on: {new Date().toLocaleDateString()}</p>
                                <p>Total Records: {filteredData.length}</p>
                            </div>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ backgroundColor: '#f5f5f5' }}>
                                        <th style={{ border: '1px solid #ddd', padding: '4px' }}>No.</th>
                                        <th style={{ border: '1px solid #ddd', padding: '4px' }}>Trip Date</th>
                                        <th style={{ border: '1px solid #ddd', padding: '4px' }}>LHS No.</th>
                                        <th style={{ border: '1px solid #ddd', padding: '4px' }}>Vehicle No</th>
                                        <th style={{ border: '1px solid #ddd', padding: '4px' }}>From</th>
                                        <th style={{ border: '1px solid #ddd', padding: '4px' }}>To</th>
                                        <th style={{ border: '1px solid #ddd', padding: '4px' }}>Driver</th>
                                        <th style={{ border: '1px solid #ddd', padding: '4px' }}>Total Advance</th>
                                        <th style={{ border: '1px solid #ddd', padding: '4px' }}>Paid</th>
                                        <th style={{ border: '1px solid #ddd', padding: '4px' }}>Unpaid</th>
                                        <th style={{ border: '1px solid #ddd', padding: '4px' }}>Balance</th>
                                        <th style={{ border: '1px solid #ddd', padding: '4px' }}>Status</th>
                                        <th style={{ border: '1px solid #ddd', padding: '4px' }}>Bank</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredData.map((item, index) => (
                                        <tr key={index}>
                                            <td style={{ border: '1px solid #ddd', padding: '4px' }}>{index + 1}</td>
                                            <td style={{ border: '1px solid #ddd', padding: '4px' }}>{item.tripDate}</td>
                                            <td style={{ border: '1px solid #ddd', padding: '4px' }}>{item.lhsNo}</td>
                                            <td style={{ border: '1px solid #ddd', padding: '4px' }}>{item.vehicleNo}</td>
                                            <td style={{ border: '1px solid #ddd', padding: '4px' }}>{item.from}</td>
                                            <td style={{ border: '1px solid #ddd', padding: '4px' }}>{item.to}</td>
                                            <td style={{ border: '1px solid #ddd', padding: '4px' }}>{item.driverName}</td>
                                            <td style={{ border: '1px solid #ddd', padding: '4px' }}>{item.totalAdvance}</td>
                                            <td style={{ border: '1px solid #ddd', padding: '4px' }}>{item.advancePaid}</td>
                                            <td style={{ border: '1px solid #ddd', padding: '4px' }}>{item.advanceUnpaid}</td>
                                            <td style={{ border: '1px solid #ddd', padding: '4px' }}>{item.balance}</td>
                                            <td style={{
                                                border: '1px solid #ddd',
                                                padding: '4px',
                                                color: item.advanceStatus === 'paid' ? '#2e7d32' :
                                                    item.advanceStatus === 'pending' ? '#ed6c02' : '#757575'
                                            }}>{item.advanceStatus.toUpperCase()}</td>
                                            <td style={{ border: '1px solid #ddd', padding: '4px' }}>{item.bankName}</td>
                                        </tr>
                                    ))}
                                    {/* Totals Row */}
                                    <tr style={{ backgroundColor: '#e8f5e8', fontWeight: 'bold' }}>
                                        <td colSpan="7" style={{ border: '1px solid #ddd', padding: '4px', textAlign: 'right' }}>
                                            TOTAL ({totals.count} records)
                                        </td>
                                        <td style={{ border: '1px solid #ddd', padding: '4px' }}>{totals.totalAdvanceAmount}</td>
                                        <td style={{ border: '1px solid #ddd', padding: '4px' }}>{totals.totalAdvancePaid}</td>
                                        <td style={{ border: '1px solid #ddd', padding: '4px' }}>{totals.totalAdvanceUnpaid}</td>
                                        <td style={{ border: '1px solid #ddd', padding: '4px' }}>{totals.totalBalance}</td>
                                        <td colSpan="2" style={{ border: '1px solid #ddd', padding: '4px' }}>
                                            Paid: {totals.paidCount} | Pending: {totals.pendingCount}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                    {/* Visible Report Table */}
                    <div ref={reportRef}>
                        {loading ? (
                            <div className="flex justify-center p-8">
                                <CircularProgress />
                            </div>
                        ) : filteredData.length === 0 ? (
                            <div className="p-8 text-center border rounded-lg">
                                <Typography color="textSecondary" variant="h6">
                                    No trip advance records found
                                </Typography>
                                <Typography color="textSecondary" variant="body2" className="mt-2">
                                    Try adjusting your filters or refresh the data
                                </Typography>
                            </div>
                        ) : (
                            <>
                                <div className="overflow-x-auto border rounded-lg">
                                    <table className={tableStyles.table}>
                                        <thead>
                                            {table.getHeaderGroups().map(hg => (
                                                <tr key={hg.id} className="bg-gray-50">
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
                                                <tr key={row.id} className="hover:bg-gray-50">
                                                    {row.getVisibleCells().map(cell => (
                                                        <td key={cell.id}>
                                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                        {/* Totals Row */}
                                        <tfoot>
                                            <tr className="bg-green-50 font-bold">
                                                <td></td>
                                                <td colSpan={5} className="text-right">
                                                    <strong>TOTAL ({totals.count} records)</strong>
                                                </td>
                                                <td><strong>{totals.totalAdvanceAmount}</strong></td>
                                                <td><strong>{totals.totalAdvancePaid}</strong></td>
                                                <td><strong>{totals.totalAdvanceUnpaid}</strong></td>
                                                <td><strong>{totals.totalBalance}</strong></td>
                                                <td></td>
                                                <td></td>
                                                <td><strong>{totals.totalPaidAdvances}</strong></td>
                                                <td></td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                                {/* Summary */}
                                <div className="mt-4 text-right">
                                    <Typography variant="body2" color="textSecondary">
                                        Showing {filteredData.length} of {rows.length} total records
                                        {totals.totalPaidAdvances > 0 && ` | ${totals.totalPaidAdvances} paid advances`}
                                    </Typography>
                                </div>
                            </>
                        )}
                    </div>
                </CardContent>
            </Card>
            {/* ================= TRIP DETAILS DIALOG (Only Paid Advances) ================= */}
            <Dialog
                open={viewDetailsDialog}
                onClose={() => setViewDetailsDialog(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    <div className="flex items-center justify-between">
                        <span>Paid Advance Details - {selectedTrip?.vehicleNo}</span>
                        {selectedTrip?.advanceStatus === 'paid' && (
                            <Chip label="FULLY PAID" color="success" size="small" />
                        )}
                    </div>
                </DialogTitle>
                <DialogContent>
                    {selectedTrip && (
                        <div className="space-y-4">
                            {/* Trip Info */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Typography variant="caption" color="textSecondary">Trip Date</Typography>
                                    <Typography variant="body1">{selectedTrip.tripDate}</Typography>
                                </div>
                                <div>
                                    <Typography variant="caption" color="textSecondary">LHS No</Typography>
                                    <Typography variant="body1">{selectedTrip.lhsNo}</Typography>
                                </div>
                                <div>
                                    <Typography variant="caption" color="textSecondary">Route</Typography>
                                    <Typography variant="body1">{selectedTrip.from} → {selectedTrip.to}</Typography>
                                </div>
                                <div>
                                    <Typography variant="caption" color="textSecondary">Driver</Typography>
                                    <Typography variant="body1">{selectedTrip.driverName}</Typography>
                                </div>
                                <div>
                                    <Typography variant="caption" color="textSecondary">Bank Details</Typography>
                                    <Typography variant="body1">
                                        {selectedTrip.bankName} ({selectedTrip.accountNo})
                                    </Typography>
                                </div>
                                <div>
                                    <Typography variant="caption" color="textSecondary">IFSC Code</Typography>
                                    <Typography variant="body1">{selectedTrip.ifscCode || 'N/A'}</Typography>
                                </div>
                            </div>
                            {/* Amount Summary */}
                            <div className="p-4 bg-gray-50 rounded">
                                <Typography variant="subtitle2" className="mb-2">Amount Summary</Typography>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Typography variant="caption" color="textSecondary">Total Advance Approved</Typography>
                                        <Typography variant="h6" color="primary">{selectedTrip.totalAdvance}</Typography>
                                    </div>
                                    <div>
                                        <Typography variant="caption" color="textSecondary">Total Paid</Typography>
                                        <Typography variant="h6" color="success.main">{selectedTrip.advancePaid}</Typography>
                                    </div>
                                    <div>
                                        <Typography variant="caption" color="textSecondary">Total Unpaid</Typography>
                                        <Typography variant="h6" color="warning.main">{selectedTrip.advanceUnpaid}</Typography>
                                    </div>
                                    <div>
                                        <Typography variant="caption" color="textSecondary">Balance</Typography>
                                        <Typography variant="h6" color={selectedTrip.balance > 0 ? "warning.main" : "success.main"}>
                                            {selectedTrip.balance}
                                        </Typography>
                                    </div>
                                </div>
                            </div>
                            {/* Paid Advances History - Only Paid Advances */}
                            {selectedTrip.paidAdvances && selectedTrip.paidAdvances.length > 0 ? (
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <Typography variant="subtitle2">
                                            Paid Advances History
                                        </Typography>
                                        <Chip
                                            label={`${selectedTrip.paidAdvances.length} advances`}
                                            color="success"
                                            size="small"
                                        />
                                    </div>
                                    <div className="overflow-x-auto border rounded">
                                        <table className="min-w-full">
                                            <thead>
                                                <tr className="bg-green-50">
                                                    <th className="px-4 py-2 text-left text-xs">Type</th>
                                                    <th className="px-4 py-2 text-left text-xs">Amount</th>
                                                    <th className="px-4 py-2 text-left text-xs">Date</th>
                                                    <th className="px-4 py-2 text-left text-xs">Status</th>
                                                    <th className="px-4 py-2 text-left text-xs">Remark</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {selectedTrip.paidAdvances.map((advance, index) => (
                                                    <tr key={index} className="border-b hover:bg-green-50">
                                                        <td className="px-4 py-2">{advance.advanceType}</td>
                                                        <td className="px-4 py-2 font-medium">{advance.amount}</td>
                                                        <td className="px-4 py-2">{advance.date}</td>
                                                        <td className="px-4 py-2">
                                                            <Chip
                                                                label="PAID"
                                                                color="success"
                                                                size="small"
                                                            />
                                                        </td>
                                                        <td className="px-4 py-2">{advance.remark || '-'}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                            <tfoot>
                                                <tr className="bg-green-100 font-bold">
                                                    <td className="px-4 py-2 text-right" colSpan="4">Total Paid Amount:</td>
                                                    <td className="px-4 py-2">
                                                        {selectedTrip.paidAdvances.reduce((sum, a) => sum + Number(a.amount || 0), 0)}
                                                    </td>
                                                </tr>
                                            </tfoot>
                                        </table>
                                    </div>
                                </div>
                            ) : (
                                <Alert severity="info">
                                    No paid advances found for this trip
                                </Alert>
                            )}
                            {/* Unpaid Advances Notice (Optional) */}
                            {selectedTrip.unpaidAdvances && selectedTrip.unpaidAdvances.length > 0 && (
                                <Alert severity="warning">
                                    Note: {selectedTrip.unpaidAdvances.length} advance(s) are still pending payment
                                </Alert>
                            )}
                        </div>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setViewDetailsDialog(false)}>Close</Button>
                </DialogActions>
            </Dialog>
            {/* ================= SNACKBAR ================= */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
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
export default TripAdvanceReport
