// // // // 'use client'
// // // // // MUI Imports
// // // // import Card from '@mui/material/Card'
// // // // import Button from '@mui/material/Button'
// // // // import CardContent from '@mui/material/CardContent'
// // // // import Typography from '@mui/material/Typography'
// // // // import Box from '@mui/material/Box'
// // // // import Alert from '@mui/material/Alert'
// // // // import CircularProgress from '@mui/material/CircularProgress'
// // // // import TextField from '@mui/material/TextField'
// // // // // Component Imports
// // // // import TwoFactorAuth from '@components/dialogs/two-factor-auth'
// // // // import OpenDialogOnElementClick from '@components/dialogs/OpenDialogOnElementClick'
// // // // import { useState, useEffect } from 'react'
// // // // const DialogAuthentication = () => {
// // // //   // State variables
// // // //   const [vehicles, setVehicles] = useState([])
// // // //   const [loading, setLoading] = useState(true)
// // // //   const [smsSending, setSmsSending] = useState(false)
// // // //   const [testSending, setTestSending] = useState(false)
// // // //   const [message, setMessage] = useState('')
// // // //   const [alertType, setAlertType] = useState('info')
// // // //   const [testMobile, setTestMobile] = useState('')
// // // //   // Hardcoded test mobile numbers
// // // //   const HARDCODED_TEST_NUMBERS = ['919284834754', '917773937764', '919823251105']
// // // //   // SMS API configuration
// // // //   const SMS_API_URL = 'http://13.200.203.109/V2/http-api-post.php'
// // // //   const SMS_API_KEY = 'dCe2ItQ23Vn4RTOv' // Replace with your actual API key
// // // //   const SENDER_ID = 'MILKCL' // Replace with your sender ID
// // // //   // Button props
// // // //   const buttonProps = {
// // // //     variant: 'contained',
// // // //     children: 'Show'
// // // //   }
// // // //   // Function to check if a document expires within X days
// // // //   const isExpiringSoon = (expiryDate, daysThreshold = 7) => {
// // // //     const expiry = new Date(expiryDate)
// // // //     const today = new Date()
// // // //     const timeDiff = expiry.getTime() - today.getTime()
// // // //     const dayDiff = Math.ceil(timeDiff / (1000 * 3600 * 24))
// // // //     return dayDiff <= daysThreshold && dayDiff > 0
// // // //   }
// // // //   // Function to format date
// // // //   const formatDate = (dateString) => {
// // // //     const date = new Date(dateString)
// // // //     return date.toLocaleDateString('en-IN', {
// // // //       day: '2-digit',
// // // //       month: 'short',
// // // //       year: 'numeric'
// // // //     })
// // // //   }
// // // //   // Fetch vehicles data
// // // //   const fetchVehicles = async () => {
// // // //     try {
// // // //       setLoading(true)
// // // //       const response = await fetch('https://srtransport.vercel.app/api/apps/vehicles')
// // // //       const result = await response.json()
// // // //       if (result.success && result.data) {
// // // //         setVehicles(result.data)
// // // //         checkExpiringDocuments(result.data)
// // // //       }
// // // //     } catch (error) {
// // // //       console.error('Error fetching vehicles:', error)
// // // //       setMessage('Failed to fetch vehicles data')
// // // //       setAlertType('error')
// // // //     } finally {
// // // //       setLoading(false)
// // // //     }
// // // //   }
// // // //   // Check for expiring documents
// // // //   const checkExpiringDocuments = (vehiclesData) => {
// // // //     const today = new Date()
// // // //     const expiringSoon = []
// // // //     vehiclesData.forEach(vehicle => {
// // // //       if (vehicle.documents) {
// // // //         vehicle.documents.forEach(document => {
// // // //           if (!document.isExpired && isExpiringSoon(document.expiryDate, 7)) {
// // // //             expiringSoon.push({ vehicle, document })
// // // //           }
// // // //         })
// // // //       }
// // // //     })
// // // //     if (expiringSoon.length > 0) {
// // // //       const msg = `Found ${expiringSoon.length} document(s) expiring soon. Check console for details.`
// // // //       setMessage(msg)
// // // //       setAlertType('info')
// // // //       // Log details for debugging
// // // //       expiringSoon.forEach(({ vehicle, document }) => {
// // // //         console.log(`Vehicle ${vehicle.vehicleNo} (${vehicle.model}): ${document.documentType} expires on ${formatDate(document.expiryDate)}`)
// // // //       })
// // // //     } else {
// // // //       setMessage('No documents expiring in the next 7 days.')
// // // //       setAlertType('info')
// // // //     }
// // // //   }
// // // //   // Send SMS to a single mobile number
// // // //   const sendSingleSMS = async (mobile, messageText) => {
// // // //     // Clean mobile number (remove spaces, ensure proper format)
// // // //     const cleanMobile = mobile.replace(/\s+/g, '')
// // // //     const smsData = {
// // // //       apikey: SMS_API_KEY,
// // // //       senderid: SENDER_ID,
// // // //       number: cleanMobile,
// // // //       message: messageText,
// // // //       format: 'json'
// // // //     }
// // // //     try {
// // // //       const response = await fetch(SMS_API_URL, {
// // // //         method: 'POST',
// // // //         headers: {
// // // //           'Content-Type': 'application/json',
// // // //         },
// // // //         body: JSON.stringify(smsData)
// // // //       })
// // // //       return await response.json()
// // // //     } catch (error) {
// // // //       throw new Error(`Failed to send SMS: ${error}`)
// // // //     }
// // // //   }
// // // //   // Send SMS to multiple numbers
// // // //   const sendBulkSMS = async (mobiles, message) => {
// // // //     const smsData = {
// // // //       apikey: SMS_API_KEY,
// // // //       senderid: SENDER_ID,
// // // //       number: mobiles.join(','),
// // // //       message: message,
// // // //       format: 'json'
// // // //     }
// // // //     try {
// // // //       const response = await fetch(SMS_API_URL, {
// // // //         method: 'POST',
// // // //         headers: {
// // // //           'Content-Type': 'application/json',
// // // //         },
// // // //         body: JSON.stringify(smsData)
// // // //       })
// // // //       return await response.json()
// // // //     } catch (error) {
// // // //       throw new Error(`Failed to send bulk SMS: ${error}`)
// // // //     }
// // // //   }
// // // //   // Test SMS to hardcoded numbers
// // // //   const sendTestSMS = async () => {
// // // //     setTestSending(true)
// // // //     setMessage('')
// // // //     try {
// // // //       const results = []
// // // //       // Send to all hardcoded numbers
// // // //       for (let i = 0; i < HARDCODED_TEST_NUMBERS.length; i++) {
// // // //         const mobile = HARDCODED_TEST_NUMBERS[i]
// // // //         try {
// // // //           const testMessage = `Test SMS from Milk Collection System. This is test message ${i + 1}. Please ignore.`
// // // //           const smsResponse = await sendSingleSMS(mobile, testMessage)
// // // //           if (smsResponse.status === 'OK') {
// // // //             results.push({
// // // //               success: true,
// // // //               mobile: mobile,
// // // //               message: 'Test SMS sent successfully'
// // // //             })
// // // //           } else {
// // // //             results.push({
// // // //               success: false,
// // // //               mobile: mobile,
// // // //               message: smsResponse.message || 'Failed to send SMS'
// // // //             })
// // // //           }
// // // //           // Small delay between messages
// // // //           await new Promise(resolve => setTimeout(resolve, 500))
// // // //         } catch (error) {
// // // //           results.push({
// // // //             success: false,
// // // //             mobile: mobile,
// // // //             message: error.message || 'Unknown error'
// // // //           })
// // // //         }
// // // //       }
// // // //       // Process results
// // // //       const successful = results.filter(r => r.success).length
// // // //       const failed = results.filter(r => !r.success).length
// // // //       setMessage(`Test SMS: Sent ${successful} successfully. ${failed > 0 ? `${failed} failed.` : ''}`)
// // // //       setAlertType(successful > 0 ? 'success' : 'error')
// // // //       console.log('Test SMS Results:', results)
// // // //     } catch (error) {
// // // //       console.error('Error sending test SMS:', error)
// // // //       setMessage('Failed to send test SMS. Please try again.')
// // // //       setAlertType('error')
// // // //     } finally {
// // // //       setTestSending(false)
// // // //     }
// // // //   }
// // // //   // Send SMS to custom mobile number
// // // //   const sendCustomSMS = async () => {
// // // //     if (!testMobile.trim()) {
// // // //       setMessage('Please enter a mobile number')
// // // //       setAlertType('error')
// // // //       return
// // // //     }
// // // //     setTestSending(true)
// // // //     setMessage('')
// // // //     try {
// // // //       const testMessage = `Test SMS from Milk Collection System. This is a test message to verify SMS functionality. Please ignore.`
// // // //       const smsResponse = await sendSingleSMS(testMobile, testMessage)
// // // //       if (smsResponse.status === 'OK') {
// // // //         setMessage(`Test SMS sent successfully to ${testMobile}`)
// // // //         setAlertType('success')
// // // //       } else {
// // // //         setMessage(`Failed to send SMS: ${smsResponse.message}`)
// // // //         setAlertType('error')
// // // //       }
// // // //       console.log('Custom SMS Response:', smsResponse)
// // // //     } catch (error) {
// // // //       console.error('Error sending custom SMS:', error)
// // // //       setMessage(`Failed to send SMS: ${error.message}`)
// // // //       setAlertType('error')
// // // //     } finally {
// // // //       setTestSending(false)
// // // //     }
// // // //   }
// // // //   // Main function to send expiry reminders (ORIGINAL - keeps your existing logic)
// // // //   const sendExpiryReminders = async () => {
// // // //     setSmsSending(true)
// // // //     setMessage('')
// // // //     try {
// // // //       // Find documents expiring soon
// // // //       const reminders = []
// // // //       vehicles.forEach(vehicle => {
// // // //         if (vehicle.documents) {
// // // //           vehicle.documents.forEach(document => {
// // // //             if (!document.isExpired && isExpiringSoon(document.expiryDate, 7)) {
// // // //               // Try to get mobile numbers in order of preference
// // // //               const mobile = vehicle.ownerMobile || vehicle.driverMobile
// // // //               const recipientName = vehicle.ownerName || vehicle.driverName || 'Customer'
// // // //               if (mobile) {
// // // //                 reminders.push({
// // // //                   mobile,
// // // //                   vehicle,
// // // //                   document,
// // // //                   recipientName
// // // //                 })
// // // //               }
// // // //             }
// // // //           })
// // // //         }
// // // //       })
// // // //       if (reminders.length === 0) {
// // // //         setMessage('No expiring documents found for sending reminders.')
// // // //         setAlertType('info')
// // // //         return
// // // //       }
// // // //       // Send SMS for each reminder (limit to 5 as requested)
// // // //       const maxReminders = Math.min(reminders.length, 5)
// // // //       const results = []
// // // //       for (let i = 0; i < maxReminders; i++) {
// // // //         const reminder = reminders[i]
// // // //         try {
// // // //           const smsMessage = `Dear Customer, Your ${reminder.document.documentType} for vehicle ${reminder.vehicle.vehicleNo} (${reminder.vehicle.model}) is expiring on ${formatDate(reminder.document.expiryDate)}. Please renew it to avoid penalties.`
// // // //           const smsResponse = await sendSingleSMS(reminder.mobile, smsMessage)
// // // //           if (smsResponse.status === 'OK') {
// // // //             results.push({
// // // //               success: true,
// // // //               mobile: reminder.mobile,
// // // //               vehicleNo: reminder.vehicle.vehicleNo,
// // // //               message: 'SMS sent successfully'
// // // //             })
// // // //           } else {
// // // //             results.push({
// // // //               success: false,
// // // //               mobile: reminder.mobile,
// // // //               vehicleNo: reminder.vehicle.vehicleNo,
// // // //               message: smsResponse.message || 'Failed to send SMS'
// // // //             })
// // // //           }
// // // //           // Small delay between messages to avoid rate limiting
// // // //           await new Promise(resolve => setTimeout(resolve, 1000))
// // // //         } catch (error) {
// // // //           results.push({
// // // //             success: false,
// // // //             mobile: reminder.mobile,
// // // //             vehicleNo: reminder.vehicle.vehicleNo,
// // // //             message: error instanceof Error ? error.message : 'Unknown error'
// // // //           })
// // // //         }
// // // //       }
// // // //       // Process results
// // // //       const successful = results.filter(r => r.success).length
// // // //       const failed = results.filter(r => !r.success).length
// // // //       setMessage(`Sent ${successful} reminder(s) successfully. ${failed > 0 ? `${failed} failed.` : ''}`)
// // // //       setAlertType(successful > 0 ? 'success' : 'error')
// // // //       // Log detailed results
// // // //       console.log('SMS Sending Results:', results)
// // // //     } catch (error) {
// // // //       console.error('Error sending reminders:', error)
// // // //       setMessage('Failed to send reminders. Please try again.')
// // // //       setAlertType('error')
// // // //     } finally {
// // // //       setSmsSending(false)
// // // //     }
// // // //   }
// // // //   // Alternative: Send bulk SMS to all numbers at once
// // // //   const sendBulkExpiryReminders = async () => {
// // // //     setSmsSending(true)
// // // //     setMessage('')
// // // //     try {
// // // //       // Collect all mobile numbers with their messages
// // // //       const mobileMessages = {}
// // // //       vehicles.forEach(vehicle => {
// // // //         if (vehicle.documents) {
// // // //           vehicle.documents.forEach(document => {
// // // //             if (!document.isExpired && isExpiringSoon(document.expiryDate, 7)) {
// // // //               const mobile = vehicle.ownerMobile || vehicle.driverMobile
// // // //               if (mobile) {
// // // //                 const cleanMobile = mobile.replace(/\s+/g, '')
// // // //                 const smsMessage = `Dear Customer, Your ${document.documentType} for vehicle ${vehicle.vehicleNo} (${vehicle.model}) is expiring on ${formatDate(document.expiryDate)}. Please renew it to avoid penalties.`
// // // //                 // If multiple documents for same mobile, combine messages
// // // //                 if (mobileMessages[cleanMobile]) {
// // // //                   mobileMessages[cleanMobile] += ` Also, ${smsMessage}`
// // // //                 } else {
// // // //                   mobileMessages[cleanMobile] = smsMessage
// // // //                 }
// // // //               }
// // // //             }
// // // //           })
// // // //         }
// // // //       })
// // // //       // Take only first 5 mobiles (as requested)
// // // //       const mobileEntries = Object.entries(mobileMessages).slice(0, 5)
// // // //       if (mobileEntries.length === 0) {
// // // //         setMessage('No expiring documents found for sending reminders.')
// // // //         setAlertType('info')
// // // //         return
// // // //       }
// // // //       // For bulk SMS, we need to send the same message to all
// // // //       // So we'll create a generic message and send to all mobiles
// // // //       const mobiles = mobileEntries.map(([mobile]) => mobile)
// // // //       const bulkMessage = 'Reminder: Your vehicle document(s) are expiring soon. Please check your email or contact support for details.'
// // // //       const smsResponse = await sendBulkSMS(mobiles, bulkMessage)
// // // //       if (smsResponse.status === 'OK') {
// // // //         setMessage(`Successfully sent ${mobiles.length} reminder(s)`)
// // // //         setAlertType('success')
// // // //         console.log('Bulk SMS Response:', smsResponse)
// // // //       } else {
// // // //         setMessage(`Failed to send reminders: ${smsResponse.message}`)
// // // //         setAlertType('error')
// // // //       }
// // // //     } catch (error) {
// // // //       console.error('Error sending bulk reminders:', error)
// // // //       setMessage('Failed to send bulk reminders.')
// // // //       setAlertType('error')
// // // //     } finally {
// // // //       setSmsSending(false)
// // // //     }
// // // //   }
// // // //   // Fetch data on component mount
// // // //   useEffect(() => {
// // // //     fetchVehicles()
// // // //     // Set up interval to check every hour
// // // //     const interval = setInterval(fetchVehicles, 60 * 60 * 1000)
// // // //     return () => clearInterval(interval)
// // // //   }, [])
// // // //   return (
// // // //     <Card>
// // // //       <CardContent className='flex flex-col items-center text-center gap-4'>
// // // //         <i className='ri-lock-line text-[28px] text-textPrimary' />
// // // //         <Typography variant='h5'>Two Factor Authentication</Typography>
// // // //         <Typography color='text.primary'>
// // // //           Enhance your application security by enabling two factor authentication.
// // // //         </Typography>
// // // //         {/* Original Dialog Button */}
// // // //         <OpenDialogOnElementClick element={Button} elementProps={buttonProps} dialog={TwoFactorAuth} />
// // // //         {/* Vehicle Data Section */}
// // // //         <Box sx={{ mt: 4, width: '100%', textAlign: 'left' }}>
// // // //           <Typography variant='h6' gutterBottom>
// // // //             Vehicle Document Expiry Check & SMS Testing
// // // //           </Typography>
// // // //           {loading ? (
// // // //             <Box display="flex" justifyContent="center" my={2}>
// // // //               <CircularProgress />
// // // //             </Box>
// // // //           ) : (
// // // //             <>
// // // //               {/* Alert Message */}
// // // //               {message && (
// // // //                 <Alert severity={alertType} sx={{ mb: 2 }}>
// // // //                   {message}
// // // //                 </Alert>
// // // //               )}
// // // //               {/* Summary */}
// // // //               <Typography variant='body2' paragraph>
// // // //                 Total Vehicles: {vehicles.length}
// // // //               </Typography>
// // // //               {/* TEST SMS SECTION */}
// // // //               <Box sx={{ mt: 3, mb: 3, p: 2, border: '1px dashed', borderColor: 'primary.main', borderRadius: 1 }}>
// // // //                 <Typography variant='subtitle2' gutterBottom color="primary">
// // // //                   📱 SMS Testing Section
// // // //                 </Typography>
// // // //                 {/* Custom Mobile Input */}
// // // //                 <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
// // // //                   <TextField
// // // //                     size="small"
// // // //                     label="Enter Mobile Number"
// // // //                     value={testMobile}
// // // //                     onChange={(e) => setTestMobile(e.target.value)}
// // // //                     placeholder="e.g., 9876543210"
// // // //                     sx={{ flexGrow: 1 }}
// // // //                   />
// // // //                   <Button
// // // //                     variant="contained"
// // // //                     color="primary"
// // // //                     onClick={sendCustomSMS}
// // // //                     disabled={testSending || !testMobile.trim()}
// // // //                     startIcon={testSending ? <CircularProgress size={20} /> : null}
// // // //                   >
// // // //                     {testSending ? 'Sending...' : 'Send Test SMS'}
// // // //                   </Button>
// // // //                 </Box>
// // // //                 {/* Hardcoded Test Numbers */}
// // // //                 <Typography variant='caption' color="text.secondary" display="block" gutterBottom>
// // // //                   Hardcoded Test Numbers: {HARDCODED_TEST_NUMBERS.join(', ')}
// // // //                 </Typography>
// // // //                 <Button
// // // //                   variant="outlined"
// // // //                   color="secondary"
// // // //                   onClick={sendTestSMS}
// // // //                   disabled={testSending}
// // // //                   startIcon={testSending ? <CircularProgress size={20} /> : null}
// // // //                   size="small"
// // // //                   sx={{ mt: 1 }}
// // // //                 >
// // // //                   {testSending ? 'Sending...' : 'Send Test SMS to All Numbers'}
// // // //                 </Button>
// // // //               </Box>
// // // //               {/* Send Reminders Button */}
// // // //               <Typography variant='subtitle2' gutterBottom sx={{ mt: 2 }}>
// // // //                 Send Expiry Reminders
// // // //               </Typography>
// // // //               <Box sx={{ display: 'flex', gap: 2, mt: 1, flexWrap: 'wrap' }}>
// // // //                 <Button
// // // //                   variant="contained"
// // // //                   color="primary"
// // // //                   onClick={sendExpiryReminders}
// // // //                   disabled={smsSending || vehicles.length === 0}
// // // //                   startIcon={smsSending ? <CircularProgress size={20} /> : null}
// // // //                 >
// // // //                   {smsSending ? 'Sending...' : 'Send Expiry Reminders'}
// // // //                 </Button>
// // // //                 <Button
// // // //                   variant="outlined"
// // // //                   color="secondary"
// // // //                   onClick={sendBulkExpiryReminders}
// // // //                   disabled={smsSending || vehicles.length === 0}
// // // //                   startIcon={smsSending ? <CircularProgress size={20} /> : null}
// // // //                 >
// // // //                   Send Bulk Reminders
// // // //                 </Button>
// // // //                 <Button
// // // //                   variant="text"
// // // //                   onClick={fetchVehicles}
// // // //                   disabled={loading}
// // // //                 >
// // // //                   Refresh Data
// // // //                 </Button>
// // // //               </Box>
// // // //               {/* Quick Stats */}
// // // //               {vehicles.length > 0 && (
// // // //                 <Box sx={{ mt: 3, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
// // // //                   <Typography variant='subtitle2' gutterBottom>
// // // //                     Document Status Overview:
// // // //                   </Typography>
// // // //                   <Typography variant='caption' component='div'>
// // // //                     • Vehicles with documents: {vehicles.filter(v => v.documents && v.documents.length > 0).length}
// // // //                   </Typography>
// // // //                   <Typography variant='caption' component='div'>
// // // //                     • Expired documents: {vehicles.reduce((count, v) =>
// // // //                       count + (v.documents ? v.documents.filter(d => d.isExpired).length : 0), 0)}
// // // //                   </Typography>
// // // //                   <Typography variant='caption' component='div'>
// // // //                     • Expiring within 7 days: {vehicles.reduce((count, v) =>
// // // //                       count + (v.documents ? v.documents.filter(d =>
// // // //                         !d.isExpired && isExpiringSoon(d.expiryDate, 7)).length : 0), 0)}
// // // //                   </Typography>
// // // //                 </Box>
// // // //               )}
// // // //             </>
// // // //           )}
// // // //         </Box>
// // // //       </CardContent>
// // // //     </Card>
// // // //   )
// // // // }
// // // // export default DialogAuthentication
// // // 'use client'
// // // // MUI Imports
// // // import Card from '@mui/material/Card'
// // // import Button from '@mui/material/Button'
// // // import CardContent from '@mui/material/CardContent'
// // // import Typography from '@mui/material/Typography'
// // // import Box from '@mui/material/Box'
// // // import Alert from '@mui/material/Alert'
// // // import CircularProgress from '@mui/material/CircularProgress'
// // // import TextField from '@mui/material/TextField'
// // // // Component Imports
// // // import TwoFactorAuth from '@components/dialogs/two-factor-auth'
// // // import OpenDialogOnElementClick from '@components/dialogs/OpenDialogOnElementClick'
// // // import { useState, useEffect } from 'react'
// // // const DialogAuthentication = () => {
// // //   // State variables
// // //   const [vehicles, setVehicles] = useState([])
// // //   const [loading, setLoading] = useState(true)
// // //   const [smsSending, setSmsSending] = useState(false)
// // //   const [testSending, setTestSending] = useState(false)
// // //   const [message, setMessage] = useState('')
// // //   const [alertType, setAlertType] = useState('info')
// // //   const [testMobile, setTestMobile] = useState('')
// // //   // Hardcoded test mobile numbers
// // //   const HARDCODED_TEST_NUMBERS = ['919284834754', '917773937764', '919823251105']
// // //   // Use your proxy endpoint
// // //   const SMS_API_ENDPOINT = '/api/sms-proxy/http-api-post.php'
// // //   const SMS_API_KEY = 'dCe2ItQ23Vn4RTOv'
// // //   const SENDER_ID = 'MILKCL'
// // //   // Button props
// // //   const buttonProps = {
// // //     variant: 'contained',
// // //     children: 'Show'
// // //   }
// // //   // Function to check if a document expires within X days
// // //   const isExpiringSoon = (expiryDate, daysThreshold = 7) => {
// // //     const expiry = new Date(expiryDate)
// // //     const today = new Date()
// // //     const timeDiff = expiry.getTime() - today.getTime()
// // //     const dayDiff = Math.ceil(timeDiff / (1000 * 3600 * 24))
// // //     return dayDiff <= daysThreshold && dayDiff > 0
// // //   }
// // //   // Function to format date
// // //   const formatDate = (dateString) => {
// // //     const date = new Date(dateString)
// // //     return date.toLocaleDateString('en-IN', {
// // //       day: '2-digit',
// // //       month: 'short',
// // //       year: 'numeric'
// // //     })
// // //   }
// // //   // Fetch vehicles data
// // //   const fetchVehicles = async () => {
// // //     try {
// // //       setLoading(true)
// // //       const response = await fetch('https://srtransport.vercel.app/api/apps/vehicles')
// // //       const result = await response.json()
// // //       if (result.success && result.data) {
// // //         setVehicles(result.data)
// // //         checkExpiringDocuments(result.data)
// // //       }
// // //     } catch (error) {
// // //       console.error('Error fetching vehicles:', error)
// // //       setMessage('Failed to fetch vehicles data')
// // //       setAlertType('error')
// // //     } finally {
// // //       setLoading(false)
// // //     }
// // //   }
// // //   // Check for expiring documents
// // //   const checkExpiringDocuments = (vehiclesData) => {
// // //     const today = new Date()
// // //     const expiringSoon = []
// // //     vehiclesData.forEach(vehicle => {
// // //       if (vehicle.documents) {
// // //         vehicle.documents.forEach(document => {
// // //           if (!document.isExpired && isExpiringSoon(document.expiryDate, 7)) {
// // //             expiringSoon.push({ vehicle, document })
// // //           }
// // //         })
// // //       }
// // //     })
// // //     if (expiringSoon.length > 0) {
// // //       const msg = `Found ${expiringSoon.length} document(s) expiring soon. Check console for details.`
// // //       setMessage(msg)
// // //       setAlertType('info')
// // //       expiringSoon.forEach(({ vehicle, document }) => {
// // //         console.log(`Vehicle ${vehicle.vehicleNo} (${vehicle.model}): ${document.documentType} expires on ${formatDate(document.expiryDate)}`)
// // //       })
// // //     } else {
// // //       setMessage('No documents expiring in the next 7 days.')
// // //       setAlertType('info')
// // //     }
// // //   }
// // //   // Send SMS via proxy
// // //   const sendSingleSMS = async (mobile, messageText) => {
// // //     const cleanMobile = mobile.replace(/\s+/g, '')
// // //     const smsData = {
// // //       apikey: SMS_API_KEY,
// // //       senderid: SENDER_ID,
// // //       number: cleanMobile,
// // //       message: messageText,
// // //       format: 'json'
// // //     }
// // //     try {
// // //       const response = await fetch(SMS_API_ENDPOINT, {
// // //         method: 'POST',
// // //         headers: {
// // //           'Content-Type': 'application/json',
// // //         },
// // //         body: JSON.stringify(smsData)
// // //       })
// // //       const result = await response.json()
// // //       return result
// // //     } catch (error) {
// // //       throw new Error(`Failed to send SMS: ${error.message}`)
// // //     }
// // //   }
// // //   // Send bulk SMS
// // //   const sendBulkSMS = async (mobiles, messageText) => {
// // //     const cleanMobiles = mobiles.map(m => m.replace(/\s+/g, '')).join(',')
// // //     const smsData = {
// // //       apikey: SMS_API_KEY,
// // //       senderid: SENDER_ID,
// // //       number: cleanMobiles,
// // //       message: messageText,
// // //       format: 'json'
// // //     }
// // //     try {
// // //       const response = await fetch(SMS_API_ENDPOINT, {
// // //         method: 'POST',
// // //         headers: {
// // //           'Content-Type': 'application/json',
// // //         },
// // //         body: JSON.stringify(smsData)
// // //       })
// // //       return await response.json()
// // //     } catch (error) {
// // //       throw new Error(`Failed to send bulk SMS: ${error.message}`)
// // //     }
// // //   }
// // //   // Test SMS to hardcoded numbers
// // //   const sendTestSMS = async () => {
// // //     setTestSending(true)
// // //     setMessage('')
// // //     try {
// // //       // Send to all hardcoded numbers in bulk
// // //       const testMessage = 'Test SMS from Milk Collection System. Please ignore.'
// // //       const smsResponse = await sendBulkSMS(HARDCODED_TEST_NUMBERS, testMessage)
// // //       if (smsResponse.status === 'OK') {
// // //         setMessage(`Test SMS sent successfully to ${HARDCODED_TEST_NUMBERS.length} numbers`)
// // //         setAlertType('success')
// // //       } else {
// // //         setMessage(`Failed to send SMS: ${smsResponse.message}`)
// // //         setAlertType('error')
// // //       }
// // //       console.log('Test SMS Response:', smsResponse)
// // //     } catch (error) {
// // //       console.error('Error sending test SMS:', error)
// // //       setMessage(`Failed to send test SMS: ${error.message}`)
// // //       setAlertType('error')
// // //     } finally {
// // //       setTestSending(false)
// // //     }
// // //   }
// // //   // Send SMS to custom mobile number
// // //   const sendCustomSMS = async () => {
// // //     if (!testMobile.trim()) {
// // //       setMessage('Please enter a mobile number')
// // //       setAlertType('error')
// // //       return
// // //     }
// // //     setTestSending(true)
// // //     setMessage('')
// // //     try {
// // //       const testMessage = `Test SMS from Milk Collection System. This is a test message to verify SMS functionality. Please ignore.`
// // //       const smsResponse = await sendSingleSMS(testMobile, testMessage)
// // //       if (smsResponse.status === 'OK') {
// // //         setMessage(`Test SMS sent successfully to ${testMobile}`)
// // //         setAlertType('success')
// // //       } else {
// // //         setMessage(`Failed to send SMS: ${smsResponse.message}`)
// // //         setAlertType('error')
// // //       }
// // //       console.log('Custom SMS Response:', smsResponse)
// // //     } catch (error) {
// // //       console.error('Error sending custom SMS:', error)
// // //       setMessage(`Failed to send SMS: ${error.message}`)
// // //       setAlertType('error')
// // //     } finally {
// // //       setTestSending(false)
// // //     }
// // //   }
// // //   // Main function to send expiry reminders
// // //   const sendExpiryReminders = async () => {
// // //     setSmsSending(true)
// // //     setMessage('')
// // //     try {
// // //       // Find documents expiring soon
// // //       const reminders = []
// // //       vehicles.forEach(vehicle => {
// // //         if (vehicle.documents) {
// // //           vehicle.documents.forEach(document => {
// // //             if (!document.isExpired && isExpiringSoon(document.expiryDate, 7)) {
// // //               const mobile = vehicle.ownerMobile || vehicle.driverMobile
// // //               if (mobile) {
// // //                 reminders.push({
// // //                   mobile,
// // //                   vehicle,
// // //                   document
// // //                 })
// // //               }
// // //             }
// // //           })
// // //         }
// // //       })
// // //       if (reminders.length === 0) {
// // //         setMessage('No expiring documents found for sending reminders.')
// // //         setAlertType('info')
// // //         return
// // //       }
// // //       // Send SMS for each reminder (limit to 5 as requested)
// // //       const maxReminders = Math.min(reminders.length, 5)
// // //       const results = []
// // //       for (let i = 0; i < maxReminders; i++) {
// // //         const reminder = reminders[i]
// // //         try {
// // //           const smsMessage = `Dear Customer, Your ${reminder.document.documentType} for vehicle ${reminder.vehicle.vehicleNo} (${reminder.vehicle.model}) is expiring on ${formatDate(reminder.document.expiryDate)}. Please renew it to avoid penalties.`
// // //           const smsResponse = await sendSingleSMS(reminder.mobile, smsMessage)
// // //           if (smsResponse.status === 'OK') {
// // //             results.push({
// // //               success: true,
// // //               mobile: reminder.mobile,
// // //               vehicleNo: reminder.vehicle.vehicleNo,
// // //               message: 'SMS sent successfully'
// // //             })
// // //           } else {
// // //             results.push({
// // //               success: false,
// // //               mobile: reminder.mobile,
// // //               vehicleNo: reminder.vehicle.vehicleNo,
// // //               message: smsResponse.message || 'Failed to send SMS'
// // //             })
// // //           }
// // //           // Small delay between messages
// // //           await new Promise(resolve => setTimeout(resolve, 500))
// // //         } catch (error) {
// // //           results.push({
// // //             success: false,
// // //             mobile: reminder.mobile,
// // //             vehicleNo: reminder.vehicle.vehicleNo,
// // //             message: error.message || 'Unknown error'
// // //           })
// // //         }
// // //       }
// // //       // Process results
// // //       const successful = results.filter(r => r.success).length
// // //       const failed = results.filter(r => !r.success).length
// // //       setMessage(`Sent ${successful} reminder(s) successfully. ${failed > 0 ? `${failed} failed.` : ''}`)
// // //       setAlertType(successful > 0 ? 'success' : 'error')
// // //       console.log('SMS Sending Results:', results)
// // //     } catch (error) {
// // //       console.error('Error sending reminders:', error)
// // //       setMessage('Failed to send reminders. Please try again.')
// // //       setAlertType('error')
// // //     } finally {
// // //       setSmsSending(false)
// // //     }
// // //   }
// // //   // Alternative: Send bulk SMS to all numbers at once
// // //   const sendBulkExpiryReminders = async () => {
// // //     setSmsSending(true)
// // //     setMessage('')
// // //     try {
// // //       // Collect all mobile numbers
// // //       const mobiles = []
// // //       vehicles.forEach(vehicle => {
// // //         if (vehicle.documents) {
// // //           vehicle.documents.forEach(document => {
// // //             if (!document.isExpired && isExpiringSoon(document.expiryDate, 7)) {
// // //               const mobile = vehicle.ownerMobile || vehicle.driverMobile
// // //               if (mobile && !mobiles.includes(mobile)) {
// // //                 mobiles.push(mobile)
// // //               }
// // //             }
// // //           })
// // //         }
// // //       })
// // //       // Take only first 5 mobiles (as requested)
// // //       const mobilesToSend = mobiles.slice(0, 5)
// // //       if (mobilesToSend.length === 0) {
// // //         setMessage('No expiring documents found for sending reminders.')
// // //         setAlertType('info')
// // //         return
// // //       }
// // //       // Send bulk message
// // //       const bulkMessage = 'Reminder: Your vehicle document(s) are expiring soon. Please check your email or contact support for details.'
// // //       const smsResponse = await sendBulkSMS(mobilesToSend, bulkMessage)
// // //       if (smsResponse.status === 'OK') {
// // //         setMessage(`Successfully sent reminders to ${mobilesToSend.length} numbers`)
// // //         setAlertType('success')
// // //       } else {
// // //         setMessage(`Failed to send reminders: ${smsResponse.message}`)
// // //         setAlertType('error')
// // //       }
// // //       console.log('Bulk SMS Response:', smsResponse)
// // //     } catch (error) {
// // //       console.error('Error sending bulk reminders:', error)
// // //       setMessage('Failed to send bulk reminders.')
// // //       setAlertType('error')
// // //     } finally {
// // //       setSmsSending(false)
// // //     }
// // //   }
// // //   // Fetch data on component mount
// // //   useEffect(() => {
// // //     fetchVehicles()
// // //     // Set up interval to check every hour
// // //     const interval = setInterval(fetchVehicles, 60 * 60 * 1000)
// // //     return () => clearInterval(interval)
// // //   }, [])
// // //   return (
// // //     <Card>
// // //       <CardContent className='flex flex-col items-center text-center gap-4'>
// // //         <i className='ri-lock-line text-[28px] text-textPrimary' />
// // //         <Typography variant='h5'>Two Factor Authentication</Typography>
// // //         <Typography color='text.primary'>
// // //           Enhance your application security by enabling two factor authentication.
// // //         </Typography>
// // //         {/* Original Dialog Button */}
// // //         <OpenDialogOnElementClick element={Button} elementProps={buttonProps} dialog={TwoFactorAuth} />
// // //         {/* Vehicle Data Section */}
// // //         <Box sx={{ mt: 4, width: '100%', textAlign: 'left' }}>
// // //           <Typography variant='h6' gutterBottom>
// // //             Vehicle Document Expiry Check & SMS Testing
// // //           </Typography>
// // //           {loading ? (
// // //             <Box display="flex" justifyContent="center" my={2}>
// // //               <CircularProgress />
// // //             </Box>
// // //           ) : (
// // //             <>
// // //               {/* Alert Message */}
// // //               {message && (
// // //                 <Alert severity={alertType} sx={{ mb: 2 }}>
// // //                   {message}
// // //                 </Alert>
// // //               )}
// // //               {/* Summary */}
// // //               <Typography variant='body2' paragraph>
// // //                 Total Vehicles: {vehicles.length}
// // //               </Typography>
// // //               {/* TEST SMS SECTION */}
// // //               <Box sx={{ mt: 3, mb: 3, p: 2, border: '1px dashed', borderColor: 'primary.main', borderRadius: 1 }}>
// // //                 <Typography variant='subtitle2' gutterBottom color="primary">
// // //                   📱 SMS Testing Section
// // //                 </Typography>
// // //                 {/* Custom Mobile Input */}
// // //                 <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
// // //                   <TextField
// // //                     size="small"
// // //                     label="Enter Mobile Number"
// // //                     value={testMobile}
// // //                     onChange={(e) => setTestMobile(e.target.value)}
// // //                     placeholder="e.g., 9876543210"
// // //                     sx={{ flexGrow: 1 }}
// // //                   />
// // //                   <Button
// // //                     variant="contained"
// // //                     color="primary"
// // //                     onClick={sendCustomSMS}
// // //                     disabled={testSending || !testMobile.trim()}
// // //                     startIcon={testSending ? <CircularProgress size={20} /> : null}
// // //                   >
// // //                     {testSending ? 'Sending...' : 'Send Test SMS'}
// // //                   </Button>
// // //                 </Box>
// // //                 {/* Hardcoded Test Numbers */}
// // //                 <Typography variant='caption' color="text.secondary" display="block" gutterBottom>
// // //                   Hardcoded Test Numbers: {HARDCODED_TEST_NUMBERS.join(', ')}
// // //                 </Typography>
// // //                 <Button
// // //                   variant="outlined"
// // //                   color="secondary"
// // //                   onClick={sendTestSMS}
// // //                   disabled={testSending}
// // //                   startIcon={testSending ? <CircularProgress size={20} /> : null}
// // //                   size="small"
// // //                   sx={{ mt: 1 }}
// // //                 >
// // //                   {testSending ? 'Sending...' : 'Send Test SMS to All Numbers'}
// // //                 </Button>
// // //               </Box>
// // //               {/* Send Reminders Button */}
// // //               <Typography variant='subtitle2' gutterBottom sx={{ mt: 2 }}>
// // //                 Send Expiry Reminders
// // //               </Typography>
// // //               <Box sx={{ display: 'flex', gap: 2, mt: 1, flexWrap: 'wrap' }}>
// // //                 <Button
// // //                   variant="contained"
// // //                   color="primary"
// // //                   onClick={sendExpiryReminders}
// // //                   disabled={smsSending || vehicles.length === 0}
// // //                   startIcon={smsSending ? <CircularProgress size={20} /> : null}
// // //                 >
// // //                   {smsSending ? 'Sending...' : 'Send Expiry Reminders'}
// // //                 </Button>
// // //                 <Button
// // //                   variant="outlined"
// // //                   color="secondary"
// // //                   onClick={sendBulkExpiryReminders}
// // //                   disabled={smsSending || vehicles.length === 0}
// // //                   startIcon={smsSending ? <CircularProgress size={20} /> : null}
// // //                 >
// // //                   Send Bulk Reminders
// // //                 </Button>
// // //                 <Button
// // //                   variant="text"
// // //                   onClick={fetchVehicles}
// // //                   disabled={loading}
// // //                 >
// // //                   Refresh Data
// // //                 </Button>
// // //               </Box>
// // //               {/* Quick Stats */}
// // //               {vehicles.length > 0 && (
// // //                 <Box sx={{ mt: 3, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
// // //                   <Typography variant='subtitle2' gutterBottom>
// // //                     Document Status Overview:
// // //                   </Typography>
// // //                   <Typography variant='caption' component='div'>
// // //                     • Vehicles with documents: {vehicles.filter(v => v.documents && v.documents.length > 0).length}
// // //                   </Typography>
// // //                   <Typography variant='caption' component='div'>
// // //                     • Expired documents: {vehicles.reduce((count, v) =>
// // //                       count + (v.documents ? v.documents.filter(d => d.isExpired).length : 0), 0)}
// // //                   </Typography>
// // //                   <Typography variant='caption' component='div'>
// // //                     • Expiring within 7 days: {vehicles.reduce((count, v) =>
// // //                       count + (v.documents ? v.documents.filter(d =>
// // //                         !d.isExpired && isExpiringSoon(d.expiryDate, 7)).length : 0), 0)}
// // //                   </Typography>
// // //                 </Box>
// // //               )}
// // //             </>
// // //           )}
// // //         </Box>
// // //       </CardContent>
// // //     </Card>
// // //   )
// // // }
// // // export default DialogAuthentication
// // 'use client'
// // // MUI Imports
// // import Card from '@mui/material/Card'
// // import Button from '@mui/material/Button'
// // import CardContent from '@mui/material/CardContent'
// // import Typography from '@mui/material/Typography'
// // import Box from '@mui/material/Box'
// // import Alert from '@mui/material/Alert'
// // import CircularProgress from '@mui/material/CircularProgress'
// // import TextField from '@mui/material/TextField'
// // import Grid from '@mui/material/Grid'
// // // Component Imports
// // import TwoFactorAuth from '@components/dialogs/two-factor-auth'
// // import OpenDialogOnElementClick from '@components/dialogs/OpenDialogOnElementClick'
// // import { useState, useEffect } from 'react'
// // const DialogAuthentication = () => {
// //   // State variables
// //   const [vehicles, setVehicles] = useState([])
// //   const [loading, setLoading] = useState(true)
// //   const [smsSending, setSmsSending] = useState(false)
// //   const [testSending, setTestSending] = useState(false)
// //   const [message, setMessage] = useState('')
// //   const [alertType, setAlertType] = useState('info')
// //   const [debugInfo, setDebugInfo] = useState('')
// //   // Manual mobile inputs
// //   const [mobile1, setMobile1] = useState('919284834754')
// //   const [mobile2, setMobile2] = useState('917773937764')
// //   const [mobile3, setMobile3] = useState('919823251105')
// //   const [customMobile, setCustomMobile] = useState('')
// //   // Message inputs
// //   const [testMessage, setTestMessage] = useState('Test SMS from Milk Collection System')
// //   const [expiryMessage, setExpiryMessage] = useState('Your vehicle document is expiring soon. Please renew.')
// //   // Use your proxy endpoint
// //   const SMS_API_ENDPOINT = '/api/sms-proxy/http-api-post.php'
// //   const SMS_API_KEY = 'dCe2ItQ23Vn4RTOv'
// //   const SENDER_ID = 'MILKCL'
// //   // Button props
// //   const buttonProps = {
// //     variant: 'contained',
// //     children: 'Show'
// //   }
// //   // Function to check if a document expires within X days
// //   const isExpiringSoon = (expiryDate, daysThreshold = 7) => {
// //     if (!expiryDate) return false
// //     const expiry = new Date(expiryDate)
// //     const today = new Date()
// //     // Validate dates
// //     if (isNaN(expiry.getTime())) {
// //       return false
// //     }
// //     // Reset times to compare dates only
// //     today.setHours(0, 0, 0, 0)
// //     expiry.setHours(0, 0, 0, 0)
// //     const timeDiff = expiry.getTime() - today.getTime()
// //     const dayDiff = Math.ceil(timeDiff / (1000 * 3600 * 24))
// //     return dayDiff <= daysThreshold && dayDiff > 0
// //   }
// //   // Fetch vehicles data
// //   const fetchVehicles = async () => {
// //     try {
// //       setLoading(true)
// //       const response = await fetch('https://srtransport.vercel.app/api/apps/vehicles')
// //       const result = await response.json()
// //       if (result.success && result.data) {
// //         setVehicles(result.data)
// //         // Count expiring documents
// //         const expiringCount = result.data.reduce((count, vehicle) => {
// //           if (vehicle.documents) {
// //             return count + vehicle.documents.filter(doc =>
// //               !doc.isExpired && isExpiringSoon(doc.expiryDate, 7)
// //             ).length
// //           }
// //           return count
// //         }, 0)
// //         if (expiringCount > 0) {
// //           setMessage(`Found ${expiringCount} document(s) expiring soon`)
// //           setAlertType('info')
// //         }
// //       }
// //     } catch (error) {
// //       console.error('Error fetching vehicles:', error)
// //     } finally {
// //       setLoading(false)
// //     }
// //   }
// //   // Send SMS via proxy
// //   const sendSingleSMS = async (mobile, messageText) => {
// //     const cleanMobile = mobile.replace(/\s+/g, '')
// //     console.log(`Sending SMS to ${cleanMobile}`)
// //     const smsData = {
// //       apikey: SMS_API_KEY,
// //       senderid: SENDER_ID,
// //       number: cleanMobile,
// //       message: messageText,
// //       format: 'json'
// //     }
// //     console.log('SMS Request:', smsData)
// //     try {
// //       const response = await fetch(SMS_API_ENDPOINT, {
// //         method: 'POST',
// //         headers: {
// //           'Content-Type': 'application/json',
// //         },
// //         body: JSON.stringify(smsData)
// //       })
// //       const result = await response.json()
// //       console.log('SMS Response:', result)
// //       return result
// //     } catch (error) {
// //       console.error('Failed to send SMS:', error)
// //       throw new Error(`Failed to send SMS: ${error.message}`)
// //     }
// //   }
// //   // Send bulk SMS
// //   const sendBulkSMS = async (mobiles, messageText) => {
// //     const cleanMobiles = mobiles.filter(m => m.trim()).map(m => m.replace(/\s+/g, '')).join(',')
// //     console.log(`Sending bulk SMS to: ${cleanMobiles}`)
// //     const smsData = {
// //       apikey: SMS_API_KEY,
// //       senderid: SENDER_ID,
// //       number: cleanMobiles,
// //       message: messageText,
// //       format: 'json'
// //     }
// //     console.log('Bulk SMS Request:', smsData)
// //     try {
// //       const response = await fetch(SMS_API_ENDPOINT, {
// //         method: 'POST',
// //         headers: {
// //           'Content-Type': 'application/json',
// //         },
// //         body: JSON.stringify(smsData)
// //       })
// //       const result = await response.json()
// //       console.log('Bulk SMS Response:', result)
// //       return result
// //     } catch (error) {
// //       console.error('Failed to send bulk SMS:', error)
// //       throw new Error(`Failed to send bulk SMS: ${error.message}`)
// //     }
// //   }
// //   // 1. Send test SMS to single mobile
// //   const sendTestToSingle = async () => {
// //     if (!customMobile.trim()) {
// //       setMessage('Please enter a mobile number')
// //       setAlertType('error')
// //       return
// //     }
// //     setTestSending(true)
// //     setMessage('')
// //     setDebugInfo('')
// //     try {
// //       const smsResponse = await sendSingleSMS(customMobile, testMessage)
// //       if (smsResponse.status === 'OK') {
// //         setMessage(`Test SMS sent to ${customMobile}`)
// //         setAlertType('success')
// //         setDebugInfo(JSON.stringify(smsResponse, null, 2))
// //       } else {
// //         setMessage(`Failed: ${smsResponse.message}`)
// //         setAlertType('error')
// //         setDebugInfo(JSON.stringify(smsResponse, null, 2))
// //       }
// //     } catch (error) {
// //       setMessage(`Error: ${error.message}`)
// //       setAlertType('error')
// //       setDebugInfo(error.toString())
// //     } finally {
// //       setTestSending(false)
// //     }
// //   }
// //   // 2. Send test SMS to all 3 numbers
// //   const sendTestToAll = async () => {
// //     const mobiles = [mobile1, mobile2, mobile3].filter(m => m.trim())
// //     if (mobiles.length === 0) {
// //       setMessage('Please enter at least one mobile number')
// //       setAlertType('error')
// //       return
// //     }
// //     setTestSending(true)
// //     setMessage('')
// //     setDebugInfo('')
// //     try {
// //       const smsResponse = await sendBulkSMS(mobiles, testMessage)
// //       if (smsResponse.status === 'OK') {
// //         setMessage(`Test SMS sent to ${mobiles.length} numbers`)
// //         setAlertType('success')
// //         setDebugInfo(`Numbers: ${mobiles.join(', ')}\nResponse: ${JSON.stringify(smsResponse, null, 2)}`)
// //       } else {
// //         setMessage(`Failed: ${smsResponse.message}`)
// //         setAlertType('error')
// //         setDebugInfo(JSON.stringify(smsResponse, null, 2))
// //       }
// //     } catch (error) {
// //       setMessage(`Error: ${error.message}`)
// //       setAlertType('error')
// //       setDebugInfo(error.toString())
// //     } finally {
// //       setTestSending(false)
// //     }
// //   }
// //   // 3. Send expiry SMS to single mobile
// //   const sendExpiryToSingle = async () => {
// //     if (!customMobile.trim()) {
// //       setMessage('Please enter a mobile number')
// //       setAlertType('error')
// //       return
// //     }
// //     setSmsSending(true)
// //     setMessage('')
// //     setDebugInfo('')
// //     try {
// //       const smsResponse = await sendSingleSMS(customMobile, expiryMessage)
// //       if (smsResponse.status === 'OK') {
// //         setMessage(`Expiry SMS sent to ${customMobile}`)
// //         setAlertType('success')
// //         setDebugInfo(JSON.stringify(smsResponse, null, 2))
// //       } else {
// //         setMessage(`Failed: ${smsResponse.message}`)
// //         setAlertType('error')
// //         setDebugInfo(JSON.stringify(smsResponse, null, 2))
// //       }
// //     } catch (error) {
// //       setMessage(`Error: ${error.message}`)
// //       setAlertType('error')
// //       setDebugInfo(error.toString())
// //     } finally {
// //       setSmsSending(false)
// //     }
// //   }
// //   // 4. Send expiry SMS to all 3 numbers
// //   const sendExpiryToAll = async () => {
// //     const mobiles = [mobile1, mobile2, mobile3].filter(m => m.trim())
// //     if (mobiles.length === 0) {
// //       setMessage('Please enter at least one mobile number')
// //       setAlertType('error')
// //       return
// //     }
// //     setSmsSending(true)
// //     setMessage('')
// //     setDebugInfo('')
// //     try {
// //       const smsResponse = await sendBulkSMS(mobiles, expiryMessage)
// //       if (smsResponse.status === 'OK') {
// //         setMessage(`Expiry SMS sent to ${mobiles.length} numbers`)
// //         setAlertType('success')
// //         setDebugInfo(`Numbers: ${mobiles.join(', ')}\nResponse: ${JSON.stringify(smsResponse, null, 2)}`)
// //       } else {
// //         setMessage(`Failed: ${smsResponse.message}`)
// //         setAlertType('error')
// //         setDebugInfo(JSON.stringify(smsResponse, null, 2))
// //       }
// //     } catch (error) {
// //       setMessage(`Error: ${error.message}`)
// //       setAlertType('error')
// //       setDebugInfo(error.toString())
// //     } finally {
// //       setSmsSending(false)
// //     }
// //   }
// //   // Fetch data on component mount
// //   useEffect(() => {
// //     fetchVehicles()
// //   }, [])
// //   return (
// //     <Card>
// //       <CardContent className='flex flex-col items-center text-center gap-4'>
// //         <i className='ri-lock-line text-[28px] text-textPrimary' />
// //         <Typography variant='h5'>Two Factor Authentication</Typography>
// //         <Typography color='text.primary'>
// //           Enhance your application security by enabling two factor authentication.
// //         </Typography>
// //         {/* Original Dialog Button */}
// //         <OpenDialogOnElementClick element={Button} elementProps={buttonProps} dialog={TwoFactorAuth} />
// //         {/* SMS Testing Section */}
// //         <Box sx={{ mt: 4, width: '100%', textAlign: 'left' }}>
// //           <Typography variant='h6' gutterBottom>
// //             📱 Manual SMS Testing (API Trigger)
// //           </Typography>
// //           {/* Alert Message */}
// //           {message && (
// //             <Alert severity={alertType} sx={{ mb: 2 }}>
// //               {message}
// //             </Alert>
// //           )}
// //           {/* Debug Info */}
// //           {debugInfo && (
// //             <Box sx={{
// //               mb: 2,
// //               p: 2,
// //               bgcolor: 'grey.100',
// //               borderRadius: 1,
// //               fontSize: '0.75rem',
// //               fontFamily: 'monospace',
// //               whiteSpace: 'pre-wrap',
// //               maxHeight: '200px',
// //               overflow: 'auto'
// //             }}>
// //               <Typography variant='caption' color="text.secondary">API Response:</Typography>
// //               <div>{debugInfo}</div>
// //             </Box>
// //           )}
// //           {/* Mobile Inputs */}
// //           <Grid container spacing={2} sx={{ mb: 3 }}>
// //             <Grid item xs={12} md={4}>
// //               <TextField
// //                 fullWidth
// //                 size="small"
// //                 label="Mobile 1"
// //                 value={mobile1}
// //                 onChange={(e) => setMobile1(e.target.value)}
// //                 placeholder="919284834754"
// //               />
// //             </Grid>
// //             <Grid item xs={12} md={4}>
// //               <TextField
// //                 fullWidth
// //                 size="small"
// //                 label="Mobile 2"
// //                 value={mobile2}
// //                 onChange={(e) => setMobile2(e.target.value)}
// //                 placeholder="917773937764"
// //               />
// //             </Grid>
// //             <Grid item xs={12} md={4}>
// //               <TextField
// //                 fullWidth
// //                 size="small"
// //                 label="Mobile 3"
// //                 value={mobile3}
// //                 onChange={(e) => setMobile3(e.target.value)}
// //                 placeholder="919823251105"
// //               />
// //             </Grid>
// //             <Grid item xs={12}>
// //               <TextField
// //                 fullWidth
// //                 size="small"
// //                 label="Custom Mobile"
// //                 value={customMobile}
// //                 onChange={(e) => setCustomMobile(e.target.value)}
// //                 placeholder="Enter any mobile number"
// //               />
// //             </Grid>
// //           </Grid>
// //           {/* Message Inputs */}
// //           <Grid container spacing={2} sx={{ mb: 3 }}>
// //             <Grid item xs={12} md={6}>
// //               <TextField
// //                 fullWidth
// //                 size="small"
// //                 label="Test Message"
// //                 value={testMessage}
// //                 onChange={(e) => setTestMessage(e.target.value)}
// //                 multiline
// //                 rows={2}
// //               />
// //             </Grid>
// //             <Grid item xs={12} md={6}>
// //               <TextField
// //                 fullWidth
// //                 size="small"
// //                 label="Expiry Message"
// //                 value={expiryMessage}
// //                 onChange={(e) => setExpiryMessage(e.target.value)}
// //                 multiline
// //                 rows={2}
// //               />
// //             </Grid>
// //           </Grid>
// //           {/* Test SMS Buttons */}
// //           <Box sx={{ mb: 3, p: 2, border: '1px solid', borderColor: 'primary.main', borderRadius: 1 }}>
// //             <Typography variant="subtitle2" color="primary" gutterBottom>
// //               Test SMS (Manual Trigger)
// //             </Typography>
// //             <Grid container spacing={1}>
// //               <Grid item xs={12} sm={6}>
// //                 <Button
// //                   fullWidth
// //                   variant="contained"
// //                   color="primary"
// //                   onClick={sendTestToSingle}
// //                   disabled={testSending || !customMobile.trim()}
// //                   startIcon={testSending ? <CircularProgress size={20} /> : null}
// //                 >
// //                   {testSending ? 'Sending...' : 'Send Test to Custom Mobile'}
// //                 </Button>
// //               </Grid>
// //               <Grid item xs={12} sm={6}>
// //                 <Button
// //                   fullWidth
// //                   variant="outlined"
// //                   color="primary"
// //                   onClick={sendTestToAll}
// //                   disabled={testSending}
// //                   startIcon={testSending ? <CircularProgress size={20} /> : null}
// //                 >
// //                   {testSending ? 'Sending...' : 'Send Test to All 3 Numbers'}
// //                 </Button>
// //               </Grid>
// //             </Grid>
// //           </Box>
// //           {/* Expiry SMS Buttons */}
// //           <Box sx={{ mb: 3, p: 2, border: '1px solid', borderColor: 'secondary.main', borderRadius: 1 }}>
// //             <Typography variant="subtitle2" color="secondary" gutterBottom>
// //               Expiry SMS (Manual Trigger)
// //             </Typography>
// //             <Grid container spacing={1}>
// //               <Grid item xs={12} sm={6}>
// //                 <Button
// //                   fullWidth
// //                   variant="contained"
// //                   color="secondary"
// //                   onClick={sendExpiryToSingle}
// //                   disabled={smsSending || !customMobile.trim()}
// //                   startIcon={smsSending ? <CircularProgress size={20} /> : null}
// //                 >
// //                   {smsSending ? 'Sending...' : 'Send Expiry to Custom Mobile'}
// //                 </Button>
// //               </Grid>
// //               <Grid item xs={12} sm={6}>
// //                 <Button
// //                   fullWidth
// //                   variant="outlined"
// //                   color="secondary"
// //                   onClick={sendExpiryToAll}
// //                   disabled={smsSending}
// //                   startIcon={smsSending ? <CircularProgress size={20} /> : null}
// //                 >
// //                   {smsSending ? 'Sending...' : 'Send Expiry to All 3 Numbers'}
// //                 </Button>
// //               </Grid>
// //             </Grid>
// //           </Box>
// //           {/* Vehicle Data Info */}
// //           <Box sx={{ mt: 3, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
// //             <Typography variant="subtitle2" gutterBottom>
// //               Vehicle Data Status
// //             </Typography>
// //             {loading ? (
// //               <Box display="flex" alignItems="center">
// //                 <CircularProgress size={20} />
// //                 <Typography variant="body2" sx={{ ml: 1 }}>Loading vehicle data...</Typography>
// //               </Box>
// //             ) : (
// //               <>
// //                 <Typography variant="body2">
// //                   Total Vehicles: {vehicles.length}
// //                 </Typography>
// //                 <Button
// //                   variant="text"
// //                   size="small"
// //                   onClick={fetchVehicles}
// //                   sx={{ mt: 1 }}
// //                 >
// //                   Refresh Data
// //                 </Button>
// //                 {/* Show expiring documents if any */}
// //                 {vehicles.length > 0 && (
// //                   <Box sx={{ mt: 2 }}>
// //                     <Typography variant="caption" color="text.secondary">
// //                       Found documents expiring soon. To send automatic reminders, add mobile numbers to vehicle data.
// //                     </Typography>
// //                   </Box>
// //                 )}
// //               </>
// //             )}
// //           </Box>
// //           <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
// //             Check browser console (F12 → Console) and Network tab to see API calls
// //           </Typography>
// //         </Box>
// //       </CardContent>
// //     </Card>
// //   )
// // }
// // export default DialogAuthentication
// 'use client'
// // MUI Imports
// import Card from '@mui/material/Card'
// import Button from '@mui/material/Button'
// import CardContent from '@mui/material/CardContent'
// import Typography from '@mui/material/Typography'
// import Box from '@mui/material/Box'
// import Alert from '@mui/material/Alert'
// import CircularProgress from '@mui/material/CircularProgress'
// import TextField from '@mui/material/TextField'
// import Grid from '@mui/material/Grid'
// // Component Imports
// import TwoFactorAuth from '@components/dialogs/two-factor-auth'
// import OpenDialogOnElementClick from '@components/dialogs/OpenDialogOnElementClick'
// import { useState, useEffect } from 'react'
// const DialogAuthentication = () => {
//   // State variables
//   const [vehicles, setVehicles] = useState([])
//   const [loading, setLoading] = useState(true)
//   const [smsSending, setSmsSending] = useState(false)
//   const [testSending, setTestSending] = useState(false)
//   const [message, setMessage] = useState('')
//   const [alertType, setAlertType] = useState('info')
//   const [debugInfo, setDebugInfo] = useState('')
//   // Manual mobile inputs
//   const [mobile1, setMobile1] = useState('919284834754')
//   const [mobile2, setMobile2] = useState('917773937764')
//   const [mobile3, setMobile3] = useState('919823251105')
//   const [customMobile, setCustomMobile] = useState('')
//   // Milk collection data inputs
//   const [customerName, setCustomerName] = useState('John Doe')
//   const [milkCode, setMilkCode] = useState('MC001')
//   const [liter, setLiter] = useState('10.5')
//   const [fat, setFat] = useState('4.2')
//   const [snf, setSnf] = useState('8.5')
//   const [rate, setRate] = useState('45')
//   const [amount, setAmount] = useState('472.50')
//   // Use your proxy endpoint
//   const SMS_API_ENDPOINT = '/api/sms-proxy/http-api-post.php'
//   const SMS_API_KEY = 'dCe2ItQ23Vn4RTOv'
//   const SENDER_ID = 'MILKCL'
//   // Button props
//   const buttonProps = {
//     variant: 'contained',
//     children: 'Show'
//   }
//   // Generate milk collection SMS message
//   const generateMilkSMS = () => {
//     return `Gurukrupa milk ${customerName} Code:- ${milkCode} Liter:- ${liter} Fat:- ${fat} Snf:- ${snf} Rate:- ${rate} Amount:- ${amount} MILK COLLECTION`
//   }
//   // Generate test SMS message
//   const generateTestSMS = () => {
//     return `Test SMS from Milk Collection System. Date: ${new Date().toLocaleDateString('en-IN')}`
//   }
//   // Fetch vehicles data
//   const fetchVehicles = async () => {
//     try {
//       setLoading(true)
//       const response = await fetch('https://srtransport.vercel.app/api/apps/vehicles')
//       const result = await response.json()
//       if (result.success && result.data) {
//         setVehicles(result.data)
//       }
//     } catch (error) {
//       console.error('Error fetching vehicles:', error)
//     } finally {
//       setLoading(false)
//     }
//   }
//   // Send SMS via proxy
//   const sendSingleSMS = async (mobile, messageText) => {
//     const cleanMobile = mobile.replace(/\s+/g, '')
//     console.log(`📱 SENDING SMS to ${cleanMobile}`)
//     console.log(`📝 Message: ${messageText}`)
//     const smsData = {
//       apikey: SMS_API_KEY,
//       senderid: SENDER_ID,
//       number: cleanMobile,
//       message: messageText,
//       format: 'json'
//     }
//     console.log('📤 SMS Request:', smsData)
//     console.log('🌐 API Endpoint:', SMS_API_ENDPOINT)
//     try {
//       const response = await fetch(SMS_API_ENDPOINT, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(smsData)
//       })
//       const result = await response.json()
//       console.log('📥 SMS Response:', result)
//       return result
//     } catch (error) {
//       console.error('❌ Failed to send SMS:', error)
//       throw new Error(`Failed to send SMS: ${error.message}`)
//     }
//   }
//   // Send bulk SMS
//   const sendBulkSMS = async (mobiles, messageText) => {
//     const cleanMobiles = mobiles.filter(m => m.trim()).map(m => m.replace(/\s+/g, '')).join(',')
//     console.log(`📱 SENDING BULK SMS to ${mobiles.length} numbers`)
//     console.log(`📝 Message: ${messageText}`)
//     const smsData = {
//       apikey: SMS_API_KEY,
//       senderid: SENDER_ID,
//       number: cleanMobiles,
//       message: messageText,
//       format: 'json'
//     }
//     console.log('📤 Bulk SMS Request:', smsData)
//     try {
//       const response = await fetch(SMS_API_ENDPOINT, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(smsData)
//       })
//       const result = await response.json()
//       console.log('📥 Bulk SMS Response:', result)
//       return result
//     } catch (error) {
//       console.error('❌ Failed to send bulk SMS:', error)
//       throw new Error(`Failed to send bulk SMS: ${error.message}`)
//     }
//   }
//   // 1. Send milk SMS to single mobile
//   const sendMilkSMSToSingle = async () => {
//     if (!customMobile.trim()) {
//       setMessage('Please enter a mobile number')
//       setAlertType('error')
//       return
//     }
//     setSmsSending(true)
//     setMessage('')
//     setDebugInfo('')
//     const smsText = generateMilkSMS()
//     try {
//       console.log('🚀 Starting milk SMS to single mobile...')
//       const smsResponse = await sendSingleSMS(customMobile, smsText)
//       if (smsResponse.status === 'OK') {
//         setMessage(`✅ Milk collection SMS sent to ${customMobile}`)
//         setAlertType('success')
//         setDebugInfo(`Message: ${smsText}\n\nResponse: ${JSON.stringify(smsResponse, null, 2)}`)
//       } else {
//         setMessage(`❌ Failed: ${smsResponse.message || 'Unknown error'}`)
//         setAlertType('error')
//         setDebugInfo(JSON.stringify(smsResponse, null, 2))
//       }
//     } catch (error) {
//       setMessage(`❌ Error: ${error.message}`)
//       setAlertType('error')
//       setDebugInfo(error.toString())
//     } finally {
//       setSmsSending(false)
//     }
//   }
//   // 2. Send milk SMS to all 3 numbers
//   const sendMilkSMSToAll = async () => {
//     const mobiles = [mobile1, mobile2, mobile3].filter(m => m.trim())
//     if (mobiles.length === 0) {
//       setMessage('Please enter at least one mobile number')
//       setAlertType('error')
//       return
//     }
//     setSmsSending(true)
//     setMessage('')
//     setDebugInfo('')
//     const smsText = generateMilkSMS()
//     try {
//       console.log('🚀 Starting milk SMS to all numbers...')
//       const smsResponse = await sendBulkSMS(mobiles, smsText)
//       if (smsResponse.status === 'OK') {
//         setMessage(`✅ Milk collection SMS sent to ${mobiles.length} numbers`)
//         setAlertType('success')
//         setDebugInfo(`Message: ${smsText}\n\nNumbers: ${mobiles.join(', ')}\n\nResponse: ${JSON.stringify(smsResponse, null, 2)}`)
//       } else {
//         setMessage(`❌ Failed: ${smsResponse.message || 'Unknown error'}`)
//         setAlertType('error')
//         setDebugInfo(JSON.stringify(smsResponse, null, 2))
//       }
//     } catch (error) {
//       setMessage(`❌ Error: ${error.message}`)
//       setAlertType('error')
//       setDebugInfo(error.toString())
//     } finally {
//       setSmsSending(false)
//     }
//   }
//   // 3. Send test SMS to single mobile
//   const sendTestToSingle = async () => {
//     if (!customMobile.trim()) {
//       setMessage('Please enter a mobile number')
//       setAlertType('error')
//       return
//     }
//     setTestSending(true)
//     setMessage('')
//     setDebugInfo('')
//     const smsText = generateTestSMS()
//     try {
//       console.log('🚀 Starting test SMS to single mobile...')
//       const smsResponse = await sendSingleSMS(customMobile, smsText)
//       if (smsResponse.status === 'OK') {
//         setMessage(`✅ Test SMS sent to ${customMobile}`)
//         setAlertType('success')
//         setDebugInfo(`Message: ${smsText}\n\nResponse: ${JSON.stringify(smsResponse, null, 2)}`)
//       } else {
//         setMessage(`❌ Failed: ${smsResponse.message || 'Unknown error'}`)
//         setAlertType('error')
//         setDebugInfo(JSON.stringify(smsResponse, null, 2))
//       }
//     } catch (error) {
//       setMessage(`❌ Error: ${error.message}`)
//       setAlertType('error')
//       setDebugInfo(error.toString())
//     } finally {
//       setTestSending(false)
//     }
//   }
//   // 4. Send test SMS to all 3 numbers
//   const sendTestToAll = async () => {
//     const mobiles = [mobile1, mobile2, mobile3].filter(m => m.trim())
//     if (mobiles.length === 0) {
//       setMessage('Please enter at least one mobile number')
//       setAlertType('error')
//       return
//     }
//     setTestSending(true)
//     setMessage('')
//     setDebugInfo('')
//     const smsText = generateTestSMS()
//     try {
//       console.log('🚀 Starting test SMS to all numbers...')
//       const smsResponse = await sendBulkSMS(mobiles, smsText)
//       if (smsResponse.status === 'OK') {
//         setMessage(`✅ Test SMS sent to ${mobiles.length} numbers`)
//         setAlertType('success')
//         setDebugInfo(`Message: ${smsText}\n\nNumbers: ${mobiles.join(', ')}\n\nResponse: ${JSON.stringify(smsResponse, null, 2)}`)
//       } else {
//         setMessage(`❌ Failed: ${smsResponse.message || 'Unknown error'}`)
//         setAlertType('error')
//         setDebugInfo(JSON.stringify(smsResponse, null, 2))
//       }
//     } catch (error) {
//       setMessage(`❌ Error: ${error.message}`)
//       setAlertType('error')
//       setDebugInfo(error.toString())
//     } finally {
//       setTestSending(false)
//     }
//   }
//   // Calculate amount automatically
//   const calculateAmount = () => {
//     const literNum = parseFloat(liter) || 0
//     const rateNum = parseFloat(rate) || 0
//     const calculated = (literNum * rateNum).toFixed(2)
//     if (!isNaN(calculated) && calculated !== amount) {
//       setAmount(calculated)
//     }
//   }
//   // Auto-calculate when liter or rate changes
//   useEffect(() => {
//     calculateAmount()
//   }, [liter, rate])
//   // Fetch data on component mount
//   useEffect(() => {
//     fetchVehicles()
//   }, [])
//   return (
//     <Card>
//       <CardContent className='flex flex-col items-center text-center gap-4'>
//         <i className='ri-lock-line text-[28px] text-textPrimary' />
//         <Typography variant='h5'>Two Factor Authentication</Typography>
//         <Typography color='text.primary'>
//           Enhance your application security by enabling two factor authentication.
//         </Typography>
//         {/* Original Dialog Button */}
//         <OpenDialogOnElementClick element={Button} elementProps={buttonProps} dialog={TwoFactorAuth} />
//         {/* Milk Collection SMS Section */}
//         <Box sx={{ mt: 4, width: '100%', textAlign: 'left' }}>
//           <Typography variant='h6' gutterBottom>
//             🥛 Milk Collection SMS Sender
//           </Typography>
//           {/* Alert Message */}
//           {message && (
//             <Alert severity={alertType} sx={{ mb: 2 }}>
//               {message}
//             </Alert>
//           )}
//           {/* Debug Info */}
//           {debugInfo && (
//             <Box sx={{
//               mb: 2,
//               p: 2,
//               bgcolor: 'grey.100',
//               borderRadius: 1,
//               fontSize: '0.75rem',
//               fontFamily: 'monospace',
//               whiteSpace: 'pre-wrap',
//               maxHeight: '200px',
//               overflow: 'auto'
//             }}>
//               <Typography variant='caption' color="text.secondary">API Response:</Typography>
//               <div>{debugInfo}</div>
//             </Box>
//           )}
//           {/* Mobile Numbers Section */}
//           <Box sx={{ mb: 3, p: 2, border: '1px solid', borderColor: 'primary.main', borderRadius: 1 }}>
//             <Typography variant="subtitle2" color="primary" gutterBottom>
//               📱 Mobile Numbers
//             </Typography>
//             <Grid container spacing={2}>
//               <Grid item xs={12} sm={4}>
//                 <TextField
//                   fullWidth
//                   size="small"
//                   label="Mobile 1"
//                   value={mobile1}
//                   onChange={(e) => setMobile1(e.target.value)}
//                   placeholder="919284834754"
//                 />
//               </Grid>
//               <Grid item xs={12} sm={4}>
//                 <TextField
//                   fullWidth
//                   size="small"
//                   label="Mobile 2"
//                   value={mobile2}
//                   onChange={(e) => setMobile2(e.target.value)}
//                   placeholder="917773937764"
//                 />
//               </Grid>
//               <Grid item xs={12} sm={4}>
//                 <TextField
//                   fullWidth
//                   size="small"
//                   label="Mobile 3"
//                   value={mobile3}
//                   onChange={(e) => setMobile3(e.target.value)}
//                   placeholder="919823251105"
//                 />
//               </Grid>
//               <Grid item xs={12}>
//                 <TextField
//                   fullWidth
//                   size="small"
//                   label="Custom Mobile (for single SMS)"
//                   value={customMobile}
//                   onChange={(e) => setCustomMobile(e.target.value)}
//                   placeholder="Enter any mobile number"
//                 />
//               </Grid>
//             </Grid>
//           </Box>
//           {/* Milk Collection Data Section */}
//           <Box sx={{ mb: 3, p: 2, border: '1px solid', borderColor: 'secondary.main', borderRadius: 1 }}>
//             <Typography variant="subtitle2" color="secondary" gutterBottom>
//               🥛 Milk Collection Data
//             </Typography>
//             <Grid container spacing={2}>
//               <Grid item xs={12} sm={6}>
//                 <TextField
//                   fullWidth
//                   size="small"
//                   label="Customer Name"
//                   value={customerName}
//                   onChange={(e) => setCustomerName(e.target.value)}
//                   placeholder="John Doe"
//                 />
//               </Grid>
//               <Grid item xs={12} sm={6}>
//                 <TextField
//                   fullWidth
//                   size="small"
//                   label="Milk Code"
//                   value={milkCode}
//                   onChange={(e) => setMilkCode(e.target.value)}
//                   placeholder="MC001"
//                 />
//               </Grid>
//               <Grid item xs={12} sm={4}>
//                 <TextField
//                   fullWidth
//                   size="small"
//                   label="Liter"
//                   value={liter}
//                   onChange={(e) => setLiter(e.target.value)}
//                   placeholder="10.5"
//                   type="number"
//                 />
//               </Grid>
//               <Grid item xs={12} sm={4}>
//                 <TextField
//                   fullWidth
//                   size="small"
//                   label="Fat %"
//                   value={fat}
//                   onChange={(e) => setFat(e.target.value)}
//                   placeholder="4.2"
//                   type="number"
//                 />
//               </Grid>
//               <Grid item xs={12} sm={4}>
//                 <TextField
//                   fullWidth
//                   size="small"
//                   label="SNF %"
//                   value={snf}
//                   onChange={(e) => setSnf(e.target.value)}
//                   placeholder="8.5"
//                   type="number"
//                 />
//               </Grid>
//               <Grid item xs={12} sm={6}>
//                 <TextField
//                   fullWidth
//                   size="small"
//                   label="Rate per Liter"
//                   value={rate}
//                   onChange={(e) => setRate(e.target.value)}
//                   placeholder="45"
//                   type="number"
//                 />
//               </Grid>
//               <Grid item xs={12} sm={6}>
//                 <TextField
//                   fullWidth
//                   size="small"
//                   label="Amount"
//                   value={amount}
//                   onChange={(e) => setAmount(e.target.value)}
//                   placeholder="472.50"
//                   type="number"
//                   InputProps={{
//                     readOnly: true,
//                   }}
//                   helperText="Auto-calculated (Liter × Rate)"
//                 />
//               </Grid>
//             </Grid>
//             {/* Preview SMS Message */}
//             <Box sx={{ mt: 2, p: 1, bgcolor: 'info.light', borderRadius: 1 }}>
//               <Typography variant="caption" color="text.secondary" gutterBottom>
//                 SMS Preview:
//               </Typography>
//               <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
//                 {generateMilkSMS()}
//               </Typography>
//             </Box>
//           </Box>
//           {/* SMS Buttons Section */}
//           <Grid container spacing={2}>
//             {/* Milk Collection SMS */}
//             <Grid item xs={12} md={6}>
//               <Box sx={{ p: 2, border: '1px solid', borderColor: 'success.main', borderRadius: 1, height: '100%' }}>
//                 <Typography variant="subtitle2" color="success.main" gutterBottom>
//                   🥛 Milk Collection SMS
//                 </Typography>
//                 <Button
//                   fullWidth
//                   variant="contained"
//                   color="success"
//                   onClick={sendMilkSMSToSingle}
//                   disabled={smsSending || !customMobile.trim()}
//                   startIcon={smsSending ? <CircularProgress size={20} /> : null}
//                   sx={{ mb: 1 }}
//                 >
//                   {smsSending ? 'Sending...' : 'Send Milk SMS to Custom Mobile'}
//                 </Button>
//                 <Button
//                   fullWidth
//                   variant="outlined"
//                   color="success"
//                   onClick={sendMilkSMSToAll}
//                   disabled={smsSending}
//                   startIcon={smsSending ? <CircularProgress size={20} /> : null}
//                 >
//                   {smsSending ? 'Sending...' : 'Send Milk SMS to All 3 Numbers'}
//                 </Button>
//               </Box>
//             </Grid>
//             {/* Test SMS */}
//             <Grid item xs={12} md={6}>
//               <Box sx={{ p: 2, border: '1px solid', borderColor: 'info.main', borderRadius: 1, height: '100%' }}>
//                 <Typography variant="subtitle2" color="info.main" gutterBottom>
//                   🔧 Test SMS
//                 </Typography>
//                 <Button
//                   fullWidth
//                   variant="contained"
//                   color="info"
//                   onClick={sendTestToSingle}
//                   disabled={testSending || !customMobile.trim()}
//                   startIcon={testSending ? <CircularProgress size={20} /> : null}
//                   sx={{ mb: 1 }}
//                 >
//                   {testSending ? 'Sending...' : 'Send Test to Custom Mobile'}
//                 </Button>
//                 <Button
//                   fullWidth
//                   variant="outlined"
//                   color="info"
//                   onClick={sendTestToAll}
//                   disabled={testSending}
//                   startIcon={testSending ? <CircularProgress size={20} /> : null}
//                 >
//                   {testSending ? 'Sending...' : 'Send Test to All 3 Numbers'}
//                 </Button>
//               </Box>
//             </Grid>
//           </Grid>
//           {/* Instructions */}
//           <Box sx={{ mt: 3, p: 2, bgcolor: 'warning.light', borderRadius: 1 }}>
//             <Typography variant="subtitle2" gutterBottom>
//               📋 How to Test:
//             </Typography>
//             <Typography variant="body2" component="div">
//               1. Fill mobile numbers above<br />
//               2. Fill milk collection data<br />
//               3. Click any SMS button<br />
//               4. Check browser Console (F12 → Console) for logs<br />
//               5. Check Network tab for API call<br />
//               6. See API response in Debug Info section
//             </Typography>
//           </Box>
//           <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
//             SMS Format: "Gurukrupa milk {customerName} Code:- {milkCode} Liter:- {liter} Fat:- {fat} Snf:- {snf} Rate:- {rate} Amount:- {amount} MILK COLLECTION"
//           </Typography>
//         </Box>
//       </CardContent>
//     </Card>
//   )
// }
// export default DialogAuthentication
'use client'
// MUI Imports
import Card from '@mui/material/Card'
import Button from '@mui/material/Button'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import TextField from '@mui/material/TextField'
import Grid from '@mui/material/Grid'
// Component Imports
import TwoFactorAuth from '@components/dialogs/two-factor-auth'
import OpenDialogOnElementClick from '@components/dialogs/OpenDialogOnElementClick'
import { useState, useEffect } from 'react'
const DialogAuthentication = () => {
  // State variables
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [smsSending, setSmsSending] = useState(false)
  const [testSending, setTestSending] = useState(false)
  const [message, setMessage] = useState('')
  const [alertType, setAlertType] = useState('info')
  const [debugInfo, setDebugInfo] = useState('')
  // Manual mobile inputs (for testing)
  const [mobile1, setMobile1] = useState('919284834754')
  const [mobile2, setMobile2] = useState('917773937764')
  const [mobile3, setMobile3] = useState('919823251105')
  const [customMobile, setCustomMobile] = useState('')
  // Vehicle document data (auto-populated from API)
  const [expiringDocuments, setExpiringDocuments] = useState([])
  // Use your proxy endpoint
  const SMS_API_ENDPOINT = '/api/sms-proxy/http-api-post.php'
  const SMS_API_KEY = 'dCe2ItQ23Vn4RTOv'
  const SENDER_ID = 'MILKCL'
  // Button props
  const buttonProps = {
    variant: 'contained',
    children: 'Show'
  }
  // Function to check if a document expires within X days
  const isExpiringSoon = (expiryDate, daysThreshold = 7) => {
    if (!expiryDate) return false
    const expiry = new Date(expiryDate)
    const today = new Date()
    // Validate dates
    if (isNaN(expiry.getTime())) {
      return false
    }
    // Reset times to compare dates only
    today.setHours(0, 0, 0, 0)
    expiry.setHours(0, 0, 0, 0)
    const timeDiff = expiry.getTime() - today.getTime()
    const dayDiff = Math.ceil(timeDiff / (1000 * 3600 * 24))
    return dayDiff <= daysThreshold && dayDiff > 0
  }
  // Function to format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return 'Invalid Date'
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }
  // Generate vehicle document expiry SMS message
  const generateExpirySMS = (vehicle, document) => {
    // Using your exact SMS template format with vehicle document values
    return `Gurukrupa milk ${vehicle.ownerName || 'Vehicle Owner'} Code:- ${vehicle.vehicleNo} Liter:- ${formatDate(document.expiryDate)} Fat:- ${document.documentType} Snf:- VEHICLE Rate:- URGENT Amount:- RENEWAL MILK COLLECTION`
  }
  // Generate alternative format with more details
  const generateDetailedExpirySMS = (vehicle, document) => {
    return `URGENT: ${document.documentType} for ${vehicle.vehicleNo} (${vehicle.model}) expires on ${formatDate(document.expiryDate)}. Owner: ${vehicle.ownerName}. Please renew immediately.`
  }
  // Generate test SMS message
  const generateTestSMS = () => {
    return `Test SMS from Milk Collection System. Vehicle document expiry check working. Date: ${new Date().toLocaleDateString('en-IN')}`
  }
  /* ================= API ENDPOINTS ================= */
  const API_BASE = '/api/apps'
  const TRIPS_API = `${API_BASE}/vehicles/`  // ✅ CORRECTED: 'trips' not 'trip'
  /* ================= FETCH TRIPS ================= */
  // Fetch vehicles data
  const fetchVehicles = async () => {
    try {
      setLoading(true)
      setMessage('')
      console.log('🔄 Fetching vehicles data...')
      const response = await fetch(TRIPS_API)
      const result = await response.json()
      console.log('📦 Vehicles API Response:', result)
      if (result.success && result.data) {
        setVehicles(result.data)
        // Find all expiring documents
        const expiringDocs = []
        result.data.forEach(vehicle => {
          if (vehicle.documents && vehicle.documents.length > 0) {
            vehicle.documents.forEach(document => {
              if (!document.isExpired && isExpiringSoon(document.expiryDate, 7)) {
                expiringDocs.push({
                  vehicle,
                  document,
                  daysLeft: Math.ceil((new Date(document.expiryDate) - new Date()) / (1000 * 3600 * 24))
                })
              }
            })
          }
        })
        setExpiringDocuments(expiringDocs)
        if (expiringDocs.length > 0) {
          setMessage(`✅ Found ${expiringDocs.length} document(s) expiring soon`)
          setAlertType('success')
          // Show details in debug info
          const docDetails = expiringDocs.map((item, index) =>
            `${index + 1}. ${item.vehicle.vehicleNo}: ${item.document.documentType} expires ${formatDate(item.document.expiryDate)} (${item.daysLeft} days)`
          ).join('\n')
          setDebugInfo(`📋 Expiring Documents Found:\n${docDetails}`)
        } else {
          setMessage('ℹ️ No documents expiring in the next 7 days')
          setAlertType('info')
          setDebugInfo('No expiring documents found. All documents are either expired or not expiring soon.')
        }
      } else {
        setMessage('❌ Failed to fetch vehicles data')
        setAlertType('error')
      }
    } catch (error) {
      console.error('❌ Error fetching vehicles:', error)
      setMessage(`❌ Error: ${error.message}`)
      setAlertType('error')
    } finally {
      setLoading(false)
    }
  }
  // Send SMS via proxy
  const sendSingleSMS = async (mobile, messageText) => {
    const cleanMobile = mobile.replace(/\s+/g, '')
    console.log(`📱 SENDING SMS to ${cleanMobile}`)
    console.log(`📝 Message (${messageText.length} chars): ${messageText}`)
    const smsData = {
      apikey: SMS_API_KEY,
      senderid: SENDER_ID,
      number: cleanMobile,
      message: messageText,
      format: 'json'
    }
    console.log('📤 SMS Request Data:', smsData)
    try {
      console.log('🌐 Calling SMS API:', SMS_API_ENDPOINT)
      const response = await fetch(SMS_API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(smsData)
      })
      const result = await response.json()
      console.log('📥 SMS API Response:', result)
      return result
    } catch (error) {
      console.error('❌ Failed to send SMS:', error)
      throw new Error(`Failed to send SMS: ${error.message}`)
    }
  }
  // Send bulk SMS
  const sendBulkSMS = async (mobiles, messageText) => {
    const cleanMobiles = mobiles.filter(m => m.trim()).map(m => m.replace(/\s+/g, '')).join(',')
    console.log(`📱 SENDING BULK SMS to ${mobiles.length} numbers: ${cleanMobiles}`)
    const smsData = {
      apikey: SMS_API_KEY,
      senderid: SENDER_ID,
      number: cleanMobiles,
      message: messageText,
      format: 'json'
    }
    console.log('📤 Bulk SMS Request:', smsData)
    try {
      const response = await fetch(SMS_API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(smsData)
      })
      const result = await response.json()
      console.log('📥 Bulk SMS Response:', result)
      return result
    } catch (error) {
      console.error('❌ Failed to send bulk SMS:', error)
      throw new Error(`Failed to send bulk SMS: ${error.message}`)
    }
  }
  // 1. Send expiry SMS for first expiring document to custom mobile
  const sendExpirySMSToSingle = async () => {
    if (!customMobile.trim()) {
      setMessage('Please enter a mobile number')
      setAlertType('error')
      return
    }
    if (expiringDocuments.length === 0) {
      setMessage('No expiring documents found. Refresh data first.')
      setAlertType('warning')
      return
    }
    setSmsSending(true)
    setMessage('')
    // Use the first expiring document
    const firstExpiring = expiringDocuments[0]
    const smsText = generateExpirySMS(firstExpiring.vehicle, firstExpiring.document)
    try {
      console.log('🚀 Sending expiry SMS for first document...')
      const smsResponse = await sendSingleSMS(customMobile, smsText)
      if (smsResponse.status === 'OK') {
        setMessage(`✅ Expiry SMS sent to ${customMobile}`)
        setAlertType('success')
        setDebugInfo(`Vehicle: ${firstExpiring.vehicle.vehicleNo}\nDocument: ${firstExpiring.document.documentType}\nExpires: ${formatDate(firstExpiring.document.expiryDate)}\n\nSMS Sent:\n${smsText}\n\nAPI Response: ${JSON.stringify(smsResponse, null, 2)}`)
      } else {
        setMessage(`❌ Failed: ${smsResponse.message || 'Unknown error'}`)
        setAlertType('error')
        setDebugInfo(JSON.stringify(smsResponse, null, 2))
      }
    } catch (error) {
      setMessage(`❌ Error: ${error.message}`)
      setAlertType('error')
      setDebugInfo(error.toString())
    } finally {
      setSmsSending(false)
    }
  }
  // 2. Send expiry SMS for all expiring documents to test numbers
  const sendExpirySMSToAll = async () => {
    if (expiringDocuments.length === 0) {
      setMessage('No expiring documents found. Refresh data first.')
      setAlertType('warning')
      return
    }
    const mobiles = [mobile1, mobile2, mobile3].filter(m => m.trim())
    if (mobiles.length === 0) {
      setMessage('Please enter at least one mobile number')
      setAlertType('error')
      return
    }
    setSmsSending(true)
    setMessage('')
    // Use the first expiring document for the bulk message
    const firstExpiring = expiringDocuments[0]
    const smsText = generateExpirySMS(firstExpiring.vehicle, firstExpiring.document)
    try {
      console.log('🚀 Sending expiry SMS to all test numbers...')
      const smsResponse = await sendBulkSMS(mobiles, smsText)
      if (smsResponse.status === 'OK') {
        setMessage(`✅ Expiry SMS sent to ${mobiles.length} numbers`)
        setAlertType('success')
        setDebugInfo(`Vehicle: ${firstExpiring.vehicle.vehicleNo}\nDocument: ${firstExpiring.document.documentType}\nExpires: ${formatDate(firstExpiring.document.expiryDate)}\n\nNumbers: ${mobiles.join(', ')}\n\nSMS Sent:\n${smsText}\n\nAPI Response: ${JSON.stringify(smsResponse, null, 2)}`)
      } else {
        setMessage(`❌ Failed: ${smsResponse.message || 'Unknown error'}`)
        setAlertType('error')
        setDebugInfo(JSON.stringify(smsResponse, null, 2))
      }
    } catch (error) {
      setMessage(`❌ Error: ${error.message}`)
      setAlertType('error')
      setDebugInfo(error.toString())
    } finally {
      setSmsSending(false)
    }
  }
  // 3. Send test SMS to custom mobile
  const sendTestToSingle = async () => {
    if (!customMobile.trim()) {
      setMessage('Please enter a mobile number')
      setAlertType('error')
      return
    }
    setTestSending(true)
    setMessage('')
    const smsText = generateTestSMS()
    try {
      console.log('🚀 Sending test SMS to single mobile...')
      const smsResponse = await sendSingleSMS(customMobile, smsText)
      if (smsResponse.status === 'OK') {
        setMessage(`✅ Test SMS sent to ${customMobile}`)
        setAlertType('success')
        setDebugInfo(`SMS Sent:\n${smsText}\n\nAPI Response: ${JSON.stringify(smsResponse, null, 2)}`)
      } else {
        setMessage(`❌ Failed: ${smsResponse.message || 'Unknown error'}`)
        setAlertType('error')
        setDebugInfo(JSON.stringify(smsResponse, null, 2))
      }
    } catch (error) {
      setMessage(`❌ Error: ${error.message}`)
      setAlertType('error')
      setDebugInfo(error.toString())
    } finally {
      setTestSending(false)
    }
  }
  // 4. Send test SMS to all test numbers
  const sendTestToAll = async () => {
    const mobiles = [mobile1, mobile2, mobile3].filter(m => m.trim())
    if (mobiles.length === 0) {
      setMessage('Please enter at least one mobile number')
      setAlertType('error')
      return
    }
    setTestSending(true)
    setMessage('')
    const smsText = generateTestSMS()
    try {
      console.log('🚀 Sending test SMS to all numbers...')
      const smsResponse = await sendBulkSMS(mobiles, smsText)
      if (smsResponse.status === 'OK') {
        setMessage(`✅ Test SMS sent to ${mobiles.length} numbers`)
        setAlertType('success')
        setDebugInfo(`Numbers: ${mobiles.join(', ')}\n\nSMS Sent:\n${smsText}\n\nAPI Response: ${JSON.stringify(smsResponse, null, 2)}`)
      } else {
        setMessage(`❌ Failed: ${smsResponse.message || 'Unknown error'}`)
        setAlertType('error')
        setDebugInfo(JSON.stringify(smsResponse, null, 2))
      }
    } catch (error) {
      setMessage(`❌ Error: ${error.message}`)
      setAlertType('error')
      setDebugInfo(error.toString())
    } finally {
      setTestSending(false)
    }
  }
  // 5. Send expiry SMS for ALL expiring documents (one by one)
  const sendAllExpirySMS = async () => {
    if (expiringDocuments.length === 0) {
      setMessage('No expiring documents found. Refresh data first.')
      setAlertType('warning')
      return
    }
    const mobiles = [mobile1, mobile2, mobile3].filter(m => m.trim())
    if (mobiles.length === 0) {
      setMessage('Please enter at least one mobile number')
      setAlertType('error')
      return
    }
    setSmsSending(true)
    setMessage('')
    const results = []
    const maxToSend = Math.min(expiringDocuments.length, 3) // Max 3 documents
    try {
      for (let i = 0; i < maxToSend; i++) {
        const item = expiringDocuments[i]
        const mobile = mobiles[i % mobiles.length]
        const smsText = generateExpirySMS(item.vehicle, item.document)
        console.log(`📤 Sending SMS ${i + 1}/${maxToSend} to ${mobile}`)
        try {
          const smsResponse = await sendSingleSMS(mobile, smsText)
          results.push({
            success: smsResponse.status === 'OK',
            mobile,
            vehicleNo: item.vehicle.vehicleNo,
            documentType: item.document.documentType,
            message: smsResponse.status === 'OK' ? 'Sent successfully' : smsResponse.message
          })
          // Wait 1 second between messages
          await new Promise(resolve => setTimeout(resolve, 1000))
        } catch (error) {
          results.push({
            success: false,
            mobile,
            vehicleNo: item.vehicle.vehicleNo,
            documentType: item.document.documentType,
            message: error.message
          })
        }
      }
      const successful = results.filter(r => r.success).length
      const failed = results.filter(r => !r.success).length
      if (successful > 0) {
        setMessage(`✅ Sent ${successful} expiry SMS successfully. ${failed > 0 ? `${failed} failed.` : ''}`)
        setAlertType('success')
      } else {
        setMessage(`❌ All SMS failed to send`)
        setAlertType('error')
      }
      // Build detailed results
      const resultDetails = results.map((r, idx) =>
        `${idx + 1}. ${r.vehicleNo} - ${r.documentType} to ${r.mobile}: ${r.success ? '✅' : `❌ ${r.message}`}`
      ).join('\n')
      setDebugInfo(`📊 SMS Results (${maxToSend} sent):\n${resultDetails}`)
    } catch (error) {
      setMessage(`❌ Error: ${error.message}`)
      setAlertType('error')
      setDebugInfo(error.toString())
    } finally {
      setSmsSending(false)
    }
  }
  // Fetch data on component mount
  useEffect(() => {
    fetchVehicles()
  }, [])
  return (
    <Card>
      <CardContent className='flex flex-col items-center text-center gap-4'>
        <i className='ri-lock-line text-[28px] text-textPrimary' />
        <Typography variant='h5'>Two Factor Authentication</Typography>
        <Typography color='text.primary'>
          Enhance your application security by enabling two factor authentication.
        </Typography>
        {/* Original Dialog Button */}
        <OpenDialogOnElementClick element={Button} elementProps={buttonProps} dialog={TwoFactorAuth} />
        {/* Vehicle Document Expiry SMS Section */}
        <Box sx={{ mt: 4, width: '100%', textAlign: 'left' }}>
          <Typography variant='h6' gutterBottom>
            🚗 Vehicle Document Expiry SMS
          </Typography>
          {/* Alert Message */}
          {message && (
            <Alert severity={alertType} sx={{ mb: 2 }}>
              {message}
            </Alert>
          )}
          {/* Debug Info */}
          {debugInfo && (
            <Box sx={{
              mb: 2,
              p: 2,
              bgcolor: 'grey.100',
              borderRadius: 1,
              fontSize: '0.75rem',
              fontFamily: 'monospace',
              whiteSpace: 'pre-wrap',
              maxHeight: '200px',
              overflow: 'auto'
            }}>
              <Typography variant='caption' color="text.secondary">Debug Info:</Typography>
              <div>{debugInfo}</div>
            </Box>
          )}
          {/* Vehicle Data Status */}
          <Box sx={{ mb: 3, p: 2, border: '1px solid', borderColor: 'primary.main', borderRadius: 1 }}>
            <Typography variant="subtitle2" color="primary" gutterBottom>
              🚗 Vehicle Documents Status
            </Typography>
            {loading ? (
              <Box display="flex" alignItems="center">
                <CircularProgress size={20} />
                <Typography variant="body2" sx={{ ml: 1 }}>Loading vehicle data...</Typography>
              </Box>
            ) : (
              <>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={4}>
                    <Typography variant="body2">
                      <strong>Total Vehicles:</strong> {vehicles.length}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Typography variant="body2">
                      <strong>Expiring Soon:</strong> {expiringDocuments.length}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={fetchVehicles}
                      fullWidth
                    >
                      Refresh Data
                    </Button>
                  </Grid>
                </Grid>
                {/* Show expiring documents if any */}
                {expiringDocuments.length > 0 && (
                  <Box sx={{ mt: 2, p: 1, bgcolor: 'warning.light', borderRadius: 1 }}>
                    <Typography variant="caption" color="text.secondary" gutterBottom>
                      📋 Expiring Documents Found:
                    </Typography>
                    {expiringDocuments.slice(0, 3).map((item, index) => (
                      <Typography key={index} variant="body2" sx={{ fontSize: '0.8rem' }}>
                        • {item.vehicle.vehicleNo}: {item.document.documentType} expires {formatDate(item.document.expiryDate)} ({item.daysLeft} days)
                      </Typography>
                    ))}
                    {expiringDocuments.length > 3 && (
                      <Typography variant="caption" color="text.secondary">
                        ... and {expiringDocuments.length - 3} more
                      </Typography>
                    )}
                  </Box>
                )}
              </>
            )}
          </Box>
          {/* Mobile Numbers Section */}
          <Box sx={{ mb: 3, p: 2, border: '1px solid', borderColor: 'secondary.main', borderRadius: 1 }}>
            <Typography variant="subtitle2" color="secondary" gutterBottom>
              📱 Test Mobile Numbers
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  size="small"
                  label="Mobile 1"
                  value={mobile1}
                  onChange={(e) => setMobile1(e.target.value)}
                  placeholder="919284834754"
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  size="small"
                  label="Mobile 2"
                  value={mobile2}
                  onChange={(e) => setMobile2(e.target.value)}
                  placeholder="917773937764"
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  size="small"
                  label="Mobile 3"
                  value={mobile3}
                  onChange={(e) => setMobile3(e.target.value)}
                  placeholder="919823251105"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  size="small"
                  label="Custom Mobile (for single SMS)"
                  value={customMobile}
                  onChange={(e) => setCustomMobile(e.target.value)}
                  placeholder="Enter any mobile number"
                />
              </Grid>
            </Grid>
          </Box>
          {/* SMS Buttons Section */}
          <Grid container spacing={2}>
            {/* Expiry SMS Buttons */}
            <Grid item xs={12} md={6}>
              <Box sx={{ p: 2, border: '1px solid', borderColor: 'error.main', borderRadius: 1, height: '100%' }}>
                <Typography variant="subtitle2" color="error.main" gutterBottom>
                  ⚠️ Document Expiry SMS
                </Typography>
                <Button
                  fullWidth
                  variant="contained"
                  color="error"
                  onClick={sendExpirySMSToSingle}
                  disabled={smsSending || !customMobile.trim() || expiringDocuments.length === 0}
                  startIcon={smsSending ? <CircularProgress size={20} /> : null}
                  sx={{ mb: 1 }}
                >
                  {smsSending ? 'Sending...' : 'Send Expiry SMS to Custom Mobile'}
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  color="error"
                  onClick={sendExpirySMSToAll}
                  disabled={smsSending || expiringDocuments.length === 0}
                  startIcon={smsSending ? <CircularProgress size={20} /> : null}
                  sx={{ mb: 1 }}
                >
                  {smsSending ? 'Sending...' : 'Send Expiry SMS to All Test Numbers'}
                </Button>
                <Button
                  fullWidth
                  variant="contained"
                  color="warning"
                  onClick={sendAllExpirySMS}
                  disabled={smsSending || expiringDocuments.length === 0}
                  startIcon={smsSending ? <CircularProgress size={20} /> : null}
                >
                  {smsSending ? 'Sending...' : 'Send ALL Expiry Documents (One by One)'}
                </Button>
              </Box>
            </Grid>
            {/* Test SMS Buttons */}
            <Grid item xs={12} md={6}>
              <Box sx={{ p: 2, border: '1px solid', borderColor: 'info.main', borderRadius: 1, height: '100%' }}>
                <Typography variant="subtitle2" color="info.main" gutterBottom>
                  🔧 Test SMS
                </Typography>
                <Button
                  fullWidth
                  variant="contained"
                  color="info"
                  onClick={sendTestToSingle}
                  disabled={testSending || !customMobile.trim()}
                  startIcon={testSending ? <CircularProgress size={20} /> : null}
                  sx={{ mb: 1 }}
                >
                  {testSending ? 'Sending...' : 'Send Test SMS to Custom Mobile'}
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  color="info"
                  onClick={sendTestToAll}
                  disabled={testSending}
                  startIcon={testSending ? <CircularProgress size={20} /> : null}
                >
                  {testSending ? 'Sending...' : 'Send Test SMS to All Test Numbers'}
                </Button>
              </Box>
            </Grid>
          </Grid>
          {/* SMS Preview */}
          {expiringDocuments.length > 0 && (
            <Box sx={{ mt: 3, p: 2, border: '1px solid', borderColor: 'success.main', borderRadius: 1 }}>
              <Typography variant="subtitle2" color="success.main" gutterBottom>
                📝 SMS Preview (First Expiring Document)
              </Typography>
              <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.8rem', mb: 1 }}>
                {generateExpirySMS(expiringDocuments[0].vehicle, expiringDocuments[0].document)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Format: Gurukrupa milk {expiringDocuments[0].vehicle.ownerName || 'Owner'} Code:- {expiringDocuments[0].vehicle.vehicleNo} Liter:- {formatDate(expiringDocuments[0].document.expiryDate)} Fat:- {expiringDocuments[0].document.documentType} Snf:- VEHICLE Rate:- URGENT Amount:- RENEWAL MILK COLLECTION
              </Typography>
            </Box>
          )}
          {/* Instructions */}
          <Box sx={{ mt: 3, p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
            <Typography variant="subtitle2" gutterBottom>
              📋 How to Test SMS API:
            </Typography>
            <Typography variant="body2" component="div">
              1. Click "Refresh Data" to load vehicles<br />
              2. Check if expiring documents are found<br />
              3. Enter mobile numbers (pre-filled with test numbers)<br />
              4. Click any SMS button<br />
              5. Open DevTools (F12) → Network tab<br />
              6. Look for API call to: /api/sms-proxy/http-api-post.php<br />
              7. Check Console for detailed logs<br />
              8. See API response in Debug Info section
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  )
}
export default DialogAuthentication
