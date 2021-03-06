import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { AlertService } from '../../_services/ui/alert.service';
import { DataService } from '../../_services/data/data.service';
import { StateService } from '../../_services/data/state.service';
import { AppState } from '../../_models/wcgop/app-state';
import { Subscription, Observable } from 'rxjs';
import { ThemeService } from '../../_services/ui/theme.service';
import { Program } from '@boatnet/bn-models';
import { ElectronService } from 'ngx-electron';
import { ConfirmationService } from 'primeng/api';
import { AuthService } from '@boatnet/bn-auth';
import { Credentials } from '../../auth/models/authentication.model';

import { Store } from '@ngrx/store';
import * as fromStore from '../../state';
import { Login } from '../../auth/actions/auth.actions';

@Component({
  moduleId: module.id,
  templateUrl: 'login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  error$ = this.store.select(fromStore.selectLoginPageError);
  pending$ = this.store.select(fromStore.selectLoginPagePending);

  model: any = {};
  loading = false;
  hide = true;
  returnUrl: string;
  currentUserProgram: Program; // TODO: Actual user programs from Auth service
  availablePrograms = [];

  isTabletMode: Observable<boolean>;
  isDarkTheme: Observable<boolean>;

  isDBSynced: Observable<boolean>;

  loginResult$: Observable<any>;

  loginError$ = this.store.select(fromStore.selectLoginPageError);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    public electronService: ElectronService,
    private alertService: AlertService,
    private confirmationService: ConfirmationService,
    private dataService: DataService,
    private stateService: StateService,
    private themeService: ThemeService,
    private store: Store<fromStore.State>
  ) {}

  ngOnInit() {
    // reset login status
    this.authService.logout();
    // TODO Remove in favor of NgRx AppState
    this.stateService.setState(<AppState>{ name: 'login' });

    // get return url from route parameters or default to '/'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';

    this.isTabletMode = this.stateService.tabletMode;
    this.isDarkTheme = this.themeService.isDarkTheme;
    this.isDBSynced = this.dataService.initialSyncComplete;
  }

  onLogin(credentials: Credentials) {
    this.store.dispatch(new Login(credentials));
  }

  changedUsername(event$) {}

  toggleTabletMode(checked) {
    // Emit a tablet mode change, through the state service
    this.stateService.setTabletMode(checked);
  }

  toggleDarkTheme(checked: boolean) {
    this.themeService.setDarkTheme(checked);
  }

  login() {
    this.loading = true;
    const credentials: Credentials = {
      username: this.model.username,
      password: this.model.password
    };

    this.onLogin(credentials);
    // this.authService.login(username, pw).subscribe(
    //   result => {
    //     console.log('Logged in as', result.username);
    //     // if (!this.dataService.initialSyncComplete.getValue()) {
    //     //   this.dataService.connectDatabase(
    //     //     this.model.username,
    //     //     this.model.password
    //     //   );
    //     // }
    //     this.router.navigate([this.returnUrl]);
    //   },
    //   loginError => {
    //     this.loading = false;
    //     this.alertService.error(loginError);
    //     console.error(loginError);
    //   }
    // );
  }

  onExitElectron() {
    if (this.electronService.isElectronApp) {
      this.confirmationService.confirm({
        header: 'Exit Application',
        message: 'Exit the application?',
        accept: () => {
          this.electronService.ipcRenderer.send('close-app');
        }
      });
    } else {
      console.log('Not an electron app, not exiting.');
    }
  }
}
