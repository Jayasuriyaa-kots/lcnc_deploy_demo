import { A11yModule } from '@angular/cdk/a11y';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  QoButtonComponent,
  QoCardComponent,
  QoFormFieldComponent,
  QoInputComponent
} from '@qo/ui-components';
import { AuthFacadeService } from '../../services/auth-facade.service';
import { DeployerI18nService } from '../../../../services/deployer-i18n.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    A11yModule,
    ReactiveFormsModule,
    QoCardComponent,
    QoButtonComponent,
    QoInputComponent,
    QoFormFieldComponent
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly authFacade = inject(AuthFacadeService);
  readonly i18n = inject(DeployerI18nService);

  readonly loading = this.authFacade.loading;

  readonly loginForm = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      this.authFacade.showValidationError();
      return;
    }

    const { email, password } = this.loginForm.getRawValue();
    this.authFacade.login({ email, password });
  }

  getEmailError(): string {
    const control = this.loginForm.controls.email;

    if (!control.touched) {
      return '';
    }

    if (control.hasError('required')) {
      return this.i18n.translate('auth.emailRequired');
    }

    if (control.hasError('email')) {
      return this.i18n.translate('auth.emailInvalid');
    }

    return '';
  }

  getPasswordError(): string {
    const control = this.loginForm.controls.password;

    return control.touched && control.hasError('required')
      ? this.i18n.translate('auth.passwordRequired')
      : '';
  }
}
