import React, { Fragment, useState, useContext } from "react";
import { ThemeTextField } from "../../../common/theme";
import { AddRecord } from "./AddRecord";
import { v1 as uuidv1 } from "uuid";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { TTSProject } from "../../../../store/tts/project";
import { CrisTTSApi } from "../../../../api/cris-tts-api";
import { Subscription } from "../../../../store/subscriptions/subscription";
import { SubscriptionContext } from "../../../project";
import { ProjectContext, ApiContext } from "../..";
import { store } from "../../../../store";
import _ from "lodash";
import * as urljoin from "url-join";
import { VoiceDatasetSubtype, uploadTTSDataAction } from "../../../../store/tts/data";
import { ProjectType } from "../../../../store/common/projectbase";
import { ITTSDatasetDefinition, TTSDataImportKind } from "../../../../api/interfaces/tts/dataset";
import { Redirect } from "react-router";
import { TTSProjectHelper } from "../../../../store/tts/utils/project-helper";
import { LocaleUtil } from "../../../../store/common/common";

require("./RecordModel.scss");

export interface textItem {
  fileId: string;
  id: string;
  No: string;
  index: number;
  text: string;
  src: string;
  hasAudio: boolean;
}

export interface fileItem {
  uid: string;
  name: string;
  text: Array<textItem>;
}

function getBlob(url: string): Promise<Blob> {
  return new Promise(resolve => {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.responseType = "blob";
    xhr.onload = () => {
      if (xhr.status === 200) {
        resolve(xhr.response);
      }
    };
    xhr.send();
  });
}

