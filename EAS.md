# HOW TO CONVERT MY APP TO APK

**PREREQUISITES**
Make sure you have the following set up:

_Node.js (LTS version recommended)_
_Expo CLI installed (npm install -g expo-cli)_
_EAS CLI installed (npm install -g eas-cli) • eas login....my email with 255 and password with 255 • eas whoami to confilrm you're logged in_
_An Expo account (sign up at expo.dev)_
_Java JDK 17 (required for Android builds) install version 17LTS from https://adoptium.net the msi for windows_
Click MSI to download it
Once downloaded, double-click the .msi file
Click Next → Next → Install (default settings are fine)
Click Finish
Run _java -version_ 0n the terminal to confirm install
java -version

**Set the JAVA_HOME Environment Variable**
This tells your system where Java is installed so other tools (like Gradle) can find it.

_Step 1: Find Your Java Install Path_
Open File Explorer and navigate to:
C:\Program Files\Eclipse Adoptium\ OR Downloads
You should see a folder like:
jdk-17.0.x.x-hotspot
Open it and copy the full path from the address bar at the top. It'll look something like:
C:\Program Files\Eclipse Adoptium\jdk-17.0.18.7-hotspot

_Step 2: Open Environment Variables_

Press Windows key + S
Search "environment variables"
Click "Edit the system environment variables"
A window opens → click "Environment Variables" button at the bottom

_Step 3: Add JAVA_HOME_
Under System Variables (bottom half of the window):

Click New
Set:
Variable name: JAVA_HOME
Variable value: paste the path you copied earlier
Click OK

_Step 4: Add Java to PATH_
Still in System Variables:

Find and click Path → click Edit
Click New
Type: %JAVA_HOME%\bin
Click OK on all windows to close everything

_Step 5: Verify_
Open a new terminal window (important — old ones won't reflect changes) and run:
bash "java -version"
You should see:
openjdk version "17.0.x" ...

**Next Step: Install Android Studio** _Optional_
_You only need adb, but you can download the full stuff for emulating testing on different android devices_

Go to 👉 https://developer.android.com/studio
Click the big Download Android Studio button
_android-studio-panda3-windows.exe_
Run the installer once downloaded
Click Next through everything — default settings are fine
It will install:

Android Studio IDE
Android SDK
Android Emulator

This one is a bigger download (~1GB) so it'll take a bit longer.

**Set the ANDROID_HOME Environment Variable**
_Step 1: Find Your Android SDK Path_
In Android Studio, go to:

File → Settings (or press Ctrl + Alt + S)
Navigate to Languages & Frameworks → Android SDK
At the top you'll see "Android SDK Location" — it'll look something like:

C:\Users\YourName\AppData\Local\Android\Sdk
Copy that path.

_Step 2: Add ANDROID_HOME_

Press Windows key + S
Search "environment variables"
Click "Edit the system environment variables"
Click "Environment Variables" button
Under System Variables → click New
Set:

Variable name: ANDROID_HOME
Variable value: paste the path you copied

Click OK

_Step 3: Add to PATH_
Still in System Variables:

Find Path → click Edit
Click New and add:

%ANDROID_HOME%\platform-tools

Click OK on all windows

_Step 4: Verify_
Open a new terminal and run:
bash "adb version"

**BACK TO EAS**

bash: "eas build:configure"
bash: "cat eas.json" to make sure the build type is apk
bash: "eas build -p android --profile preview"
_Whenever you make changes..._
bash: "eas build -p android --profile preview"

**What you accomplished today:**
✅ Installed Java JDK 17
✅ Set JAVA_HOME
✅ Installed Android Studio
✅ Set ANDROID_HOME
✅ Installed EAS CLI
✅ Configured your Expo project
✅ Built your first APK
✅ Fixed the environment variables issue
✅ App running on a real Android device 📱

**MAKE SURE:**
_supabse keys are in the eas.json file_
