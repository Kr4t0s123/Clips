import { Injectable } from '@angular/core';
import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';

@Injectable({
  providedIn: 'root'
})
export class FfmpegService {
  isRunning = false;
  isReady = false;
  private ffmpeg;

  constructor() {
      this.ffmpeg = createFFmpeg({ log : true});
   }

   async init(){
      if(!this.isReady){
        await this.ffmpeg.load()
        this.isReady = true;
      }
   }

   async getScreenshots(file : File){
       var binaryFileData = await fetchFile(file);
       this.isRunning = true;
       this.ffmpeg.FS('writeFile', file.name, binaryFileData)

      const seconds = [1, 5, 9]
      const commands : string[] = []

      seconds.forEach(second => {
        commands.push(
          //Input
        '-i', file.name,
        //output options
        '-ss',`00:00:0${second}`,
        '-frames:v', '1',
        '-filter:v','scale=510:-1',
        `output_0${second}.png`
        )
      });

       await this.ffmpeg.run(
          ...commands
       )

       const screenShots : string[] = []

       seconds.forEach(second =>{
          const screenShotFile = this.ffmpeg.FS('readFile', `output_0${second}.png`)
          const screenShotBlob = new Blob([screenShotFile.buffer], {
            type : 'image/png'
          })
          const screenShotURL = URL.createObjectURL(screenShotBlob);
          screenShots.push(screenShotURL);
       })
       this.isRunning = false;
      return screenShots;
   }

   async blobFromURL(url : string){
      const response = await fetch(url)
      const blob = await response.blob()
      return blob
   }
}
