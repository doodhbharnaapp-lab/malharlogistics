'use client'
// React Imports
import { useEffect, useState, useMemo } from 'react'
// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import TablePagination from '@mui/material/TablePagination'
import IconButton from '@mui/material/IconButton'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
// Third-party Imports
import classnames from 'classnames'
import { rankItem } from '@tanstack/match-sorter-utils'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getFilteredRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFacetedMinMaxValues,
  getPaginationRowModel,
  getSortedRowModel
} from '@tanstack/react-table'
// Component Imports
import PermissionDialog from '@components/dialogs/permission-dialog'
// Style Imports
import tableStyles from '@core/styles/table.module.css'

const fuzzyFilter = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(row.getValue(columnId), value)
  addMeta({ itemRank })
  return itemRank.passed
}

const DebouncedInput = ({ value: initialValue, onChange, debounce = 500, ...props }) => {
  const [value, setValue] = useState(initialValue)

  useEffect(() => {
    setValue(initialValue)
  }, [initialValue])

  useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value)
    }, debounce)

    return () => clearTimeout(timeout)
  }, [value])

  return <TextField {...props} value={value} onChange={e => setValue(e.target.value)} size='small' />
}

// Column Definitions
const columnHelper = createColumnHelper()

const Permissions = () => {
  // States
  const [open, setOpen] = useState(false)
  const [rowSelection, setRowSelection] = useState({})
  const [editValue, setEditValue] = useState(null)
  const [data, setData] = useState([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [roles, setRoles] = useState([])
  const [menuAnchor, setMenuAnchor] = useState(null)
  const [selectedPermission, setSelectedPermission] = useState(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  // Fetch data on component mount
  useEffect(() => {
    fetchData()
    fetchRoles()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('/api/apps/permissions?action=permissions')
      const result = await response.json()

      if (result.success) {
        setData(result.data)
      } else {
        throw new Error(result.error || 'Failed to fetch permissions')
      }
    } catch (err) {
      setError(err.message)
      console.error('Error fetching permissions:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchRoles = async () => {
    try {
      const response = await fetch('/api/apps/permissions?action=roles')
      const result = await response.json()

      if (result.success) {
        setRoles(result.data)
      }
    } catch (err) {
      console.error('Error fetching roles:', err)
    }
  }

  const handleEditPermission = (permission) => {
    setEditValue(permission)
    setDialogOpen(true)
  }

  const handleAddPermission = () => {
    setEditValue(null)
    setDialogOpen(true)
  }

  const handleMenuOpen = (event, permission) => {
    setMenuAnchor(event.currentTarget)
    setSelectedPermission(permission)
  }

  const handleMenuClose = () => {
    setMenuAnchor(null)
    setSelectedPermission(null)
  }

  const handleDeletePermission = async () => {
    if (!selectedPermission) return

    try {
      const response = await fetch(`/api/apps/permissions?id=${selectedPermission._id}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (result.success) {
        // Refresh data
        fetchData()
        handleMenuClose()
      } else {
        throw new Error(result.error || 'Failed to delete permission')
      }
    } catch (err) {
      setError(err.message)
      console.error('Error deleting permission:', err)
    }
  }

  const handleDialogClose = () => {
    setDialogOpen(false)
    setEditValue(null)
  }

  const handleDialogSuccess = () => {
    fetchData() // Refresh data after successful operation
    handleDialogClose()
  }

  // Format assigned roles for display
  const getAssignedRoles = (permissionId) => {
    const assignedRoles = []

    roles.forEach(role => {
      if (role.permissionDetails?.some(permission => permission._id === permissionId)) {
        assignedRoles.push(role.name)
      }
    })

    return assignedRoles
  }

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // Column definitions
  const columns = useMemo(
    () => [
      columnHelper.accessor('name', {
        header: 'Name',
        cell: ({ row }) => <Typography color='text.primary'>{row.original.name}</Typography>
      }),
      columnHelper.accessor('key', {
        header: 'Key',
        cell: ({ row }) => <Typography color='text.secondary'>{row.original.key}</Typography>
      }),
      columnHelper.accessor('module', {
        header: 'Module',
        cell: ({ row }) => (
          <Chip
            variant='outlined'
            label={row.original.module}
            color='primary'
            size='small'
            className='capitalize'
          />
        )
      }),
      columnHelper.accessor('assignedTo', {
        header: 'Assigned To',
        cell: ({ row }) => {
          const assignedRoles = getAssignedRoles(row.original._id)

          return assignedRoles.length > 0 ? (
            <div className='flex flex-wrap gap-1'>
              {assignedRoles.map((role, index) => (
                <Chip
                  key={index}
                  variant='tonal'
                  label={role}
                  size='small'
                  className='capitalize'
                  color={
                    role.toLowerCase().includes('admin') ? 'primary' :
                      role.toLowerCase().includes('manager') ? 'warning' :
                        role.toLowerCase().includes('support') ? 'info' : 'default'
                  }
                />
              ))}
            </div>
          ) : (
            <Typography color='text.disabled' variant='body2'>
              Not assigned
            </Typography>
          )
        }
      }),
      columnHelper.accessor('createdAt', {
        header: 'Created Date',
        cell: ({ row }) => <Typography variant='body2'>{formatDate(row.original.createdAt)}</Typography>
      }),
      columnHelper.accessor('action', {
        header: 'Actions',
        cell: ({ row }) => (
          <div className='flex items-center gap-0.5'>
            <IconButton size='small' onClick={() => handleEditPermission(row.original)}>
              <i className='ri-edit-box-line text-textSecondary' />
            </IconButton>
            <IconButton size='small' onClick={(e) => handleMenuOpen(e, row.original)}>
              <i className='ri-more-2-line text-textSecondary' />
            </IconButton>
          </div>
        ),
        enableSorting: false
      })
    ],
    [roles]
  )

  const table = useReactTable({
    data: data,
    columns,
    filterFns: {
      fuzzy: fuzzyFilter
    },
    state: {
      rowSelection,
      globalFilter
    },
    initialState: {
      pagination: {
        pageSize: 10
      }
    },
    globalFilterFn: fuzzyFilter,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues()
  })

  if (loading) {
    return (
      <Card className='flex items-center justify-center p-8'>
        <CircularProgress />
      </Card>
    )
  }

  if (error) {
    return (
      <Card className='p-6'>
        <Alert severity='error'>{error}</Alert>
        <Button onClick={fetchData} variant='outlined' className='mt-4'>
          Retry
        </Button>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardContent className='flex flex-col sm:flex-row items-start sm:items-center justify-between max-sm:gap-4'>
          <DebouncedInput
            value={globalFilter ?? ''}
            onChange={value => setGlobalFilter(String(value))}
            placeholder='Search Permissions'
            className='max-sm:is-full sm:is-64'
          />
          <Button
            variant='contained'
            onClick={handleAddPermission}
            className='max-sm:is-full'
          >
            Add Permission
          </Button>
        </CardContent>

        <div className='overflow-x-auto'>
          <table className={tableStyles.table}>
            <thead>
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th key={header.id}>
                      {header.isPlaceholder ? null : (
                        <div
                          className={classnames({
                            'flex items-center': header.column.getIsSorted(),
                            'cursor-pointer select-none': header.column.getCanSort()
                          })}
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {{
                            asc: <i className='ri-arrow-up-s-line text-xl' />,
                            desc: <i className='ri-arrow-down-s-line text-xl' />
                          }[header.column.getIsSorted()] ?? null}
                        </div>
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>

            {table.getFilteredRowModel().rows.length === 0 ? (
              <tbody>
                <tr>
                  <td colSpan={table.getVisibleFlatColumns().length} className='text-center p-8'>
                    <Typography color='text.secondary'>
                      No permissions found. {globalFilter ? 'Try a different search.' : 'Click "Add Permission" to create one.'}
                    </Typography>
                  </td>
                </tr>
              </tbody>
            ) : (
              <tbody>
                {table
                  .getRowModel()
                  .rows.slice(0, table.getState().pagination.pageSize)
                  .map(row => {
                    return (
                      <tr key={row.id} className={classnames({ selected: row.getIsSelected() })}>
                        {row.getVisibleCells().map(cell => (
                          <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                        ))}
                      </tr>
                    )
                  })}
              </tbody>
            )}
          </table>
        </div>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component='div'
          className='border-bs'
          count={table.getFilteredRowModel().rows.length}
          rowsPerPage={table.getState().pagination.pageSize}
          page={table.getState().pagination.pageIndex}
          SelectProps={{
            inputProps: { 'aria-label': 'rows per page' }
          }}
          onPageChange={(_, page) => {
            table.setPageIndex(page)
          }}
          onRowsPerPageChange={e => table.setPageSize(Number(e.target.value))}
        />
      </Card>

      {/* Permission Dialog */}
      <PermissionDialog
        open={dialogOpen}
        setOpen={setDialogOpen}
        editValue={editValue}
        onClose={handleDialogClose}
        onSuccess={handleDialogSuccess}
      />

      {/* Context Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleDeletePermission} disabled={!selectedPermission}>
          <i className='ri-delete-bin-line text-error me-2' />
          Delete Permission
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <i className='ri-close-line me-2' />
          Cancel
        </MenuItem>
      </Menu>
    </>
  )
}

export default Permissions
