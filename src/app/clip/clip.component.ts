import { Component, OnInit, ViewChild, ElementRef, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import videojs from 'video.js';
import IClip from '../models/clip.model';
import { ClipService } from '../services/clip.service';

@Component({
  selector: 'app-clip',
  templateUrl: './clip.component.html',
  styleUrls: ['./clip.component.css'],
  encapsulation : ViewEncapsulation.None
})
export class ClipComponent implements OnInit{

 
  constructor(private route : ActivatedRoute, private clipService : ClipService){

  } 
  // varibles
  clip : IClip | null = null
  @ViewChild('videoPlayer', { static : true }) target? : ElementRef 
  player ?: videojs.Player 
  


  ngOnInit(): void {
    this.player = videojs(this.target?.nativeElement);
    this.route.data.subscribe(data => {
        const { clip } = data
        this.clip = clip as IClip;
        this.player?.src({
          src : this.clip.url,
          type : "video/mp4"
        })
     })

    

  }
}
