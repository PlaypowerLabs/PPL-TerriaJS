import { doc, setDoc, updateDoc, deleteDoc, getDocs, collection } from "firebase/firestore";
import PinBuilder from "terriajs-cesium/Source/Core/PinBuilder";
// @ts-ignore  
import { db } from "../../firebase";
import Color from "terriajs-cesium/Source/Core/Color";

const getPinId = (longitude: number, latitude: number) => {
  return "pin_" + longitude.toString() + "_" + latitude.toString();
}

export const deletePin = async (id: string) => {
  try {
    await deleteDoc(doc(db, "Pins", id));
    return true;
  } catch (error) {
    console.log(error)
    return false;
  }
}

export const removePins = async (basemap: string) => {
  const pinsCollectionRef = collection(db, "Pins");
  try {
    const querySnapshot = await getDocs(pinsCollectionRef);
    querySnapshot.forEach(async (doc) => {
      const metadata = doc.data().metadata;
      if (metadata && metadata.basemap === basemap) {
        await deleteDoc(doc.ref);
      }
    });
  } catch (error) {
    console.error(
      'Error removing basemap documents from the "Pins" collection:',
      error
    );
  }
}

export const savePin = (color: string, name: string, id: string, longitude: number, latitude: number, isUpdate: boolean, baseMapId: string) => {
  const pinBuilder = new PinBuilder();
  const pinId = getPinId(longitude, latitude);
  const pinCustom = {
    metadata: {
      color: color,
      id: pinId,
      basemap: baseMapId,
    },
    data: {
      name: name.trim().length > 0 ? name.trim() : new Date().getUTCMilliseconds(),
      location: {
        longitude,
        latitude
      },
      customMarkerIcon: pinBuilder.fromColor(Color.fromCssColorString(color), 48).toDataURL()
    },
    created_at: new Date().getTime()
  }
  if (!isUpdate) {
    setDoc(
      doc(db, "Pins", pinId),
      JSON.parse(JSON.stringify(pinCustom))
    );
  } else {
    updateDoc(
      doc(db, "Pins", id),
      JSON.parse(JSON.stringify(pinCustom))
    )
  }
}

export const createStory = (name: String) => {
  const storyData = {
    name: name,
    created: new Date().getTime(),
    modified: new Date().getTime(),
    data: [],
  }
  setDoc(
    doc(collection(db, "Stories")),
    storyData
  );
}

export const updateStory = (name: string, id: string) => {
  const storyData = {
    name: name,
    modified: new Date().getTime()
  }
  updateDoc(
    doc(db, "Stories", id),
    storyData
  );
}

export const deleteStory = async (id: string) => {
  try {
    await deleteDoc(doc(db, "Stories", id));
    return true;
  } catch (error) {
    console.log(error)
    return false;
  }
}