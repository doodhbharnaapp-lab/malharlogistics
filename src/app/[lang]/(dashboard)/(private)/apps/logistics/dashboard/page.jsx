//MUI Imports
import Grid from '@mui/material/Grid'
//Component Imports
import LogisticsStatisticsCard from '@views/apps/logistics/dashboard/LogisticsStatisticsCard'
import LogisticsVehicleOverview from '@views/apps/logistics/dashboard/LogisticsVehicleOverview'
import LogisticsShipmentStatistics from '@views/apps/logistics/dashboard/LogisticsShipmentStatistics'
import LogisticsDeliveryPerformance from '@views/apps/logistics/dashboard/LogisticsDeliveryPerformance'
import LogisticsDeliveryExceptions from '@views/apps/logistics/dashboard/LogisticsDeliveryExceptions'
import LogisticsOrdersByCountries from '@/views/apps/logistics/dashboard/LogisticsOrdersByCountries'
import LogisticsOverviewTable from '@views/apps/logistics/dashboard/LogisticsOverviewTable'
//Data Imports
import { getStatisticsData } from '@/app/server/actions'
import Sales from '@/views/dashboards/ecommerce/Sales'
import MarketTrip from '@/views/apps/logistics/dashboard/MarketTrip'
import StatsCard from '@/views/apps/logistics/dashboard/Stats'
import TabBasedTable from '@/views/apps/logistics/dashboard/TabBasedTable'
import { CardHeader } from '@mui/material'
const LogisticsDashboard = async () => {
  // Vars
  const data = await getStatisticsData()
  // const vehicleData = await getLogisticsData()
  return (
    <>
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
        <Grid item xs={12} md={12}>
          <TabBasedTable />
        </Grid>
      </Grid>
    </>
  )
}
export default LogisticsDashboard
{/* <Grid size={{ xs: 12, md: 6 }}>
        <LogisticsVehicleOverview />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <LogisticsShipmentStatistics />
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
        <LogisticsDeliveryPerformance />
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
        <LogisticsDeliveryExceptions />
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
        <LogisticsOrdersByCountries />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <LogisticsOverviewTable vehicleData={vehicleData?.vehicles} />
      </Grid> */}
