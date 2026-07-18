import { Client } from '@stomp/stompjs';
import ConstantList from '../appConfig';

let stompClient = null;

const getBrokerUrl = () => {
  let apiEndpoint = ConstantList.API_ENPOINT || 'http://localhost:8080';
  if (apiEndpoint.endsWith('/api')) {
    apiEndpoint = apiEndpoint.substring(0, apiEndpoint.length - 4);
  }
  if (apiEndpoint.startsWith('http://') || apiEndpoint.startsWith('https://')) {
    return apiEndpoint.replace(/^http/, 'ws') + '/ws';
  }
  const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${wsProtocol}//${window.location.host}/ws`;
};

export const connectWebSocket = (token, onMessageReceived) => {
  if (stompClient && stompClient.connected) {
    console.info('[WS] WebSocket is already connected — skip init');
    return;
  }

  const brokerURL = getBrokerUrl();
  console.info('[WS] Connecting to WebSocket broker:', brokerURL);

  stompClient = new Client({
    brokerURL: brokerURL,
    connectHeaders: {
      Authorization: `Bearer ${token}`,
    },
    reconnectDelay: 10000, // Tự động kết nối lại sau 10s nếu đứt kết nối
    heartbeatIncoming: 4000,
    heartbeatOutgoing: 4000,
    onConnect: (frame) => {
      console.info('[WS] Connected to WebSocket STOMP broker');
      
      // 1. Đăng ký nhận thông báo riêng của User hiện tại
      stompClient.subscribe('/user/queue/notifications', (message) => {
        try {
          const payload = JSON.parse(message.body);
          console.info('[WS] Received targeted notification:', payload);
          if (onMessageReceived) {
            onMessageReceived(payload);
          }
        } catch (err) {
          console.error('[WS] Failed to parse targeted notification payload:', err);
        }
      });

      // 2. Đăng ký nhận thông báo chung toàn công ty (global)
      stompClient.subscribe('/topic/notifications', (message) => {
        try {
          const payload = JSON.parse(message.body);
          console.info('[WS] Received global notification:', payload);
          if (onMessageReceived) {
            onMessageReceived(payload);
          }
        } catch (err) {
          console.error('[WS] Failed to parse global notification payload:', err);
        }
      });
    },
    onStompError: (frame) => {
      console.error('[WS] STOMP Broker error:', frame.headers['message']);
      console.error('[WS] Details:', frame.body);
    },
    onWebSocketClose: () => {
      console.warn('[WS] WebSocket connection closed');
    },
  });

  stompClient.activate();
};

export const disconnectWebSocket = () => {
  if (stompClient) {
    console.info('[WS] Disconnecting WebSocket Client...');
    stompClient.deactivate();
    stompClient = null;
  }
};
