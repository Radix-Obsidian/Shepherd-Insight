import { ImageResponse } from 'next/og'

export const size = {
  width: 1200,
  height: 630,
}

export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 32,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '24px',
            marginBottom: '20px',
          }}
        >
          <img
            src="/sheplight-logo.png"
            alt="Shepherd Insight Logo"
            width={80}
            height={80}
            style={{
              borderRadius: '12px',
            }}
          />
          <div
            style={{
              fontSize: '48px',
              fontWeight: 'bold',
              lineHeight: 1.2,
            }}
          >
            Shepherd Insight
          </div>
        </div>
        
        <div
          style={{
            fontSize: '24px',
            opacity: 0.9,
            textAlign: 'center',
            maxWidth: '800px',
            lineHeight: 1.4,
          }}
        >
          From idea to clarity in minutes
        </div>
        
        <div
          style={{
            fontSize: '20px',
            opacity: 0.8,
            marginTop: '16px',
            textAlign: 'center',
          }}
        >
          Navigate → Compass → Muse → Blueprint → Launch
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
