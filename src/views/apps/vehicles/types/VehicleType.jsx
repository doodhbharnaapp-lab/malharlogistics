'use client'
import { useState, useEffect, useMemo } from 'react'
import {
    Card,
    CardContent,
    Button,
    Typography,
    TextField,
    Switch,
    Chip,
    CircularProgress,
    Alert,
    IconButton,
    Tooltip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
} from '@mui/material'
import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    useReactTable
} from '@tanstack/react-table'
import tableStyles from '@core/styles/table.module.css'
const columnHelper = createColumnHelper()
const VehicleType = () => {
    const [data, setData] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [dialogOpen, setDialogOpen] = useState(false)
    const [editingItem, setEditingItem] = useState(null)
    const [form, setForm] = useState({
        srno: 1,
        type: '',
        isActive: true
    })
    /* ================= FETCH ================= */
    const fetchTypes = async () => {
        try {
            setLoading(true)
            setError('')
            const res = await fetch('/api/apps/vehicles/types')
            const result = await res.json()
            if (!res.ok) throw new Error(result.error || 'Failed to fetch')
            setData(result.data || [])
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }
    useEffect(() => {
        fetchTypes()
    }, [])
    /* ================= ADD ================= */
    const openAddDialog = () => {
        const nextSrNo =
            data.length > 0
                ? Math.max(...data.map(item => Number(item.srno))) + 1
                : 1
        setEditingItem(null)
        setForm({
            srno: nextSrNo,
            type: '',
            isActive: true
        })
        setDialogOpen(true)
    }
    /* ================= EDIT ================= */
    const openEditDialog = (row) => {
        setEditingItem(row)
        setForm({
            srno: row.srno, // locked
            type: row.type,
            isActive: row.isActive
        })
        setDialogOpen(true)
    }
    /* ================= SUBMIT ================= */
    const handleSubmit = async () => {
        try {
            if (!form.type) {
                throw new Error('Type are required')
            }
            const method = editingItem ? 'PUT' : 'POST'
            const payload = editingItem
                ? { ...form, id: editingItem.id }
                : form
            const res = await fetch('/api/apps/vehicles/types', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })
            const result = await res.json()
            if (!res.ok) throw new Error(result.error || 'Failed')
            setDialogOpen(false)
            fetchTypes()
        } catch (err) {
            setError(err.message)
        }
    }
    /* ================= DELETE ================= */
    const handleDelete = async (id) => {
        if (!confirm('Delete this type?')) return
        await fetch('/api/apps/vehicles/types', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id })
        })
        fetchTypes()
    }
    /* ================= TABLE ================= */
    const columns = useMemo(
        () => [
            columnHelper.accessor('srno', {
                header: 'Sr No'
            }),
            columnHelper.accessor('type', {
                header: 'Type'
            }),

            columnHelper.accessor('isActive', {
                header: 'Status',
                cell: ({ row }) => (
                    <Chip
                        label={row.original.isActive ? 'Active' : 'Inactive'}
                        color={row.original.isActive ? 'success' : 'error'}
                        size="small"
                    />
                )
            }),
            columnHelper.display({
                id: 'actions',
                header: 'Actions',
                cell: ({ row }) => (
                    <div className="flex gap-2">
                        <Tooltip title="Edit">
                            <IconButton onClick={() => openEditDialog(row.original)}>
                                <i className="ri-edit-line text-primary" />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                            <IconButton onClick={() => handleDelete(row.original.id)}>
                                <i className="ri-delete-bin-line text-error" />
                            </IconButton>
                        </Tooltip>
                    </div>
                )
            })
        ],
        [data]
    )
    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel()
    })
    /* ================= UI ================= */
    if (loading) {
        return (
            <Card>
                <CardContent className="flex justify-center p-10">
                    <CircularProgress />
                </CardContent>
            </Card>
        )
    }
    if (error) {
        return (
            <Alert severity="error" className="mb-4">
                {error}
            </Alert>
        )
    }
    return (
        <>
            <Card>
                <CardContent className="flex justify-between items-center">
                    <Typography variant="h5">Vehicle Types</Typography>
                    <Button variant="contained" onClick={openAddDialog}>
                        Add Type
                    </Button>
                </CardContent>
                <div className="overflow-x-auto">
                    <table className={tableStyles.table}>
                        <thead>
                            {table.getHeaderGroups().map(hg => (
                                <tr key={hg.id}>
                                    {hg.headers.map(h => (
                                        <th key={h.id}>
                                            {flexRender(h.column.columnDef.header, h.getContext())}
                                        </th>
                                    ))}
                                </tr>
                            ))}
                        </thead>
                        <tbody>
                            {table.getRowModel().rows.map(row => (
                                <tr key={row.id}>
                                    {row.getVisibleCells().map(cell => (
                                        <td key={cell.id}>
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
            {/* ADD / EDIT DIALOG */}
            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {editingItem ? 'Edit Vehicle Type' : 'Add Vehicle Type'}
                </DialogTitle>
                <DialogContent className="flex flex-col gap-4 pt-4">
                    <TextField label="Sr No" value={form.srno} disabled />
                    <TextField
                        label="Type"
                        value={form.type}
                        onChange={e => setForm({ ...form, type: e.target.value })}
                        fullWidth
                    />
                    <div className="flex justify-between items-center">
                        <Typography>Status</Typography>
                        <Switch
                            checked={form.isActive}
                            onChange={e =>
                                setForm({ ...form, isActive: e.target.checked })
                            }
                        />
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleSubmit}>
                        {editingItem ? 'Update' : 'Create'}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    )
}
export default VehicleType
