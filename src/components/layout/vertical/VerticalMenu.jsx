// Next Imports
import { useParams } from 'next/navigation'
// MUI Imports
import { useTheme } from '@mui/material/styles'
import Chip from '@mui/material/Chip'
// Third-party Imports
import PerfectScrollbar from 'react-perfect-scrollbar'
// Component Imports
import { Menu, SubMenu, MenuItem, MenuSection } from '@menu/vertical-menu'
// import { GenerateVerticalMenu } from '@components/GenerateMenu'
// Hook Imports
import useVerticalNav from '@menu/hooks/useVerticalNav'
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
  // Vars
  const { isBreakpointReached, transitionDuration } = verticalNavOptions
  const { lang: locale } = params
  const ScrollWrapper = isBreakpointReached ? 'div' : PerfectScrollbar
  return (
    // eslint-disable-next-line lines-around-comment
    /* Custom scrollbar instead of browser scroll, remove if you want browser scroll only */
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
      {/* Incase you also want to scroll NavHeader to scroll with Vertical Menu, remove NavHeader from above and paste it below this comment */}
      {/* Vertical Menu */}
      <Menu
        popoutMenuOffset={{ mainAxis: 17 }}
        menuItemStyles={menuItemStyles(verticalNavOptions, theme)}
        renderExpandIcon={({ open }) => <RenderExpandIcon open={open} transitionDuration={transitionDuration} />}
        renderExpandedMenuItemIcon={{ icon: <i className='ri-circle-fill' /> }}
        menuSectionStyles={menuSectionStyles(verticalNavOptions, theme)}
      >
        <MenuItem href={`/${locale}/dashboards/logistics`} icon={<i className='ri-home-smile-line' />}
        >{dictionary['navigation'].dashboard}</MenuItem>
        {/* </MenuItem> */}
        <SubMenu label={"Staff Management"} icon={<i className='ri-group-line' />}>
          <MenuItem href={`/${locale}/apps/user/list`}>{'Users'}</MenuItem>
          <MenuItem href={`/${locale}/apps/roles`}>{dictionary['navigation'].roles}</MenuItem>
          {/* <MenuItem href={`/${locale}/apps/permissions`}>{dictionary['navigation'].permissions}</MenuItem> */}
        </SubMenu>
        <MenuSection label={'Fleet Management'}>
          <SubMenu label={"vehicles"} icon={<i className='ri-car-line' />}>
            <MenuItem href={`/${locale}/apps/vehicles/list`}>{dictionary['navigation'].list}</MenuItem>
            <MenuItem href={`/${locale}/apps/vehicles/types`}>{'Types'}</MenuItem>
            <MenuItem href={`/${locale}/apps/vehicles/vehicle-owners/list`}>
              {'Vehhicle Owners'}
            </MenuItem>
            <MenuItem href={`/${locale}/apps/vehicles/market`}>{'Market Vehicles'}</MenuItem>
          </SubMenu>
          <SubMenu label={"Trips"} icon={<i className='ri-file-copy-line' />}>
            <MenuItem href={`/${locale}/apps/trip/`}>{dictionary['navigation'].list}</MenuItem>
            <MenuItem href={`/${locale}/apps/trip/advance/`}>{'Advance'}</MenuItem>
            <MenuItem href={`/${locale}/apps/trip/market`}>{'Market Trips'}</MenuItem>
            <MenuItem href={`/${locale}/apps/trip/advance/market`}>{'Market Advance'}</MenuItem>

          </SubMenu>
          <SubMenu label={"Reports"} icon={<i className='ri-pages-line' />}>
            <MenuItem href={`/${locale}/apps/trip/report`}>{'Trip Report'}</MenuItem>
            <MenuItem href={`/${locale}/apps/trip/advance/reports`}>{'Advance Report'}</MenuItem>
          </SubMenu>
          <SubMenu label={"Location"} icon={<i className='ri-map-pin-fill' />}>
            <MenuItem href={`/${locale}/apps/location/`}>{'Location'}</MenuItem>
            <MenuItem href={`/${locale}/apps/location/info`}>{'Location Info'}</MenuItem>
          </SubMenu>

        </MenuSection>
      </Menu>
      {/* <Menu
          popoutMenuOffset={{ mainAxis: 17 }}
          menuItemStyles={menuItemStyles(verticalNavOptions, theme)}
          renderExpandIcon={({ open }) => <RenderExpandIcon open={open} transitionDuration={transitionDuration} />}
          renderExpandedMenuItemIcon={{ icon: <i className='ri-circle-fill' /> }}
          menuSectionStyles={menuSectionStyles(verticalNavOptions, theme)}
        >
          <GenerateVerticalMenu menuData={menuData(dictionary, params)} />
        </Menu> */}
    </ScrollWrapper>
  )
}
export default VerticalMenu
