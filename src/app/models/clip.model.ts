import firebase from 'firebase/compat/app'


export default interface IClip {
    docId? : string,
    uid : string,
    displayName : string,
    title: string,
    fileName : string,
    url : string,
    screenShotUrl : string,
    screenShotName : string,
    timestamp : firebase.firestore.FieldValue
};