export const RecordModel = () => {
  const api = useContext<CrisTTSApi>(ApiContext);
  const project = useContext<TTSProject>(ProjectContext);
  const subscription = useContext<Subscription>(SubscriptionContext);

  const [file, setFile] = useState({} as fileItem);
  const [item, setItem] = useState({} as textItem);
  const [zipDisabled, setZipDisabled] = useState(true);
  const [startAudio, setStartAudio] = useState(false);
  const [prevDisabled, setPrevDisabled] = useState(true);
  const [nextDisabled, setNextDisabled] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const isMixlingualProject = TTSProjectHelper.isMixLingual(project);
  const mixlingualLocal = isMixlingualProject && LocaleUtil.getLocaleById(project.locale, isMixlingualProject);

  const [updateComplete, setUpdateComplete] = useState(false);

  const handleChange = (event: React.FormEvent) => {
    const target = event.target as HTMLInputElement;
    const value = target.value;
    const name = target.name;
    if (name === "name") {
      setName(value);
    } else if (name === "description") {
      setDescription(value);
    }
  };

  const checkValid = () => {
    return !name;
  };

  const readFile = (e: any) => {
    const reader = new FileReader();
    const input = e.target.files[0];
    reader.readAsText(input);
    reader.onload = function(e: any) {
      let text: string = e.target.result;
      if (text.length === 0) {
        alert("This text is empty. Please choose again!");
      } else {
        let arr = text.split("\n");
        let newArr = arr.filter(i => i && i.trim());
        let itemList: textItem[] = [];
        let fileId = uuidv1();
        let updateFile: boolean = true;
        newArr.forEach((newtext, index) => {
          const newItemArray = newtext.split("\t");
          let newNo: string;
          let newTextTemp: string;
          try {
            if (newItemArray.length > 2) {
              updateFile = false;
              alert("Document Format Error");
              throw "Document format error";
            }
          } catch (str) {
            console.log(str);
          }
          if (newItemArray.length === 1) {
            newTextTemp = newItemArray[0];
            const newIndex = index + 1;
            newNo = ("0000" + newIndex).substr(-4);
          } else if (newItemArray.length === 2) {
            newNo = newItemArray[0];
            newTextTemp = newItemArray[1];
          }
          let newItem = {
            fileId: fileId,
            id: uuidv1(),
            No: newNo,
            index: index,
            text: newTextTemp,
            src: "",
            hasAudio: false,
          };
          itemList.push(newItem);
        });
        if (updateFile) {
          if (newArr.length === 1) {
            setNextDisabled(true);
          }
          let newFile = {
            uid: fileId,
            name: input.name,
            text: itemList,
          };
          setFile(newFile);
          setItem(newFile.text[0]);
          setStartAudio(true);
          setZipDisabled(true);
        }
      }
    };
  };

  const handleAddAudio = (newItem: textItem) => {
    setItem(newItem);
    let fileTemp = file;
    fileTemp.text.forEach(currText => {
      if (currText.id === newItem.id) {
        currText.src = newItem.src;
        currText.hasAudio = newItem.hasAudio;
      }
    });
    setFile(fileTemp);
    setZipDisabled(false);
  };

  const getPrevItem = () => {
    setNextDisabled(false);
    if (item.index === 1) setPrevDisabled(true);
    const newItem = file.text[item.index - 1];
    setItem(newItem);
  };

  const getNextItem = () => {
    setPrevDisabled(false);
    if (item.index === file.text.length - 2) setNextDisabled(true);
    const newItem = file.text[item.index + 1];
    setItem(newItem);
  };

  const deleteItem = () => {
    let fileTemp = file;
    if (file.text.length === 2) {
      setPrevDisabled(true);
      setNextDisabled(true);
    }
    if (item.index === file.text.length - 1 || item.index === file.text.length - 2) {
      setNextDisabled(true);
    }

    if (fileTemp.text.length !== 1) {
      if (item.index === file.text.length - 1) {
        const newItem = file.text[file.text.length - 2];
        setItem(newItem);
      } else {
        const newItem = file.text[item.index + 1];
        setItem(newItem);
      }
    } else {
      setFile({} as fileItem);
      setItem({} as textItem);
      setZipDisabled(true);
      setPrevDisabled(true);
      setNextDisabled(false);
      setStartAudio(false);
    }

    fileTemp.text = fileTemp.text.filter((text: textItem) => text.id !== item.id);
    for (let i = item.index; i < fileTemp.text.length; i++) {
      fileTemp.text[i].index = i;
    }
    setFile(fileTemp);

    let tempDis = true;
    fileTemp.text.forEach(textItem => {
      if (textItem.hasAudio) {
        tempDis = false;
      }
    });
    setZipDisabled(tempDis);
  };

  const downloadTextFile = () => {
    const textTemp = file.text;
    let str: string = "";
    textTemp.forEach((text: textItem) => {
      str = str + text.No + "\t" + text.text + "\n";
    });
    const saveFile = new File([str], file.name, { type: "text/plain;charset=utf-8" });
    saveAs(saveFile);
  };

  const downloadAllRecord = () => {
    const data = file.text;
    let zip = new JSZip();
    for (let i = 0; i < data.length; i++) {
      const obj = data[i];
      if (obj.hasAudio) zip.file(obj.No + ".wav", getBlob(obj.src));
    }
    zip.generateAsync({ type: "blob" }).then(function(content: Blob) {
      saveAs(content, "Sound.zip");
    });
  };

  const uploadData = () => {
    const data: ITTSDatasetDefinition = {
      project: { id: project.id, self: project.self },
      name: name,
      displayName: name,
      description: description || "",
      properties: {},
      locale: project.locale,
      dataImportKind: TTSDataImportKind.CustomVoice,
    };
    data.properties.Gender = project.properties.Gender;
    data.properties.IsMixLingual = "false";
    if (data.locale === mixlingualLocal.name) {
      data.locale = mixlingualLocal.code;
      data.properties.IsMixLingual = "true";
    }

    const textTemp = file.text;
    let str: string = "";
    textTemp.forEach((text: textItem) => {
      str = str + text.No + "\t" + text.text + "\n";
    });
    const saveFile = new File([str], file.name, { type: "text/plain" });

    const fileTextData = file.text;
    let zip = new JSZip();
    for (let i = 0; i < fileTextData.length; i++) {
      const obj = fileTextData[i];
      if (obj.hasAudio) zip.file(obj.No + ".wav", getBlob(obj.src));
    }
    zip.generateAsync({ type: "blob" }).then(function(content: Blob) {
      const filesZip = new File([content], name + ".zip", { type: "application/x-zip-compressed" });
      store.dispatch(uploadTTSDataAction(api, project, VoiceDatasetSubtype.Normal, data, filesZip, saveFile));
    });
    setUpdateComplete(true);
  };

  if (updateComplete) {
    return <Redirect to={urljoin("/portal", subscription.id, ProjectType.CustomVoice.toLowerCase(), project.id)} />;
  }

  return (
    <div className="container">
      <h1 className="text-center">Recording Page (Beta)</h1>
      <input
        type="file"
        id="tts-input-text"
        accept="text/plain"
        onChange={readFile}
        onClick={(e: any) => (e.target.value = null)}
      />
      <input
        type="button"
        id="tts-input-button"
        value="Select recording script"
        onClick={() => document.getElementById("tts-input-text").click()}
      />
      <input type="text" value={file.name} id="tts-inputFileAgent" />

      {startAudio && (
        <div>
          <div className="tts-recordItem">
            <div className="tts-recordItem-text">
              <div className="tts-recordItem-content">
                <h2>{item.index + 1 + "/" + file.text.length}</h2>
                <h2>{item.text}</h2>
              </div>
            </div>
            <AddRecord sentence={item} handleAddAudio={handleAddAudio} />
            <button disabled={prevDisabled} onClick={getPrevItem}>
              Prev
            </button>
            <button disabled={nextDisabled} onClick={getNextItem}>
              Next
            </button>
            <button onClick={deleteItem}>Delete</button>
          </div>
          <button onClick={downloadTextFile}>Download script</button>
          <button disabled={zipDisabled} onClick={downloadAllRecord}>
            Download audio zip
          </button>
          <Fragment>
            <ThemeTextField
              name="name"
              label="Name"
              placeholder="Name your dataset"
              defaultValue={null || ""}
              onChange={handleChange}
              required={true}
            />
            <ThemeTextField
              name="description"
              className="margin-top_15"
              label="Description"
              placeholder="Describe your dataset"
              defaultValue={null || ""}
              onChange={handleChange}
            />
          </Fragment>
          <br />
          <p>
            Finish the recording above, fill in dataset name and description, and click 'Upload' button to upload data
            to server
          </p>
          <button disabled={checkValid() || zipDisabled} onClick={uploadData}>
            Upload
          </button>
        </div>
      )}
    </div>
  );
};
