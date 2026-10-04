# Smart Canteen image upload fix

Staff image uploads are stored under `backend/uploads/menu/` as `menu-<id>.<ext>` plus a MIME sidecar.

The image GET endpoint is public and returns the stored media type. The frontend cache-busts image requests after an upload, and student menu polling refreshes menu data every 5 seconds.

Test:
1. Start backend.
2. Login as Staff.
3. Manage Menu -> Image -> choose JPG/PNG/WEBP.
4. Wait for "Food image uploaded successfully."
5. Confirm `backend/uploads/menu/menu-<id>.*` exists.
6. Open Student; the new image should appear automatically within 5 seconds.
