import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(req: Request) {
  try {
    const { orderId, courierName, recipientData, amountToCollect } = await req.json();

    let courierResponse;

    if (courierName === 'steadfast') {
      // Steadfast API Integration Example
      courierResponse = await axios.post(
        'https://portal.packzy.com/api/v1/create_order',
        {
          invoice: orderId,
          recipient_name: recipientData.fullName,
          recipient_phone: recipientData.phone,
          recipient_address: recipientData.address,
          amount_to_collect: amountToCollect,
        },
        {
          headers: {
            'Api-Key': process.env.STEADFAST_API_KEY,
            'Secret-Key': process.env.STEADFAST_SECRET_KEY,
            'Content-Type': 'application/json',
          },
        }
      );
    } else if (courierName === 'pathao') {
      // Pathao API integration placeholder
      // similar POST request to Pathao Courier API endpoint
      courierResponse = { data: { success: true, consignment_id: 'PTA-123456' } };
    }

    return NextResponse.json({ success: true, data: courierResponse.data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
