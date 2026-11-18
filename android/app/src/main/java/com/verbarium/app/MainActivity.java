package com.verbarium.app;

import android.app.Activity;
import android.content.Intent;
import android.graphics.Color;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.view.Window;
import android.view.WindowManager;
import android.webkit.PermissionRequest;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

/**
 * Verbarium Native Android Shell (V12)
 * Connects via zero-latency USB reverse tunnel (http://localhost:5173/academy/)
 * with automatic fallback to bundled offline assets (file:///android_asset/index.html).
 */
public class MainActivity extends Activity {
    private static final String USB_TUNNEL_URL = "http://localhost:5173/academy/";
    private static final String FALLBACK_ASSET_URL = "file:///android_asset/index.html";
    private WebView webView;
    private boolean fallbackLoaded = false;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        configureFullscreenWindow();

        webView = new WebView(this);
        webView.setBackgroundColor(Color.parseColor("#F8FAFF"));
        setContentView(webView);

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
            WebView.setWebContentsDebuggingEnabled(true);
        }

        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setMediaPlaybackRequiresUserGesture(false);
        settings.setAllowFileAccess(true);
        settings.setAllowContentAccess(true);
        settings.setLoadWithOverviewMode(true);
        settings.setUseWideViewPort(true);
        settings.setCacheMode(WebSettings.LOAD_DEFAULT);

        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public void onPermissionRequest(final PermissionRequest request) {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                    request.grant(request.getResources());
                }
            }
        });

        webView.setWebViewClient(new WebViewClient() {
            @Override
            public void onReceivedError(
                WebView view,
                WebResourceRequest request,
                WebResourceError error
            ) {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP && request.isForMainFrame()) {
                    loadOfflineFallback(view);
                }
            }

            @Override
            @SuppressWarnings("deprecation")
            public void onReceivedError(
                WebView view,
                int errorCode,
                String description,
                String failingUrl
            ) {
                loadOfflineFallback(view);
            }
        });

        String targetUrl = resolveInitialUrl(getIntent());
        webView.loadUrl(targetUrl);
    }

    private String resolveInitialUrl(Intent intent) {
        if (intent != null && Intent.ACTION_VIEW.equals(intent.getAction())) {
            Uri data = intent.getData();
            if (data != null) {
                String uriString = data.toString();
                if (uriString.startsWith("http://") || uriString.startsWith("https://")) {
                    return uriString;
                }
            }
        }
        return USB_TUNNEL_URL;
    }

    private void loadOfflineFallback(WebView view) {
        if (!fallbackLoaded) {
            fallbackLoaded = true;
            view.loadUrl(FALLBACK_ASSET_URL);
        }
    }

    private void configureFullscreenWindow() {
        requestWindowFeature(Window.FEATURE_NO_TITLE);
        Window window = getWindow();
        if (window != null) {
            window.addFlags(WindowManager.LayoutParams.FLAG_DRAWS_SYSTEM_BAR_BACKGROUNDS);
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                window.setStatusBarColor(Color.parseColor("#F8FAFF"));
                window.setNavigationBarColor(Color.parseColor("#FFFFFF"));
            }
            View decorView = window.getDecorView();
            if (decorView != null && Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                decorView.setSystemUiVisibility(
                    View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                    | View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR
                );
            }
        }
    }

    @Override
    public void onBackPressed() {
        if (webView != null && webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }
}
