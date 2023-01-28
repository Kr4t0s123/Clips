import { Component, OnInit, OnDestroy } from '@angular/core';
import IClip from '../models/clip.model';
import { ClipService } from '../services/clip.service';
import { Timestamp } from "firebase/firestore"

@Component({
  selector: 'app-clip-list',
  templateUrl: './clip-list.component.html',
  styleUrls: ['./clip-list.component.css']
})
export class ClipListComponent implements OnInit, OnDestroy {
  constructor(public clipService : ClipService){
      this.clipService.getClips()
  }

  handleScroll = () =>{
     const { scrollTop, offsetHeight} = document.documentElement
     const { innerHeight } = window
     
     const bottomOfWindow = (Math.round(scrollTop) + innerHeight) === offsetHeight
     if(bottomOfWindow){
        this.clipService.getClips()
     }

  }

  ngOnInit(): void {
    window.addEventListener('scroll', this.handleScroll)
  }

  ngOnDestroy(): void {
    window.removeEventListener('scroll', this.handleScroll)

    this.clipService.pageClips = []
  }

  handlecopyToClipboard(clip : IClip){
    const url = `${location.origin}/clip/${clip.docId}`
    navigator.clipboard.writeText(url);
    alert('Link copied')
  }
}
