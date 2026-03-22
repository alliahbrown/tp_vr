// Authentification et interaction basique avec l'API Spotify

const SPOTIFY_CLIENT_ID = 'f815616e29be4c4c86cd0121c83e68de';
const SPOTIFY_REDIRECT_URI = "https://alliahbrown.github.io/tp_vr/"
const SPOTIFY_SCOPES = 'streaming user-read-playback-state user-modify-playback-state';


function generateRandomString(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    return Array.from(crypto.getRandomValues(new Uint8Array(length)))
        .map(x => chars[x % chars.length])
        .join('');
}

async function generateCodeChallenge(verifier: string): Promise<string> {
    const data = new TextEncoder().encode(verifier);
    const digest = await crypto.subtle.digest('SHA-256', data);
    return btoa(String.fromCharCode(...new Uint8Array(digest)))
        .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

// --- Lance le flow OAuth ---
export async function spotifyLogin() {
    const verifier = generateRandomString(64);
    const challenge = await generateCodeChallenge(verifier);
    localStorage.setItem('spotify_verifier', verifier);

    const params = new URLSearchParams({
        client_id: SPOTIFY_CLIENT_ID,
        response_type: 'code',
        redirect_uri: SPOTIFY_REDIRECT_URI,
        scope: SPOTIFY_SCOPES,
        code_challenge_method: 'S256',
        code_challenge: challenge,
    });

    window.location = `https://accounts.spotify.com/authorize?${params}` as any;
}

// --- Echange le code contre un token ---
export async function getToken(code: string): Promise<string | null> {
    const verifier = localStorage.getItem('spotify_verifier');
    if (!verifier) return null;

    const res = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            client_id: SPOTIFY_CLIENT_ID,
            grant_type: 'authorization_code',
            code,
            redirect_uri: SPOTIFY_REDIRECT_URI,
            code_verifier: verifier,
        }),
    });

    const data = await res.json();
    if (data.access_token) {
        localStorage.setItem('spotify_token', data.access_token);
        return data.access_token;
    }
    return null;
}

// --- Recupere le token stocke ---
export function getStoredToken(): string | null {
    return localStorage.getItem('spotify_token');
}

// --- Recherche des tracks Spotify ---
export async function searchTracks(query: string, token: string) {
    const res = await fetch(
        `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=10`,
        { headers: { Authorization: `Bearer ${token}` } }
    );
    const data = await res.json();
    return data.tracks.items.map((track: any) => ({
        name: track.name,
        artist: track.artists[0].name,
        cover: track.album.images[0]?.url ?? null,
        preview: track.preview_url,
        id: track.id,
    }));
}

// --- Joue un track (necessite Spotify Premium) ---
export async function playTrack(trackId: string, token: string) {
    await fetch('https://api.spotify.com/v1/me/player/play', {
        method: 'PUT',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ uris: [`spotify:track:${trackId}`] }),
    });
}