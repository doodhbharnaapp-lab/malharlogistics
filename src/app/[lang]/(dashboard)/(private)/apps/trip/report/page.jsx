import Trip from '@views/apps/trip/TripReport'
// Data Imports
import { getEcommerceData } from '@/app/server/actions'

const TripReport = async () => {
    // Vars
    const data = await getEcommerceData()
    return <Trip />
}
export default TripReport
