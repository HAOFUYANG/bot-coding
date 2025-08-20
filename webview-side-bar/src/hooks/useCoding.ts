import { useCall, useSubscribe } from "./useCecClient";
import { useEffect, useState } from "react";

export function useCoding() {
  const [acceptDetails, setAcceptDetails] = useState<any[]>([]);
  const startCoding = async (params?: {
    maxGeneratedLines?: number;
    acceptRatio?: number;
  }) => {
    return await useCall("Coding.start", params);
  };
  const stopCoding = async () => {
    return await useCall("Coding.stop");
  };
  const scanFile = async () => {
    return await useCall("Coding.scanFile");
  };
  const openFile = async (filePath: string) => {
    return await useCall("Coding.openFile", filePath);
  };
  const deleteFile = async (filePath: string) => {
    return await useCall("Coding.deleteFile", filePath);
  };
  useEffect(() => {
    const getGenerateList = useSubscribe(
      "Coding.generationUpdates",
      (data: any) => {
        setAcceptDetails(data);
      }
    );
    return () => getGenerateList();
  }, []);
  return {
    startCoding,
    stopCoding,
    scanFile,
    openFile,
    deleteFile,
    acceptDetails,
  };
}
