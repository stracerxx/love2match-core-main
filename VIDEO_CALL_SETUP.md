# Video Call Setup Guide

## Overview

Love2Match uses WebRTC for peer-to-peer video and audio calls. The current implementation uses public STUN/TURN servers which work for development but should be replaced with dedicated servers for production.

## Current Configuration

The video call system is implemented in [`src/components/VideoCallInterface.tsx`](src/components/VideoCallInterface.tsx).

### Current ICE Servers (Development)

```javascript
const ICE_SERVERS = [
  // STUN servers (free, public)
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  { urls: 'stun:stun2.l.google.com:19302' },
  { urls: 'stun:stun3.l.google.com:19302' },
  { urls: 'stun:stun4.l.google.com:19302' },
  
  // TURN servers (public, may have usage limits)
  {
    urls: 'turn:openrelay.metered.ca:80',
    username: 'openrelayproject',
    credential: 'openrelayproject'
  },
  {
    urls: 'turn:openrelay.metered.ca:443',
    username: 'openrelayproject',
    credential: 'openrelayproject'
  }
];
```

## Why TURN Servers Matter

- **STUN servers** help peers discover their public IP addresses
- **TURN servers** relay traffic when direct peer-to-peer connection fails (common behind strict NATs/firewalls)
- Without reliable TURN servers, ~10-15% of calls may fail to connect

## Production TURN Server Options

### Option 1: Twilio (Recommended for Startups)

**Pros:** Easy setup, pay-per-use, reliable
**Cons:** Can get expensive at scale

```javascript
// Get credentials from Twilio API
const response = await fetch('/api/twilio-token');
const { iceServers } = await response.json();
```

**Setup:**
1. Create Twilio account at https://www.twilio.com
2. Get Account SID and Auth Token
3. Use Twilio's Network Traversal Service API
4. Generate temporary credentials per call

### Option 2: Xirsys

**Pros:** WebRTC-focused, global network
**Cons:** Requires subscription

**Setup:**
1. Sign up at https://xirsys.com
2. Create a channel
3. Use their API to get ICE servers

### Option 3: Metered TURN (Current - Free Tier)

**Pros:** Free tier available, easy setup
**Cons:** Limited bandwidth on free tier

**Setup:**
1. Sign up at https://www.metered.ca/turn-server
2. Get your API key
3. Use their TURN servers

### Option 4: Self-Hosted (coturn)

**Pros:** Full control, no per-minute costs
**Cons:** Requires server management, DevOps knowledge

**Setup:**
1. Deploy coturn on a server with public IP
2. Configure TLS certificates
3. Set up authentication

```bash
# Example coturn installation on Ubuntu
sudo apt-get install coturn

# Edit /etc/turnserver.conf
listening-port=3478
tls-listening-port=5349
fingerprint
lt-cred-mech
user=username:password
realm=yourdomain.com
cert=/path/to/cert.pem
pkey=/path/to/key.pem
```

## Recommended Production Setup

### Environment Variables

Add to `.env`:

```env
# TURN Server Configuration
VITE_TURN_SERVER_URL=turn:your-turn-server.com:443
VITE_TURN_USERNAME=your-username
VITE_TURN_CREDENTIAL=your-credential
```

### Updated VideoCallInterface Configuration

```typescript
// src/components/VideoCallInterface.tsx

const ICE_SERVERS = [
  // Google STUN (always free)
  { urls: 'stun:stun.l.google.com:19302' },
  
  // Your production TURN server
  {
    urls: import.meta.env.VITE_TURN_SERVER_URL || 'turn:openrelay.metered.ca:443',
    username: import.meta.env.VITE_TURN_USERNAME || 'openrelayproject',
    credential: import.meta.env.VITE_TURN_CREDENTIAL || 'openrelayproject'
  }
];
```

## Cost Estimates

| Provider | Free Tier | Paid Pricing |
|----------|-----------|--------------|
| Twilio | None | ~$0.0004/min |
| Xirsys | 500MB/month | $50+/month |
| Metered | 500GB/month | $0.02/GB |
| Self-hosted | N/A | ~$20-50/month server |

## Testing Video Calls

1. **Local Testing:** Works with STUN only (same network)
2. **Cross-Network Testing:** Requires TURN servers
3. **Mobile Testing:** Often requires TURN due to carrier NAT

## Troubleshooting

### Calls Not Connecting

1. Check browser console for ICE connection errors
2. Verify TURN server credentials
3. Test with https://webrtc.github.io/samples/src/content/peerconnection/trickle-ice/

### Poor Call Quality

1. Check network bandwidth
2. Consider adding more TURN server regions
3. Implement adaptive bitrate

### One-Way Audio/Video

1. Usually a NAT traversal issue
2. Ensure TURN servers are configured
3. Check firewall rules

## Security Considerations

1. **Never expose TURN credentials in client code** - Use server-side token generation
2. **Use TLS** for TURN connections (turns:// or port 443)
3. **Rotate credentials** regularly
4. **Monitor usage** to detect abuse

## Next Steps

1. Choose a TURN provider based on your budget and scale
2. Update environment variables
3. Test video calls across different networks
4. Monitor call success rates
5. Consider implementing call quality metrics
