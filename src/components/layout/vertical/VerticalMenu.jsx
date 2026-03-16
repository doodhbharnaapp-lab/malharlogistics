// // // // Next Imports
// // // import { useParams } from 'next/navigation'
// // // // MUI Imports
// // // import { useTheme } from '@mui/material/styles'
// // // import Chip from '@mui/material/Chip'
// // // // Third-party Imports
// // // import PerfectScrollbar from 'react-perfect-scrollbar'
// // // // Component Imports
// // // import { Menu, SubMenu, MenuItem, MenuSection } from '@menu/vertical-menu'
// // // // import { GenerateVerticalMenu } from '@components/GenerateMenu'
// // // // Hook Imports
// // // import useVerticalNav from '@menu/hooks/useVerticalNav'
// // // // Styled Component Imports
// // // import StyledVerticalNavExpandIcon from '@menu/styles/vertical/StyledVerticalNavExpandIcon'
// // // // Style Imports
// // // import menuItemStyles from '@core/styles/vertical/menuItemStyles'
// // // import menuSectionStyles from '@core/styles/vertical/menuSectionStyles'
// // // const RenderExpandIcon = ({ open, transitionDuration }) => (
// // //   <StyledVerticalNavExpandIcon open={open} transitionDuration={transitionDuration}>
// // //     <i className='ri-arrow-right-s-line' />
// // //   </StyledVerticalNavExpandIcon>
// // // )
// // // const VerticalMenu = ({ dictionary, scrollMenu }) => {
// // //   // Hooks
// // //   const theme = useTheme()
// // //   const verticalNavOptions = useVerticalNav()
// // //   const params = useParams()
// // //   // Vars
// // //   const { isBreakpointReached, transitionDuration } = verticalNavOptions
// // //   const { lang: locale } = params
// // //   const ScrollWrapper = isBreakpointReached ? 'div' : PerfectScrollbar
// // //   return (
// // //     // eslint-disable-next-line lines-around-comment
// // //     /* Custom scrollbar instead of browser scroll, remove if you want browser scroll only */
// // //     <ScrollWrapper
// // //       {...(isBreakpointReached
// // //         ? {
// // //           className: 'bs-full overflow-y-auto overflow-x-hidden',
// // //           onScroll: container => scrollMenu(container, false)
// // //         }
// // //         : {
// // //           options: { wheelPropagation: false, suppressScrollX: true },
// // //           onScrollY: container => scrollMenu(container, true)
// // //         })}
// // //     >
// // //       {/* Vertical Menu */}
// // //       <Menu
// // //         popoutMenuOffset={{ mainAxis: 17 }}
// // //         menuItemStyles={menuItemStyles(verticalNavOptions, theme)}
// // //         renderExpandIcon={({ open }) => <RenderExpandIcon open={open} transitionDuration={transitionDuration} />}
// // //         renderExpandedMenuItemIcon={{ icon: <i className='ri-circle-fill' /> }}
// // //         menuSectionStyles={menuSectionStyles(verticalNavOptions, theme)}
// // //       >
// // //         <MenuItem href={`/${locale}/dashboards/logistics`} icon={<i className='ri-home-smile-line' />}
// // //         >{dictionary['navigation'].dashboard}</MenuItem>
// // //         {/* </MenuItem> */}
// // //         <SubMenu label={"Staff Management"} icon={<i className='ri-group-line' />}>
// // //           <MenuItem href={`/${locale}/apps/user/list`}>{'Users'}</MenuItem>
// // //           <MenuItem href={`/${locale}/apps/roles`}>{dictionary['navigation'].roles}</MenuItem>
// // //         </SubMenu>
// // //         <SubMenu label={"vehicles"} icon={<i className='ri-car-line' />}>
// // //           <MenuItem href={`/${locale}/apps/vehicles/list`}>{dictionary['navigation'].list}</MenuItem>
// // //           <MenuItem href={`/${locale}/apps/vehicles/types`}>{'Types'}</MenuItem>
// // //           <MenuItem href={`/${locale}/apps/vehicles/vehicle-owners/list`}>
// // //             {'Vehhicle Owners'}
// // //           </MenuItem>
// // //           <MenuItem href={`/${locale}/apps/vehicles/market`}>{'Market Vehicles'}</MenuItem>
// // //         </SubMenu>
// // //         <SubMenu label={"Trips"} icon={<i className='ri-file-copy-line' />}>
// // //           <MenuItem href={`/${locale}/apps/trip/`}>{dictionary['navigation'].list}</MenuItem>
// // //           <MenuItem href={`/${locale}/apps/trip/advance/`}>{'Advance'}</MenuItem>
// // //           <MenuItem href={`/${locale}/apps/trip/market`}>{'Market Trips'}</MenuItem>
// // //           <MenuItem href={`/${locale}/apps/trip/advance/market`}>{'Market Advance'}</MenuItem>
// // //         </SubMenu>
// // //         <SubMenu label={"Reports"} icon={<i className='ri-pages-line' />}>
// // //           <MenuItem href={`/${locale}/apps/trip/report`}>{'Trip Report'}</MenuItem>
// // //           <MenuItem href={`/${locale}/apps/trip/advance/reports`}>{'Advance Report'}</MenuItem>
// // //           <MenuItem href={`/${locale}/apps/trip/report/market`}>{'Market Trip Report'}</MenuItem>
// // //           <MenuItem href={`/${locale}/apps/trip/advance/reports/market`}>{'Market Advance Report'}</MenuItem>
// // //         </SubMenu>
// // //         <SubMenu label={"Location"} icon={<i className='ri-map-pin-fill' />}>
// // //           <MenuItem href={`/${locale}/apps/location/`}>{'Location'}</MenuItem>
// // //           <MenuItem href={`/${locale}/apps/location/info`}>{'Location Info'}</MenuItem>
// // //         </SubMenu>
// // //       </Menu>
// // //     </ScrollWrapper>
// // //   )
// // // }
// // // export default VerticalMenu
// // // Next Imports
// // import { useParams } from 'next/navigation'
// // // MUI Imports
// // import { useTheme } from '@mui/material/styles'
// // import Chip from '@mui/material/Chip'
// // // Third-party Imports
// // import PerfectScrollbar from 'react-perfect-scrollbar'
// // // Component Imports
// // import { Menu, SubMenu, MenuItem, MenuSection } from '@menu/vertical-menu'
// // // import { GenerateVerticalMenu } from '@components/GenerateMenu'
// // // Hook Imports
// // import useVerticalNav from '@menu/hooks/useVerticalNav'
// // // Styled Component Imports
// // import StyledVerticalNavExpandIcon from '@menu/styles/vertical/StyledVerticalNavExpandIcon'
// // // Style Imports
// // import menuItemStyles from '@core/styles/vertical/menuItemStyles'
// // import menuSectionStyles from '@core/styles/vertical/menuSectionStyles'
// // // If using Context
// // import { useAuth } from '@/context/AuthContext'
// // const { user } = useAuth()
// // const userRole = user?.role
// // // If using Redux
// // import { useSelector } from 'react-redux'
// // const userRole = useSelector(state => state.auth.user?.role)
// // // If using NextAuth.js
// // import { useSession } from 'next-auth/react'
// // const { data: session } = useSession()
// // const userRole = session?.user?.role
// // // You'll need to import your auth hook/context
// // // import { useAuth } from '@/hooks/useAuth' // Adjust the import path as needed
// // const RenderExpandIcon = ({ open, transitionDuration }) => (
// //   <StyledVerticalNavExpandIcon open={open} transitionDuration={transitionDuration}>
// //     <i className='ri-arrow-right-s-line' />
// //   </StyledVerticalNavExpandIcon>
// // )
// // const VerticalMenu = ({ dictionary, scrollMenu }) => {
// //   // Hooks
// //   const theme = useTheme()
// //   const verticalNavOptions = useVerticalNav()
// //   const params = useParams()
// //   // Get user role from your auth system
// //   // Vars
// //   const { isBreakpointReached, transitionDuration } = verticalNavOptions
// //   const { lang: locale } = params
// //   const ScrollWrapper = isBreakpointReached ? 'div' : PerfectScrollbar
// //   // Helper function to check if menu item should be visible
// //   const canViewMenu = (allowedRoles) => {
// //     if (!allowedRoles || allowedRoles.length === 0) return true
// //     return allowedRoles.includes(userRole)
// //   }
// //   return (
// //     <ScrollWrapper
// //       {...(isBreakpointReached
// //         ? {
// //           className: 'bs-full overflow-y-auto overflow-x-hidden',
// //           onScroll: container => scrollMenu(container, false)
// //         }
// //         : {
// //           options: { wheelPropagation: false, suppressScrollX: true },
// //           onScrollY: container => scrollMenu(container, true)
// //         })}
// //     >
// //       {/* Vertical Menu */}
// //       <Menu
// //         popoutMenuOffset={{ mainAxis: 17 }}
// //         menuItemStyles={menuItemStyles(verticalNavOptions, theme)}
// //         renderExpandIcon={({ open }) => <RenderExpandIcon open={open} transitionDuration={transitionDuration} />}
// //         renderExpandedMenuItemIcon={{ icon: <i className='ri-circle-fill' /> }}
// //         menuSectionStyles={menuSectionStyles(verticalNavOptions, theme)}
// //       >
// //         {/* Dashboard - Visible to all */}
// //         <MenuItem href={`/${locale}/dashboards/logistics`} icon={<i className='ri-home-smile-line' />}>
// //           {dictionary['navigation'].dashboard}
// //         </MenuItem>
// //         {/* Staff Management - Admin only */}
// //         {canViewMenu(['admin']) && (
// //           <SubMenu label="Staff Management" icon={<i className='ri-group-line' />}>
// //             <MenuItem href={`/${locale}/apps/user/list`}>{'Users'}</MenuItem>
// //             <MenuItem href={`/${locale}/apps/roles`}>{dictionary['navigation'].roles}</MenuItem>
// //           </SubMenu>
// //         )}
// //         {/* Vehicles - Admin only */}
// //         {canViewMenu(['admin']) && (
// //           <SubMenu label="vehicles" icon={<i className='ri-car-line' />}>
// //             <MenuItem href={`/${locale}/apps/vehicles/list`}>{dictionary['navigation'].list}</MenuItem>
// //             <MenuItem href={`/${locale}/apps/vehicles/types`}>{'Types'}</MenuItem>
// //             <MenuItem href={`/${locale}/apps/vehicles/vehicle-owners/list`}>
// //               {'Vehicle Owners'}
// //             </MenuItem>
// //             <MenuItem href={`/${locale}/apps/vehicles/market`}>{'Market Vehicles'}</MenuItem>
// //           </SubMenu>
// //         )}
// //         {/* Trips - Visible to admin and account1 */}
// //         {canViewMenu(['admin', 'account1']) && (
// //           <SubMenu label="Trips" icon={<i className='ri-file-copy-line' />}>
// //             <MenuItem href={`/${locale}/apps/trip/`}>{dictionary['navigation'].list}</MenuItem>
// //             {/* Advance - Visible to admin and account1 */}
// //             {canViewMenu(['admin', 'account1']) && (
// //               <MenuItem href={`/${locale}/apps/trip/advance/`}>{'Advance'}</MenuItem>
// //             )}
// //             {/* Market Trips - Visible to admin, account1, and other */}
// //             {canViewMenu(['admin', 'account1', 'other']) && (
// //               <MenuItem href={`/${locale}/apps/trip/market`}>{'Market Trips'}</MenuItem>
// //             )}
// //             {/* Market Advance - Visible to admin and account1 */}
// //             {canViewMenu(['admin', 'account1']) && (
// //               <MenuItem href={`/${locale}/apps/trip/advance/market`}>{'Market Advance'}</MenuItem>
// //             )}
// //           </SubMenu>
// //         )}
// //         {/* Reports - Visible to admin and account1 */}
// //         {canViewMenu(['admin', 'account1']) && (
// //           <SubMenu label="Reports" icon={<i className='ri-pages-line' />}>
// //             <MenuItem href={`/${locale}/apps/trip/report`}>{'Trip Report'}</MenuItem>
// //             <MenuItem href={`/${locale}/apps/trip/advance/reports`}>{'Advance Report'}</MenuItem>
// //             <MenuItem href={`/${locale}/apps/trip/report/market`}>{'Market Trip Report'}</MenuItem>
// //             <MenuItem href={`/${locale}/apps/trip/advance/reports/market`}>{'Market Advance Report'}</MenuItem>
// //           </SubMenu>
// //         )}
// //         {/* Location - Admin only */}
// //         {canViewMenu(['admin']) && (
// //           <SubMenu label="Location" icon={<i className='ri-map-pin-fill' />}>
// //             <MenuItem href={`/${locale}/apps/location/`}>{'Location'}</MenuItem>
// //             <MenuItem href={`/${locale}/apps/location/info`}>{'Location Info'}</MenuItem>
// //           </SubMenu>
// //         )}
// //       </Menu>
// //     </ScrollWrapper>
// //   )
// // }
// // export default VerticalMenu
// // {/* <MenuSection label={'Fleet Management'}>
// //         </MenuSection> */}
// import { useParams } from 'next/navigation'
// // MUI Imports
// import { useTheme } from '@mui/material/styles'
// // Third-party Imports
// import PerfectScrollbar from 'react-perfect-scrollbar'
// // Component Imports
// import { Menu, SubMenu, MenuItem } from '@menu/vertical-menu'
// // Hook Imports
// import useVerticalNav from '@menu/hooks/useVerticalNav'
// // NextAuth Import
// import { useSession } from 'next-auth/react'
// // Styled Component Imports
// import StyledVerticalNavExpandIcon from '@menu/styles/vertical/StyledVerticalNavExpandIcon'
// // Style Imports
// import menuItemStyles from '@core/styles/vertical/menuItemStyles'
// import menuSectionStyles from '@core/styles/vertical/menuSectionStyles'
// const RenderExpandIcon = ({ open, transitionDuration }) => (
//   <StyledVerticalNavExpandIcon open={open} transitionDuration={transitionDuration}>
//     <i className='ri-arrow-right-s-line' />
//   </StyledVerticalNavExpandIcon>
// )
// const VerticalMenu = ({ dictionary, scrollMenu }) => {
//   // Hooks
//   const theme = useTheme()
//   const verticalNavOptions = useVerticalNav()
//   const params = useParams()
//   const { data: session, status } = useSession()
//   // Get user role from session
//   const userRole = session?.user?.role || null
//   // Vars
//   const { isBreakpointReached, transitionDuration } = verticalNavOptions
//   const { lang: locale } = params
//   const ScrollWrapper = isBreakpointReached ? 'div' : PerfectScrollbar
//   // Show loading state if session is loading
//   if (status === 'loading') {
//     return <div>Loading menu...</div> // Or your loading component
//   }
//   return (
//     <ScrollWrapper
//       {...(isBreakpointReached
//         ? {
//           className: 'bs-full overflow-y-auto overflow-x-hidden',
//           onScroll: container => scrollMenu(container, false)
//         }
//         : {
//           options: { wheelPropagation: false, suppressScrollX: true },
//           onScrollY: container => scrollMenu(container, true)
//         })}
//     >
//       <Menu
//         popoutMenuOffset={{ mainAxis: 17 }}
//         menuItemStyles={menuItemStyles(verticalNavOptions, theme)}
//         renderExpandIcon={({ open }) => <RenderExpandIcon open={open} transitionDuration={transitionDuration} />}
//         renderExpandedMenuItemIcon={{ icon: <i className='ri-circle-fill' /> }}
//         menuSectionStyles={menuSectionStyles(verticalNavOptions, theme)}
//       >
//         {/* Dashboard - Visible to all authenticated users */}
//         {userRole === 'admin' && (
//           <MenuItem href={`/${locale}/dashboards/logistics`} icon={<i className='ri-home-smile-line' />}>
//             {dictionary['navigation'].dashboard}
//           </MenuItem>
//         )}
//         {/* Staff Management - Admin only */}
//         {userRole === 'admin' && (
//           <SubMenu label="Staff Management" icon={<i className='ri-group-line' />}>
//             <MenuItem href={`/${locale}/apps/user/list`}>{'Users'}</MenuItem>
//             <MenuItem href={`/${locale}/apps/roles`}>{dictionary['navigation'].roles}</MenuItem>
//           </SubMenu>
//         )}
//         {/* Vehicles - Admin only */}
//         {userRole === 'admin' && (
//           <SubMenu label="vehicles" icon={<i className='ri-car-line' />}>
//             <MenuItem href={`/${locale}/apps/vehicles/list`}>{dictionary['navigation'].list}</MenuItem>
//             <MenuItem href={`/${locale}/apps/vehicles/types`}>{'Types'}</MenuItem>
//             <MenuItem href={`/${locale}/apps/vehicles/vehicle-owners/list`}>
//               {'Vehicle Owners'}
//             </MenuItem>
//             <MenuItem href={`/${locale}/apps/vehicles/market`}>{'Market Vehicles'}</MenuItem>
//           </SubMenu>
//         )}
//         {/* Trips - Visible based on role */}
//         {session && (userRole === 'admin' || userRole === 'account1' || userRole === 'other') && (
//           <SubMenu label="Trips" icon={<i className='ri-file-copy-line' />}>
//             {/* Basic Trips - Admin and Account1 only */}
//             {(userRole === 'admin' || userRole === 'account1') && (
//               <MenuItem href={`/${locale}/apps/trip/`}>{dictionary['navigation'].list}</MenuItem>
//             )}
//             {/* Advance - Admin and Account1 only */}
//             {(userRole === 'admin' || userRole === 'account1') && (
//               <MenuItem href={`/${locale}/apps/trip/advance/`}>{'Advance'}</MenuItem>
//             )}
//             {/* Market Trips - All roles */}
//             <MenuItem href={`/${locale}/apps/trip/market`}>{'Market Trips'}</MenuItem>
//             {/* Market Advance - Admin and Account1 only */}
//             {(userRole === 'admin' || userRole === 'account1') && (
//               <MenuItem href={`/${locale}/apps/trip/advance/market`}>{'Market Advance'}</MenuItem>
//             )}
//           </SubMenu>
//         )}
//         {/* Reports - Admin and Account1 only */}
//         {(userRole === 'admin' || userRole === 'account1') && (
//           <SubMenu label="Reports" icon={<i className='ri-pages-line' />}>
//             <MenuItem href={`/${locale}/apps/trip/report`}>{'Trip Report'}</MenuItem>
//             <MenuItem href={`/${locale}/apps/trip/advance/reports`}>{'Advance Report'}</MenuItem>
//             <MenuItem href={`/${locale}/apps/trip/report/market`}>{'Market Trip Report'}</MenuItem>
//             <MenuItem href={`/${locale}/apps/trip/advance/reports/market`}>{'Market Advance Report'}</MenuItem>
//           </SubMenu>
//         )}
//         {/* Location - Admin only */}
//         {userRole === 'admin' && (
//           <SubMenu label="Location" icon={<i className='ri-map-pin-fill' />}>
//             <MenuItem href={`/${locale}/apps/location/`}>{'Location'}</MenuItem>
//             <MenuItem href={`/${locale}/apps/location/info`}>{'Location Info'}</MenuItem>
//           </SubMenu>
//         )}
//       </Menu>
//     </ScrollWrapper>
//   )
// }
// export default VerticalMenu


