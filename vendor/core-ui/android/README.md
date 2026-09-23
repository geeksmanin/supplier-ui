# Geeksman Universal Android Wrapper & Automated Build Pipeline

Convert any web app or production URL into a native Android wrapper (`.apk` / `.aab`).

---

## 🌟 How It Works: The "Zero-Update" Remote Wrapper

Instead of bundling static JavaScript and CSS assets into the APK, this tool builds a native Android container powered by Capacitor that dynamically loads the production URL (`server.url: "https://..."`).

- **Instant Releases**: When you deploy updates to your web servers, mobile users see the changes immediately on app launch—no app store review, no manual APK downloads.
- **Native Superpowers**: Even though the UI runs from the web, the app has full access to native Android features:
  - **Push Notifications (FCM HTTP v1)** with high-priority channels (`geeksman_alerts`, `geeksman_chat`) with custom sound and vibration.
  - **Native File Downloads**: Automatically routes PDF invoices, Excel spreadsheets, and CSV exports to the Android device `Downloads/` directory using Android's native `DownloadManager`.
  - **Barcode & QR Scanning**: Native hardware camera barcode scanning via MLKit.
  - **Android Hardware Back Button**: Closes open modal dialogs, goes back in navigation history, and exits cleanly at the root dashboard.
  - **External Intent Routing**: Links to payment gateways (Razorpay, UPI), WhatsApp, and Google Maps open smoothly in their native apps rather than trapping inside the WebView.

---

## 🚀 Quick Start

### 1. Convert Any Web URL on Demand
```bash
# Convert any arbitrary URL into an Android APK:
./convert.sh --url https://staff.a3pl.in --name "Ajit Pharma Staff" --package com.ajitpharma.staff
```

### 2. Build a Pre-Registered App from `apps.json`
```bash
# Build Ajit Pharma Catalogue
./convert.sh --app ajit-catalogue

# Build Ajit Pharma Staff
./convert.sh --app ajit-staff
```

### 3. Generate Signed Production Release (APK + AAB)
```bash
./convert.sh --app ajit-staff --release
```

---

## 📁 Directory Structure

```
core-ui/android/
├── Dockerfile              # Docker build container (JDK 17 + Android SDK 34 + Gradle)
├── convert.sh              # CLI runner (auto-detects Docker or host environment)
├── apps.json               # Declarative app registry
├── config/
│   └── google-services.json# Central Firebase client configuration
├── scripts/
│   ├── convert.js          # Node orchestration engine
│   └── generate-assets.js  # App icon & splash screen installer
├── template/               # Parameterizable Capacitor Android project
│   ├── build.gradle.app.template
│   ├── MainActivity.java.template
│   ├── capacitor.config.template.ts
│   └── android/            # Clean Android Gradle skeleton
└── dist/                   # Output folder for generated APKs & AABs
```

---

## 🔔 Firebase Cloud Messaging (FCM) Setup

1. Register your package ID (e.g. `com.ajitpharma.staff`) in your [Firebase Console](https://console.firebase.google.com).
2. Download `google-services.json` and place it in `config/google-services.json` (or pass via `--google-services <path>`).
3. In backend services (`notification`), configure `firebase.service_account_file` or `firebase.service_account_json` to enable FCM HTTP v1 notifications.
