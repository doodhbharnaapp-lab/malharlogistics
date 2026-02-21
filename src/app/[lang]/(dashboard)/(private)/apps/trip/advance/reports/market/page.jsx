// Data Imports
import { getEcommerceData } from '@/app/server/actions'
import MarketAdvanceReport from '@/views/apps/trip/advance/market/MarketAdvanceReport'

const MarketAdvanceReportPage = async () => {
    // Vars
    const data = await getEcommerceData()
    return <MarketAdvanceReport customerData={data?.customerData} />
}
export default MarketAdvanceReportPage
