# Security Review & Privacy Compliance

Security and learner privacy are core engineering imperatives of the UCAG platform.

---

## Key Security Gates

1. **Server-Isolated Secrets**:
   - Firebase Admin SDK credentials and Gemini API keys are isolated server-side via `import "server-only"`.
   - Client bundles never receive private service account keys or internal tokens.

2. **POPIA Compliance & Document Privacy**:
   - The Application Document Assistant (`/application/documents`) performs file metadata validation (mime type, 5MB limit, category classification) entirely in the browser.
   - Zero identity documents, matric results, or utility bills are uploaded to server storage without explicit user action.

3. **Rate Limiting & Abuse Prevention**:
   - AI endpoints (`/api/chat`, `/api/studymate/*`) are protected by sliding-window rate limiters preventing automated spam or API exhaustion.

4. **Firestore Security Rules**:
   - Verified catalogue collections (`institutions`, `programmes`, `apsRules`, `applicationWindows`) are read-only for public clients and writable only by authorized admin service accounts.
