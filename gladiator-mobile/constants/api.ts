import { Platform } from 'react-native';

/**
 * Update this to your computer's local IP address (e.g. 192.168.1.5)
 * so your physical phone can talk to your local backend.
 * 
 * To find your IP on Windows:
 * 1. Open Command Prompt
 * 2. Type 'ipconfig'
 * 3. Look for 'IPv4 Address' under your Wi-Fi or Ethernet adapter.
 */
// Using a Public Tunnel (Localtunnel) to bypass university Wi-Fi restrictions
export const TUNNEL_URL = 'https://gladiator-pro-dev.loca.lt';

export const getBaseUrl = () => {
    if (Platform.OS === 'web') {
        return 'http://localhost:5000';
    }
    // Use the tunnel URL for physical devices
    return TUNNEL_URL;
};

export const baseUrl = getBaseUrl();

export const TUNNEL_BYPASS_HEADER = {
    'Bypass-Tunnel-Reminder': 'true'
};
