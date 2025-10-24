import request from '../utils/new_request.js'

//获得通知
export const getnoticeApi = (username) => {
    return request({
      url: `/user/getnotifications?username=${username}`,
      method: "GET",
    });
  };
  
  //已读某个通知
  export const readsomeonenotificationApi = (receiverId,notificationId) => {
    return request({
      url: `/user/readsomeonenotification?receiverId=${receiverId}&notificationId=${notificationId}`,
      method: "POST",
    });
  };

  //已读所有通知
  export const readallnotificationApi = (receiverId) => {
    return request({
      url: `/user/readallnotification?receiverId=${receiverId}`,
      method: "POST",
    });
  };