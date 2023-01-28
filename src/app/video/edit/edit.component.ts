import { Component, OnInit, OnDestroy, Input, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import IClip from 'src/app/models/clip.model';
import { ModelService } from 'src/app/services/model.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ClipService } from 'src/app/services/clip.service';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.css']
})
export class EditComponent implements OnInit, OnDestroy, OnChanges{

  @Input() selectedClip : IClip | null = null
  @Output() clipUpdatedEvent = new EventEmitter();

  constructor(private modelService : ModelService, private clipService : ClipService){
    
  }

  showAlert = false;
  isSubmission = false;
  alertMessage = 'Please wait! Your clip is being updated.'
  alertColor = 'blue'
  clipId = new FormControl('',{
    nonNullable : true
  })
  title = new FormControl('', {
    validators : [Validators.required, Validators.min(3)],
    nonNullable : true
  })

  editForm = new FormGroup({
    title : this.title,
    id : this.clipId
  })

  ngOnInit(): void {
    this.modelService.register("editClip");
  }

  ngOnDestroy(): void {
    this.modelService.unregister("editClip");
  }

  ngOnChanges(): void {
      if(!this.selectedClip){
        return;
      }
      this.isSubmission = false
      this.showAlert = false
      this.clipId.setValue(this.selectedClip.docId ?? '');
      this.title.setValue(this.selectedClip.title);
  }

  async updateClip(){
    if(!this.selectedClip){
      return;
    }

    this.isSubmission = true
    this.showAlert = true
    this.alertColor = 'blue'
    this.alertMessage = 'Please wait! Updating clip.'

    try {
      await this.clipService.updateClip(this.clipId.value, this.title.value);
      
      this.selectedClip.title = this.title.value
      this.clipUpdatedEvent.emit(this.selectedClip);
      setTimeout(() => {
        this.showAlert = false
      }, 1000);
    } catch (e) {
      this.isSubmission = false
      this.alertColor = 'red'
      this.alertMessage = 'Update failed! Please try again.'
      return
    }
   
      this.alertColor = 'green'
      this.alertMessage = 'Update Success!!.'
      this.isSubmission = false
  }
}
