#!/usr/bin/env node

/**
 * convert.js
 * Universal CLI tool to convert any web app URL into a high-performance native Android wrapper.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import { setupAppAssets } from './generate-assets.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

function showHelp() {
  console.log(`
======================================================================
  GEEKSMAN UNIVERSAL ANDROID APP WRAPPER GENERATOR
======================================================================

Converts any web app or production URL into a native Android APK / AAB.
The resulting app is a remote wrapper that updates instantly on web release
and inherits native push notifications (FCM), camera, downloads, & back button.

USAGE:
  node scripts/convert.js [options]
  ./convert.sh [options]

OPTIONS:
  --app <id>             Pre-registered app ID from apps.json (e.g. 'ajit-staff', 'ajit-catalogue')
  --url <url>            Production URL to load (e.g. 'https://staff.a3pl.in')
  --name <name>          Human-readable App Name (e.g. 'Ajit Pharma Staff')
  --package <package>    Android Package ID (e.g. 'com.ajitpharma.staff')
  --version <version>    Version name string (default: '1.0.0')
  --version-code <code>  Version integer code (default: 1)
  --icon <path>          Path to custom app icon PNG
  --google-services <f>  Path to custom google-services.json for Firebase push
  --release              Build production release APK / AAB (requires keystore)
  --skip-build           Generate and configure the Android project without compiling Gradle
  --output <dir>         Output destination for generated APKs (default: ./dist/<package>)
  --help                 Show this help manual

EXAMPLES:
  # 1. Build a pre-registered app from apps.json
  ./convert.sh --app ajit-catalogue

  # 2. Convert ANY ad-hoc URL on demand
  ./convert.sh --url https://staff.a3pl.in --name "Ajit Pharma Staff" --package com.ajitpharma.staff

  # 3. Build release signed bundle
  ./convert.sh --app ajit-staff --release
======================================================================
`);
}

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    appId: null,
    url: null,
    name: null,
    package: null,
    version: '1.0.0',
    versionCode: 1,
    icon: null,
    googleServices: null,
    release: false,
    skipBuild: false,
    output: null,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--help' || arg === '-h') {
      showHelp();
      process.exit(0);
    } else if (arg === '--app') {
      options.appId = args[++i];
    } else if (arg === '--url') {
      options.url = args[++i];
    } else if (arg === '--name') {
      options.name = args[++i];
    } else if (arg === '--package') {
      options.package = args[++i];
    } else if (arg === '--version') {
      options.version = args[++i];
    } else if (arg === '--version-code') {
      options.versionCode = parseInt(args[++i], 10) || 1;
    } else if (arg === '--icon') {
      options.icon = args[++i];
    } else if (arg === '--google-services') {
      options.googleServices = args[++i];
    } else if (arg === '--release') {
      options.release = true;
    } else if (arg === '--skip-build') {
      options.skipBuild = true;
    } else if (arg === '--output') {
      options.output = args[++i];
    }
  }

  return options;
}

function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();
  if (isDirectory) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    fs.readdirSync(src).forEach((childItemName) => {
      copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

async function main() {
  const opts = parseArgs();

  // 1. Resolve registered app from apps.json if --app was passed
  if (opts.appId) {
    const appsJsonPath = path.join(ROOT_DIR, 'apps.json');
    if (!fs.existsSync(appsJsonPath)) {
      console.error(`[Error] apps.json not found at: ${appsJsonPath}`);
      process.exit(1);
    }
    const appsData = JSON.parse(fs.readFileSync(appsJsonPath, 'utf-8'));
    const registeredApp = appsData.apps?.[opts.appId];
    if (!registeredApp) {
      console.error(`[Error] App ID '${opts.appId}' not found in apps.json. Available: ${Object.keys(appsData.apps || {}).join(', ')}`);
      process.exit(1);
    }

    opts.name = opts.name || registeredApp.name;
    opts.package = opts.package || registeredApp.package;
    opts.url = opts.url || registeredApp.url;
    opts.version = opts.version || registeredApp.version || '1.0.0';
    opts.versionCode = opts.versionCode || registeredApp.versionCode || 1;
    if (!opts.icon && registeredApp.icon) {
      const resolvedIcon = path.resolve(ROOT_DIR, registeredApp.icon);
      if (fs.existsSync(resolvedIcon)) opts.icon = resolvedIcon;
    }
  }

  // 2. Validate mandatory parameters
  if (!opts.url) {
    console.error('[Error] Target production URL is required (--url <url> or --app <id>).');
    showHelp();
    process.exit(1);
  }

  if (!opts.url.startsWith('http://') && !opts.url.startsWith('https://')) {
    opts.url = `https://${opts.url}`;
  }

  if (!opts.package) {
    try {
      const host = new URL(opts.url).hostname.replace(/[^a-zA-Z0-9]/g, '.');
      opts.package = `in.geeksman.${host}`;
    } catch {
      opts.package = 'in.geeksman.app';
    }
  }

  if (!opts.name) {
    try {
      const host = new URL(opts.url).hostname;
      opts.name = host.split('.')[0].toUpperCase() + ' App';
    } catch {
      opts.name = 'Geeksman App';
    }
  }

  const outputDir = opts.output
    ? path.resolve(opts.output)
    : path.join(ROOT_DIR, 'dist', opts.package);

  console.log(`
----------------------------------------------------------------------
  CONFIGURING ANDROID NATIVE WRAPPER
----------------------------------------------------------------------
  App Name      : ${opts.name}
  Package ID    : ${opts.package}
  Target URL    : ${opts.url}
  Version       : ${opts.version} (Code: ${opts.versionCode})
  Build Mode    : ${opts.release ? 'RELEASE (Signed/AAB)' : 'DEBUG (Test APK)'}
  Output Folder : ${outputDir}
----------------------------------------------------------------------
`);

  const buildDir = path.join(ROOT_DIR, '.build', opts.package);
  if (fs.existsSync(buildDir)) {
    fs.rmSync(buildDir, { recursive: true, force: true });
  }
  fs.mkdirSync(buildDir, { recursive: true });

  // 3. Populate working build directory from template
  console.log('[1/5] Initializing Android workspace template...');
  const templateDir = path.join(ROOT_DIR, 'template');
  copyRecursiveSync(path.join(templateDir, 'android'), path.join(buildDir, 'android'));

  // Ensure gradlew has executable permissions
  const gradlewPath = path.join(buildDir, 'android', 'gradlew');
  if (fs.existsSync(gradlewPath)) {
    fs.chmodSync(gradlewPath, '755');
  }

  // Link node_modules so that ../node_modules resolves for Capacitor plugins
  const nodeModulesSource = path.join(ROOT_DIR, 'node_modules');
  const targetNodeModules = path.join(buildDir, 'node_modules');
  if (fs.existsSync(nodeModulesSource) && !fs.existsSync(targetNodeModules)) {
    try {
      fs.symlinkSync(nodeModulesSource, targetNodeModules, 'junction');
    } catch {
      copyRecursiveSync(nodeModulesSource, targetNodeModules);
    }
  }

  // 4. Configure Capacitor capacitor.config.json & capacitor.config.ts
  console.log('[2/5] Injecting production URL and native bridge configurations...');
  const capacitorConfig = {
    appId: opts.package,
    appName: opts.name,
    webDir: 'public',
    server: {
      url: opts.url,
      cleartext: true,
      androidScheme: 'https',
    },
    plugins: {
      CapacitorHttp: {
        enabled: true,
      },
      PushNotifications: {
        presentationOptions: ['badge', 'sound', 'alert'],
      },
      SplashScreen: {
        launchShowDuration: 1500,
        launchAutoHide: true,
        backgroundColor: '#070b14',
        androidScaleType: 'CENTER_CROP',
        showSpinner: false,
      },
      StatusBar: {
        overlaysWebView: false,
        style: 'DARK',
        backgroundColor: '#070b14',
      },
    },
  };

  // Write capacitor.config.json inside android assets for direct runtime injection
  const assetsDir = path.join(buildDir, 'android/app/src/main/assets');
  fs.mkdirSync(assetsDir, { recursive: true });
  fs.writeFileSync(
    path.join(assetsDir, 'capacitor.config.json'),
    JSON.stringify(capacitorConfig, null, 2)
  );

  // Write capacitor.plugins.json to guarantee native plugins are registered in the bridge
  const plugins = [
    { pkg: "@capacitor/push-notifications", classpath: "com.capacitorjs.plugins.pushnotifications.PushNotificationsPlugin" },
    { pkg: "@capacitor/app", classpath: "com.capacitorjs.plugins.app.AppPlugin" },
    { pkg: "@capacitor/splash-screen", classpath: "com.capacitorjs.plugins.splashscreen.SplashScreenPlugin" },
    { pkg: "@capacitor/status-bar", classpath: "com.capacitorjs.plugins.statusbar.StatusBarPlugin" },
    { pkg: "@capacitor/filesystem", classpath: "com.capacitorjs.plugins.filesystem.FilesystemPlugin" },
    { pkg: "@capacitor/share", classpath: "com.capacitorjs.plugins.share.SharePlugin" }
  ];
  fs.writeFileSync(path.join(assetsDir, 'capacitor.plugins.json'), JSON.stringify(plugins, null, 2));

  // 5. Configure Android Gradle & Manifest
  console.log('[3/5] Configuring Android build.gradle & package naming...');
  const gradleAppTemplate = fs.readFileSync(path.join(templateDir, 'build.gradle.app.template'), 'utf-8');
  const renderedAppGradle = gradleAppTemplate
    .replace(/\{\{APP_ID\}\}/g, opts.package)
    .replace(/\{\{VERSION_CODE\}\}/g, String(opts.versionCode))
    .replace(/\{\{VERSION_NAME\}\}/g, opts.version);
  fs.writeFileSync(path.join(buildDir, 'android/app/build.gradle'), renderedAppGradle);

  // Update strings.xml with app name
  const stringsPath = path.join(buildDir, 'android/app/src/main/res/values/strings.xml');
  if (fs.existsSync(stringsPath)) {
    let stringsXml = fs.readFileSync(stringsPath, 'utf-8');
    stringsXml = stringsXml
      .replace(/<string name="app_name">.*?<\/string>/, `<string name="app_name">${opts.name}</string>`)
      .replace(/<string name="title_activity_main">.*?<\/string>/, `<string name="title_activity_main">${opts.name}</string>`)
      .replace(/<string name="package_name">.*?<\/string>/, `<string name="package_name">${opts.package}</string>`);
    fs.writeFileSync(stringsPath, stringsXml);
  }

  // Create MainActivity.java with correct package path
  const packageDir = path.join(buildDir, 'android/app/src/main/java', ...opts.package.split('.'));
  fs.mkdirSync(packageDir, { recursive: true });
  const mainActivityTemplate = fs.readFileSync(path.join(templateDir, 'MainActivity.java.template'), 'utf-8');
  const renderedMainActivity = mainActivityTemplate.replace(/\{\{PACKAGE_NAME\}\}/g, opts.package);
  fs.writeFileSync(path.join(packageDir, 'MainActivity.java'), renderedMainActivity);

  // 6. Setup Firebase google-services.json
  console.log('[4/5] Checking Firebase Cloud Messaging (google-services.json)...');
  const googleServicesTarget = path.join(buildDir, 'android/app/google-services.json');
  let googleServicesSource = opts.googleServices;

  if (!googleServicesSource || !fs.existsSync(googleServicesSource)) {
    const defaultCoreService = path.join(ROOT_DIR, 'config/google-services.json');
    if (fs.existsSync(defaultCoreService)) {
      googleServicesSource = defaultCoreService;
    }
  }

  if (googleServicesSource && fs.existsSync(googleServicesSource)) {
    fs.copyFileSync(googleServicesSource, googleServicesTarget);
    console.log(`[Firebase] Applied google-services.json from: ${googleServicesSource}`);
  } else {
    console.log('[Firebase] Warning: No google-services.json found. App will build cleanly without FCM.');
  }

  // 7. Setup icons if custom icon was provided
  if (opts.icon) {
    setupAppAssets(path.join(buildDir, 'android/app/src/main/res'), opts.icon);
  }

  if (opts.skipBuild) {
    console.log(`[Complete] Android project created at: ${path.join(buildDir, 'android')} (--skip-build specified)`);
    return;
  }

  // 8. Compile via Gradle
  console.log('[5/5] Compiling Android native package with Gradle...');
  fs.mkdirSync(outputDir, { recursive: true });

  const gradleCmd = opts.release
    ? './gradlew assembleRelease bundleRelease'
    : './gradlew assembleDebug';

  const androidDir = path.join(buildDir, 'android');
  console.log(`[Gradle] Executing: ${gradleCmd} in ${androidDir}`);

  try {
    execSync(gradleCmd, {
      cwd: androidDir,
      stdio: 'inherit',
      env: {
        ...process.env,
      },
    });
  } catch (err) {
    console.error(`[Error] Gradle build failed: ${err.message}`);
    process.exit(1);
  }

  // 9. Harvest output artifacts
  const apkDebugPath = path.join(androidDir, 'app/build/outputs/apk/debug/app-debug.apk');
  const apkReleasePath = path.join(androidDir, 'app/build/outputs/apk/release/app-release.apk');
  const aabReleasePath = path.join(androidDir, 'app/build/outputs/bundle/release/app-release.aab');

  let exportedCount = 0;
  if (fs.existsSync(apkDebugPath)) {
    const destName = `${opts.package}-v${opts.version}-debug.apk`;
    fs.copyFileSync(apkDebugPath, path.join(outputDir, destName));
    console.log(`[Artifact] Generated Debug APK: ${path.join(outputDir, destName)}`);
    exportedCount++;
  }

  if (fs.existsSync(apkReleasePath)) {
    const destName = `${opts.package}-v${opts.version}-release.apk`;
    fs.copyFileSync(apkReleasePath, path.join(outputDir, destName));
    console.log(`[Artifact] Generated Release APK: ${path.join(outputDir, destName)}`);
    exportedCount++;
  }

  if (fs.existsSync(aabReleasePath)) {
    const destName = `${opts.package}-v${opts.version}-release.aab`;
    fs.copyFileSync(aabReleasePath, path.join(outputDir, destName));
    console.log(`[Artifact] Generated Release AAB: ${path.join(outputDir, destName)}`);
    exportedCount++;
  }

  console.log(`
======================================================================
  SUCCESS! ANDROID NATIVE WRAPPER CREATED
======================================================================
  Application : ${opts.name} (${opts.package})
  Remote URL  : ${opts.url}
  Artifacts   : ${outputDir} (${exportedCount} files generated)
======================================================================
`);
}

main().catch((err) => {
  console.error('[Fatal Error]', err);
  process.exit(1);
});
