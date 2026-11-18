# Meta App Review — Ready-to-Paste Submission Pack

**Legal Business Portfolio:** Emperor Smart Solutions (`1015715961606549` — Verified)  
**Meta App ID:** `4558736907726599`  
**Connected Test WABA ID:** `1443126003997682` (`+91 83067 67847` • Phone ID: `1410175982181803`)

---

## 1. Screencast Video Files to Upload

1. **For `whatsapp_business_messaging`:**  
   Upload `1_whatsapp_business_messaging.mp4` (`1920x1080` H.264 MP4, 46s, 3.29 MB)
2. **For `whatsapp_business_management`:**  
   Upload `2_whatsapp_business_management.mp4` (`1920x1080` H.264 MP4, 50s, 2.54 MB)

> **Important Before Clicking Submit:** Only include `whatsapp_business_messaging` and `whatsapp_business_management` (plus `public_profile` / `email` if auto-included) in your submission. Remove any unused Instagram or extra permissions from the review request so Meta does not ask for additional videos.

---

## 2. Copy-Paste: App Verification / Reviewer Testing Instructions

```text
CONVOZA (by Emperor Smart Solutions) is a multi-tenant B2B WhatsApp Business Cloud API v20.0 SaaS platform enabling business clients to onboard their WhatsApp Business Accounts (WABAs), manage message templates, and handle real-time customer support via a Shared Team Inbox.

Reviewer Test Credentials (No 2FA/OTP required):
- Application Login URL: https://convoza.emperorsmartsolutions.com/dashboard/login
- Test Email: owner@emperorsmartsolutions.com
- Test Password: Demo@Convoza2026!

Step-by-Step Testing Guide for Meta Reviewer:
1. Log in at https://convoza.emperorsmartsolutions.com/dashboard/login using the credentials above.
2. WABA & Asset Management (whatsapp_business_management):
   - Open "WhatsApp Numbers" (/dashboard/whatsapp) in the left sidebar to inspect the connected WABA (ID: 1443126003997682, Phone: +91 83067 67847) and click "Sync" to fetch live quality rating and messaging tier from Meta Graph API v20.0.
   - Open "Template Builder" (/dashboard/templates), click "Sync from Meta" to pull WABA templates, or click "+ Create Template" to create and submit a new template directly to POST /{waba-id}/message_templates.
3. Outbound & 2-Way Messaging (whatsapp_business_messaging):
   - Open "Single Message" (/dashboard/messages), enter any WhatsApp-enabled phone number in E.164 format (e.g., +1...), select an APPROVED template, fill any variable, and click "Dispatch Message via Meta Cloud API".
   - Reply from your WhatsApp handset to +91 83067 67847, then open "Shared Team Inbox" (/dashboard/inbox) to view the real-time webhook message and send a 24-hour customer service reply.
```

---

## 3. Copy-Paste: `whatsapp_business_messaging` Permission Justification

```text
CONVOZA uses the whatsapp_business_messaging permission to allow businesses onboarded onto our SaaS platform to send approved Utility, Authentication, and Marketing template messages and conduct real-time 2-way customer support conversations within the 24-hour customer service window via the Official Meta WhatsApp Cloud API v20.0 (POST /{phone-number-id}/messages) and real-time webhook events.

As demonstrated in the attached split-screen screencast (1_whatsapp_business_messaging.mp4):
1. A business user logs into https://convoza.emperorsmartsolutions.com, navigates to Single Message (/dashboard/messages), and dispatches an approved template from WABA +91 83067 67847, which arrives immediately on the recipient's live WhatsApp client.
2. When the customer replies from WhatsApp, CONVOZA ingests the signed Meta webhook and streams the message live into the Shared Team Inbox (/dashboard/inbox), where the support agent sends a real-time 24h session reply with delivery and read receipts.
```

---

## 4. Copy-Paste: `whatsapp_business_management` Permission Justification

```text
CONVOZA uses the whatsapp_business_management permission to allow business customers to connect and manage their WhatsApp Business Accounts (WABAs) via Meta Embedded Signup, synchronize phone number quality ratings and messaging limit tiers, synchronize existing WABA templates, and create/submit new message templates directly to Meta Graph API v20.0 (GET/POST /{waba-id}/message_templates and POST /{waba-id}/subscribed_apps).

As demonstrated in the attached screencast (2_whatsapp_business_management.mp4):
1. The business user inspects their connected WABA (ID: 1443126003997682) under WhatsApp Numbers (/dashboard/whatsapp) and synchronizes account quality/tier metadata from Meta Graph API.
2. Under Template Builder (/dashboard/templates), the user syncs existing templates from Meta and creates & submits a new Utility template live to Meta Graph API, immediately receiving the assigned Meta Template ID and PENDING review status in the catalog.
```
