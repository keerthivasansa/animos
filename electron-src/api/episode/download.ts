// most of this code has been adapted and reworked from https://github.com/reason211/m3u8-downloader
import fs from "fs";
import axios from "axios";
import request from "request";
import { headerOption } from "../scraper/helper";
import { EventEmitter } from "events";
let eventEmitter = new EventEmitter();

let m3u8Url: string,
  outputDir: fs.PathLike,
  outputFileName: string,
  threadCount: number,
  videoSuffix: string,
  videoUrlDirPath: string,
  retryOnError: any,
  resolution: string;

async function loadM3u8(onLoad) {
  let resp = await axios.get(m3u8Url, headerOption);
  if (resp.status != 200) {
    eventEmitter.emit("error", "error loading master m3u8");
  }
  console.log(resp.data);
  let lines = resp.data.split("\n");
  let maxResFileURL: string;
  // there'll be a way to set selected resolution later
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].length > 2) {
      if (lines[i].includes("RESOLUTION=" + resolution)) {
        maxResFileURL = lines[i + 1];
      }
    }
  }
  resp = await axios.get(
    m3u8Url.split("/").slice(0, -1).join("/") + "/" + maxResFileURL,
    headerOption
  );
  console.log(resp.data);
  lines = resp.data.split("\n");
  console.log(maxResFileURL);
  let files = [];
  lines.forEach((line: string) => {
    if (line.endsWith(videoSuffix) || line.includes(videoSuffix + "?")) {
      if (line.startsWith("http://") || line.startsWith("https://")) {
        files.push(line as never);
      } else {
        let file =
          (videoUrlDirPath.endsWith("/")
            ? videoUrlDirPath
            : videoUrlDirPath + "/") + line.replace(/^\//, "");

        files.push(file as never);
      }
    }
  });

  onLoad(files);
}

function downloadVideoFile(url) {
  return new Promise<void>((resolve, reject) => {
    var options = {
      method: "GET",
      url: url,
      encoding: null,
    };
    request(options, function (error, response) {
      if (error) {
        eventEmitter.emit("error", error);
        return reject(url);
      }
      let fileName = url.split("/").pop().replace(/\?.*/, "");
      console.log("Downloaded: " + fileName);

      fs.writeFileSync(outputDir + "/" + fileName, response.body);

      resolve();
    });
  });
}

let startTasks = (
  taskList: string | any[],
  taskHandlePromise: { (url: any): Promise<void>; (arg0: any): Promise<any> },
  limit = 5
) => {
  let _runTask = (arr: any[]) => {
    // console.debug('Progress: ' + ((taskList.length - arr.length) / taskList.length * 100).toFixed(2) + '%')
    eventEmitter.emit(
      "progress",
      ((taskList.length - arr.length) / taskList.length) * 100
    );

    return taskHandlePromise(arr.shift())
      .then(() => {
        if (arr.length !== 0) return _runTask(arr);
      })
      .catch((item: any) => {
        if (retryOnError) {
          arr.push(item);

          return _runTask(arr);
        }
      });
  };

  let listCopy = [].concat(taskList);
  let asyncTaskList = [];
  while (limit > 0 && listCopy.length > 0) {
    asyncTaskList.push(_runTask(listCopy) as never);
    limit--;
  }

  return Promise.all(asyncTaskList);
};

function mergeFiles(list: any[]) {
  let outFile = outputDir + "/" + outputFileName + videoSuffix;

  if (fs.existsSync(outFile)) {
    fs.unlinkSync(outFile);
  }

  list.forEach((url: string) => {
    let fileName = url.split("/").pop().replace(/\?.*/, "");
    let result = fs.readFileSync(outputDir + "/" + fileName);
    fs.unlinkSync(outputDir + "/" + fileName);

    setTimeout(() => {
      fs.appendFileSync(outFile, result);
      console.log("Merged: " + fileName);
    }, 100);
  });

  eventEmitter.emit("complete", outFile);
}

export function download(options) {
  setImmediate(() => {
    ({
      url: m3u8Url = "",
      outputDir = "",
      outputFileName = new Date().getTime() + ".ts",
      threadCount = 5,
      videoSuffix = ".ts",
      videoUrlDirPath = "",
      retryOnError = true,
      resolution = "",
    } = options);

    if (!videoUrlDirPath) {
      videoUrlDirPath = m3u8Url.substr(0, m3u8Url.lastIndexOf("/")) + "/";
    }

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir);
    }

    loadM3u8((list: any) => {
      eventEmitter.emit("progress", 0);
      // mergeFiles(list)
      startTasks(list, downloadVideoFile, threadCount).then(() => {
        eventEmitter.emit("downloaded", list);

        mergeFiles(list);
      });
    });

    eventEmitter.emit("start", options);
  });
  return eventEmitter;
}
