// /src/app/api/reminders/send/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { smsReminderService } from '../../../../../libs/sms-reminder-service';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const apiKey = request.nextUrl.searchParams.get('apiKey');

    if (process.env.REMINDER_API_KEY) {
      const validKey = process.env.REMINDER_API_KEY;
      const providedKey = authHeader?.replace('Bearer ', '') || apiKey;

      if (providedKey !== validKey) {
        return NextResponse.json(
          { success: false, message: 'Unauthorized' },
          { status: 401 }
        );
      }
    }

    const body = await request.json().catch(() => ({}));
    const {
      daysThreshold = 5,
      dryRun = false,
      adminNumbers = [],
      includeAdmins = true
    } = body;

    // ✅ FIXED IP HANDLING
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      'unknown';

    console.log(`📨 Reminder request from:`, {
      ip,
      dryRun,
      daysThreshold
    });

    if (adminNumbers.length > 0 && process.env.ADMIN_NUMBERS) {
      process.env.ADMIN_NUMBERS = adminNumbers.join(',');
    }

    const result = await smsReminderService.sendVehicleReminders({
      daysThreshold,
      includeAdmins,
      dryRun
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('❌ API Error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    {
      message: 'Use POST method to send reminders',
      example: {
        method: 'POST',
        body: {
          daysThreshold: 5,
          dryRun: true,
          adminNumbers: ['919876543210']
        }
      }
    },
    { status: 200 }
  );
}
