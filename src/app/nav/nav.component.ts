import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ModelService } from 'src/app/services/model.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})
export class NavComponent {
  constructor(
     public _modelService : ModelService,
     public authService : AuthService,
     private router : Router  
     )
  {  
  }

  async handleLogout(event : Event){
    event.preventDefault();
    await this.authService.signOut();
  }
}
