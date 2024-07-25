module.exports = {
    env: {
      NEXT_PUBLIC_TYMS_PUBLIC_KEY: process.env.NEXT_PUBLIC_TYMS_PUBLIC_KEY,
      NEXT_PUBLIC_TYMS_REDIRECT_URI: process.env.NEXT_PUBLIC_TYMS_REDIRECT_URI,
      NEXT_PUBLIC_TYMS_TERMS_URL: process.env.NEXT_PUBLIC_TYMS_TERMS_URL,
      NEXT_PUBLIC_TYMS_PRIVACY_URL: process.env.NEXT_PUBLIC_TYMS_PRIVACY_URL,
    },
    api: {
      bodyParser: {
        sizeLimit: '1mb',
      },
      responseLimit: '8mb',
    },
    // Increase the timeout (in seconds)
    serverRuntimeConfig: {
      apiTimeout: 60, // 60 seconds
    },
  }