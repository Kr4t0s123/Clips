import { Component, OnDestroy, OnInit } from '@angular/core';
import { ModelService } from 'src/app/services/model.service';

@Component({
  selector: 'app-auth-model',
  templateUrl: './auth-model.component.html',
  styleUrls: ['./auth-model.component.css']
})
export class AuthModelComponent implements OnInit, OnDestroy {
  constructor(public _modelService: ModelService){

  }

  ngOnInit(): void {
    this._modelService.register("auth");
  }

  ngOnDestroy(): void {
    this._modelService.unregister("auth");
  }
}
