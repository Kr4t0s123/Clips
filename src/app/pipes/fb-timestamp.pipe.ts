import { Pipe, PipeTransform } from '@angular/core';
import firebase from 'firebase/compat/app'

@Pipe({
  name: 'fbTimestamp'
})
export class FbTimestampPipe implements PipeTransform {

  transform(value: firebase.firestore.FieldValue | undefined | null) {
    if(value === undefined || value === null) {
      return ''
    }
    const date = (value as firebase.firestore.Timestamp).toDate();
    return date.toDateString();
  }

}
