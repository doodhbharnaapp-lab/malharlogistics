import Trip from '@views/apps/trip/market/Trip'
// Data Imports
import { getEcommerceData } from '@/app/server/actions'

const TripInfoPage = async () => {
    // Vars
    const data = await getEcommerceData()
    return <Trip customerData={data?.customerData} />
}
export default TripInfoPage
