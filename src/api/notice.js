import request from '../utils/request.js'
import { Capacitor } from '@capacitor/core'

const isNative = Capacitor.isNativePlatform()

//获得通知
export const getnoticeApi = (username) => {
    const url = isNative
      ? `https://qianxunweimeng.cn:5361/user/getnotifications?username=${username}`
      : `/user/getnotifications?username=${username}`;
  
    return request({
      url: url,
      method: "GET",
    });
  };
  
  //已读某个通知
  export const readsomeonenotificationApi = (receiverId,notificationId) => {
    const url = isNative
      ? `https://qianxunweimeng.cn:5361/user/readsomeonenotification?receiverId=${receiverId}&notificationId=${notificationId}`
      : `/user/readsomeonenotification?receiverId=${receiverId}&notificationId=${notificationId}`;
    return request({
      url: url,
      method: "POST",
    });
  };

  //已读所有通知
  export const readallnotificationApi = (receiverId) => {
    const url = isNative
      ? `https://qianxunweimeng.cn:5361/user/readallnotification?receiverId=${receiverId}`
      : `/user/readallnotification?receiverId=${receiverId}`;
    return request({
      url: url,
      method: "POST",
    });
  };