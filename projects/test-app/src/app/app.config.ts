import { ApplicationConfig, importProvidersFrom } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { AppRoutingModule } from "./app-routing.module";
import { OidcAuthModule } from "my-auth-lib";




export const appConfig: ApplicationConfig = {
  providers: [
   
    importProvidersFrom(
      BrowserModule,
      AppRoutingModule,
      OidcAuthModule.forRoot('/environments/assets-local/settings.json')
    )
  ]
};