import { useParams } from 'next/navigation'
// MUI Imports
import { useTheme } from '@mui/material/styles'
// Third-party Imports
import PerfectScrollbar from 'react-perfect-scrollbar'
// Component Imports
import { Menu, SubMenu, MenuItem } from '@menu/vertical-menu'
// Hook Imports
import useVerticalNav from '@menu/hooks/useVerticalNav'
// NextAuth Import
import { useSession } from 'next-auth/react'
// Styled Component Imports
import StyledVerticalNavExpandIcon from '@menu/styles/vertical/StyledVerticalNavExpandIcon'
// Style Imports
import menuItemStyles from '@core/styles/vertical/menuItemStyles'
import menuSectionStyles from '@core/styles/vertical/menuSectionStyles'

const RenderExpandIcon = ({ open, transitionDuration }) => (
  <StyledVerticalNavExpandIcon open={open} transitionDuration={transitionDuration}>
    <i className='ri-arrow-right-s-line' />
  </StyledVerticalNavExpandIcon>
)

const VerticalMenu = ({ dictionary, scrollMenu }) => {
  // Hooks
  const theme = useTheme()
  const verticalNavOptions = useVerticalNav()
  const params = useParams()
  const { data: session, status } = useSession()

  // Get user role from session
  const userRole = session?.user?.role || null

  // Vars
  const { isBreakpointReached, transitionDuration } = verticalNavOptions
  const { lang: locale } = params

  const ScrollWrapper = isBreakpointReached ? 'div' : PerfectScrollbar

  // Show loading state if session is loading
  if (status === 'loading') {
    return <div>Loading menu...</div>
  }

  return (
    <ScrollWrapper
      {...(isBreakpointReached
        ? {
          className: 'bs-full overflow-y-auto overflow-x-hidden',
          onScroll: container => scrollMenu(container, false)
        }
        : {
          options: { wheelPropagation: false, suppressScrollX: true },
          onScrollY: container => scrollMenu(container, true)
        })}
    >
      <Menu
        popoutMenuOffset={{ mainAxis: 17 }}
        menuItemStyles={menuItemStyles(verticalNavOptions, theme)}
        renderExpandIcon={({ open }) => <RenderExpandIcon open={open} transitionDuration={transitionDuration} />}
        renderExpandedMenuItemIcon={{ icon: <i className='ri-circle-fill' /> }}
        menuSectionStyles={menuSectionStyles(verticalNavOptions, theme)}
      >
        {/* ADMIN - All options visible */}
        {userRole === 'admin' && (
          <>
            {/* Dashboard */}
            <MenuItem href={`/${locale}/dashboards/logistics`} icon={<i className='ri-home-smile-line' />}>
              {dictionary['navigation'].dashboard}
            </MenuItem>

            {/* Staff Management */}
            <SubMenu label="Staff Management" icon={<i className='ri-group-line' />}>
              <MenuItem href={`/${locale}/apps/user/list`}>{'Users'}</MenuItem>
              <MenuItem href={`/${locale}/apps/roles`}>{dictionary['navigation'].roles}</MenuItem>
            </SubMenu>

            {/* Vehicles */}
            <SubMenu label="vehicles" icon={<i className='ri-car-line' />}>
              <MenuItem href={`/${locale}/apps/vehicles/list`}>{dictionary['navigation'].list}</MenuItem>
              <MenuItem href={`/${locale}/apps/vehicles/types`}>{'Types'}</MenuItem>
              <MenuItem href={`/${locale}/apps/vehicles/vehicle-owners/list`}>
                {'Vehicle Owners'}
              </MenuItem>
              {/* <MenuItem href={`/${locale}/apps/vehicles/market`}>{'Market Vehicles'}</MenuItem> */}
            </SubMenu>

            {/* Trips - Full access */}
            <SubMenu label="Trips" icon={<i className='ri-file-copy-line' />}>
              <MenuItem href={`/${locale}/apps/trip/`}>{dictionary['navigation'].list}</MenuItem>
              <MenuItem href={`/${locale}/apps/trip/advance/`}>{'Advance'}</MenuItem>
              <MenuItem href={`/${locale}/apps/trip/market`}>{'Market Trips'}</MenuItem>
              <MenuItem href={`/${locale}/apps/trip/advance/market`}>{'Market Advance'}</MenuItem>
            </SubMenu>

            {/* Reports - Full access */}
            <SubMenu label="Reports" icon={<i className='ri-pages-line' />}>
              <MenuItem href={`/${locale}/apps/trip/report`}>{'Trip Report'}</MenuItem>
              <MenuItem href={`/${locale}/apps/trip/advance/reports`}>{'Advance Report'}</MenuItem>
              <MenuItem href={`/${locale}/apps/trip/report/market`}>{'Market Trip Report'}</MenuItem>
              <MenuItem href={`/${locale}/apps/trip/advance/reports/market`}>{'Market Advance Report'}</MenuItem>
            </SubMenu>

            {/* Location */}
            <SubMenu label="Location" icon={<i className='ri-map-pin-fill' />}>
              <MenuItem href={`/${locale}/apps/location/`}>{'Location'}</MenuItem>
              <MenuItem href={`/${locale}/apps/location/info`}>{'Location Info'}</MenuItem>
            </SubMenu>
          </>
        )}

        {/* ACCOUNT1 - Trip, Advance, Market Trip, Market Advance, Reports */}
        {userRole === 'account1' && (
          <>
            <SubMenu label="vehicles" icon={<i className='ri-car-line' />}>
              <MenuItem href={`/${locale}/apps/vehicles/list`}>{dictionary['navigation'].list}</MenuItem>
              <MenuItem href={`/${locale}/apps/vehicles/types`}>{'Types'}</MenuItem>
              <MenuItem href={`/${locale}/apps/vehicles/vehicle-owners/list`}>
                {'Vehicle Owners'}
              </MenuItem>
              <MenuItem href={`/${locale}/apps/vehicles/market`}>{'Market Vehicles'}</MenuItem>
            </SubMenu>
            {/* Trips with all options */}
            <SubMenu label="Trips" icon={<i className='ri-file-copy-line' />}>
              <MenuItem href={`/${locale}/apps/trip/`}>{dictionary['navigation'].list}</MenuItem>
              <MenuItem href={`/${locale}/apps/trip/advance/`}>{'Advance'}</MenuItem>
              <MenuItem href={`/${locale}/apps/trip/market`}>{'Market Trips'}</MenuItem>
              <MenuItem href={`/${locale}/apps/trip/advance/market`}>{'Market Advance'}</MenuItem>
            </SubMenu>

            {/* Reports - Full access */}
            <SubMenu label="Reports" icon={<i className='ri-pages-line' />}>
              <MenuItem href={`/${locale}/apps/trip/report`}>{'Trip Report'}</MenuItem>
              <MenuItem href={`/${locale}/apps/trip/advance/reports`}>{'Advance Report'}</MenuItem>
              <MenuItem href={`/${locale}/apps/trip/report/market`}>{'Market Trip Report'}</MenuItem>
              <MenuItem href={`/${locale}/apps/trip/advance/reports/market`}>{'Market Advance Report'}</MenuItem>
            </SubMenu>
            <SubMenu label="Location" icon={<i className='ri-map-pin-fill' />}>
              <MenuItem href={`/${locale}/apps/location/`}>{'Location'}</MenuItem>
              <MenuItem href={`/${locale}/apps/location/info`}>{'Location Info'}</MenuItem>
            </SubMenu>
          </>
        )}
        {userRole === 'account2' && (
          <>
            <SubMenu label="vehicles" icon={<i className='ri-car-line' />}>
              <MenuItem href={`/${locale}/apps/vehicles/list`}>{dictionary['navigation'].list}</MenuItem>
              <MenuItem href={`/${locale}/apps/vehicles/market`}>{'Market Vehicles'}</MenuItem>
            </SubMenu>
            <SubMenu label="Trips" icon={<i className='ri-file-copy-line' />}>
              <MenuItem href={`/${locale}/apps/trip/`}>{dictionary['navigation'].list}</MenuItem>
              <MenuItem href={`/${locale}/apps/trip/market`}>{'Market Trips'}</MenuItem>

              <MenuItem href={`/${locale}/apps/trip/advance/`}>{'Advance'}</MenuItem>
              <MenuItem href={`/${locale}/apps/trip/advance/market`}>{'Market Advance'}</MenuItem>

            </SubMenu>
            {/* Reports - Full access */}
            <SubMenu label="Reports" icon={<i className='ri-pages-line' />}>
              <MenuItem href={`/${locale}/apps/trip/report`}>{'Trip Report'}</MenuItem>
              <MenuItem href={`/${locale}/apps/trip/advance/reports`}>{'Advance Report'}</MenuItem>
              <MenuItem href={`/${locale}/apps/trip/report/market`}>{'Market Trip Report'}</MenuItem>
              <MenuItem href={`/${locale}/apps/trip/advance/reports/market`}>{'Market Advance Report'}</MenuItem>
            </SubMenu>

          </>
        )}
        {/* OTHER USERS - Only Trip and Market Trip */}
        {userRole === 'other' && (
          <>
            <SubMenu label="Trips" icon={<i className='ri-file-copy-line' />}>
              <MenuItem href={`/${locale}/apps/trip/`}>{dictionary['navigation'].list}</MenuItem>
              <MenuItem href={`/${locale}/apps/trip/market`}>{'Market Trips'}</MenuItem>
            </SubMenu>
            {/* <SubMenu label="Location" icon={<i className='ri-map-pin-fill' />}>
              <MenuItem href={`/${locale}/apps/location/`}>{'Location'}</MenuItem>
              <MenuItem href={`/${locale}/apps/location/info`}>{'Location Info'}</MenuItem>
            </SubMenu> */}
          </>
        )}
      </Menu>
    </ScrollWrapper>
  )
}

export default VerticalMenu
