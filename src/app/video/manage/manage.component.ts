import { Component, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import IClip from 'src/app/models/clip.model';
import { ClipService } from 'src/app/services/clip.service';
import { ModelService } from 'src/app/services/model.service';

@Component({
  selector: 'app-manage',
  templateUrl: './manage.component.html',
  styleUrls: ['./manage.component.css']
})
export class ManageComponent implements OnInit, OnChanges{

  constructor(
    private router : Router,
    private route : ActivatedRoute,
    private clipService : ClipService,
    public modelService : ModelService   
  ){

  }

  selectedClip : IClip | null = null
  clips : IClip[] = []
  videoOrder = '1'


  ngOnInit(): void {
     this.route.queryParams.subscribe((params :Params ) => {
       this.videoOrder =  params['sort']
       this.sortClips()
     });

     
     this.clipService.getUserClips().subscribe({
      next : (docs)=>{
        this.clips = []
        docs.forEach(doc => {
          this.clips.push({
            docId : doc.id,
            ...doc.data()
          })
        })
        this.sortClips()
      },
      error : (error)=>{
        console.log(error)
      }
     })
  }

  ngOnChanges(changes : SimpleChanges): void {
    console.log(changes['videoOrder'])
  }

  sortClips()
  {
    this.clips = this.clips.sort((clipA, clipB)=>{
        if(this.videoOrder === '1')
          return clipA.timestamp < clipB.timestamp ? 1 : -1
        return  clipA.timestamp > clipB.timestamp ? 1 : -1
    });
  }

  sort(event : Event){
    const { value } = (event.target as HTMLSelectElement);

   // this.router.navigateByUrl(`/manage?sort=${value}`)
  
    this.router.navigate([], {
      relativeTo : this.route,
      queryParams :{
        sort : value
      }
    })
  }

  openModel(event : Event, clip : IClip){

    this.modelService.toggleModel('editClip')
    this.selectedClip = clip
  }

  updateClips(event : IClip){
      this.clips.forEach(clip =>{
        if(clip.docId === event.docId)
        {
          clip = { ...event }
        }
      })
  }

  deleteClip(event : Event, clip : IClip){

    this.clipService.deleteClip(clip)
    this.clips.forEach((localClip, index) =>{
        if(localClip.docId === clip.docId){
            this.clips.splice(index, 1)
        }
    })
  }

  handlecopyToClipboard(clip : IClip){

    const url = `${location.origin}/clip/${clip.docId}`
    navigator.clipboard.writeText(url);

    alert('Link copied')
  }
}
