# Known Issues

## Issue #1: Docker Integration Broken
**Status:** Open
**Priority:** High

### Problem
Docker integration is not working properly. The app and PocketBase need to be started manually instead of via docker-compose.

### Current Workaround
```bash
# Start PocketBase manually
/tmp/pocketbase serve --dir=pb_data --http=0.0.0.0:8090

# Start App manually  
PORT=3456 node build/index.js
```

### Expected Behavior
`docker-compose up -d` should start both services correctly.

### Environment
- OS: Linux
- Docker: permission denied on socket
- PocketBase: v0.37.4

---

## Issue #2: PocketBase Admin Login Not Working
**Status:** Open
**Priority:** High

### Problem
Admin login to PocketBase admin panel (`/_`) is not working with provided credentials.

### Current Credentials (not working)
- Email: `__pbinstaller@example.com`
- Password: `TestAdmin123!` or `admin123`

### Workaround
Direct database manipulation via SQLite:
```bash
sqlite3 pb_data/data.db "SELECT * FROM _superusers"
```

### Solution Needed
- Reset admin password properly
- Or create new admin user

---

## Issue #3: API Rules Too Restrictive
**Status:** Open
**Priority:** Medium

### Problem
API Rules with `@request.auth.id = owner` prevent public access and cause 400 errors for unauthenticated users.

### Current Rules (problematic)
```sql
listRule = '@request.auth.id = owner'
viewRule = '@request.auth.id = owner'
```

### Temporary Fix Applied
```sql
listRule = ''
viewRule = ''
```

### Solution Needed
- Implement proper authentication flow
- Or create public access rules for testing

---

## Issue #4: CSS/Design Not Loading Properly
**Status:** Open
**Priority:** Medium

### Problem
The app shows HTML structure but styling is not applied correctly. Console shows:
- CSS preload warnings
- Tailwind classes not working

### Current Behavior
- Page loads with HTML structure
- No dark theme applied
- Layout looks broken

### Solution Needed
- Fix Tailwind CSS compilation
- Check CSS delivery
- Verify build output

---

## Issue #5: Network Configuration
**Status:** Open
**Priority:** Medium

### Problem
Frontend cannot connect to PocketBase when accessed from external devices.

### Current Configuration
- Frontend URL: `http://192.168.178.5:3456`
- PocketBase URL: `http://localhost:8090` (hardcoded)

### Solution Needed
- Make PocketBase URL configurable
- Use relative URLs or environment variables
- Support for different network setups

---

## Issue #6: Node_modules Committed to Git
**Status:** Open
**Priority:** Low

### Problem
`node_modules` was accidentally committed to the repository, making it very large.

### Solution
Add to `.gitignore`:
```
node_modules/
.svelte-kit/
build/
pb_data/
```

Then clean repository:
```bash
git rm -r --cached node_modules
git commit -m "Remove node_modules from tracking"
```
