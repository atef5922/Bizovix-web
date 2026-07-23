# Backend Integration Guide

Mock services live in `src/services`.

- `demo.service.ts` should connect to `NEXT_PUBLIC_DEMO_API_URL`.
- `contact.service.ts` should connect to `NEXT_PUBLIC_CONTACT_API_URL`.
- `career.service.ts` should connect to `NEXT_PUBLIC_CAREER_API_URL`.
- `newsletter.service.ts` should connect to the chosen email provider.

Each service already returns explicit success or error responses. Replace mock delays with typed API calls, keep validation at the UI boundary, and avoid silent failures.
