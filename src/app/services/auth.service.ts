import { Injectable } from '@angular/core';
import { AngularFireAuth} from '@angular/fire/compat/auth';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { delay, map, Observable, filter, switchMap, of } from 'rxjs';
import { Router } from '@angular/router';
import IUser from '../models/user.model';
import { ActivatedRoute, NavigationEnd } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private userCollection : AngularFirestoreCollection<IUser>;
  public isAuthenticated$ : Observable<boolean>
  public isAuthenticatedWithDelay$ : Observable<boolean>
  redirect = true

  constructor(
    private auth : AngularFireAuth,
    private db : AngularFirestore,
    private router : Router,
    private route : ActivatedRoute
  ) {

      this.userCollection = db.collection<IUser>('users')
      this.isAuthenticated$ =  auth.user.pipe(
        map(user => !!user)
      )
      this.isAuthenticatedWithDelay$ = this.isAuthenticated$.pipe(
        delay(1000)  
      )
      this.router.events.pipe(
        filter(e => e instanceof NavigationEnd),
        map(x => this.route.firstChild),
        switchMap(route => route?.data ?? of({}))
      ).subscribe(data => {
          this.redirect = data['authOnly'] ?? false;
      })
   }

  public async createUser(userData : IUser){
    if(!userData.password)
    {
      throw new Error("Password not provided!");
    }

    const userCred = await this.auth.createUserWithEmailAndPassword(userData.email,  userData.password);

    if(!userCred.user){
      throw new Error("User can't be found.");
    }

    // call add user
    await this.userCollection.doc(userCred.user.uid).set({
      name : userData.name,
      email : userData.email,
      age : userData.age,
      phoneNumber : userData.phoneNumber,
    })

    await userCred.user.updateProfile({
      displayName : userData.name
    });
  }

  public async signInWithEmailAndPassword(email : string, password : string){
      const userCred = await this.auth.signInWithEmailAndPassword(email, password);
  }

  public async signOut(){
    await this.auth.signOut();
    if(this.redirect)
    {
      await this.router.navigateByUrl('/');
    }
  }
}