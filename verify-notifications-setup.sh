#!/bin/bash

# Push Notifications Setup Verification Script
# Run this to verify push notification configuration

set -e

echo "🔍 Perfect Day - Push Notifications Setup Verification"
echo "======================================================"
echo ""

# Check 1: Dependencies installed
echo "✓ Checking dependencies..."
if grep -q "@capacitor-firebase/messaging" package.json; then
  echo "  ✅ Firebase Messaging plugin found in package.json"
else
  echo "  ❌ Firebase Messaging plugin NOT in package.json"
  echo "     Run: npm install @capacitor-firebase/messaging"
  exit 1
fi

# Check 2: Service Worker exists
echo ""
echo "✓ Checking service worker..."
if [ -f "public/firebase-messaging-sw.js" ]; then
  echo "  ✅ Service worker found at public/firebase-messaging-sw.js"
else
  echo "  ❌ Service worker NOT found"
  exit 1
fi

# Check 3: Messaging service exists
echo ""
echo "✓ Checking messaging service..."
if [ -f "src/lib/messaging.ts" ]; then
  echo "  ✅ Messaging service found at src/lib/messaging.ts"
else
  echo "  ❌ Messaging service NOT found"
  exit 1
fi

# Check 4: Hook exists
echo ""
echo "✓ Checking notification hook..."
if [ -f "src/hooks/usePushNotifications.ts" ]; then
  echo "  ✅ Notification hook found at src/hooks/usePushNotifications.ts"
else
  echo "  ❌ Notification hook NOT found"
  exit 1
fi

# Check 5: Environment variables
echo ""
echo "✓ Checking environment variables..."
if [ -f ".env.local" ]; then
  if grep -q "NEXT_PUBLIC_FIREBASE_API_KEY" .env.local; then
    echo "  ✅ Firebase API key configured"
  else
    echo "  ⚠️  Firebase API key not found in .env.local"
  fi
  
  if grep -q "NEXT_PUBLIC_FIREBASE_VAPID_KEY" .env.local; then
    echo "  ✅ VAPID key configured"
  else
    echo "  ⚠️  VAPID key not found (required for web push)"
    echo "     Add to .env.local:"
    echo "     NEXT_PUBLIC_FIREBASE_VAPID_KEY=your_vapid_key"
  fi
else
  echo "  ⚠️  .env.local not found"
  echo "     Create .env.local with Firebase credentials"
fi

# Check 6: Capacitor config
echo ""
echo "✓ Checking Capacitor configuration..."
if grep -q "FirebaseMessaging" capacitor.config.ts; then
  echo "  ✅ Firebase Messaging plugin configured in capacitor.config.ts"
else
  echo "  ❌ Firebase Messaging plugin NOT configured in capacitor.config.ts"
  exit 1
fi

# Check 7: Android setup
echo ""
echo "✓ Checking Android setup..."
if [ -f "android/app/google-services.json" ]; then
  echo "  ✅ google-services.json found"
else
  echo "  ⚠️  google-services.json not found (required for Android)"
  echo "     Download from Firebase Console and place in android/app/"
fi

# Check 8: Documentation
echo ""
echo "✓ Checking documentation..."
if [ -f "PUSH_NOTIFICATIONS.md" ]; then
  echo "  ✅ PUSH_NOTIFICATIONS.md found"
else
  echo "  ⚠️  PUSH_NOTIFICATIONS.md not found"
fi

if [ -f "NOTIFICATION_EXAMPLES.md" ]; then
  echo "  ✅ NOTIFICATION_EXAMPLES.md found"
else
  echo "  ⚠️  NOTIFICATION_EXAMPLES.md not found"
fi

if [ -f "NOTIFICATIONS_QUICKSTART.md" ]; then
  echo "  ✅ NOTIFICATIONS_QUICKSTART.md found"
else
  echo "  ⚠️  NOTIFICATIONS_QUICKSTART.md not found"
fi

echo ""
echo "======================================================"
echo "✅ Setup Verification Complete!"
echo ""
echo "Next steps:"
echo "  1. Ensure NEXT_PUBLIC_FIREBASE_VAPID_KEY is in .env.local"
echo "  2. Run: npm install"
echo "  3. Run: npm run build:android && npm run android:sync"
echo "  4. Test on device"
echo ""
echo "For troubleshooting, see PUSH_NOTIFICATIONS.md"
