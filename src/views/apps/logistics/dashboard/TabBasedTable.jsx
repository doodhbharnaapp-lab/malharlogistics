'use client'
// MUI Imports
import { useState, useEffect } from 'react'
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
import { styled } from '@mui/material/styles'
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
  const [data, setData] = useState({
    ownVehicles: [],
    marketVehicles: [],
    trips: [],
    marketTrips: []
  })
  const API_BASE = '/api/apps'
  const TRIPS_API = `${API_BASE}/trip`  // ✅ CORRECTED: 'trips' not 'trip'
  const VEHICLES_API = `${API_BASE}/vehicles`
  const MARKETVEHICLES_API = `${API_BASE}/vehicles/market`
  const MARKETTRIPS_API = `${API_BASE}/trip/market`  // ✅ CORRECTED: 'trips' not 'trip'

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
    const expiredDocs = documents.filter(doc => doc.isExpired)
    if (expiredDocs.length === 0) return { label: 'All Valid', color: 'success' }
    if (expiredDocs.length === documents.length) return { label: 'All Expired', color: 'error' }
    return { label: 'Some Expired', color: 'warning' }
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
            <Tab label="Own Vehicles" value="1" />
            <Tab label="Market Vehicles" value="2" />
            <Tab label="Trips" value="3" />
            <Tab label="Market Trips" value="4" />
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
                  <StyledTableCell>Documents</StyledTableCell>
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
                      <TableCell>
                        <Chip
                          {...getDocumentStatus(vehicle.documents)}
                          size="small"
                        />
                      </TableCell>
                    </StyledTableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
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
      </TabContext>
    </Box>
  )
}
export default TabBasedTable
