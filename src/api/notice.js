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
  