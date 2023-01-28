import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms'
import { AuthService } from 'src/app/services/auth.service';
import IUser from 'src/app/models/user.model';
import { RegisterValidators } from '../validators/register-validators';
import { Emailtaken } from '../validators/emailtaken';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {

  constructor
  (
    private authService : AuthService,
    private emailTaken : Emailtaken
  )
  {

  }

  registerForm = new FormGroup({
     name : new FormControl('', [Validators.required, Validators.minLength(3)]),
     email : new FormControl('', [Validators.required, Validators.email], [this.emailTaken.validate]),
     age : new FormControl<number | null>(null, [Validators.required, Validators.min(18), Validators.max(120)]),
     phoneNumber : new FormControl(''),
     password : new FormControl('', [Validators.required, Validators.pattern(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/gm)]),
     confirm_password : new FormControl('', [Validators.required, Validators.pattern(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/gm)]),
  }, [RegisterValidators.match('password', 'confirm_password')])

  showAlert = false;
  isSubmission = false;
  alertMessage = 'Please wait! Your account is being created.'
  alertColor = 'blue'

  async register(){
    this.showAlert = true;
    this.alertMessage = 'Please wait! Your account is being created.'
    this.alertColor = 'blue'
    this.isSubmission = true;
    try {
      // add user
      await this.authService.createUser(this.registerForm.value as IUser);

      this.alertMessage = 'Success! Your account has been created.'
      this.alertColor = 'green'
    } catch (error) {
      console.log(error)
      this.isSubmission = false;
      this.alertMessage = 'Something went wrong. Please try again.'
      this.alertColor = 'red'
    }

    setTimeout(()=>{ 
      this.showAlert =  false;
     }, 3000);
  }
}
