import { Component, Input, OnInit } from '@angular/core';
import { ModelService } from 'src/app/services/model.service';

@Component({
  selector: 'app-model',
  templateUrl: './model.component.html',
  styleUrls: ['./model.component.css']
})
export class ModelComponent implements OnInit {

  @Input() ModelId = "";

  constructor(public _modelService : ModelService){
      
  }

  ngOnInit(): void {
    
  }
}
