## 项目说明

基于 Vue 3 + Vite + Pinia + Vue Router，使用 Capacitor 7 打包为 Android APK。

## 环境准备

- Node.js 18+（建议 20+）
- Java 17（Android Gradle Plugin 8 需要）
- Android Studio（含 Android SDK/Platform、SDK Platform-Tools、Build-Tools）
- 环境变量（Windows）
  - `JAVA_HOME` 指向 JDK 17 根目录
  - `ANDROID_SDK_ROOT` 指向 Android SDK 根目录（如 `C:\\Users\\<you>\\AppData\\Local\\Android\\Sdk`）
  - 将 `%ANDROID_SDK_ROOT%\\platform-tools` 与 `%ANDROID_SDK_ROOT%\\build-tools\\<version>` 加入 `PATH`

## 安装与本地运行

```bash
# 安装依赖
npm i

# 启动 H5 开发服务器
npm run dev
```

## 生产构建（Web 资源）

```bash
# 生成 dist/ 目录（供 Capacitor 打包）
npm run build
```

## 使用 Capacitor 构建 Android APK

首次添加 Android 平台（只需一次）：

```bash
npx cap add android
```

每次变更前端代码后，同步 `dist/` 到原生工程：

```bash
npm run build && npx cap sync android
```

### 方式一：使用 Android Studio 打包

```bash
# 打开 Android 工程
npx cap open android
```

在 Android Studio 中：
- Debug 构建：Build > Build Bundle(s) / APK(s) > Build APK(s)
- Release 构建：Build > Generate Signed Bundle / APK > APK（配置签名）

生成的 APK 默认在 `android/app/build/outputs/apk/` 下。

### 方式二：命令行打包（Gradle）

在项目根目录执行（Capacitor 会在 `android/` 下构建）：

```bash
# 同步前端资源到原生工程
npm run build && npx cap sync android

# Debug APK（无需签名）
cd android && .\\gradlew.bat assembleDebug

# Release APK（需签名，未签名的可用于本地测试）
.\\gradlew.bat assembleRelease
```

输出位置：
- Debug: `android/app/build/outputs/apk/debug/app-debug.apk`
- Release: `android/app/build/outputs/apk/release/app-release.apk`

### Release 签名（命令行）

1) 生成签名文件（仅一次）：
```bash
keytool -genkeypair -v -keystore my-release.keystore -alias myapp -keyalg RSA -keysize 2048 -validity 36500
```

2) 将 `my-release.keystore` 放入 `android/app/`，并在 `android/variables.gradle` 或 `android/app/build.gradle` 中配置签名（常见做法为在 `gradle.properties` 中保存密钥）：

`android/gradle.properties`（示例）
```
MYAPP_STORE_FILE=my-release.keystore
MYAPP_STORE_PASSWORD=your_store_pwd
MYAPP_KEY_ALIAS=myapp
MYAPP_KEY_PASSWORD=your_key_pwd
```

`android/app/build.gradle`（signingConfigs 示例片段）
```
android {
    signingConfigs {
        release {
            storeFile file(MYAPP_STORE_FILE)
            storePassword MYAPP_STORE_PASSWORD
            keyAlias MYAPP_KEY_ALIAS
            keyPassword MYAPP_KEY_PASSWORD
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled false
            shrinkResources false
        }
    }
}
```

3) 构建发布包：
```bash
cd android && .\\gradlew.bat assembleRelease
```

## 常见问题

- 找不到 SDK/构建工具：确认 `ANDROID_SDK_ROOT` 和 `PATH` 中包含 `platform-tools` 与 `build-tools`。
- Java 版本不兼容：确保使用 JDK 17，并让 Android Studio/Gradle 指向该 JDK。
- 同步失败：执行 `npm run build && npx cap sync android`，必要时 `npx cap doctor` 检查环境。

## 目录说明

- `src/` 前端源码
- `dist/` 生产构建输出（Capacitor 打包来源）
- `android/` 原生 Android 工程
