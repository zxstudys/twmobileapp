// This file was generated by Mendix Studio Pro.
//
// WARNING: Only the following code will be retained when actions are regenerated:
// - the import list
// - the code between BEGIN USER CODE and END USER CODE
// - the code between BEGIN EXTRA CODE and END EXTRA CODE
// Other code you write will be lost the next time you deploy the project.
import { Big } from "big.js";
import { Alert, Linking, NativeModules } from "react-native";
import ImagePicker from "react-native-image-picker";
import { getLocales } from "react-native-localize";

// BEGIN EXTRA CODE
// END EXTRA CODE

/**
 * Take a picture using the camera or import one from the image library on the device.
 *
 * The result is an ImageMetaData object. Most items are self-explanatory.
 *
 * The FileType is not the extension but the mime type, for example image/jpeg when the image is a jpg file
 * You can get the right extension from the FileName:
 * substring($ImageMetaData/FileName, findLast($ImageMetaData/FileName, '.'))
 *
 * @param {MxObject} picture - This field is required.
 * @param {"NativeMobileResources.PictureSource.camera"|"NativeMobileResources.PictureSource.imageLibrary"|"NativeMobileResources.PictureSource.either"} pictureSource - Select a picture from the library or the camera. The default is to let the user decide.
 * @param {"NativeMobileResources.PictureQuality.original"|"NativeMobileResources.PictureQuality.low"|"NativeMobileResources.PictureQuality.medium"|"NativeMobileResources.PictureQuality.high"|"NativeMobileResources.PictureQuality.custom"} pictureQuality - Set to empty to use default value 'medium'.
 * @param {Big} maximumWidth - The picture will be scaled to this maximum pixel width, while maintaing the aspect ratio.
 * @param {Big} maximumHeight - The picture will be scaled to this maximum pixel height, while maintaing the aspect ratio.
 * @returns {Promise.<MxObject>}
 */
