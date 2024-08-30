import { AuthWellKnownEndpoints } from "./auth-well-known-endpoints";

export interface OpenIdConfiguration{
    
    /**
     * The url to the Security Token Service (STS). The authority issues tokens.
     * This field is required.
     */
    authority: string;


    authWellknownEndpoints?: AuthWellKnownEndpoints;
    
    /**
     * The Client MUST validate that the aud (audience) Claim contains its `client_id` value
     * registered at the Issuer identified by the iss (issuer) Claim as an audience.
     * The ID Token MUST be rejected if the ID Token does not list the Client as a valid audience,
     * or if it contains additional audiences not trusted by the Client.
     */
    clientId: string;
    /**
     * `code`, `id_token token` or `id_token`.
     * Name of the flow which can be configured.
     * You must use the `id_token token` flow, if you want to access an API
     * or get user data from the server. The `access_token` is required for this,
     * and only returned with this flow.
     */
    responseType?: string;
    /**
     * List of scopes which are requested from the server from this client.
     * This must match the Security Token Service configuration for the client you use.
     * The `openid` scope is required. The `offline_access` scope can be requested when using refresh tokens
     * but this is optional and some Security Token Service do not support this or recommend not requesting this even when using
     * refresh tokens in the browser.
     */
    scope?: string;
    
    /** Final URL to redirect to after a server logout if using the end session API. */
    postLogoutRedirectUri?: string;

    /** Final URL to redirect to after a server login if using the end session API. */
    postLoginRedirectUri?: string;
   
    /**
     * Makes it possible to add an offset to the silent renew check in seconds.
     * By entering a value, you can renew the tokens before the tokens expire.
     */
    renewTimeBeforeTokenExpiresInMilliseconds?: number;


    /**
   * Defines when the token_timeout event should be raised.
   * If you set this to the default value 0.75, the event
   * is triggered after 75% of the token's life time.
   */
    timeoutFactor? : number;


    /**
     * Endpoints that when called need the the Library to append Token
     * If this config is not specified all endpoints called will be managed has if protected by IdP
     */
    managedEndpoints? : Array<string>;
   
}
