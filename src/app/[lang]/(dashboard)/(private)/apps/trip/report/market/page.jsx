import MarketTripReport from '@views/apps/trip/MarketTripReport'
// Data Imports
import { getEcommerceData } from '@/app/server/actions'

const MarketTripReportPage = async () => {
    // Vars
    const data = await getEcommerceData()
    return <MarketTripReport customerData={data?.customerData} />
}
export default MarketTripReportPage
