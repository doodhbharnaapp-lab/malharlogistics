/**
 * ! The server actions below are used to fetch the static data from the fake-db. If you're using an ORM
 * ! (Object-Relational Mapping) or a database, you can swap the code below with your own database queries.
 */
'use server'
// Data Imports
import { db as eCommerceData } from '@/fake-db/apps/ecommerce'
import { db as academyData } from '@/fake-db/apps/academy'
import { db as vehicleData } from '@/fake-db/apps/logistics'
import { db as invoiceData } from '@/fake-db/apps/invoice'
import { db as userData } from '@/fake-db/apps/userList'
import { db as permissionData } from '@/fake-db/apps/permissions'
import { db as profileData } from '@/fake-db/pages/userProfile'
import { db as faqData } from '@/fake-db/pages/faq'
import { db as pricingData } from '@/fake-db/pages/pricing'
import { db as statisticsData } from '@/fake-db/pages/widgetExamples'
export const getEcommerceData = async () => {
  return eCommerceData
}
export const getAcademyData = async () => {
  return academyData
}
export const getLogisticsData = async () => {
  return vehicleData
}
export const getInvoiceData = async () => {
  return invoiceData
}
export const getUserData = async () => {
  return userData
}
export const getPermissionsData = async () => {
  return permissionData
}
export const getProfileData = async () => {
  return profileData
}
export const getFaqData = async () => {
  return faqData
}
export const getPricingData = async () => {
  return pricingData
}
// actions.js
import { getActiveVehicleCount } from '@/app/api/apps/vehicles/route'
import { getMarketActiveVehicleCount } from '@/app/api/apps/vehicles/market/route'

export const getStatisticsData = async () => {
  const totalVehicles = await getActiveVehicleCount()
  const totalMarketVehicles = await getMarketActiveVehicleCount()

  console.log('Total vehicles:', totalVehicles) // <-- check terminal
  return {
    statsHorizontalWithBorder: [
      {
        title: 'Total Vehicles',
        stats: totalVehicles,
        trendNumber: 5,
        avatarIcon: 'fas fa-truck',
        color: 'primary'
      },
      {
        title: 'Total Market Vehicles',
        stats: totalMarketVehicles,
        trendNumber: 5,
        avatarIcon: 'fas fa-truck',
        color: 'error'
      }
    ]
  }
}
