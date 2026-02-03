import LocationInfo from '@views/apps/location/info/Info'
// Data Imports
import { getEcommerceData } from '@/app/server/actions'

const LocationInfoPage = async () => {
    // Vars
    const data = await getEcommerceData()
    return <LocationInfo customerData={data?.customerData} />
}
export default LocationInfoPage
