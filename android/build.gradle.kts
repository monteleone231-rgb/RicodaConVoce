// Top-level build file where you can add configuration options common to all sub-projects/modules.
extra.apply {
    set("compileSdkVersion", 36)
    set("targetSdkVersion", 36)
    set("minSdkVersion", 26)
    set("androidxActivityVersion", "1.9.0")
    set("androidxAppCompatVersion", "1.6.1")
    set("androidxCoordinatorLayoutVersion", "1.2.0")
    set("androidxCoreVersion", "1.13.1")
    set("androidxFragmentVersion", "1.7.1")
    set("androidxWebkitVersion", "1.11.0")
}

plugins {
    id("com.android.application") version "8.7.3" apply false
    id("org.jetbrains.kotlin.android") version "1.9.22" apply false
    id("com.google.devtools.ksp") version "1.9.22-1.0.17" apply false
}

subprojects {
    afterEvaluate {
        if (plugins.hasPlugin("com.android.application") || plugins.hasPlugin("com.android.library")) {
            configure<com.android.build.gradle.BaseExtension> {
                compileOptions {
                    sourceCompatibility = JavaVersion.VERSION_17
                    targetCompatibility = JavaVersion.VERSION_17
                }
            }
        }
        tasks.withType<org.jetbrains.kotlin.gradle.tasks.KotlinCompile>().configureEach {
            kotlinOptions {
                jvmTarget = "17"
            }
        }
    }
}

buildscript {
    repositories {
        google()
        mavenCentral()
    }
    dependencies {
        // Add standard plugins if needed
    }
}

task("clean", type = Delete::class) {
    delete(rootProject.buildDir)
}