export async function TakePictureAdvanced(picture, pictureSource, pictureQuality, maximumWidth, maximumHeight) {
	// BEGIN USER CODE
    // Documentation https://github.com/react-native-community/react-native-image-picker/blob/master/docs/Reference.md
    return new Promise((resolve, reject) => {
        if (!picture) {
            return reject(new Error("Input parameter 'Picture' is required"));
        }
        if (!picture.inheritsFrom("System.FileDocument")) {
            const entity = picture.getEntity();
            return reject(new Error(`Entity ${entity} does not inherit from 'System.FileDocument'`));
        }
        if (pictureQuality === "custom" && !maximumHeight && !maximumWidth) {
            return reject(new Error("Picture quality is set to 'Custom', but no maximum width or height was provided"));
        }
        createMxObject("NativeMobileResources.ImageMetaData").then((resultObject) => {
            takePicture()
                .then((response) => {
                if (!response || !response.uri) {
                    return resolve(resultObject);
                }
                const fileName = response.fileName ? response.fileName : /[^\/]*$/.exec(response.uri)[0];
                storeFile(picture, response.uri).then(pictureTaken => {
                    resultObject.set("PictureTaken", pictureTaken);
                    resultObject.set("URI", response.uri);
                    resultObject.set("IsVertical", response.isVertical);
                    resultObject.set("Width", response.width);
                    resultObject.set("Height", response.height);
                    resultObject.set("FileName", fileName);
                    resultObject.set("FileSize", response.fileSize);
                    resultObject.set("FileType", response.type);
                    resolve(resultObject);
                });
            })
                .catch(error => {
                if (error === "canceled") {
                    resolve(resultObject);
                }
                else {
                    throw new Error(error);
                }
            });
        });
    });
    function takePicture() {
        return new Promise((resolve, reject) => {
            const options = getOptions();
            const method = getPictureMethod();
            method(options, response => {
                if (response.didCancel) {
                    return resolve();
                }
                if (response.error) {
                    const unhandledError = handleImagePickerError(response.error);
                    if (!unhandledError) {
                        return resolve();
                    }
                    return reject(new Error(response.error));
                }
                return resolve(response);
            });
        });
    }
    function storeFile(imageObject, uri) {
        return new Promise((resolve, reject) => {
            fetch(uri)
                .then(res => res.blob())
                .then(blob => {
                const guid = imageObject.getGuid();
                // eslint-disable-next-line no-useless-escape
                const filename = /[^\/]*$/.exec(uri)[0];
                const onSuccess = () => {
                    NativeModules.NativeFsModule.remove(uri).then(() => {
                        imageObject.set("Name", filename);
                        mx.data.commit({
                            mxobj: imageObject,
                            callback: () => resolve(true),
                            error: (error) => reject(error)
                        });
                    });
                };
                const onError = (error) => {
                    NativeModules.NativeFsModule.remove(uri).then(undefined);
                    reject(error);
                };
                mx.data.saveDocument(guid, filename, {}, blob, onSuccess, onError);
            });
        });
    }
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    function getPictureMethod() {
        const source = pictureSource ? pictureSource : "either";
        switch (source) {
            case "imageLibrary":
                return ImagePicker.launchImageLibrary;
            case "camera":
                return ImagePicker.launchCamera;
            case "either":
            default:
                return ImagePicker.showImagePicker;
        }
    }
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    function getOptions() {
        const { maxWidth, maxHeight } = getPictureQuality();
        const [language] = getLocales().map(local => local.languageCode);
        const isDutch = language === "nl";

        return {
            mediaType: "photo",
            maxWidth,
            maxHeight,
            noData: true,
            title: isDutch ? "Foto toevoegen" : "Select a photo",
            cancelButtonTitle: isDutch ? "Annuleren" : "Cancel",
            takePhotoButtonTitle: isDutch ? "Foto maken" : "Take photo",
            chooseFromLibraryButtonTitle: isDutch ? "Kies uit bibliotheek" : "Choose from library",
            permissionDenied: {
                title: isDutch
                    ? "Deze app heeft geen toegang tot uw camera of foto's"
                    : "This app does not have access to your camera or photos",
                text: isDutch
                    ? "Ga naar Instellingen > Privacy om toegang tot uw camera en bestanden te verlenen."
                    : "To enable access, tap Settings > Privacy and turn on Camera and Photos/Storage.",
                reTryTitle: isDutch ? "Instellingen" : "Settings",
                okTitle: isDutch ? "Annuleren" : "Cancel"
            },
            storageOptions: {
                skipBackup: true,
                cameraRoll: false,
                privateDirectory: true
            }
        };
    }
    function getPictureQuality() {
        switch (pictureQuality) {
            case "low":
                return {
                    maxWidth: 1024,
                    maxHeight: 1024
                };
            case "medium":
            default:
                return {
                    maxWidth: 2048,
                    maxHeight: 2048
                };
            case "high":
                return {
                    maxWidth: 4096,
                    maxHeight: 4096
                };
            case "custom":
                return {
                    maxWidth: Number(maximumWidth),
                    maxHeight: Number(maximumHeight)
                };
        }
    }
    function handleImagePickerError(error) {
        const ERRORS = {
            AndroidPermissionDenied: "Permissions weren't granted",
            iOSPhotoLibraryPermissionDenied: "Photo library permissions not granted",
            iOSCameraPermissionDenied: "Camera permissions not granted"
        };
        switch (error) {
            case ERRORS.iOSPhotoLibraryPermissionDenied:
                showiOSPermissionAlert("This app does not have access to your photos or videos", "To enable access, tap Settings and turn on Photos.");
                return;
            case ERRORS.iOSCameraPermissionDenied:
                showiOSPermissionAlert("This app does not have access to your camera", "To enable access, tap Settings and turn on Camera.");
                return;
            case ERRORS.AndroidPermissionDenied:
                // Ignore this error because the image picker plugin already shows an alert in this case.
                return;
            default:
                return error;
        }
    }
    function showiOSPermissionAlert(title, message) {
        Alert.alert(title, message, [
            { text: "Cancel", style: "cancel" },
            { text: "Settings", onPress: () => Linking.openURL("app-settings:") }
        ], { cancelable: false });
    }
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    function createMxObject(entity) {
        return new Promise((resolve, reject) => {
            mx.data.create({
                entity,
                callback: mxObject => resolve(mxObject),
                error: () => reject(new Error(`Could not create '${entity}' object to store device info`))
            });
        });
    }
	// END USER CODE
}
