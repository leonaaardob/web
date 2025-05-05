import socket from "./Socket";
import { v4 as uuidv4 } from "uuid";
import type { SocketCallback } from "./types/SocketCallback";
import type { Instance as SimplePeerInstance, SignalData } from "simple-peer";

// @ts-ignore
import Peer from "simple-peer/simplepeer.min.js";

// Extended type to include internal properties
type ExtendedPeer = SimplePeerInstance & {
  id: string;
  _pc: RTCPeerConnection;
  connected: boolean;
};

class WebRTCClient {
  private channelCounter: number = 0;
  private peers: Map<string, ExtendedPeer> = new Map();
  private dataChannels: Map<string, RTCDataChannel> = new Map();
  private hasSetupSocketListeners: boolean = false;

  private setupSocketListeners() {
    socket.listen("candidate", (async (data: {
      peerId: string;
      signal: SignalData;
    }) => {
      const peer = this.peers.get(data.peerId);
      if (!peer) {
        console.warn(
          `[WebRTC] Received signal for unknown peer: ${data.peerId}`,
        );
        return;
      }

      peer.signal(data.signal);
    }) as unknown as SocketCallback);
  }

  public async connect(
    region: string,
    callback: () => void,
  ): Promise<RTCDataChannel> {
    if (!this.hasSetupSocketListeners) {
      this.setupSocketListeners();
      this.hasSetupSocketListeners = true;
    }

    const peer = await this.createPeer(region);

    const dataChannel = peer._pc.createDataChannel(
      `ping-${++this.channelCounter}`,
      {
        ordered: true,
      },
    );

    return new Promise((resolve, reject) => {
      dataChannel.onopen = () => {
        resolve(dataChannel);
      };

      dataChannel.onmessage = () => {
        callback();
      };

      dataChannel.onerror = (error: any) => {
        console.error(`[WebRTC] Data channel error for peer ${peer.id}:`, {
          label: dataChannel.label,
          readyState: dataChannel.readyState,
          error: error,
        });
        reject(error);
      };
    });
  }

  private async createPeer(region: string): Promise<ExtendedPeer> {
    return new Promise((resolve, reject) => {
      const peer = new Peer({
        trickle: true,
        initiator: true,
        channelName: "data-channel",
        config: {
          iceServers: [
            { urls: "stun:stun.l.google.com:19302" },
            { urls: "stun:stun1.l.google.com:19302" },
            { urls: "stun:stun2.l.google.com:19302" },
            { urls: "stun:stun3.l.google.com:19302" },
            { urls: "stun:stun4.l.google.com:19302" },
          ],
        },
      }) as ExtendedPeer;

      peer.id = uuidv4();
      peer.channelCounter = 0;
      this.peers.set(peer.id, peer);

      peer
        .on("connect", () => {
          resolve(peer);
        })
        .on("signal", (data: any) => {
          console.debug("[WebRTC] Generated signaling data:", data.type);
          socket.event(data.type, {
            signal: data,
            region: region,
            peerId: peer.id,
          });
        })
        .on("error", (err: Error) => {
          console.error(
            `[WebRTC] Peer connection error for peer ${peer.id}:`,
            err,
          );
          reject(err);
        })
        .on("close", () => {
          this.cleanupPeer(peer.id);
        });
    });
  }

  public sendMessage(message: any) {
    const messageStr =
      typeof message === "string" ? message : JSON.stringify(message);

    // Try to send to all connected peers
    let sentToAny = false;
    this.peers.forEach((peer, peerId) => {
      const dataChannel = this.dataChannels.get(peerId);

      if (dataChannel && dataChannel.readyState === "open") {
        console.log(
          `[WebRTC] Sending message through data channel for peer ${peerId}:`,
          {
            size: messageStr.length,
            channelState: dataChannel.readyState,
          },
        );
        dataChannel.send(messageStr);
        sentToAny = true;
      } else if (peer.connected) {
        console.log(
          `[WebRTC] Sending message through peer connection ${peerId}:`,
          {
            size: messageStr.length,
            peerConnected: peer.connected,
          },
        );
        peer.send(messageStr);
        sentToAny = true;
      }
    });

    if (!sentToAny) {
      console.error("[WebRTC] Failed to send message to any peers:", {
        peerCount: this.peers.size,
        dataChannelCount: this.dataChannels.size,
      });
    }
  }

  private cleanupPeer(peerId: string) {
    console.log(`[WebRTC] Starting cleanup for peer ${peerId}`);

    const dataChannel = this.dataChannels.get(peerId);
    if (dataChannel) {
      console.log(`[WebRTC] Closing data channel for peer ${peerId}:`, {
        label: dataChannel.label,
        readyState: dataChannel.readyState,
      });
      dataChannel.close();
      this.dataChannels.delete(peerId);
    }

    const peer = this.peers.get(peerId);
    if (peer) {
      console.log(`[WebRTC] Destroying peer connection ${peerId}:`, {
        connectionState: peer._pc.connectionState,
        iceConnectionState: peer._pc.iceConnectionState,
      });
      peer.destroy();
      this.peers.delete(peerId);
    }

    console.log(`[WebRTC] Cleanup completed for peer ${peerId}`);
  }

  public dispose() {
    console.log("[WebRTC] Disposing all peers");
    // Clean up all peers
    Array.from(this.peers.keys()).forEach((peerId) => {
      this.cleanupPeer(peerId);
    });
  }
}

export const webrtc = new WebRTCClient();
