'use client'
// MUI Imports
import { useState, useEffect, useRef } from 'react'
import Box from '@mui/material/Box'
import Tab from '@mui/material/Tab'
import TabContext from '@mui/lab/TabContext'
import TabList from '@mui/lab/TabList'
import TabPanel from '@mui/lab/TabPanel'
import Paper from '@mui/material/Paper'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Chip from '@mui/material/Chip'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Tooltip from '@mui/material/Tooltip'
import PrintIcon from '@mui/icons-material/Print'
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'
import WarningIcon from '@mui/icons-material/Warning'
import ErrorIcon from '@mui/icons-material/Error'
import { styled } from '@mui/material/styles'
import Link from '@mui/material/Link'
// Styled components
const StyledTableCell = styled(TableCell)(({ theme }) => ({
  backgroundColor: theme.palette.primary.light,
  color: theme.palette.common.white,
  fontWeight: 600,
  fontSize: '0.875rem'
}))
const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(even)': {
    backgroundColor: theme.palette.action.hover,
  },
  '&:hover': {
    backgroundColor: theme.palette.action.selected,
  }
}))
// Main Component
const TabBasedTable = () => {
  const [value, setValue] = useState('1')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filterStatus, setFilterStatus] = useState('all') // 'all', 'expired', 'expiringSoon'
  const [data, setData] = useState({
    ownVehicles: [],
    marketVehicles: [],
    trips: [],
    marketTrips: []
  })
  const printRef = useRef()
  const API_BASE = '/api/apps'
  const TRIPS_API = `${API_BASE}/trip`
  const VEHICLES_API = `${API_BASE}/vehicles`
  const MARKETVEHICLES_API = `${API_BASE}/vehicles/market`
  const MARKETTRIPS_API = `${API_BASE}/trip/market`
  const handleChange = (event, newValue) => {
    setValue(newValue)
  }
  // Format date to readable format
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    try {
      return new Date(dateString).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      })
    } catch {
      return dateString
    }
  }
  // Format datetime
  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A'
    try {
      return new Date(dateString).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return dateString
    }
  }
  // Format currency
  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return 'N/A'
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount)
  }
  // Check document status
  const getDocumentStatus = (documents) => {
    if (!documents || !Array.isArray(documents)) return { label: 'No Docs', color: 'default' }
    const today = new Date()
    const thirtyDaysFromNow = new Date()
    thirtyDaysFromNow.setDate(today.getDate() + 15)
    const expiredDocs = documents.filter(doc => doc.isExpired)
    const expiringSoonDocs = documents.filter(doc => {
      if (!doc.expiryDate || doc.isExpired) return false
      const expiryDate = new Date(doc.expiryDate)
      return expiryDate <= thirtyDaysFromNow && expiryDate > today
    })
    if (expiredDocs.length > 0) return { label: 'Has Expired', color: 'error' }
    if (expiringSoonDocs.length > 0) return { label: 'Expiring Soon', color: 'warning' }
    if (documents.length > 0) return { label: 'All Valid', color: 'success' }
    return { label: 'No Docs', color: 'default' }
  }
  // Get document status for individual document
  const getIndividualDocumentStatus = (expiryDate) => {
    if (!expiryDate) return { label: 'No Date', color: 'default' }
    const today = new Date()
    const expiry = new Date(expiryDate)
    const thirtyDaysFromNow = new Date()
    thirtyDaysFromNow.setDate(today.getDate() + 30)
    if (expiry < today) return { label: 'Expired', color: 'error', icon: ErrorIcon }
    if (expiry <= thirtyDaysFromNow) return { label: 'Expiring Soon', color: 'warning', icon: WarningIcon }
    return { label: 'Valid', color: 'success', icon: null }
  }
  // Get all documents with status from own vehicles
  const getAllDocumentsWithStatus = () => {
    const allDocs = []
    data.ownVehicles.forEach(vehicle => {
      if (vehicle.documents && Array.isArray(vehicle.documents)) {
        vehicle.documents.forEach(doc => {
          const status = getIndividualDocumentStatus(doc.expiryDate)
          allDocs.push({
            vehicleNo: vehicle.vehicleNo,
            ownerName: vehicle.ownerName,
            documentName: doc.documentType || 'Unknown Document',
            documentUrl: doc.imageUrl,
            expiryDate: doc.expiryDate,
            status: status.label,
            statusColor: status.color,
            statusIcon: status.icon,
            isExpired: doc.isExpired,
            vehicleId: vehicle._id
          })
        })
      }
    })
    // Sort by expiry date (oldest first)
    return allDocs.sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate))
  }
  // Get filtered documents
  const getFilteredDocuments = () => {
    const allDocs = getAllDocumentsWithStatus()
    if (filterStatus === 'all') return allDocs
    return allDocs.filter(doc => {
      if (filterStatus === 'expired') return doc.status === 'Expired'
      if (filterStatus === 'expiringSoon') return doc.status === 'Expiring Soon'
      return true
    })
  }
  // Handle print report
  const handlePrintReport = () => {
    const printWindow = window.open('', '_blank')
    const documents = getFilteredDocuments()
    const reportTitle = filterStatus === 'all' ? 'All Documents Report' :
      filterStatus === 'expired' ? 'Expired Documents Report' :
        'Expiring Soon Documents Report'
    const styles = `
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        h1 { color: #1976d2; font-size: 24px; margin-bottom: 10px; }
        h2 { color: #333; font-size: 18px; margin-bottom: 20px; }
        .status-expired { color: #d32f2f; font-weight: bold; }
        .status-expiring { color: #ed6c02; font-weight: bold; }
        .status-valid { color: #2e7d32; font-weight: bold; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th { background-color: #1976d2; color: white; padding: 10px; text-align: left; }
        td { padding: 8px; border-bottom: 1px solid #ddd; }
        tr:nth-child(even) { background-color: #f5f5f5; }
        .footer { margin-top: 30px; font-size: 12px; color: #666; text-align: center; }
        .status-badge {
          padding: 3px 8px;
          border-radius: 12px;
          font-size: 12px;
          display: inline-block;
        }
        .badge-expired { background-color: #d32f2f; color: white; }
        .badge-expiring { background-color: #ed6c02; color: white; }
        .badge-valid { background-color: #2e7d32; color: white; }
      </style>
    `
    const content = `
      <html>
        <head>
          <title>${reportTitle}</title>
          ${styles}
        </head>
        <body>
          <h1>🚛 ${reportTitle}</h1>
          <h2>Generated on: ${formatDateTime(new Date())}</h2>
          <table>
            <thead>
              <tr>
                <th>Vehicle No</th>
                <th>Owner Name</th>
                <th>Document Name</th>
                <th>Expiry Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${documents.map(doc => {
      const statusClass = doc.status === 'Expired' ? 'badge-expired' :
        doc.status === 'Expiring Soon' ? 'badge-expiring' : 'badge-valid'
      const dateClass = doc.status === 'Expired' ? 'status-expired' :
        doc.status === 'Expiring Soon' ? 'status-expiring' : 'status-valid'
      return `
                  <tr>
                    <td><strong>${doc.vehicleNo}</strong></td>
                    <td>${doc.ownerName}</td>
                    <td>${doc.documentName}</td>
                    <td class="${dateClass}">${formatDate(doc.expiryDate)}</td>
                    <td><span class="status-badge ${statusClass}">${doc.status}</span></td>
                  </tr>
                `
    }).join('')}
            </tbody>
          </table>
          <div class="footer">
            <p>Total Documents: ${documents.length}</p>
            <p>Report generated from Vehicle Management System</p>
          </div>
        </body>
      </html>
    `
    printWindow.document.write(content)
    printWindow.document.close()
    printWindow.focus()
    printWindow.print()
  }
  // Fetch all data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const endpoints = [
          { key: 'ownVehicles', url: VEHICLES_API },
          { key: 'marketVehicles', url: MARKETVEHICLES_API },
          { key: 'trips', url: TRIPS_API },
          { key: 'marketTrips', url: MARKETTRIPS_API }
        ]
        const responses = await Promise.all(
          endpoints.map(endpoint =>
            fetch(endpoint.url).then(res => res.json())
          )
        )
        const newData = {}
        endpoints.forEach((endpoint, index) => {
          if (responses[index].success) {
            newData[endpoint.key] = responses[index].data || []
          } else {
            newData[endpoint.key] = []
          }
        })
        setData(newData)
      } catch (err) {
        console.error('Error fetching data:', err)
        setError('Failed to fetch data from server')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])
  const allDocuments = getAllDocumentsWithStatus()
  const expiredCount = allDocuments.filter(doc => doc.status === 'Expired').length
  const expiringSoonCount = allDocuments.filter(doc => doc.status === 'Expiring Soon').length
  const filteredDocuments = getFilteredDocuments()
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
        <CircularProgress />
      </Box>
    )
  }
  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    )
  }
  return (
    <Box sx={{ width: '100%', typography: 'body1' }}>
      <TabContext value={value}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <TabList
            onChange={handleChange}
            aria-label="data tabs"
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label="Trips" value="3" />
            <Tab label="Own Vehicles" value="1" />
            <Tab label="Market Vehicles" value="2" />
            <Tab label="Market Trips" value="4" />
            <Tab
              label={
                <Box display="flex" alignItems="center" gap={1}>
                  Documents Status
                  {(expiredCount > 0 || expiringSoonCount > 0) && (
                    <Box display="flex" gap={0.5}>
                      {expiredCount > 0 && (
                        <Chip
                          label={expiredCount}
                          size="small"
                          color="error"
                          sx={{ height: 20, '& .MuiChip-label': { px: 1 } }}
                        />
                      )}
                      {expiringSoonCount > 0 && (
                        <Chip
                          label={expiringSoonCount}
                          size="small"
                          color="warning"
                          sx={{ height: 20, '& .MuiChip-label': { px: 1 } }}
                        />
                      )}
                    </Box>
                  )}
                </Box>
              }
              value="5"
            />
          </TabList>
        </Box>
        {/* Tab 1: Own Vehicles */}
        <TabPanel value="1" sx={{ p: 0, pt: 3 }}>
          <TableContainer component={Paper} elevation={0} variant="outlined">
            <Table sx={{ minWidth: 800 }} aria-label="own vehicles table">
              <TableHead>
                <TableRow>
                  <StyledTableCell>Vehicle No</StyledTableCell>
                  <StyledTableCell>Owner Name</StyledTableCell>
                  <StyledTableCell>Model</StyledTableCell>
                  <StyledTableCell>Bank Details</StyledTableCell>
                  <StyledTableCell>Status</StyledTableCell>
                  <StyledTableCell>Documents</StyledTableCell>
                  <StyledTableCell>Created At</StyledTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.ownVehicles.length > 0 ? (
                  data.ownVehicles.map((vehicle) => (
                    <StyledTableRow key={vehicle._id}>
                      <TableCell>
                        <Typography variant="body2" fontWeight={500}>
                          {vehicle.vehicleNo}
                        </Typography>
                      </TableCell>
                      <TableCell>{vehicle.ownerName}</TableCell>
                      <TableCell>{vehicle.model}</TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="caption" display="block">
                            {vehicle.bankName}
                          </Typography>
                          <Typography variant="caption" display="block" fontFamily="monospace">
                            A/C: {vehicle.accountNo}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={vehicle.isActive ? 'Active' : 'Inactive'}
                          color={vehicle.isActive ? 'success' : 'error'}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          {...getDocumentStatus(vehicle.documents)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {formatDateTime(vehicle.createdAt)}
                        </Typography>
                      </TableCell>
                    </StyledTableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <Typography color="text.secondary">
                        No vehicles found
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>
        {/* Tab 2: Market Vehicles */}
        <TabPanel value="2" sx={{ p: 0, pt: 3 }}>
          <TableContainer component={Paper} elevation={0} variant="outlined">
            <Table sx={{ minWidth: 850 }} aria-label="market vehicles table">
              <TableHead>
                <TableRow>
                  <StyledTableCell>Vehicle No</StyledTableCell>
                  <StyledTableCell>Owner</StyledTableCell>
                  <StyledTableCell>Driver</StyledTableCell>
                  <StyledTableCell>Model</StyledTableCell>
                  <StyledTableCell>Bank Details</StyledTableCell>
                  <StyledTableCell>Status</StyledTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.marketVehicles.length > 0 ? (
                  data.marketVehicles.map((vehicle) => (
                    <StyledTableRow key={vehicle._id}>
                      <TableCell>
                        <Typography variant="body2" fontWeight={500}>
                          {vehicle.vehicleNo}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2">{vehicle.ownerName}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {vehicle.ownerMobile}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2">{vehicle.driverName}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {vehicle.driverMobile}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{vehicle.model}</TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="caption" display="block">
                            {vehicle.bankName}
                          </Typography>
                          <Typography variant="caption" display="block" fontFamily="monospace">
                            A/C: {vehicle.accountNo}
                          </Typography>
                          <Typography variant="caption" display="block">
                            Holder: {vehicle.accountHolderName}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={vehicle.isActive ? 'Active' : 'Inactive'}
                          color={vehicle.isActive ? 'success' : 'error'}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                    </StyledTableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <Typography color="text.secondary">
                        No market vehicles found
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>
        {/* Tab 3: Trips */}
        <TabPanel value="3" sx={{ p: 0, pt: 3 }}>
          <TableContainer component={Paper} elevation={0} variant="outlined">
            <Table sx={{ minWidth: 900 }} aria-label="trips table">
              <TableHead>
                <TableRow>
                  <StyledTableCell>Vehicle No</StyledTableCell>
                  <StyledTableCell>Route</StyledTableCell>
                  <StyledTableCell>Driver</StyledTableCell>
                  <StyledTableCell>Trip Details</StyledTableCell>
                  <StyledTableCell>Financials</StyledTableCell>
                  <StyledTableCell>Status</StyledTableCell>
                  <StyledTableCell>Trip Date</StyledTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.trips.length > 0 ? (
                  data.trips.map((trip) => (
                    <StyledTableRow key={trip._id}>
                      <TableCell>
                        <Typography variant="body2" fontWeight={500}>
                          {trip.vehicleNo}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2">
                            {trip.fromLocation} → {trip.toLocation}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            LHS No: {trip.lhsNo}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2">{trip.driverName}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {trip.driverMobile}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="caption" display="block">
                            Type: {trip.tripType}
                          </Typography>
                          <Typography variant="caption" display="block">
                            Vehicle: {trip.vehicleType}
                          </Typography>
                          <Typography variant="caption" display="block">
                            Distance: {trip.distanceKm || 0} km
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="caption" display="block">
                            Diesel: {trip.dieselLtr}L × {formatCurrency(trip.dieselRate)}
                          </Typography>
                          <Typography variant="caption" display="block" fontWeight={500}>
                            Diesel Total: {formatCurrency(trip.totalDieselAmount)}
                          </Typography>
                          <Typography variant="caption" display="block">
                            Advance: {formatCurrency(trip.advanceAmount)}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={trip.tripStatus}
                          color={trip.tripStatus === 'active' ? 'success' : 'warning'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {formatDate(trip.tripDate)}
                        </Typography>
                      </TableCell>
                    </StyledTableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <Typography color="text.secondary">
                        No trips found
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>
        {/* Tab 4: Market Trips */}
        <TabPanel value="4" sx={{ p: 0, pt: 3 }}>
          <TableContainer component={Paper} elevation={0} variant="outlined">
            <Table sx={{ minWidth: 900 }} aria-label="market trips table">
              <TableHead>
                <TableRow>
                  <StyledTableCell>Vehicle No</StyledTableCell>
                  <StyledTableCell>Route</StyledTableCell>
                  <StyledTableCell>Driver</StyledTableCell>
                  <StyledTableCell>Trip Details</StyledTableCell>
                  <StyledTableCell>Financials</StyledTableCell>
                  <StyledTableCell>Bank Details</StyledTableCell>
                  <StyledTableCell>Status</StyledTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.marketTrips.length > 0 ? (
                  data.marketTrips.map((trip) => (
                    <StyledTableRow key={trip._id}>
                      <TableCell>
                        <Typography variant="body2" fontWeight={500}>
                          {trip.vehicleNo}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2">
                            {trip.fromLocation} → {trip.toLocation}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            LHS No: {trip.lhsNo}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2">{trip.driverName}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {trip.driverMobile}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="caption" display="block">
                            Type: {trip.tripType}
                          </Typography>
                          <Typography variant="caption" display="block">
                            Vehicle: {trip.vehicleType}
                          </Typography>
                          <Typography variant="caption" display="block">
                            Distance: {trip.distanceKm || 0} km
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="caption" display="block">
                            Diesel: {trip.dieselLtr}L × {formatCurrency(trip.dieselRate)}
                          </Typography>
                          <Typography variant="caption" display="block" fontWeight={500}>
                            Diesel Total: {formatCurrency(trip.totalDieselAmount)}
                          </Typography>
                          <Typography variant="caption" display="block">
                            Advance: {formatCurrency(trip.advanceAmount)}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="caption" display="block">
                            {trip.bankName}
                          </Typography>
                          <Typography variant="caption" display="block" fontFamily="monospace">
                            A/C: {trip.accountNo}
                          </Typography>
                          <Typography variant="caption" display="block">
                            Holder: {trip.accountHolderName}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={trip.tripStatus}
                          color={trip.tripStatus === 'active' ? 'success' : 'warning'}
                          size="small"
                        />
                      </TableCell>
                    </StyledTableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <Typography color="text.secondary">
                        No market trips found
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>
        {/* Tab 5: Documents Status */}
        <TabPanel value="5" sx={{ p: 0, pt: 3 }}>
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box display="flex" gap={1}>
              <Button
                variant={filterStatus === 'all' ? 'contained' : 'outlined'}
                size="small"
                onClick={() => setFilterStatus('all')}
              >
                All ({allDocuments.length})
              </Button>
              <Button
                variant={filterStatus === 'expired' ? 'contained' : 'outlined'}
                size="small"
                color="error"
                onClick={() => setFilterStatus('expired')}
                startIcon={<ErrorIcon />}
              >
                Expired ({expiredCount})
              </Button>
              <Button
                variant={filterStatus === 'expiringSoon' ? 'contained' : 'outlined'}
                size="small"
                color="warning"
                onClick={() => setFilterStatus('expiringSoon')}
                startIcon={<WarningIcon />}
              >
                Expiring Soon ({expiringSoonCount})
              </Button>
            </Box>
            <Tooltip title="Print Report">
              <Button
                variant="contained"
                startIcon={<PrintIcon />}
                onClick={handlePrintReport}
                disabled={filteredDocuments.length === 0}
                size="small"
              >
                Print Report
              </Button>
            </Tooltip>
          </Box>
          <TableContainer component={Paper} elevation={0} variant="outlined">
            <Table sx={{ minWidth: 900 }} aria-label="documents status table">
              <TableHead>
                <TableRow>
                  <StyledTableCell>Vehicle No</StyledTableCell>
                  <StyledTableCell>Owner Name</StyledTableCell>
                  <StyledTableCell>Document Name</StyledTableCell>
                  <StyledTableCell>Document</StyledTableCell>
                  <StyledTableCell>Expiry Date</StyledTableCell>
                  <StyledTableCell>Status</StyledTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredDocuments.length > 0 ? (
                  filteredDocuments.map((doc, index) => (
                    <StyledTableRow key={`${doc.vehicleId}-${index}`}>
                      <TableCell>
                        <Typography variant="body2" fontWeight={500}>
                          {doc.vehicleNo}
                        </Typography>
                      </TableCell>
                      <TableCell>{doc.ownerName}</TableCell>
                      <TableCell>{doc.documentName}</TableCell>
                      <TableCell>
                        {doc.documentUrl ? (
                          <Link
                            href={doc.documentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(doc.documentUrl, '_blank', 'noopener,noreferrer');
                            }}
                            sx={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 0.5,
                              color: 'primary.main',
                              textDecoration: 'none',
                              cursor: 'pointer',
                              '&:hover': {
                                textDecoration: 'underline',
                                color: 'primary.dark'
                              }
                            }}
                          >
                            <PictureAsPdfIcon fontSize="small" />
                            View Document
                          </Link>
                        ) : (
                          <Typography variant="caption" color="text.secondary">
                            No Document Available
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant="body2"
                          color={doc.status === 'Expired' ? 'error' :
                            doc.status === 'Expiring Soon' ? 'warning.main' :
                              'success.main'}
                          fontWeight={500}
                        >
                          {formatDate(doc.expiryDate)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={doc.status}
                          color={doc.statusColor}
                          size="small"
                          icon={doc.statusIcon ? <doc.statusIcon /> : undefined}
                        />
                      </TableCell>
                    </StyledTableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <Box py={3}>
                        <Typography color="success.main" variant="h6" gutterBottom>
                          ✅ No Documents Found
                        </Typography>
                        <Typography color="text.secondary">
                          {filterStatus === 'expired' ? 'No expired documents' :
                            filterStatus === 'expiringSoon' ? 'No documents expiring soon' :
                              'No documents available'}
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>
      </TabContext>
    </Box>
  )
}
export default TabBasedTable
// 'use client'
// // MUI Imports
// import { useState, useEffect, useRef } from 'react'
// import Box from '@mui/material/Box'
// import Tab from '@mui/material/Tab'
// import TabContext from '@mui/lab/TabContext'
// import TabList from '@mui/lab/TabList'
// import TabPanel from '@mui/lab/TabPanel'
// import Paper from '@mui/material/Paper'
// import Table from '@mui/material/Table'
// import TableBody from '@mui/material/TableBody'
// import TableCell from '@mui/material/TableCell'
// import TableContainer from '@mui/material/TableContainer'
// import TableHead from '@mui/material/TableHead'
// import TableRow from '@mui/material/TableRow'
// import Chip from '@mui/material/Chip'
// import Typography from '@mui/material/Typography'
// import CircularProgress from '@mui/material/CircularProgress'
// import Alert from '@mui/material/Alert'
// import Button from '@mui/material/Button'
// import Tooltip from '@mui/material/Tooltip'
// import PrintIcon from '@mui/icons-material/Print'
// import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'
// import WarningIcon from '@mui/icons-material/Warning'
// import ErrorIcon from '@mui/icons-material/Error'
// import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty'
// import { styled } from '@mui/material/styles'
// import Link from '@mui/material/Link'
// // Styled components
// const StyledTableCell = styled(TableCell)(({ theme }) => ({
//   backgroundColor: theme.palette.primary.light,
//   color: theme.palette.common.white,
//   fontWeight: 600,
//   fontSize: '0.875rem'
// }))
// const StyledTableRow = styled(TableRow)(({ theme }) => ({
//   '&:nth-of-type(even)': {
//     backgroundColor: theme.palette.action.hover,
//   },
//   '&:hover': {
//     backgroundColor: theme.palette.action.selected,
//   }
// }))
// const DaysChip = styled(Chip)(({ theme, days }) => ({
//   fontWeight: 600,
//   ...(days < 0 && {
//     backgroundColor: theme.palette.error.light,
//     color: theme.palette.error.dark,
//   }),
//   ...(days >= 0 && days <= 7 && {
//     backgroundColor: theme.palette.error.light,
//     color: theme.palette.error.dark,
//   }),
//   ...(days > 7 && days <= 15 && {
//     backgroundColor: theme.palette.warning.light,
//     color: theme.palette.warning.dark,
//   }),
//   ...(days > 15 && days <= 30 && {
//     backgroundColor: theme.palette.info.light,
//     color: theme.palette.info.dark,
//   }),
//   ...(days > 30 && {
//     backgroundColor: theme.palette.success.light,
//     color: theme.palette.success.dark,
//   })
// }))
// // Main Component
// const TabBasedTable = () => {
//   const [value, setValue] = useState('1')
//   const [loading, setLoading] = useState(true)
//   const [error, setError] = useState(null)
//   const [filterStatus, setFilterStatus] = useState('all') // 'all', 'expired', 'expiringSoon'
//   const [data, setData] = useState({
//     ownVehicles: [],
//     marketVehicles: [],
//     trips: [],
//     marketTrips: []
//   })
//   const printRef = useRef()
//   const API_BASE = '/api/apps'
//   const TRIPS_API = `${API_BASE}/trip`
//   const VEHICLES_API = `${API_BASE}/vehicles`
//   const MARKETVEHICLES_API = `${API_BASE}/vehicles/market`
//   const MARKETTRIPS_API = `${API_BASE}/trip/market`
//   const handleChange = (event, newValue) => {
//     setValue(newValue)
//   }
//   // Format date to readable format
//   const formatDate = (dateString) => {
//     if (!dateString) return 'N/A'
//     try {
//       return new Date(dateString).toLocaleDateString('en-IN', {
//         day: '2-digit',
//         month: 'short',
//         year: 'numeric'
//       })
//     } catch {
//       return dateString
//     }
//   }
//   // Format datetime
//   const formatDateTime = (dateString) => {
//     if (!dateString) return 'N/A'
//     try {
//       return new Date(dateString).toLocaleDateString('en-IN', {
//         day: '2-digit',
//         month: 'short',
//         year: 'numeric',
//         hour: '2-digit',
//         minute: '2-digit'
//       })
//     } catch {
//       return dateString
//     }
//   }
//   // Format currency
//   const formatCurrency = (amount) => {
//     if (!amount && amount !== 0) return 'N/A'
//     return new Intl.NumberFormat('en-IN', {
//       style: 'currency',
//       currency: 'INR',
//       maximumFractionDigits: 0
//     }).format(amount)
//   }
//   // Calculate days until expiry
//   const getDaysUntilExpiry = (expiryDate) => {
//     if (!expiryDate) return null
//     const today = new Date()
//     today.setHours(0, 0, 0, 0)
//     const expiry = new Date(expiryDate)
//     expiry.setHours(0, 0, 0, 0)
//     const diffTime = expiry - today
//     const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
//     return diffDays
//   }
//   // Get status and days text
//   const getExpiryStatus = (expiryDate) => {
//     const days = getDaysUntilExpiry(expiryDate)
//     if (days === null) return { label: 'No Date', color: 'default', icon: null, daysText: '' }
//     if (days < 0) return {
//       label: 'Expired',
//       color: 'error',
//       icon: ErrorIcon,
//       daysText: `${Math.abs(days)} days overdue`
//     }
//     if (days === 0) return {
//       label: 'Expires Today',
//       color: 'error',
//       icon: WarningIcon,
//       daysText: 'Today'
//     }
//     if (days <= 7) return {
//       label: 'Critical',
//       color: 'error',
//       icon: WarningIcon,
//       daysText: `${days} days left`
//     }
//     if (days <= 15) return {
//       label: 'Warning',
//       color: 'warning',
//       icon: WarningIcon,
//       daysText: `${days} days left`
//     }
//     if (days <= 30) return {
//       label: 'Expiring Soon',
//       color: 'info',
//       icon: HourglassEmptyIcon,
//       daysText: `${days} days left`
//     }
//     return {
//       label: 'Valid',
//       color: 'success',
//       icon: null,
//       daysText: `${days} days left`
//     }
//   }
//   // Check document status for vehicle level
//   const getDocumentStatus = (documents) => {
//     if (!documents || !Array.isArray(documents)) return { label: 'No Docs', color: 'default' }
//     let hasExpired = false
//     let hasExpiringSoon = false
//     documents.forEach(doc => {
//       const days = getDaysUntilExpiry(doc.expiryDate)
//       if (days < 0) hasExpired = true
//       else if (days <= 30) hasExpiringSoon = true
//     })
//     if (hasExpired) return { label: 'Has Expired', color: 'error' }
//     if (hasExpiringSoon) return { label: 'Expiring Soon', color: 'warning' }
//     if (documents.length > 0) return { label: 'All Valid', color: 'success' }
//     return { label: 'No Docs', color: 'default' }
//   }
//   // Get all documents with status from own vehicles
//   const getAllDocumentsWithStatus = () => {
//     const allDocs = []
//     data.ownVehicles.forEach(vehicle => {
//       if (vehicle.documents && Array.isArray(vehicle.documents)) {
//         vehicle.documents.forEach(doc => {
//           const status = getExpiryStatus(doc.expiryDate)
//           allDocs.push({
//             vehicleNo: vehicle.vehicleNo,
//             ownerName: vehicle.ownerName,
//             documentName: doc.documentType || 'Unknown Document',
//             documentUrl: doc.imageUrl,
//             expiryDate: doc.expiryDate,
//             daysUntilExpiry: getDaysUntilExpiry(doc.expiryDate),
//             status: status.label,
//             statusColor: status.color,
//             statusIcon: status.icon,
//             daysText: status.daysText,
//             isExpired: status.label === 'Expired',
//             vehicleId: vehicle._id
//           })
//         })
//       }
//     })
//     // Sort by days until expiry (most urgent first)
//     return allDocs.sort((a, b) => {
//       if (a.daysUntilExpiry === null) return 1
//       if (b.daysUntilExpiry === null) return -1
//       return a.daysUntilExpiry - b.daysUntilExpiry
//     })
//   }
//   // Get filtered documents
//   const getFilteredDocuments = () => {
//     const allDocs = getAllDocumentsWithStatus()
//     if (filterStatus === 'all') return allDocs
//     return allDocs.filter(doc => {
//       if (filterStatus === 'expired') return doc.status === 'Expired'
//       if (filterStatus === 'expiringSoon') return doc.status !== 'Expired' && doc.status !== 'Valid' && doc.status !== 'No Date'
//       return true
//     })
//   }
//   // Handle print report
//   const handlePrintReport = () => {
//     const printWindow = window.open('', '_blank')
//     const documents = getFilteredDocuments()
//     const reportTitle = filterStatus === 'all' ? 'All Documents Report' :
//       filterStatus === 'expired' ? 'Expired Documents Report' :
//         'Expiring Soon Documents Report'
//     const styles = `
//       <style>
//         body { font-family: Arial, sans-serif; margin: 20px; }
//         h1 { color: #1976d2; font-size: 24px; margin-bottom: 10px; }
//         h2 { color: #333; font-size: 18px; margin-bottom: 20px; }
//         .status-expired { color: #d32f2f; font-weight: bold; }
//         .status-critical { color: #d32f2f; font-weight: bold; }
//         .status-warning { color: #ed6c02; font-weight: bold; }
//         .status-expiring { color: #0288d1; font-weight: bold; }
//         .status-valid { color: #2e7d32; font-weight: bold; }
//         table { width: 100%; border-collapse: collapse; margin-top: 20px; }
//         th { background-color: #1976d2; color: white; padding: 10px; text-align: left; }
//         td { padding: 8px; border-bottom: 1px solid #ddd; }
//         tr:nth-child(even) { background-color: #f5f5f5; }
//         .footer { margin-top: 30px; font-size: 12px; color: #666; text-align: center; }
//         .days-badge {
//           padding: 3px 8px;
//           border-radius: 12px;
//           font-size: 12px;
//           display: inline-block;
//           font-weight: bold;
//         }
//         .days-overdue { background-color: #d32f2f; color: white; }
//         .days-critical { background-color: #d32f2f; color: white; }
//         .days-warning { background-color: #ed6c02; color: white; }
//         .days-info { background-color: #0288d1; color: white; }
//         .days-valid { background-color: #2e7d32; color: white; }
//       </style>
//     `
//     const content = `
//       <html>
//         <head>
//           <title>${reportTitle}</title>
//           ${styles}
//         </head>
//         <body>
//           <h1>🚛 ${reportTitle}</h1>
//           <h2>Generated on: ${formatDateTime(new Date())}</h2>
//           <table>
//             <thead>
//               <tr>
//                 <th>Vehicle No</th>
//                 <th>Owner Name</th>
//                 <th>Document Name</th>
//                 <th>Expiry Date</th>
//                 <th>Days Left/Overdue</th>
//                 <th>Status</th>
//               </tr>
//             </thead>
//             <tbody>
//               ${documents.map(doc => {
//       const daysClass = doc.daysUntilExpiry < 0 ? 'days-overdue' :
//         doc.daysUntilExpiry <= 7 ? 'days-critical' :
//           doc.daysUntilExpiry <= 15 ? 'days-warning' :
//             doc.daysUntilExpiry <= 30 ? 'days-info' : 'days-valid'
//       const dateClass = doc.daysUntilExpiry < 0 ? 'status-expired' :
//         doc.daysUntilExpiry <= 7 ? 'status-critical' :
//           doc.daysUntilExpiry <= 15 ? 'status-warning' :
//             doc.daysUntilExpiry <= 30 ? 'status-expiring' : 'status-valid'
//       return `
//                   <tr>
//                     <td><strong>${doc.vehicleNo}</strong></td>
//                     <td>${doc.ownerName}</td>
//                     <td>${doc.documentName}</td>
//                     <td class="${dateClass}">${formatDate(doc.expiryDate)}</td>
//                     <td><span class="days-badge ${daysClass}">${doc.daysText}</span></td>
//                     <td>${doc.status}</td>
//                   </tr>
//                 `
//     }).join('')}
//             </tbody>
//           </table>
//           <div class="footer">
//             <p>Total Documents: ${documents.length}</p>
//             <p>Report generated from Vehicle Management System</p>
//           </div>
//         </body>
//       </html>
//     `
//     printWindow.document.write(content)
//     printWindow.document.close()
//     printWindow.focus()
//     printWindow.print()
//   }
//   // Fetch all data
//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         setLoading(true)
//         const endpoints = [
//           { key: 'ownVehicles', url: VEHICLES_API },
//           { key: 'marketVehicles', url: MARKETVEHICLES_API },
//           { key: 'trips', url: TRIPS_API },
//           { key: 'marketTrips', url: MARKETTRIPS_API }
//         ]
//         const responses = await Promise.all(
//           endpoints.map(endpoint =>
//             fetch(endpoint.url).then(res => res.json())
//           )
//         )
//         const newData = {}
//         endpoints.forEach((endpoint, index) => {
//           if (responses[index].success) {
//             newData[endpoint.key] = responses[index].data || []
//           } else {
//             newData[endpoint.key] = []
//           }
//         })
//         setData(newData)
//       } catch (err) {
//         console.error('Error fetching data:', err)
//         setError('Failed to fetch data from server')
//       } finally {
//         setLoading(false)
//       }
//     }
//     fetchData()
//   }, [])
//   const allDocuments = getAllDocumentsWithStatus()
//   const expiredCount = allDocuments.filter(doc => doc.status === 'Expired').length
//   const criticalCount = allDocuments.filter(doc => doc.status === 'Critical').length
//   const warningCount = allDocuments.filter(doc => doc.status === 'Warning').length
//   const expiringSoonCount = allDocuments.filter(doc => doc.status === 'Expiring Soon').length
//   const filteredDocuments = getFilteredDocuments()
//   if (loading) {
//     return (
//       <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
//         <CircularProgress />
//       </Box>
//     )
//   }
//   if (error) {
//     return (
//       <Alert severity="error" sx={{ mt: 2 }}>
//         {error}
//       </Alert>
//     )
//   }
//   return (
//     <Box sx={{ width: '100%', typography: 'body1' }}>
//       <TabContext value={value}>
//         <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
//           <TabList
//             onChange={handleChange}
//             aria-label="data tabs"
//             variant="scrollable"
//             scrollButtons="auto"
//           >
//             <Tab label="Trips" value="3" />
//             <Tab label="Own Vehicles" value="1" />
//             <Tab label="Market Vehicles" value="2" />
//             <Tab label="Market Trips" value="4" />
//             <Tab
//               label={
//                 <Box display="flex" alignItems="center" gap={1}>
//                   Documents Status
//                   {(expiredCount > 0 || criticalCount > 0 || warningCount > 0 || expiringSoonCount > 0) && (
//                     <Box display="flex" gap={0.5}>
//                       {expiredCount > 0 && (
//                         <Chip
//                           label={`${expiredCount} Overdue`}
//                           size="small"
//                           color="error"
//                           sx={{ height: 20, '& .MuiChip-label': { px: 1 } }}
//                         />
//                       )}
//                       {criticalCount > 0 && (
//                         <Chip
//                           label={`${criticalCount} Critical`}
//                           size="small"
//                           sx={{
//                             height: 20,
//                             bgcolor: 'error.main',
//                             color: 'white',
//                             '& .MuiChip-label': { px: 1 }
//                           }}
//                         />
//                       )}
//                       {warningCount > 0 && (
//                         <Chip
//                           label={`${warningCount} Warning`}
//                           size="small"
//                           color="warning"
//                           sx={{ height: 20, '& .MuiChip-label': { px: 1 } }}
//                         />
//                       )}
//                       {expiringSoonCount > 0 && (
//                         <Chip
//                           label={`${expiringSoonCount} Soon`}
//                           size="small"
//                           color="info"
//                           sx={{ height: 20, '& .MuiChip-label': { px: 1 } }}
//                         />
//                       )}
//                     </Box>
//                   )}
//                 </Box>
//               }
//               value="5"
//             />
//           </TabList>
//         </Box>
//         {/* Tab 1: Own Vehicles */}
//         <TabPanel value="1" sx={{ p: 0, pt: 3 }}>
//           <TableContainer component={Paper} elevation={0} variant="outlined">
//             <Table sx={{ minWidth: 800 }} aria-label="own vehicles table">
//               <TableHead>
//                 <TableRow>
//                   <StyledTableCell>Vehicle No</StyledTableCell>
//                   <StyledTableCell>Owner Name</StyledTableCell>
//                   <StyledTableCell>Model</StyledTableCell>
//                   <StyledTableCell>Bank Details</StyledTableCell>
//                   <StyledTableCell>Status</StyledTableCell>
//                   <StyledTableCell>Documents</StyledTableCell>
//                   <StyledTableCell>Created At</StyledTableCell>
//                 </TableRow>
//               </TableHead>
//               <TableBody>
//                 {data.ownVehicles.length > 0 ? (
//                   data.ownVehicles.map((vehicle) => (
//                     <StyledTableRow key={vehicle._id}>
//                       <TableCell>
//                         <Typography variant="body2" fontWeight={500}>
//                           {vehicle.vehicleNo}
//                         </Typography>
//                       </TableCell>
//                       <TableCell>{vehicle.ownerName}</TableCell>
//                       <TableCell>{vehicle.model}</TableCell>
//                       <TableCell>
//                         <Box>
//                           <Typography variant="caption" display="block">
//                             {vehicle.bankName}
//                           </Typography>
//                           <Typography variant="caption" display="block" fontFamily="monospace">
//                             A/C: {vehicle.accountNo}
//                           </Typography>
//                         </Box>
//                       </TableCell>
//                       <TableCell>
//                         <Chip
//                           label={vehicle.isActive ? 'Active' : 'Inactive'}
//                           color={vehicle.isActive ? 'success' : 'error'}
//                           size="small"
//                           variant="outlined"
//                         />
//                       </TableCell>
//                       <TableCell>
//                         <Chip
//                           {...getDocumentStatus(vehicle.documents)}
//                           size="small"
//                         />
//                       </TableCell>
//                       <TableCell>
//                         <Typography variant="body2">
//                           {formatDateTime(vehicle.createdAt)}
//                         </Typography>
//                       </TableCell>
//                     </StyledTableRow>
//                   ))
//                 ) : (
//                   <TableRow>
//                     <TableCell colSpan={7} align="center">
//                       <Typography color="text.secondary">
//                         No vehicles found
//                       </Typography>
//                     </TableCell>
//                   </TableRow>
//                 )}
//               </TableBody>
//             </Table>
//           </TableContainer>
//         </TabPanel>
//         {/* Tab 2: Market Vehicles */}
//         <TabPanel value="2" sx={{ p: 0, pt: 3 }}>
//           <TableContainer component={Paper} elevation={0} variant="outlined">
//             <Table sx={{ minWidth: 850 }} aria-label="market vehicles table">
//               <TableHead>
//                 <TableRow>
//                   <StyledTableCell>Vehicle No</StyledTableCell>
//                   <StyledTableCell>Owner</StyledTableCell>
//                   <StyledTableCell>Driver</StyledTableCell>
//                   <StyledTableCell>Model</StyledTableCell>
//                   <StyledTableCell>Bank Details</StyledTableCell>
//                   <StyledTableCell>Status</StyledTableCell>
//                 </TableRow>
//               </TableHead>
//               <TableBody>
//                 {data.marketVehicles.length > 0 ? (
//                   data.marketVehicles.map((vehicle) => (
//                     <StyledTableRow key={vehicle._id}>
//                       <TableCell>
//                         <Typography variant="body2" fontWeight={500}>
//                           {vehicle.vehicleNo}
//                         </Typography>
//                       </TableCell>
//                       <TableCell>
//                         <Box>
//                           <Typography variant="body2">{vehicle.ownerName}</Typography>
//                           <Typography variant="caption" color="text.secondary">
//                             {vehicle.ownerMobile}
//                           </Typography>
//                         </Box>
//                       </TableCell>
//                       <TableCell>
//                         <Box>
//                           <Typography variant="body2">{vehicle.driverName}</Typography>
//                           <Typography variant="caption" color="text.secondary">
//                             {vehicle.driverMobile}
//                           </Typography>
//                         </Box>
//                       </TableCell>
//                       <TableCell>{vehicle.model}</TableCell>
//                       <TableCell>
//                         <Box>
//                           <Typography variant="caption" display="block">
//                             {vehicle.bankName}
//                           </Typography>
//                           <Typography variant="caption" display="block" fontFamily="monospace">
//                             A/C: {vehicle.accountNo}
//                           </Typography>
//                           <Typography variant="caption" display="block">
//                             Holder: {vehicle.accountHolderName}
//                           </Typography>
//                         </Box>
//                       </TableCell>
//                       <TableCell>
//                         <Chip
//                           label={vehicle.isActive ? 'Active' : 'Inactive'}
//                           color={vehicle.isActive ? 'success' : 'error'}
//                           size="small"
//                           variant="outlined"
//                         />
//                       </TableCell>
//                     </StyledTableRow>
//                   ))
//                 ) : (
//                   <TableRow>
//                     <TableCell colSpan={6} align="center">
//                       <Typography color="text.secondary">
//                         No market vehicles found
//                       </Typography>
//                     </TableCell>
//                   </TableRow>
//                 )}
//               </TableBody>
//             </Table>
//           </TableContainer>
//         </TabPanel>
//         {/* Tab 3: Trips */}
//         <TabPanel value="3" sx={{ p: 0, pt: 3 }}>
//           <TableContainer component={Paper} elevation={0} variant="outlined">
//             <Table sx={{ minWidth: 900 }} aria-label="trips table">
//               <TableHead>
//                 <TableRow>
//                   <StyledTableCell>Vehicle No</StyledTableCell>
//                   <StyledTableCell>Route</StyledTableCell>
//                   <StyledTableCell>Driver</StyledTableCell>
//                   <StyledTableCell>Trip Details</StyledTableCell>
//                   <StyledTableCell>Financials</StyledTableCell>
//                   <StyledTableCell>Status</StyledTableCell>
//                   <StyledTableCell>Trip Date</StyledTableCell>
//                 </TableRow>
//               </TableHead>
//               <TableBody>
//                 {data.trips.length > 0 ? (
//                   data.trips.map((trip) => (
//                     <StyledTableRow key={trip._id}>
//                       <TableCell>
//                         <Typography variant="body2" fontWeight={500}>
//                           {trip.vehicleNo}
//                         </Typography>
//                       </TableCell>
//                       <TableCell>
//                         <Box>
//                           <Typography variant="body2">
//                             {trip.fromLocation} → {trip.toLocation}
//                           </Typography>
//                           <Typography variant="caption" color="text.secondary">
//                             LHS No: {trip.lhsNo}
//                           </Typography>
//                         </Box>
//                       </TableCell>
//                       <TableCell>
//                         <Box>
//                           <Typography variant="body2">{trip.driverName}</Typography>
//                           <Typography variant="caption" color="text.secondary">
//                             {trip.driverMobile}
//                           </Typography>
//                         </Box>
//                       </TableCell>
//                       <TableCell>
//                         <Box>
//                           <Typography variant="caption" display="block">
//                             Type: {trip.tripType}
//                           </Typography>
//                           <Typography variant="caption" display="block">
//                             Vehicle: {trip.vehicleType}
//                           </Typography>
//                           <Typography variant="caption" display="block">
//                             Distance: {trip.distanceKm || 0} km
//                           </Typography>
//                         </Box>
//                       </TableCell>
//                       <TableCell>
//                         <Box>
//                           <Typography variant="caption" display="block">
//                             Diesel: {trip.dieselLtr}L × {formatCurrency(trip.dieselRate)}
//                           </Typography>
//                           <Typography variant="caption" display="block" fontWeight={500}>
//                             Diesel Total: {formatCurrency(trip.totalDieselAmount)}
//                           </Typography>
//                           <Typography variant="caption" display="block">
//                             Advance: {formatCurrency(trip.advanceAmount)}
//                           </Typography>
//                         </Box>
//                       </TableCell>
//                       <TableCell>
//                         <Chip
//                           label={trip.tripStatus}
//                           color={trip.tripStatus === 'active' ? 'success' : 'warning'}
//                           size="small"
//                         />
//                       </TableCell>
//                       <TableCell>
//                         <Typography variant="body2">
//                           {formatDate(trip.tripDate)}
//                         </Typography>
//                       </TableCell>
//                     </StyledTableRow>
//                   ))
//                 ) : (
//                   <TableRow>
//                     <TableCell colSpan={7} align="center">
//                       <Typography color="text.secondary">
//                         No trips found
//                       </Typography>
//                     </TableCell>
//                   </TableRow>
//                 )}
//               </TableBody>
//             </Table>
//           </TableContainer>
//         </TabPanel>
//         {/* Tab 4: Market Trips */}
//         <TabPanel value="4" sx={{ p: 0, pt: 3 }}>
//           <TableContainer component={Paper} elevation={0} variant="outlined">
//             <Table sx={{ minWidth: 900 }} aria-label="market trips table">
//               <TableHead>
//                 <TableRow>
//                   <StyledTableCell>Vehicle No</StyledTableCell>
//                   <StyledTableCell>Route</StyledTableCell>
//                   <StyledTableCell>Driver</StyledTableCell>
//                   <StyledTableCell>Trip Details</StyledTableCell>
//                   <StyledTableCell>Financials</StyledTableCell>
//                   <StyledTableCell>Bank Details</StyledTableCell>
//                   <StyledTableCell>Status</StyledTableCell>
//                 </TableRow>
//               </TableHead>
//               <TableBody>
//                 {data.marketTrips.length > 0 ? (
//                   data.marketTrips.map((trip) => (
//                     <StyledTableRow key={trip._id}>
//                       <TableCell>
//                         <Typography variant="body2" fontWeight={500}>
//                           {trip.vehicleNo}
//                         </Typography>
//                       </TableCell>
//                       <TableCell>
//                         <Box>
//                           <Typography variant="body2">
//                             {trip.fromLocation} → {trip.toLocation}
//                           </Typography>
//                           <Typography variant="caption" color="text.secondary">
//                             LHS No: {trip.lhsNo}
//                           </Typography>
//                         </Box>
//                       </TableCell>
//                       <TableCell>
//                         <Box>
//                           <Typography variant="body2">{trip.driverName}</Typography>
//                           <Typography variant="caption" color="text.secondary">
//                             {trip.driverMobile}
//                           </Typography>
//                         </Box>
//                       </TableCell>
//                       <TableCell>
//                         <Box>
//                           <Typography variant="caption" display="block">
//                             Type: {trip.tripType}
//                           </Typography>
//                           <Typography variant="caption" display="block">
//                             Vehicle: {trip.vehicleType}
//                           </Typography>
//                           <Typography variant="caption" display="block">
//                             Distance: {trip.distanceKm || 0} km
//                           </Typography>
//                         </Box>
//                       </TableCell>
//                       <TableCell>
//                         <Box>
//                           <Typography variant="caption" display="block">
//                             Diesel: {trip.dieselLtr}L × {formatCurrency(trip.dieselRate)}
//                           </Typography>
//                           <Typography variant="caption" display="block" fontWeight={500}>
//                             Diesel Total: {formatCurrency(trip.totalDieselAmount)}
//                           </Typography>
//                           <Typography variant="caption" display="block">
//                             Advance: {formatCurrency(trip.advanceAmount)}
//                           </Typography>
//                         </Box>
//                       </TableCell>
//                       <TableCell>
//                         <Box>
//                           <Typography variant="caption" display="block">
//                             {trip.bankName}
//                           </Typography>
//                           <Typography variant="caption" display="block" fontFamily="monospace">
//                             A/C: {trip.accountNo}
//                           </Typography>
//                           <Typography variant="caption" display="block">
//                             Holder: {trip.accountHolderName}
//                           </Typography>
//                         </Box>
//                       </TableCell>
//                       <TableCell>
//                         <Chip
//                           label={trip.tripStatus}
//                           color={trip.tripStatus === 'active' ? 'success' : 'warning'}
//                           size="small"
//                         />
//                       </TableCell>
//                     </StyledTableRow>
//                   ))
//                 ) : (
//                   <TableRow>
//                     <TableCell colSpan={7} align="center">
//                       <Typography color="text.secondary">
//                         No market trips found
//                       </Typography>
//                     </TableCell>
//                   </TableRow>
//                 )}
//               </TableBody>
//             </Table>
//           </TableContainer>
//         </TabPanel>
//         {/* Tab 5: Documents Status with Days Count */}
//         <TabPanel value="5" sx={{ p: 0, pt: 3 }}>
//           <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
//             <Box display="flex" gap={1} flexWrap="wrap">
//               <Button
//                 variant={filterStatus === 'all' ? 'contained' : 'outlined'}
//                 size="small"
//                 onClick={() => setFilterStatus('all')}
//               >
//                 All ({allDocuments.length})
//               </Button>
//               <Button
//                 variant={filterStatus === 'expired' ? 'contained' : 'outlined'}
//                 size="small"
//                 color="error"
//                 onClick={() => setFilterStatus('expired')}
//                 startIcon={<ErrorIcon />}
//               >
//                 Overdue ({expiredCount})
//               </Button>
//               <Button
//                 variant={filterStatus === 'expiringSoon' ? 'contained' : 'outlined'}
//                 size="small"
//                 color="warning"
//                 onClick={() => setFilterStatus('expiringSoon')}
//                 startIcon={<WarningIcon />}
//               >
//                 Urgent ({criticalCount + warningCount + expiringSoonCount})
//               </Button>
//             </Box>
//             <Box display="flex" gap={2} alignItems="center">
//               <Box display="flex" gap={1}>
//                 <DaysChip days={-5} size="small" label="Overdue" />
//                 <DaysChip days={15} size="small" label="Warning" />
//                 <DaysChip days={15} size="small" label="Soon" />
//                 <DaysChip days={45} size="small" label="Valid" />
//               </Box>
//               <Tooltip title="Print Report">
//                 <Button
//                   variant="contained"
//                   startIcon={<PrintIcon />}
//                   onClick={handlePrintReport}
//                   disabled={filteredDocuments.length === 0}
//                   size="small"
//                 >
//                   Print Report
//                 </Button>
//               </Tooltip>
//             </Box>
//           </Box>
//           <TableContainer component={Paper} elevation={0} variant="outlined">
//             <Table sx={{ minWidth: 1000 }} aria-label="documents status table">
//               <TableHead>
//                 <TableRow>
//                   <StyledTableCell>Vehicle No</StyledTableCell>
//                   <StyledTableCell>Owner Name</StyledTableCell>
//                   <StyledTableCell>Document Name</StyledTableCell>
//                   <StyledTableCell>Document</StyledTableCell>
//                   <StyledTableCell>Expiry Date</StyledTableCell>
//                   <StyledTableCell>Days Left/Overdue</StyledTableCell>
//                   <StyledTableCell>Status</StyledTableCell>
//                 </TableRow>
//               </TableHead>
//               <TableBody>
//                 {filteredDocuments.length > 0 ? (
//                   filteredDocuments.map((doc, index) => (
//                     <StyledTableRow key={`${doc.vehicleId}-${index}`}>
//                       <TableCell>
//                         <Typography variant="body2" fontWeight={500}>
//                           {doc.vehicleNo}
//                         </Typography>
//                       </TableCell>
//                       <TableCell>{doc.ownerName}</TableCell>
//                       <TableCell>{doc.documentName}</TableCell>
//                       <TableCell>
//                         {doc.documentUrl ? (
//                           <Link
//                             href={doc.documentUrl}
//                             target="_blank"
//                             rel="noopener noreferrer"
//                             onClick={(e) => {
//                               e.stopPropagation();
//                               window.open(doc.documentUrl, '_blank', 'noopener,noreferrer');
//                             }}
//                             sx={{
//                               display: 'inline-flex',
//                               alignItems: 'center',
//                               gap: 0.5,
//                               color: 'primary.main',
//                               textDecoration: 'none',
//                               cursor: 'pointer',
//                               '&:hover': {
//                                 textDecoration: 'underline',
//                                 color: 'primary.dark'
//                               }
//                             }}
//                           >
//                             <PictureAsPdfIcon fontSize="small" />
//                             View
//                           </Link>
//                         ) : (
//                           <Typography variant="caption" color="text.secondary">
//                             No Doc
//                           </Typography>
//                         )}
//                       </TableCell>
//                       <TableCell>
//                         <Typography
//                           variant="body2"
//                           color={doc.daysUntilExpiry < 0 ? 'error' :
//                             doc.daysUntilExpiry <= 5 ? 'warning.main' :
//                               doc.daysUntilExpiry <= 30 ? 'info.main' :
//                                 'success.main'}
//                           fontWeight={500}
//                         >
//                           {formatDate(doc.expiryDate)}
//                         </Typography>
//                       </TableCell>
//                       <TableCell>
//                         <DaysChip
//                           days={doc.daysUntilExpiry}
//                           label={doc.daysText}
//                           size="small"
//                         />
//                       </TableCell>
//                       <TableCell>
//                         <Chip
//                           label={doc.status}
//                           color={doc.statusColor}
//                           size="small"
//                           icon={doc.statusIcon ? <doc.statusIcon /> : undefined}
//                         />
//                       </TableCell>
//                     </StyledTableRow>
//                   ))
//                 ) : (
//                   <TableRow>
//                     <TableCell colSpan={7} align="center">
//                       <Box py={3}>
//                         <Typography color="success.main" variant="h6" gutterBottom>
//                           ✅ No Documents Found
//                         </Typography>
//                         <Typography color="text.secondary">
//                           {filterStatus === 'expired' ? 'No expired documents' :
//                             filterStatus === 'expiringSoon' ? 'No documents expiring soon' :
//                               'No documents available'}
//                         </Typography>
//                       </Box>
//                     </TableCell>
//                   </TableRow>
//                 )}
//               </TableBody>
//             </Table>
//           </TableContainer>
//         </TabPanel>
//       </TabContext>
//     </Box>
//   )
// }
// export default TabBasedTable
