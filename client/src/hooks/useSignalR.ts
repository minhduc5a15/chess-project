import { useEffect, useState } from "react";
import * as signalR from "@microsoft/signalr";

export const useSignalR = (hubUrl: string) => {
  const [connection, setConnection] = useState<signalR.HubConnection | null>(
    null
  );

  useEffect(() => {
    const newConnection = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl, {})
      .withAutomaticReconnect()
      .build();

    setConnection(newConnection);
  }, [hubUrl]);

  const startConnection = async () => {
    if (
      connection &&
      connection.state === signalR.HubConnectionState.Disconnected
    ) {
      try {
        await connection.start();
        console.log("SignalR Connected!");
      } catch (err) {
        console.error("SignalR Connection Error: ", err);
      }
    }
  };

  return { connection, startConnection };
};
