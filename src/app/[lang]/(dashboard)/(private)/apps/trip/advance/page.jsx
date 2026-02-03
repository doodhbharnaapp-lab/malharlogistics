import Advance from '@views/apps/trip/advance/Advance'
// Data Imports
import { getEcommerceData } from '@/app/server/actions'

const AdvanceInfoPage = async () => {
    // Vars
    const data = await getEcommerceData()
    return <Advance customerData={data?.customerData} />
}
export default AdvanceInfoPage
