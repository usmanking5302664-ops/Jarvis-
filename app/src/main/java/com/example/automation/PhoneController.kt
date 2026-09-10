package com.example.automation

import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.graphics.Color
import android.graphics.Paint
import android.graphics.pdf.PdfDocument
import android.net.Uri
import android.os.Environment
import android.provider.MediaStore
import android.widget.Toast
import java.io.File
import java.io.FileOutputStream

object AndroidPhoneController {

    fun sendSms(context: Context, phoneNumber: String, message: String) {
        val uri = Uri.parse("smsto:${phoneNumber.trim()}")
        val intent = Intent(Intent.ACTION_SENDTO, uri).apply {
            putExtra("sms_body", message)
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        }
        try {
            context.startActivity(intent)
        } catch (e: Exception) {
            Toast.makeText(context, "Could not open SMS: ${e.message}", Toast.LENGTH_SHORT).show()
        }
    }

    fun openApp(context: Context, appNameQuery: String): Boolean {
        val pm = context.packageManager
        val query = appNameQuery.lowercase().trim()

        val knownPackages = mapOf(
            "whatsapp" to "com.whatsapp",
            "youtube" to "com.google.android.youtube",
            "chrome" to "com.android.chrome",
            "camera" to "com.google.android.GoogleCamera",
            "settings" to "com.android.settings",
            "play store" to "com.android.vending",
            "facebook" to "com.facebook.katana",
            "instagram" to "com.instagram.android",
            "tiktok" to "com.zhiliaoapp.musically",
            "telegram" to "org.telegram.messenger",
            "spotify" to "com.spotify.music"
        )

        for ((key, pkg) in knownPackages) {
            if (query.contains(key)) {
                val launchIntent = pm.getLaunchIntentForPackage(pkg)
                if (launchIntent != null) {
                    launchIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                    context.startActivity(launchIntent)
                    return true
                }
            }
        }

        // Search through all installed applications
        try {
            val mainIntent = Intent(Intent.ACTION_MAIN, null).apply {
                addCategory(Intent.CATEGORY_LAUNCHER)
            }
            val apps = pm.queryIntentActivities(mainIntent, PackageManager.MATCH_ALL)
            for (app in apps) {
                val label = app.loadLabel(pm).toString().lowercase()
                if (label.contains(query) || query.contains(label)) {
                    val launchIntent = pm.getLaunchIntentForPackage(app.activityInfo.packageName)
                    if (launchIntent != null) {
                        launchIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                        context.startActivity(launchIntent)
                        return true
                    }
                }
            }
        } catch (e: Exception) {
            // fallback
        }

        // If not installed, search on Google Play
        searchPlayStore(context, appNameQuery)
        return false
    }

    fun searchPlayStore(context: Context, appName: String) {
        val marketUri = Uri.parse("market://search?q=${Uri.encode(appName)}")
        val intent = Intent(Intent.ACTION_VIEW, marketUri).apply {
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        }
        try {
            context.startActivity(intent)
        } catch (e: Exception) {
            val webUri = Uri.parse("https://play.google.com/store/search?q=${Uri.encode(appName)}&c=apps")
            context.startActivity(Intent(Intent.ACTION_VIEW, webUri).apply {
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            })
        }
    }

    fun playSong(context: Context, songTitle: String) {
        val mediaIntent = Intent(MediaStore.INTENT_ACTION_MEDIA_PLAY_FROM_SEARCH).apply {
            putExtra(MediaStore.EXTRA_MEDIA_FOCUS, "vnd.android.cursor.item/*")
            putExtra(android.app.SearchManager.QUERY, songTitle)
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        }
        try {
            context.startActivity(mediaIntent)
        } catch (e: Exception) {
            // Open YouTube
            val ytUri = Uri.parse("https://www.youtube.com/results?search_query=${Uri.encode(songTitle)}")
            context.startActivity(Intent(Intent.ACTION_VIEW, ytUri).apply {
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            })
        }
    }

    fun generatePdf(context: Context, title: String, content: String): File? {
        val doc = PdfDocument()
        val pageInfo = PdfDocument.PageInfo.Builder(595, 842, 1).create() // A4
        val page = doc.startPage(pageInfo)
        val canvas = page.canvas

        val paint = Paint()
        // Header background
        paint.color = Color.parseColor("#040914")
        canvas.drawRect(0f, 0f, 595f, 90f, paint)

        // Header accent bar
        paint.color = Color.parseColor("#00F0FF")
        canvas.drawRect(0f, 88f, 595f, 90f, paint)

        // Title
        paint.color = Color.parseColor("#00F0FF")
        paint.textSize = 20f
        paint.isFakeBoldText = true
        canvas.drawText("J.A.R.V.I.S. SYSTEM REPORT", 30f, 45f, paint)

        // Subtitle
        paint.color = Color.WHITE
        paint.textSize = 10f
        paint.isFakeBoldText = false
        canvas.drawText("Document Title: $title", 30f, 70f, paint)

        // Body
        paint.color = Color.DKGRAY
        paint.textSize = 12f
        var y = 130f
        val lines = content.chunked(70)
        for (line in lines) {
            canvas.drawText(line, 30f, y, paint)
            y += 20f
            if (y > 800f) break
        }

        doc.finishPage(page)

        // Compatible with Android 7 through Android 15 (Scoped Storage safe)
        val file: File = try {
            val appDownloads = context.getExternalFilesDir(Environment.DIRECTORY_DOWNLOADS)
                ?: context.filesDir
            File(appDownloads, "JARVIS_${System.currentTimeMillis()}.pdf")
        } catch (e: Exception) {
            File(context.cacheDir, "JARVIS_${System.currentTimeMillis()}.pdf")
        }

        return try {
            val fos = FileOutputStream(file)
            doc.writeTo(fos)
            fos.close()
            doc.close()
            Toast.makeText(context, "PDF saved: ${file.name}", Toast.LENGTH_LONG).show()
            file
        } catch (e: Exception) {
            doc.close()
            null
        }
    }
}
