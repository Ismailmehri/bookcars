# Meta Conversions API integration

This service exposes a secure endpoint for forwarding events from the BookCars backend to the Meta Conversions API.

## Environment variables

Create a `.env` file based on `.env.example` with:

- `META_PIXEL_ID` – Meta Pixel identifier.
- `META_PIXEL_TOKEN` – Meta access token generated in Events Manager.
- `META_API_VERSION` – Graph API version (defaults to `v21.0`).

## Endpoint

`POST /api/meta/events`

Example payload:

```json
{
  "eventName": "Purchase",
  "eventSourceUrl": "https://plany.tn/reservation",
  "userData": {
    "email": "user@test.com",
    "phone": "+21655555555",
    "city": "Tunis",
    "ip": "102.16.22.11"
  },
  "customData": {
    "value": 132,
    "currency": "TND"
  },
  "content": {
    "type": "car",
    "ids": ["car_123"]
  }
}
```

The middleware automatically enriches the payload with the caller IP and user agent before it is validated and forwarded to Meta. Sensitive fields (email and phone) are normalised and hashed with SHA-256 on the server.

## Required Meta fields

| Field | Source | Notes |
| --- | --- | --- |
| `action_source` | Request payload (defaults to `website`) | Required by Meta for attribution. |
| `event_source_url` | Request payload or inferred from the HTTP request | Must be an absolute URL pointing to the page where the action occurred. |
| `client_user_agent` | HTTP headers (`user-agent`) | Forwarded without hashing for device matching. |
| `event_id` | Generated server-side (`plany-<uuid>`) unless provided | Shared with the pixel to enable CAPI/pixel deduplication. |
| `user_data.em`, `user_data.ph`, `user_data.fn`, `user_data.ln`, `user_data.ct`, `user_data.zp`, `user_data.country` | Request payload | Normalised (lowercase, diacritics stripped) then SHA-256 hashed. |
| `user_data.fbp`, `user_data.fbc` | Cookies `_fbp` / `_fbc` (sent via frontend payload) | Passed in clear text to improve Event Match Quality. |
| `client_ip_address` | Request metadata (supports `x-forwarded-for`) | Used as-is for matching. |

## Event deduplication

- Every call receives an `event_id` in the form `plany-<uuid>` if the caller does not supply one. The frontend uses the same helper to inject the identifier into both GTM/pixel events and the CAPI payload so Meta can deduplicate duplicates.
- When integrating a custom tracker ensure the same `event_id` is forwarded alongside the browser event.

## User data normalisation & hashing

- Emails, phones, first/last names, city, postal code and country codes are normalised (trimmed, lowercased, diacritics removed) before being SHA-256 hashed.
- Phone numbers are normalised to E.164 format prior to hashing. If a country code is provided it is used to infer the dialling prefix.
- IP address and user agent are forwarded in clear text as required by Meta. Cookies `_fbp` and `_fbc` are passed through without hashing.

## Retry and replay strategy

- The service retries transient errors (HTTP ≥ 500, network timeouts) with exponential backoff (500ms base, up to five attempts).
- After the synchronous retries are exhausted the event is queued in memory and retried in the background until the retry budget is consumed. Successful replays are logged together with the Meta `fbtrace_id`.
- Queue metrics can be inspected via the exported test helpers to aid observability.

## Front-end usage

A Next.js client can trigger events via `fetch`:

```ts
await fetch('/api/meta/events', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    eventName: 'InitiateCheckout',
    eventSourceUrl: 'https://plany.tn/checkout',
    userData: { email: 'user@test.com' },
    content: { ids: ['car_123'], type: 'car' }
  })
})
```

For test mode, add `testEventCode` to the payload to forward events to the Meta Test Events dashboard.

## Testing & QA

- Use the `testEventCode` field when working inside Meta Events Manager's “Test Events” tab. The frontend exposes a toggle in the Meta events context so QA can override it without code changes.
- Automated tests cover hashing, deduplication and retry flows. Run `npm test --silent` inside both `api/` and `frontend/` to ensure regressions are caught.

## Frontend instrumentation

The public React client wraps the application with `MetaEventsProvider` (see `frontend/src/App.tsx`). The provider auto-tracks
page views and exposes the `useMetaEvents` hook so features can submit additional conversions without leaking credentials.

Example usage inside a component:

```tsx
import { useMetaEvents } from '@/context/MetaEventsContext'

const CheckoutSummary = ({ bookingId, total }) => {
  const { trackEvent, status, error } = useMetaEvents()

  const handleConfirm = async () => {
    await trackEvent({
      eventName: 'Purchase',
      customData: { value: total, currency: 'TND', orderId: bookingId },
      content: { ids: [bookingId], type: 'car' },
    })
  }

  return (
    <button type="button" onClick={handleConfirm} disabled={status === 'loading'}>
      {status === 'loading' ? 'Sending…' : 'Confirm purchase'}
      {status === 'error' && <span role="alert">{error}</span>}
    </button>
  )
}
```

The provider exposes screen-reader announcements and keeps track of loading/error states so the UI can remain accessible while
events are dispatched from the backend.
