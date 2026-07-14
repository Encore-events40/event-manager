import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { to, eventName } = await request.json()

    if (!to || !eventName) {
      return NextResponse.json({ error: "Missing payload data" }, { status: 400 })
    }

    const sendgridPayload = {
      personalizations: [{ to: [{ email: to }] }],
      from: { email: "noreply@encoreevents.com" }, // Change to your verified domain sender
      subject: `Encore Events - Application Approved!`,
      content: [
        {
          type: "text/plain",
          value: `Congratulations! Your application to volunteer for "${eventName}" has been officially approved by our administrative team. We will be in touch shortly regarding coordination detail adjustments.`
        }
      ]
    }

    const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.SENDGRID_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(sendgridPayload)
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error("SendGrid API error context:", errorData)
      return NextResponse.json({ error: "Failed executing mailing request" }, { status: 500 })
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}