import { Injectable } from '@angular/core';

interface IModel {
  Id : string,
  visible : boolean
}

@Injectable({
  providedIn: 'root'
})
export class ModelService {
  // variables
  private visible = false;
  private models : IModel[] = [];

  constructor() { }

  unregister(id : string){
    this.models = this.models.filter(model => model.Id !== id);
  }

  isModelOpen(id : string) : boolean{
    return Boolean(this.models.find(model => model.Id === id)?.visible);
  } 

  toggleModel(id : string){
    let model = this.models.find(model => model.Id === id);
    if(model) {
      model.visible = !model.visible;
    }
  }

  register(id : string){
    this.models.push({
      Id : id,
      visible : false
    });
  }
}
