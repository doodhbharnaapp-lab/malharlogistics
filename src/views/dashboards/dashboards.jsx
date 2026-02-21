'use client'
import React, { useState } from 'react'
import {
    Box,
    Card,
    CardContent,
    Typography,
    Grid,
    LinearProgress,
    Chip,
    Avatar,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Tabs,
    Tab
} from '@mui/material'
/* ===============================
   Remix Icon Helper
================================ */
const RI = ({ name, size = 22, color }) => (
    <i
        className={`ri-${name}`}
        style={{ fontSize: size, color }}
    />
)
const LogisticsDashboard = () => {
    const [tabValue, setTabValue] = useState(0)
    /* ===============================
       Mock Data
    ================================ */
    const stats = {
        ownVehicles: 45,
        marketVehicles: 32,
        totalUsers: 128,
        totalRoutes: 24,
        expiredDocs: 8,
        ownTrips: { inProcess: 12, completed: 156, cancelled: 8, total: 176 },
        marketTrips: { inProcess: 9, completed: 203, cancelled: 12, total: 224 }
    }
    const recentTrips = [
        { id: 'TRP-001', type: 'Own', vehicle: 'MH-12-AB-1234', driver: 'Rajesh Kumar', status: 'In Process', route: 'Mumbai → Delhi', progress: 65 },
        { id: 'TRP-002', type: 'Market', vehicle: 'DL-10-CD-5678', driver: 'Amit Sharma', status: 'In Process', route: 'Delhi → Jaipur', progress: 40 },
        { id: 'TRP-003', type: 'Own', vehicle: 'KA-05-EF-9012', driver: 'Suresh Reddy', status: 'Completed', route: 'Bangalore → Chennai', progress: 100 }
    ]
    const expiredDocuments = [
        { vehicle: 'MH-12-AB-1234', doc: 'Insurance', expiry: '2025-01-15', daysAgo: 8 },
        { vehicle: 'DL-10-CD-5678', doc: 'Fitness Certificate', expiry: '2025-01-10', daysAgo: 13 }
    ]
    /* ===============================
       Components
    ================================ */
    const StatCard = ({ title, value, icon, color, subtitle, trend }) => (
        <Card sx={{ height: '100%', border: `1px solid ${color}30`, background: `${color}08` }}>
            <CardContent>
                <Box display="flex" justifyContent="space-between">
                    <Box>
                        <Typography variant="body2" color="text.secondary">{title}</Typography>
                        <Typography variant="h4" sx={{ fontWeight: 700, color }}>{value}</Typography>
                        {subtitle && <Typography variant="caption">{subtitle}</Typography>}
                        {trend && (
                            <Box display="flex" alignItems="center" mt={1}>
                                <RI name="line-chart-line" size={16} color="#4caf50" />
                                <Typography variant="caption" sx={{ ml: 0.5, color: '#4caf50' }}>{trend}</Typography>
                            </Box>
                        )}
                    </Box>
                    <Avatar sx={{ bgcolor: color, width: 56, height: 56 }}>
                        <RI name={icon} size={26} color="white" />
                    </Avatar>
                </Box>
            </CardContent>
        </Card>
    )
    const TripStatsCard = ({ title, data, color, type }) => (
        <Card>
            <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                    <Avatar sx={{ bgcolor: color, mr: 2 }}>
                        <RI name={type === 'own' ? 'car-line' : 'truck-line'} color="white" />
                    </Avatar>
                    <Typography variant="h6">{title}</Typography>
                </Box>
                <Grid container spacing={2}>
                    <Grid item xs={6}>
                        <StatusBox icon="time-line" color="#ff9800" label="In Process" value={data.inProcess} />
                    </Grid>
                    <Grid item xs={6}>
                        <StatusBox icon="checkbox-circle-line" color="#4caf50" label="Completed" value={data.completed} />
                    </Grid>
                    <Grid item xs={6}>
                        <StatusBox icon="close-circle-line" color="#f44336" label="Cancelled" value={data.cancelled} />
                    </Grid>
                    <Grid item xs={6}>
                        <Box textAlign="center" p={1} sx={{ bgcolor: color + '15', borderRadius: 1 }}>
                            <Typography variant="h5" sx={{ fontWeight: 700, color }}>{data.total}</Typography>
                            <Typography variant="caption">Total Trips</Typography>
                        </Box>
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    )
    const StatusBox = ({ icon, color, label, value }) => (
        <Box textAlign="center" p={1} sx={{ bgcolor: '#f5f5f5', borderRadius: 1 }}>
            <RI name={icon} color={color} />
            <Typography variant="h5" sx={{ fontWeight: 700, color }}>{value}</Typography>
            <Typography variant="caption">{label}</Typography>
        </Box>
    )
    const getStatusColor = (status) =>
        status === 'Completed' ? '#4caf50' :
            status === 'Cancelled' ? '#f44336' :
                '#ff9800'
    /* ===============================
       Render
    ================================ */
    return (
        <Box p={3} sx={{ bgcolor: '#f5f7fa', minHeight: '100vh' }}>
            {/* Header */}
            <Box display="flex" justifyContent="space-between" mb={4}>
                <Box>
                    <Typography variant="h4" fontWeight={700}>Logistics Dashboard</Typography>
                    <Typography variant="body2" color="text.secondary">Fleet & trip overview</Typography>
                </Box>
                <IconButton sx={{ bgcolor: '#1976d2', color: 'white' }}>
                    <RI name="refresh-line" color="white" />
                </IconButton>
            </Box>
            {/* Stats */}
            <Grid container spacing={3} mb={3}>
                <Grid item xs={12} md={2.4}><StatCard title="Own Vehicles" value={stats.ownVehicles} icon="car-line" color="#1976d2" trend="+5 this month" /></Grid>
                <Grid item xs={12} md={2.4}><StatCard title="Market Vehicles" value={stats.marketVehicles} icon="truck-line" color="#9c27b0" /></Grid>
                <Grid item xs={12} md={2.4}><StatCard title="Users" value={stats.totalUsers} icon="group-line" color="#00bcd4" /></Grid>
                <Grid item xs={12} md={2.4}><StatCard title="Routes" value={stats.totalRoutes} icon="route-line" color="#4caf50" /></Grid>
                <Grid item xs={12} md={2.4}><StatCard title="Expired Docs" value={stats.expiredDocs} icon="error-warning-line" color="#f44336" /></Grid>
            </Grid>
            {/* Trip Stats */}
            <Grid container spacing={3} mb={3}>
                <Grid item xs={12} md={6}><TripStatsCard title="Own Trips" data={stats.ownTrips} color="#1976d2" type="own" /></Grid>
                <Grid item xs={12} md={6}><TripStatsCard title="Market Trips" data={stats.marketTrips} color="#9c27b0" type="market" /></Grid>
            </Grid>
            {/* Tables */}
            <Card>
                <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
                    <Tab label="Recent Trips" />
                    <Tab label="Expired Documents" />
                </Tabs>
                {tabValue === 0 && (
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>ID</TableCell>
                                    <TableCell>Vehicle</TableCell>
                                    <TableCell>Driver</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell>Progress</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {recentTrips.map(t => (
                                    <TableRow key={t.id}>
                                        <TableCell>{t.id}</TableCell>
                                        <TableCell>{t.vehicle}</TableCell>
                                        <TableCell>{t.driver}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={t.status}
                                                size="small"
                                                sx={{ bgcolor: getStatusColor(t.status) + '20', color: getStatusColor(t.status) }}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <LinearProgress variant="determinate" value={t.progress} />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </Card>
        </Box>
    )
}
export default LogisticsDashboard
