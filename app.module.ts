import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule as NgRouterModule } from '@angular/router';
import { UpgradeModule as NgUpgradeModule } from '@angular/upgrade/static';

import { CoreModule, RouterModule, HOOK_ONCE_ROUTE, ViewContext } from '@c8y/ngx-components';
import { AssetsNavigatorModule } from '@c8y/ngx-components/assets-navigator';
import { DeviceConfigurationModule } from '@c8y/ngx-components/device-configuration';
import { DeviceListsModule } from '@c8y/ngx-components/device-lists';
import { ImpactProtocolModule } from '@c8y/ngx-components/protocol-impact';
import { OpcuaProtocolModule } from '@c8y/ngx-components/protocol-opcua';
import { RepositoryModule } from '@c8y/ngx-components/repository';
import { TrustedCertificatesModule } from '@c8y/ngx-components/trusted-certificates';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';

import { DockerComponent } from './components/docker-comp/docker.component';
import { AnalyticsComponent } from './components/analytics/analytics.component';
import { AnalyticsEPLComponent } from './components/analytics/apamaepl/apamaepl.component';
import { AnalyticsBuilderComponent } from './components/analytics/analyticsbuilder/apamaAB.component';
import { DockerGuard } from './components/helper/docker.guard';
import { AnalyticsGuard } from './components/helper/analytics.guard';

import {
  DashboardUpgradeModule,
  HybridAppModule,
  UpgradeModule,
  UPGRADE_ROUTES
} from '@c8y/ngx-components/upgrade';

@NgModule({
  imports: [
    // Upgrade module must be the first
    UpgradeModule,
    BrowserAnimationsModule,
    RouterModule.forRoot(),
    NgRouterModule.forRoot([
      ...UPGRADE_ROUTES
    ], { enableTracing: false, useHash: true }),
    CoreModule.forRoot(),
    AssetsNavigatorModule.config({
      smartGroups: true
    }),
    OpcuaProtocolModule,
    ImpactProtocolModule,
    TrustedCertificatesModule,
    DeviceConfigurationModule,
    DeviceListsModule,
    NgUpgradeModule,
    DashboardUpgradeModule,
    RepositoryModule,
    BsDropdownModule
  ],
  declarations: [
    AnalyticsComponent, 
    DockerComponent,
    AnalyticsEPLComponent,
    AnalyticsBuilderComponent
  ],
  entryComponents: [
    AnalyticsComponent,  
    DockerComponent
  ],

  providers: [
    DockerGuard, 
    AnalyticsGuard,
    { 
    provide: HOOK_ONCE_ROUTE,          // 1.
    useValue: [{                       // 2.                  
      context: ViewContext.Device,     // 3.
      path: 'analytics',                   // 4.
      component: AnalyticsComponent,       // 5.
      label: 'Analytics',                  // 6.
      priority: 100,
      icon: 'diamond',      
      canActivate: [AnalyticsGuard]
    },{                      
      context: ViewContext.Device,     // 3.
      path: 'docker',                   // 4.
      component: DockerComponent,       // 5.
      label: 'Docker',                  // 6.
      priority: 100,
      icon: 'cubes',
      canActivate: [DockerGuard]
    }], 
    multi: true
  }]


})
export class AppModule extends HybridAppModule {
  constructor(protected upgrade: NgUpgradeModule) {
    super();
  }
}
