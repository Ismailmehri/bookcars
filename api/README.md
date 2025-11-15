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
