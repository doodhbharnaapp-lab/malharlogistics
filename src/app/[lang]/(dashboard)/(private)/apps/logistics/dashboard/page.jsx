// //MUI Imports
// import Grid from '@mui/material/Grid'
// //Component Imports
// import LogisticsStatisticsCard from '@views/apps/logistics/dashboard/LogisticsStatisticsCard'
// //Data Imports
// import { getStatisticsData } from '@/app/server/actions'
// import Sales from '@/views/dashboards/ecommerce/Sales'
// import MarketTrip from '@/views/apps/logistics/dashboard/MarketTrip'
// import StatsCard from '@/views/apps/logistics/dashboard/Stats'
// import TabBasedTable from '@/views/apps/logistics/dashboard/TabBasedTable'
// import TabBasedVehicleModels from '@/views/apps/logistics/dashboard/OwnTabBasedVehicleModels'
// import MarketTabBasedVehicleModels from '@/views/apps/logistics/dashboard/MArketTabBasedVehicleModels'
// const LogisticsDashboard = async () => {
//   // Vars
//   const data = await getStatisticsData()
//   // const vehicleData = await getLogisticsData()
//   return (
//     <>
//       <Grid container spacing={6}>
//         <Grid item xs={12} md={6}>
//           <LogisticsStatisticsCard data={data?.statsHorizontalWithBorder} />
//         </Grid>
//         <Grid item xs={12} md={6}>
//           <Sales />
//         </Grid>
//         <Grid item xs={12} md={6}>
//           <MarketTrip />
//         </Grid>
//         <Grid item xs={12} md={6}>
//           <StatsCard />
//         </Grid>
//         <Grid item xs={12} md={6}>
//           < TabBasedVehicleModels />
//         </Grid>
//         < MarketTabBasedVehicleModels />
//         <Grid item xs={12} md={12}>
//           <TabBasedTable />
//         </Grid>
//       </Grid>
//     </>
//   )
// }
// export default LogisticsDashboard
'use client'
// MUI Imports
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import Paper from '@mui/material/Paper'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
// NextAuth Import
import { useSession } from 'next-auth/react'
// Component Imports
import LogisticsStatisticsCard from '@views/apps/logistics/dashboard/LogisticsStatisticsCard'
// Data Imports
import { getStatisticsData } from '@/app/server/actions'
import Sales from '@/views/dashboards/ecommerce/Sales'
import MarketTrip from '@/views/apps/logistics/dashboard/MarketTrip'
import StatsCard from '@/views/apps/logistics/dashboard/Stats'
import TabBasedTable from '@/views/apps/logistics/dashboard/TabBasedTable'
import TabBasedVehicleModels from '@/views/apps/logistics/dashboard/OwnTabBasedVehicleModels'
import MarketTabBasedVehicleModels from '@/views/apps/logistics/dashboard/MArketTabBasedVehicleModels'
import { useState, useEffect } from 'react'
const LogisticsDashboard = () => {
  // Hooks
  const { data: session, status } = useSession()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  // Get user role from session
  const userRole = session?.user?.role
  // Fetch data based on role
  useEffect(() => {
    const fetchData = async () => {
      if (userRole === 'admin') {
        const result = await getStatisticsData()
        setData(result)
      }
      setLoading(false)
    }
    if (status !== 'loading') {
      fetchData()
    }
  }, [userRole, status])
  // Show loading state
  if (status === 'loading' || loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Typography>Loading dashboard...</Typography>
      </Box>
    )
  }
  // Admin View - Full dashboard
  if (userRole === 'admin') {
    return (
      <Grid container spacing={6}>
        <Grid item xs={12} md={6}>
          <LogisticsStatisticsCard data={data?.statsHorizontalWithBorder} />
        </Grid>
        <Grid item xs={12} md={6}>
          <Sales />
        </Grid>
        <Grid item xs={12} md={6}>
          <MarketTrip />
        </Grid>
        <Grid item xs={12} md={6}>
          <StatsCard />
        </Grid>
        <Grid item xs={12} md={6}>
          <TabBasedVehicleModels />
        </Grid>
        <MarketTabBasedVehicleModels />
        <Grid item xs={12} md={12}>
          <TabBasedTable />
        </Grid>
      </Grid>
    )
  }
  // Account1 View
  if (userRole === 'account1') {
    return (
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <Paper sx={{ p: 5, mb: 4, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
            <Typography variant="h4" gutterBottom>
              Welcome, Account Manager!
            </Typography>
            <Typography variant="body1">
              You have access to trips and reports. Use the navigation menu to proceed.
            </Typography>
          </Paper>
        </Grid>
        {/* Optional: Add some account1-specific widgets */}
        {/* <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Recent Trips</Typography>
              <Typography variant="body2">You have 5 active trips</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Pending Reports</Typography>
              <Typography variant="body2">3 reports need attention</Typography>
            </CardContent>
          </Card>
        </Grid> */}
      </Grid>
    )
  }
  // Other Users View
  return (
    <Box sx={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '60vh'
    }}>
      <Paper sx={{ p: 8, textAlign: 'center', maxWidth: 600 }}>
        <Typography variant="h3" gutterBottom color="primary">
          Welcome to Malhar Logistics
        </Typography>
        <Typography variant="h5" gutterBottom sx={{ mb: 4 }}>
          Hello, {session?.user?.name || 'User'}!
        </Typography>
        {/* <Typography variant="body1" paragraph>
          You have access to trips and market trips. Use the navigation menu to proceed.
        </Typography>
        <Box sx={{ mt: 4, p: 3, bgcolor: 'grey.100', borderRadius: 2 }}>
          <Typography variant="subtitle1" color="text.secondary">
            Your Access Level: Standard User
          </Typography>
        </Box> */}
      </Paper>
    </Box>
  )
}
export default LogisticsDashboard
