// /src/libs/sms-reminder-service.ts
export interface Document {
  documentType: string;
  expiryDate: string;
  isExpired: boolean;
}
export interface Vehicle {
  _id: string;
  vehicleNo: string;
  model: string;
  ownerMobile?: string;
  driverMobile?: string;
  documents: Document[];
  [key: string]: any;
}
export interface SMSResult {
  success: boolean;
  vehicleNo: string;
  recipients: string[];
  messageId?: string;
  error?: string;
}
export class SMSReminderService {
  private apiKey: string;
  private senderId: string;
  private baseUrl: string;
  constructor() {
    this.apiKey = process.env.SMS_API_KEY || '';
    this.senderId = process.env.SMS_SENDER_ID || '';
    this.baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  }
  // Send SMS using your provider
  async sendSMS(numbers: string[], message: string): Promise<any> {
    try {
      if (!this.apiKey || !this.senderId) {
        throw new Error('SMS credentials not configured in environment variables');
      }
      const apiUrl = 'http://13.200.203.109/V2/http-api-post.php';
      const payload = {
        apikey: this.apiKey,
        senderid: this.senderId,
        number: numbers.join(','),
        message: message,
        format: 'json'
      };
      console.log('📤 Sending SMS to:', numbers);
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      return {
        success: data.status === 'OK',
        data: data,
        messageId: data.msgid,
        status: data.message
      };
    } catch (error) {
      console.error('❌ SMS sending failed:', error);
      throw error;
    }
  }
  // Check for expiring documents
  getExpiringDocuments(documents: Document[], daysThreshold: number = 5): Document[] {
    const today = new Date();
    return documents.filter(doc => {
      const expiryDate = new Date(doc.expiryDate);
      const timeDiff = expiryDate.getTime() - today.getTime();
      const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
      return daysDiff <= daysThreshold && daysDiff >= 0;
    });
  }
  // Get expired documents (within last 7 days)
  getExpiredDocuments(documents: Document[]): Document[] {
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);
    return documents.filter(doc => {
      const expiryDate = new Date(doc.expiryDate);
      return expiryDate >= sevenDaysAgo && expiryDate < today;
    });
  }
  // Format mobile number
  formatMobileNumber(mobile: string): string | null {
    if (!mobile) return null;
    // Remove all non-digits
    const clean = mobile.replace(/\D/g, '');
    // Check if it's a valid Indian mobile number
    if (clean.length === 10) {
      return `91${clean}`;
    } else if (clean.length === 12 && clean.startsWith('91')) {
      return clean;
    }
    return null;
  }
  // Create SMS message
  createMessage(vehicle: Vehicle, expiringDocs: Document[], expiredDocs: Document[]): string {
    const lines = [];
    lines.push(`🚗 Vehicle: ${vehicle.vehicleNo} (${vehicle.model})`);
    lines.push('');
    if (expiredDocs.length > 0) {
      lines.push('❌ EXPIRED DOCUMENTS:');
      expiredDocs.forEach(doc => {
        const date = new Date(doc.expiryDate).toLocaleDateString('en-IN');
        lines.push(`  • ${doc.documentType}: Expired on ${date}`);
      });
      lines.push('');
    }
    if (expiringDocs.length > 0) {
      lines.push('⚠️ EXPIRING SOON:');
      expiringDocs.forEach(doc => {
        const expiryDate = new Date(doc.expiryDate);
        const daysLeft = Math.ceil((expiryDate.getTime() - Date.now()) / (1000 * 3600 * 24));
        const date = expiryDate.toLocaleDateString('en-IN');
        lines.push(`  • ${doc.documentType}: ${daysLeft} day${daysLeft === 1 ? '' : 's'} left (${date})`);
      });
      lines.push('');
    }
    lines.push('Please renew documents to avoid penalties.');
    lines.push('Contact: 9876543210');
    return lines.join('\n');
  }
  // Main function to send reminders
  async sendVehicleReminders(options: {
    daysThreshold?: number;
    includeAdmins?: boolean;
    dryRun?: boolean;
  } = {}): Promise<{
    success: boolean;
    summary: any;
    results: SMSResult[];
  }> {
    const {
      daysThreshold = 5,
      includeAdmins = true,
      dryRun = false
    } = options;
    console.log('🚀 Starting vehicle reminder service...');
    try {
      // 1. Fetch vehicles from your API
      const response = await fetch(`${this.baseUrl}/api/apps/vehicles`, {
        cache: 'no-store'
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch vehicles: ${response.statusText}`);
      }
      const data = await response.json();
      if (!data.success) {
        throw new Error('API returned unsuccessful response');
      }
      const vehicles: Vehicle[] = data.data;
      const results: SMSResult[] = [];
      let totalSMS = 0;
      // 2. Process each vehicle
      for (const vehicle of vehicles) {
        const expiringDocs = this.getExpiringDocuments(vehicle.documents, daysThreshold);
        const expiredDocs = this.getExpiredDocuments(vehicle.documents);
        if (expiringDocs.length === 0 && expiredDocs.length === 0) {
          continue; // No reminders needed for this vehicle
        }
        // 3. Collect recipients
        const recipients = new Set<string>();
        // Owner mobile
        if (vehicle.ownerMobile) {
          const formatted = this.formatMobileNumber(vehicle.ownerMobile);
          if (formatted) recipients.add(formatted);
        }
        // Driver mobile
        if (vehicle.driverMobile) {
          const formatted = this.formatMobileNumber(vehicle.driverMobile);
          if (formatted) recipients.add(formatted);
        }
        // Admin numbers (from env)
        if (includeAdmins && process.env.ADMIN_NUMBERS) {
          const adminNumbers = process.env.ADMIN_NUMBERS.split(',')
            .map(num => this.formatMobileNumber(num.trim()))
            .filter((num): num is string => num !== null);
          adminNumbers.forEach(num => recipients.add(num));
        }
        if (recipients.size > 0) {
          // 4. Create message
          const message = this.createMessage(vehicle, expiringDocs, expiredDocs);
          // 5. Send SMS (or simulate in dry run)
          if (!dryRun) {
            try {
              const smsResult = await this.sendSMS(Array.from(recipients), message);
              results.push({
                success: smsResult.success,
                vehicleNo: vehicle.vehicleNo,
                recipients: Array.from(recipients),
                messageId: smsResult.messageId
              });
              if (smsResult.success) {
                totalSMS += recipients.size;
              }
            } catch (error) {
              results.push({
                success: false,
                vehicleNo: vehicle.vehicleNo,
                recipients: Array.from(recipients),
                error: error instanceof Error ? error.message : 'Unknown error'
              });
            }
          } else {
            // Dry run - just log
            console.log(`📝 DRY RUN - Would send to ${Array.from(recipients).join(', ')}:`,
              message.substring(0, 100) + '...');
            results.push({
              success: true,
              vehicleNo: vehicle.vehicleNo,
              recipients: Array.from(recipients)
            });
          }
        }
      }
      // 6. Return summary
      const summary = {
        timestamp: new Date().toISOString(),
        totalVehicles: vehicles.length,
        vehiclesProcessed: results.length,
        totalSMS: dryRun ? 'DRY_RUN' : totalSMS,
        mode: dryRun ? 'TEST' : 'LIVE',
        success: results.every(r => r.success) || results.length === 0
      };
      console.log('✅ Reminder service completed:', summary);
      return {
        success: summary.success,
        summary,
        results
      };
    } catch (error) {
      console.error('❌ Reminder service failed:', error);
      throw error;
    }
  }
}
// Export singleton instance
export const smsReminderService = new SMSReminderService();
