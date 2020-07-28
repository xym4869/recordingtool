import React, { useState, CSSProperties } from "react";
import styled from "styled-components";
import { AddRecord } from "./AddRecord";
import { v1 as uuidv1 } from "uuid";
import JSZip from "jszip";
import { saveAs } from "file-saver";
require('./RecordModel.scss');

const RecordItem = styled.div`text-align: center`;

export interface textItem {
  fileId: string;
  id: string;
  index: number;
  text: string;
  src: string;
  hasAudio: boolean
}

export interface fileItem {
  uid: string;
  name: string;
  text: Array<textItem>;
}

const uidExample = uuidv1();
const exampleFile: fileItem = {
    uid: uidExample,
    name: "hhh.txt",
    text: [
      {
        fileId: uidExample,
        id: uuidv1(),
        index: 0,
        text: "just an example",
        src: "",
            hasAudio: false,
      },
      {
        fileId: uidExample,
        id: uuidv1(),
        index: 1,
        text: "just an another example",
        src: "",
          hasAudio: false,
      },
    ],
  };

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
    const [file, setFile] = useState({} as fileItem);
    const [item, setItem] = useState({} as textItem);
    const [zipDisabled, setZipDisabled] = useState(true);
    const [startAudio, setStartAudio] = useState(false);
    const [prevDisabled, setPrevDisabled] = useState(true);
    const [nextDisabled, setNextDisabled] = useState(false);


    const readFile = (e: any) => {
        const reader = new FileReader();
        const input = e.target.files[0];
        reader.readAsText(input);
        reader.onload = function (e: any) {
            let text: string = e.target.result;
            if (text.length === 0) {
                alert("This text is empty. Please choose again!")
            } else {
                let arr = text.split("\n");
                let newArr = arr.filter(i => i && i.trim());
                if (newArr.length === 1) {
                    setNextDisabled(true)
                }
                let itemList: textItem[] = [];
                let fileId = uuidv1();
                newArr.forEach((newtext, index) => {
                    let newItem = {
                        fileId: fileId,
                        id: uuidv1(),
                        index: index,
                        text: newtext,
                        src: "",
                        hasAudio: false
                    };
                    itemList.push(newItem);
                });
                let newFile = {
                    uid: fileId,
                    name: input.name,
                    text: itemList,
                };
                setFile(newFile);
                setItem(newFile.text[0])
                setStartAudio(true)
                setZipDisabled(true)
            }
        };
    };

    const handleAddAudio = (newItem: textItem) => {
        setItem(newItem);
        let fileTemp = file;
        fileTemp.text.forEach(
            currText => {
                if (currText.id === newItem.id) {
                    currText.src = newItem.src;
                    currText.hasAudio = newItem.hasAudio;
                }
            }
        )
        setFile(fileTemp);
        setZipDisabled(false);
    };

    const getPrevItem = () => {
        setNextDisabled(false);
        if (item.index === 1)
            setPrevDisabled(true)
        const newItem = file.text[item.index - 1];
        setItem(newItem);
    }

    const getNextItem = () => {
        setPrevDisabled(false);
        if (item.index === (file.text.length - 2))
            setNextDisabled(true)
        const newItem = file.text[item.index + 1];
        setItem(newItem);
    }

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

        fileTemp.text = fileTemp.text.filter((text: textItem) => text.id !== item.id)
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
    }

    const downloadTextFile = () => {
        const textTemp = file.text;
        let str: string = "";
        textTemp.forEach((text: textItem) => {
            str = str + text.text + "\n";
        });
        const saveFile = new File([str], file.name, { type: "text/plain;charset=utf-8" })
        saveAs(saveFile);
    }

    const downloadAllRecord = () => {
        const data = file.text;
        let zip = new JSZip();
        for (let i = 0; i < data.length; i++) {
            const obj = data[i];
            if (obj.hasAudio) zip.file(obj.index + 1 + ".webm", getBlob(obj.src));
        }
        zip.generateAsync({ type: "blob" }).then(function (content: Blob) {
            saveAs(content, "Sound.zip");
        });
    }

    return (
    <div className="container">
          <h1 className="text-center">Record Page</h1>
          {!startAudio && <p>Please Select A Text.</p>}
            <input
                type="file"
                id="tts-input-text"
                accept="text/plain"
                onChange={readFile}
                onClick={ (e: any) => ( e.target.value = null )} />
          {startAudio &&
              <div>
                <RecordItem>
                    <h2>
                        {item.index + 1 + "/" + file.text.length} <br /> {item.text}
                    </h2>
                      <AddRecord sentence={item} handleAddAudio={handleAddAudio} />
                      <button disabled={prevDisabled} onClick={getPrevItem}>
                          Prev
                    </button>
                      <button disabled={nextDisabled} onClick={getNextItem}>
                      Next
                    </button>
                      <button onClick={deleteItem}>
                          Delete
                    </button>
                    </RecordItem>
                  <button onClick={downloadTextFile}>
                      Export .txt
                </button>
                  <button disabled={zipDisabled} onClick={downloadAllRecord}>
                          Export .zip
                </button>
              </div>}
    </div>
  );
};
