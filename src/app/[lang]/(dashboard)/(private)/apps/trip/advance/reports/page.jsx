import Advance from '@views/apps/trip/advance/AdvanceReport'
// Data Imports
import { getEcommerceData } from '@/app/server/actions'

const AdvanceReport = async () => {
    // Vars
    const data = await getEcommerceData()
    return <Advance customerData={data?.customerData} />
}
export default AdvanceReport
