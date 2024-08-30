import { ApplicationConfig, importProvidersFrom } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { AppRoutingModule } from "./app-routing.module";
import { OidcAuthModule } from "my-auth-lib";




export const appConfig: ApplicationConfig = {
  providers: [
   
    importProvidersFrom(
      BrowserModule,
      AppRoutingModule,
      OidcAuthModule.forRoot(
        {
          authority : "https://wso2.icc.crifnet.com:9443",
		      authWellknownEndpoints :  {
			      issuer: "https://wso2.icc.crifnet.com:9443/oauth2/token", 
			      jwksUri: "https://wso2.icc.crifnet.com:9443/oauth2/jwks",
			      authorizationEndpoint: "https://wso2.icc.crifnet.com:9443/oauth2/authorize",
			      tokenEndpoint: "https://wso2.icc.crifnet.com:9443/oauth2/token", 
			      userInfoEndpoint: "https://wso2.icc.crifnet.com:9443/oauth2/userinfo",
			      endSessionEndpoint: "https://wso2.icc.crifnet.com:9443/oidc/logout",
			      revokeEndpoint : "https://wso2.icc.crifnet.com:9443/oauth2/revoke" 
		      },
		      clientId : "kdlEOeUIp9HSUof4tvMgvllORh4a",
		      responseType : "code",
		      scope : "openid",
		      postLogoutRedirectUri: "/home",
		      managedEndpoints: ["https://wso2.icc.crifnet.com:8244/httpbin/1.0.0/get"]
        }
      )
    )
  ]
};
