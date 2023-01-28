import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  constructor(private authService : AuthService){

  }

  credentials = { 
    email : '',
    password: ''
  }

  showAlert = false;
  isSubmission = false;
  alertMessage = 'Please wait! We are logging you in.'
  alertColor = 'blue'

  async login(){
    
    this.showAlert = true;
    this.isSubmission = true;
    this.alertMessage = 'Please wait!'
    this.alertColor = 'blue'

    try {
      await this.authService.signInWithEmailAndPassword(this.credentials.email, this.credentials.password);
      
      this.alertMessage = 'Success! You are logged in.'
      this.alertColor = 'green'
    } catch (e) {
      this.isSubmission = false;
      this.alertMessage = 'Something went wrong. Please try again.'
      this.alertColor = 'red'
    }

    setTimeout(()=>{                    
      this.showAlert =  false;
     }, 3000);
  }

  ngOnInit(): void {
    
  }
}
