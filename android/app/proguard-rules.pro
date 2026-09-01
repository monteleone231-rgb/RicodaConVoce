# ------------------------------------------------------------------------------
# Ricorda con Voce - Production ProGuard & R8 Obfuscation Rules
# ------------------------------------------------------------------------------

# 1. Protect the JavaScript Interface from being renamed or stripped.
# This ensures that our React/Web frontend can successfully call native APIs.
-keepattributes JavascriptInterface
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# 2. General code optimization and obfuscation controls
-repackageclasses 'com.ricordaconvove.internal'
-allowaccessmodification

# 3. Retain attributes needed for debugging/crash reporting in production
-keepattributes SourceFile,LineNumberTable,Signature,InnerClasses,EnclosingMethod,Exceptions,*Annotation*

# 4. Keep standard Android Component entry points
-keep public class * extends android.app.Activity
-keep public class * extends android.app.Application
-keep public class * extends android.app.Service
-keep public class * extends android.content.BroadcastReceiver
-keep public class * extends android.content.ContentProvider

# 5. Prevent Google GenAI SDK rules from stripping essential components if used
-keep class com.google.genai.** { *; }
-dontwarn com.google.genai.**

# 6. Keep specific model classes or types if needed for serialization
-keepclassmembers class * implements java.io.Serializable {
    static final long serialVersionUID;
    private static final java.io.ObjectStreamField[] serialPersistentFields;
    private void writeObject(java.io.ObjectOutputStream);
    private void readObject(java.io.ObjectInputStream);
    java.lang.Object writeReplace();
    java.lang.Object readResolve();
}
