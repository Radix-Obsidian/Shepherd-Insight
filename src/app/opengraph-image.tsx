import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const size = {
  width: 1200,
  height: 630,
}

export const contentType = 'image/png'

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 64,
          backgroundColor: '#5229D4',
          color: 'white',
          fontFamily: 'sans-serif',
          fontWeight: 700,
          letterSpacing: '-1px',
        }}
      >
        Shepherd Insight
      </div>
    ),
    size
  )
}
