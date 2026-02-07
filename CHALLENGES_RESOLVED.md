# AI Cover Letter Generator: Technical Challenges & Resolutions

This document outlines the key issues encountered during the development of the AI Cover Letter Generator and the solutions implemented to resolve them.

## 1. Google Gemini Model Availability (404 Errors)
- **Issue:** The standard `gemini-1.5-flash` and `gemini-1.5-pro` model identifiers returned `404 Not Found` errors when called via the Vercel AI SDK, despite working in raw `curl` commands.
- **Root Cause:** API key permissions and region-specific rollouts meant that certain aliases were not recognized in the `v1beta` channel used by the SDK.
- **Resolution:** Performed a manual API inspection using `ListModels`, which revealed that the API key was specifically provisioned for the new **`gemini-2.5-flash`** model. Updating the identifier to this exact string resolved the 404.

## 2. Vercel AI SDK Versioning (Method Not Found)
- **Issue:** The installed version of the `ai` library (`6.0.77`) did not contain the standard `toDataStreamResponse()` method, leading to a `TypeError`.
- **Root Cause:** This version appears to be a bleeding-edge or experimental release where several standard utility methods were renamed or relocated compared to the stable `v3` or `v4` documentation.
- **Resolution:** Switched to `toTextStreamResponse()` with manual header overrides (`x-vercel-ai-data-stream: v1`) to maintain protocol compatibility.

## 3. Streaming Protocol Mismatch (Empty UI)
- **Issue:** The Network tab showed data being received (e.g., `0:"text..."`), but the `useCompletion` hook from `@ai-sdk/react` was not displaying the text in the UI.
- **Root Cause:** A mismatch between the SDK's internal data stream protocol and the response formatting in version `6.0.77`. The hook was expecting a specific chunk format that wasn't being correctly decoded.
- **Resolution:** Replaced the `useCompletion` hook with a **Manual Stream Reader** implementation in `app/page.tsx`. By using a standard `fetch` with a `ReadableStream` reader and `TextDecoder`, we bypassed the protocol requirements and successfully rendered raw text as it arrived.

## 4. Hugeicons Integration
- **Issue:** The `@hugeicons/react` package required a separate core icon set that was initially missing from the environment.
- **Resolution:** Installed `@hugeicons/core-free-icons` and implemented the icons using the `HugeiconsIcon` wrapper component as required by the library's latest usage patterns.

## 5. Next.js Payload Synchronization
- **Issue:** Initial attempts showed empty prompts in the API request payload.
- **Resolution:** Updated the frontend to explicitly combine the Resume and Job Description into a single string passed directly to the generation call, ensuring the latest React state values are always captured.
