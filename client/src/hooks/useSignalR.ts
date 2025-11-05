import { useEffect, useState } from "react";
import * as signalR from "@microsoft/signalr";

export const useSignalR = (hubUrl: string) => {
  const [connection, setConnection] = useState<signalR.HubConnection | null>(
    null
  );

  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const newConnection = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl, {
        withCredentials: true,
      })
      .withAutomaticReconnect()
      .build();

    setConnection(newConnection);

    const start = async () => {
      try {
        if (newConnection.state === signalR.HubConnectionState.Disconnected) {
          await newConnection.start();
          console.log("SignalR Connected!");
          setIsConnected(true);
        }
      } catch (err) {
        console.error("SignalR Connection Error: ", err);
        setIsConnected(false);
        // Có thể thử kết nối lại sau vài giây nếu muốn
        setTimeout(start, 5000);
      }
    };

    newConnection.onclose(() => setIsConnected(false));
    newConnection.onreconnecting(() => setIsConnected(false));
    newConnection.onreconnected(() => setIsConnected(true));

    start();

    return () => {
      newConnection.stop();
    };
  }, [hubUrl]);

  return { connection, isConnected };
};
