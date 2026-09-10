package com.example.gemini

import com.example.BuildConfig
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONArray
import org.json.JSONObject
import java.util.concurrent.TimeUnit

object AndroidGeminiProService {

    private const val MODEL = "gemini-3.1-pro-preview"
    private val client = OkHttpClient.Builder()
        .connectTimeout(60, TimeUnit.SECONDS)
        .readTimeout(60, TimeUnit.SECONDS)
        .writeTimeout(60, TimeUnit.SECONDS)
        .build()

    suspend fun generateContent(prompt: String, systemInstruction: String? = null): String = withContext(Dispatchers.IO) {
        val apiKey = BuildConfig.GEMINI_API_KEY
        val url = "https://generativelanguage.googleapis.com/v1beta/models/$MODEL:generateContent?key=$apiKey"

        val jsonBody = JSONObject().apply {
            val partsArray = JSONArray().apply {
                put(JSONObject().put("text", prompt))
            }
            val contentsArray = JSONArray().apply {
                put(JSONObject().put("parts", partsArray))
            }
            put("contents", contentsArray)

            if (!systemInstruction.isNullOrEmpty()) {
                val sysPart = JSONArray().put(JSONObject().put("text", systemInstruction))
                put("systemInstruction", JSONObject().put("parts", sysPart))
            }
        }

        val requestBody = jsonBody.toString().toRequestBody("application/json".toMediaType())
        val request = Request.Builder().url(url).post(requestBody).build()

        try {
            val response = client.newCall(request).execute()
            val resText = response.body?.string() ?: ""
            if (!response.isSuccessful) {
                return@withContext "Error ${response.code}: $resText"
            }
            val resJson = JSONObject(resText)
            val candidates = resJson.getJSONArray("candidates")
            val firstCandidate = candidates.getJSONObject(0)
            val content = firstCandidate.getJSONObject("content")
            val parts = content.getJSONArray("parts")
            parts.getJSONObject(0).getString("text")
        } catch (e: Exception) {
            "Exception: ${e.message}"
        }
    }
}
