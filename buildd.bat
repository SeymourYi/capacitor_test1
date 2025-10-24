@echo off
echo 🚀 开始执行打包流程...

call npm run build
call npx cap sync android
cd android
call gradlew.bat assembleDebug

call "C:\Users\abc\AppData\Local\Android\Sdk\platform-tools\adb.exe" devices
call "C:\Users\abc\AppData\Local\Android\Sdk\platform-tools\adb.exe" shell am start -n com.example.capacitor_test1/.MainActivity
