import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, DocumentReference, QuerySnapshot } from '@angular/fire/compat/firestore';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { Observable, of, switchMap, map, lastValueFrom } from 'rxjs';
import IClip from '../models/clip.model';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class ClipService implements Resolve<IClip | null>{
  public clipsCollection : AngularFirestoreCollection<IClip>
  pageClips : IClip[] = []
  pendingReq = false;

  constructor(
    private db : AngularFirestore,
    private auth : AngularFireAuth,
    private store: AngularFireStorage,
    private router : Router
  ){
    this.clipsCollection = db.collection('clips')
   }

   createClip(clip : IClip) : Promise<DocumentReference<IClip>> {
      return this.clipsCollection.add(clip);
   }

   getUserClips(){
      return this.auth.user.pipe(
        switchMap(user =>{
          if(!user){
            return of([])
          }
          const query = this.clipsCollection.ref.where('uid', '==', user.uid)
          return query.get()
        }),
        map(snapShot => (snapShot as QuerySnapshot<IClip>).docs)
      )
   }

   async getClips(){
      if(this.pendingReq){
        return;
      }
      this.pendingReq = true;

      let query =  this.clipsCollection.ref.orderBy(
        'timestamp', 'desc'
      ).limit(6)

      const { length } = this.pageClips
      if(length){
        const lastDocId = this.pageClips[length - 1].docId;
        let lastDoc = await lastValueFrom(this.clipsCollection.doc(lastDocId).get());      
        query = query.startAfter(lastDoc);
      }

      const snapShot = await query.get()
      snapShot.forEach(doc => {
          this.pageClips.push({
            docId : doc.id,
            ...doc.data()
          })
      })
      console.log(this.pageClips)
      this.pendingReq = false
   }

  updateClip(id : string, title : string){
     return this.clipsCollection.doc(id).update({ title : title})
   }

  async deleteClip(clip : IClip){
    const clipRef = this.store.ref(`clips/${clip.fileName}`)
    const screenShotRef = this.store.ref(`screenshots/${clip.screenShotName}`)
    await clipRef.delete()
    await screenShotRef.delete()
    await this.clipsCollection.doc(clip.docId).delete()
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    const clipId = route.params['id'];
    return this.clipsCollection.doc(clipId).get().pipe(
      map(snapShot => {
        const data = snapShot.data();
        if(!data) {
           this.router.navigate(["/"])
           return null;
        }
        return data;
      })
    )
  }
}

