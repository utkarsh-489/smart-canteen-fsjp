# Smart Canteen — Final Run Guide (Image Upload Fixed)

## Backend

Open PowerShell 1:

```powershell
cd "<EXTRACTED>\smart-canteen-fsjp\backend"
mvn clean package
mvn spring-boot:run
```

Keep it running.

## Frontend

Open PowerShell 2:

```powershell
cd "<EXTRACTED>\smart-canteen-fsjp\frontend"
npm install
npm run dev
```

Open `http://localhost:5173`.

## Image upload test

1. Login as Staff.
2. Open Manage Menu.
3. Click `Image` for an existing item.
4. Select a JPG/PNG/WEBP image.
5. Wait for `Food image uploaded successfully.`
6. The backend creates `backend\uploads\menu\menu-<id>.<ext>`.
7. Open Student. The Student menu polls every 5 seconds and cache-busts the image URL, so the new image appears automatically.

For a brand-new item, choose the image before `Add Item`; the item is created first, then the selected image is uploaded against the new item ID.
