import axios from "axios";
import { MinIOFile, FileResponse } from "../models/file";
import Folder from "../models/folder";
import { useEventEmitterStore } from "../stores/eventEmitterStore";
import { FILE_UPDATED } from "../constants";

interface FilesResponse {
  files: FileResponse[] | null;
  folders: Folder[] | null;
}

interface ReturnValue {
  files: MinIOFile[];
  folders: Folder[];
}

export async function getFilesFromPath(path: string): Promise<ReturnValue> {
  path = path.replace('//', '/')
  try {
    const response = await axios.get("http://localhost:3000/api/files", {
      params: {
        path: path,
        trashCan: false
      }
    });
    if (response.data.hasOwnProperty("files")) {
      const filesResponse: FilesResponse = response.data as FilesResponse;
      const files: MinIOFile[] = filesResponse.files?.map(
        (fileResponse) => new MinIOFile(fileResponse)
      )!;
      const folders = filesResponse.folders as Folder[] | null;
      return {
        files,
        folders
      } as ReturnValue;
    }
  } catch (error: any) {
    console.error(error);
  }
  return { files: [], folders: [] } as ReturnValue;
}

export async function getTrashCan(): Promise<{files: MinIOFile[]}> {
  try {
    const response = await axios.get("http://localhost:3000/api/files", {
      params: {
        trashCan: true,
        path: 'a'
      }
    });
    return { files: response.data.files as MinIOFile[] };
  } catch (error) {
    console.error(error);
  }
  return { files: [] };
}

export async function getFavoriteFiles(): Promise<{files: MinIOFile[]}> {
  try {
    const response = await axios.get("http://localhost:3000/api/files", {
      params: {
        favorite: true,
        path: 'a'
      }
    });
    return { files: response.data.files as MinIOFile[] };
  } catch (error) {
    console.error(error);
  }
  return { files: [] };
}

export async function trashFile(file: MinIOFile): Promise<void> {
  try {
    await axios.delete(`http://localhost:3000/api/files/${file.ID}?trash=true`);
    const eventEmitter = useEventEmitterStore();
    eventEmitter.eventEmitter.emit(FILE_UPDATED);
  } catch (error) {
    console.error(error);
  }
}

export async function updateFile(file: MinIOFile, isRestoreFile: boolean): Promise<boolean> {
  const body: {FileName: string, IsFavorite: boolean, Restore: boolean} = {
    FileName: file.FileName,
    IsFavorite: file.IsFavorite,
    Restore: isRestoreFile,
  };


  try {
    await axios.put(`http://localhost:3000/api/files/${file.ID}`, body);
    const eventEmitter = useEventEmitterStore();
    eventEmitter.eventEmitter.emit(FILE_UPDATED);
    return true;
  } catch (error) {
    console.error(error);
  }

  return false;
}