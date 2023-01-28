import { Component, OnInit, OnDestroy} from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AngularFireStorage, AngularFireUploadTask } from '@angular/fire/compat/storage'; 
import { v4 as uuid } from 'uuid';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import firebase from 'firebase/compat/app'
import { last, switchMap } from 'rxjs';
import { ClipService } from 'src/app/services/clip.service';
import IClip from 'src/app/models/clip.model';
import { Router } from '@angular/router';
import { FfmpegService } from 'src/app/services/ffmpeg.service';
import { combineLatest, forkJoin } from 'rxjs';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.css']
})
export class UploadComponent implements OnInit, OnDestroy {

    constructor(
      private storageSerive : AngularFireStorage,
      private auth : AngularFireAuth,
      private clipService : ClipService,
      private router : Router,
      public ffmpegService : FfmpegService
    )
    {

    }

    ngOnInit(): void {
      this.auth.user.subscribe(data => this.user = data)
      this.ffmpegService.init()
    }

    ngOnDestroy(): void {
      this.task?.cancel()
    }

    task : AngularFireUploadTask | null = null
    screenShotTask : AngularFireUploadTask | null = null
    showAlert = false;
    isSubmission = false;
    alertMessage = 'Please wait! Your clip is being Uploaded.'
    alertColor = 'blue'
    progressCounter = 0
    user : firebase.User | null = null

    isDragover = false;
    file : File | null = null;
    screenShotURLs : string[] = [];
    selectedScreenShot = ''
    nextStep = false;
    title = new FormControl('', {
      validators : [Validators.required, Validators.minLength(3)],
      nonNullable : true
    });

    uploadForm = new FormGroup({
      title : this.title
    });

    async storeFile(event : Event){
      if(this.ffmpegService.isRunning){
        return
      }

       this.isDragover = false;
       this.file = (event as DragEvent).dataTransfer ?
                     (event as DragEvent).dataTransfer?.files.item(0) ?? null :
                     (event.target as HTMLInputElement).files?.item(0) ?? null

       if(!this.file || this.file.type !=='video/mp4'){
          return
       }

       this.title.setValue(
        this.file.name.replace(/\.[^/.]+$/, '')
      )

       this.screenShotURLs = await this.ffmpegService.getScreenshots(this.file);
       this.selectedScreenShot = this.screenShotURLs[0]
       this.nextStep = true;
    }

    async uploadFile(){
      this.uploadForm.disable()
      const clipName = uuid();
      const clipPath = `clips/${clipName}.mp4` 
      const screenShotBlob = await this.ffmpegService.blobFromURL(this.selectedScreenShot);

      const screenShotPath = `screenshots/${clipName}.png`

      this.isSubmission = true;
      this.showAlert = true;
      this.task = this.storageSerive.upload(clipPath, this.file)

      this.screenShotTask =  this.storageSerive.upload(screenShotPath, screenShotBlob)

      const clipRef = this.storageSerive.ref(clipPath);
      const screenShotRef = this.storageSerive.ref(screenShotPath);

      combineLatest([
        this.task.percentageChanges(),
        this.screenShotTask.percentageChanges()
      ]).subscribe(progress => {
         const [clipProgress, screenShotProgress] = progress
         if(!clipProgress || !screenShotProgress){
            return;
         }
         const total = clipProgress + screenShotProgress;
         this.progressCounter = Math.ceil(total as number) / 200;
      })
      forkJoin([
        this.task.snapshotChanges(),
        this.screenShotTask.snapshotChanges()
      ]).pipe(
        switchMap(()=> forkJoin([clipRef.getDownloadURL(), screenShotRef.getDownloadURL()]) )
      ).subscribe({
        next : async (urls)=>{
          const [clipUrl, screenShotUrl] = urls
          const clip : IClip = {
            uid : this.user?.uid as string,
            displayName : this.user?.displayName as string,
            title : this.title.value,
            fileName : `${clipName}.mp4`,
            url : clipUrl,
            screenShotUrl,
            screenShotName : `${clipName}.png`,
            timestamp : firebase.firestore.FieldValue.serverTimestamp()
          }   
          var clipDocRef = await this.clipService.createClip(clip)
          this.alertColor = 'green'
          this.alertMessage = 'Success! You clip has been uploaded.'

          setTimeout(()=>{
            this.router.navigate(['clip', clipDocRef.id]);
          }, 1000)
        },
        error : (error)=>{
          this.uploadForm.enable()
          this.alertColor = 'red'
          this.alertMessage = 'Something went wrong! Please try again.'
          this.isSubmission = false;
        }
      })
    }
    
    getProgress(){
      return `${this.progressCounter * 100}%`
    }
} 
