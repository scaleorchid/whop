// Whop Webhook Handler
// This function receives webhook events from Whop and logs the
// payment_method_id and member_id you need to charge later.
//
// Your webhook URL will be:
// https://YOUR-SITE.netlify.app/.netlify/functions/whop-webhook

export default async (request, context) => {
  // Only accept POST requests
  if (request.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const payload = JSON.parse(await request.text());
    const eventType = payload.type;

    console.log(`[Whop Webhook] Event received: ${eventType}`);

    // ─── SETUP INTENT SUCCEEDED ───────────────────────────────
    // Fires when the customer's payment method is saved.
    // This gives you the payment_method_id and member_id.
    if (eventType === "setup_intent.succeeded") {
      const setupIntent = payload.data;
      const paymentMethodId = setupIntent.payment_method?.id;
      const memberId = setupIntent.member?.id;
      const metadata = setupIntent.metadata;

      console.log("──────────────────────────────────────");
      console.log("PAYMENT METHOD SAVED");
      console.log(`  Payment Method ID: ${paymentMethodId}`);
      console.log(`  Member ID:         ${memberId}`);
      console.log(`  Metadata:          ${JSON.stringify(metadata)}`);
      console.log("──────────────────────────────────────");

      // ┌─────────────────────────────────────────────────────┐
      // │  TODO: Store paymentMethodId and memberId somewhere │
      // │  Options:                                           │
      // │  - A database (Supabase, PlanetScale, etc.)         │
      // │  - Airtable                                         │
      // │  - Google Sheets API                                │
      // │  - Notion API                                       │
      // │  - Even a simple JSON file in cloud storage         │
      // └─────────────────────────────────────────────────────┘
    }

    // ─── PAYMENT SUCCEEDED ────────────────────────────────────
    // Fires when any payment goes through (initial or off-session).
    if (eventType === "payment.succeeded") {
      const payment = payload.data;
      console.log("──────────────────────────────────────");
      console.log("PAYMENT SUCCEEDED");
      console.log(`  Payment ID: ${payment.id}`);
      console.log(`  Amount:     ${payment.final_amount} ${payment.currency}`);
      console.log(`  Member ID:  ${payment.member?.id}`);
      console.log("──────────────────────────────────────");
    }

    // ─── PAYMENT FAILED ───────────────────────────────────────
    // Fires when an off-session charge fails.
    if (eventType === "payment.failed") {
      const payment = payload.data;
      console.log("──────────────────────────────────────");
      console.log("PAYMENT FAILED");
      console.log(`  Payment ID: ${payment.id}`);
      console.log(`  Member ID:  ${payment.member?.id}`);
      console.log(`  Reason:     ${payment.failure_message}`);
      console.log("──────────────────────────────────────");

      // TODO: Notify yourself or the customer about the failure
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[Whop Webhook] Error:", error);
    return new Response(JSON.stringify({ error: "Processing failed" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
