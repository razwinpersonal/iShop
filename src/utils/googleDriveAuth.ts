// Google Drive OAuth Authentication
interface GoogleAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scope: string;
}

interface GoogleTokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
}

class GoogleDriveAuth {
  private config: GoogleAuthConfig;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private tokenExpiry: number | null = null;

  constructor() {
    this.config = {
      clientId: '522597735583-cf11d2knq10ceo7l0nh70ouq73hpv5gh.apps.googleusercontent.com',
      clientSecret: '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',
      redirectUri: window.location.origin + '/auth/callback',
      scope: 'https://www.googleapis.com/auth/drive.file'
    };

    // Load saved tokens from localStorage
    this.loadTokensFromStorage();
  }

  private loadTokensFromStorage() {
    const savedTokens = localStorage.getItem('googleDriveTokens');
    if (savedTokens) {
      try {
        const tokens = JSON.parse(savedTokens);
        this.accessToken = tokens.access_token;
        this.refreshToken = tokens.refresh_token;
        this.tokenExpiry = tokens.expires_at;
      } catch (error) {
        console.error('Error loading saved tokens:', error);
      }
    }
  }

  private saveTokensToStorage(tokens: GoogleTokenResponse) {
    const tokenData = {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token || this.refreshToken,
      expires_at: Date.now() + (tokens.expires_in * 1000)
    };
    
    localStorage.setItem('googleDriveTokens', JSON.stringify(tokenData));
    this.accessToken = tokenData.access_token;
    this.refreshToken = tokenData.refresh_token;
    this.tokenExpiry = tokenData.expires_at;
  }

  public getAuthUrl(): string {
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      scope: this.config.scope,
      response_type: 'code',
      access_type: 'offline',
      prompt: 'consent'
    });

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  public async handleAuthCallback(code: string): Promise<boolean> {
    try {
      const tokenResponse = await this.exchangeCodeForTokens(code);
      this.saveTokensToStorage(tokenResponse);
      return true;
    } catch (error) {
      console.error('Error handling auth callback:', error);
      return false;
    }
  }

  private async exchangeCodeForTokens(code: string): Promise<GoogleTokenResponse> {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: this.config.redirectUri,
      }),
    });

    if (!response.ok) {
      throw new Error(`Token exchange failed: ${response.statusText}`);
    }

    return await response.json();
  }

  public async refreshAccessToken(): Promise<boolean> {
    if (!this.refreshToken) {
      return false;
    }

    try {
      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: this.config.clientId,
          client_secret: this.config.clientSecret,
          refresh_token: this.refreshToken,
          grant_type: 'refresh_token',
        }),
      });

      if (!response.ok) {
        throw new Error(`Token refresh failed: ${response.statusText}`);
      }

      const tokens = await response.json();
      this.saveTokensToStorage(tokens);
      return true;
    } catch (error) {
      console.error('Error refreshing token:', error);
      return false;
    }
  }

  public async getValidAccessToken(): Promise<string | null> {
    // Check if token exists and is not expired
    if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry - 60000) {
      return this.accessToken;
    }

    // Try to refresh the token
    if (await this.refreshAccessToken()) {
      return this.accessToken;
    }

    return null;
  }

  public isAuthenticated(): boolean {
    return this.accessToken !== null && this.tokenExpiry !== null && Date.now() < this.tokenExpiry;
  }

  public logout() {
    this.accessToken = null;
    this.refreshToken = null;
    this.tokenExpiry = null;
    localStorage.removeItem('googleDriveTokens');
  }
}

export const googleDriveAuth = new GoogleDriveAuth();