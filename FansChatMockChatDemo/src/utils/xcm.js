import Vue from "../main";
import { getUrlKey } from "../utils/tools";
import { onlineInfo } from "../../api/xcm";

const isTestServer = false;
const tag = isTestServer ? "h_test_" : "h_";

// nim 云信实例
export const ReSetIM = async function (vue) {
  var that = vue;
  // 获取type
  var targetInfo =
    getUrlKey("type") == 1 ? that.dataInfo.operator : that.dataInfo.blogger; // 1是运营

  // 获取云信参数
  var token = targetInfo.wyToken;
  var account = tag + targetInfo.id;
  var appKey = "590d2352a5d8778b6d1f427b5ecc8c62";

  // 实例初始化
  that.nim = NIM.getInstance({
    debug: true,
    appKey,
    account,
    token,
    db: true, // 不使用数据库
    syncSessionUnread: true,
    syncMsgReceipts: true,
    onconnect: onConnect,
    onwillreconnect: onWillReconnect,
    ondisconnect: onDisconnect,
    onerror: onError,
    onsessions: onSessions,
    onupdatesession: onUpdateSession,
    onroamingmsgs: onRoamingMsgs,
    onofflinemsgs: onOfflineMsgs,
    onmsg: onMsg,
    oncustomsysmsg: onCustomSysMsg,
  });

  //#region 消息处理
  // 收到会话列表
  function onSessions(sessions) {
    console.log("====== 收到会话列表 ======", sessions);

    var chatList = []; // 整合后的消息列表
    var tempUidList = []; // 未转换的临时id列表

    // 遍历会话 添加到id列表
    sessions.map((item) => {
      // 全部会话添加到列表
      chatList.push(item);
      // 单独抽离id去请求每个会话的用户信息
      if (item.id.indexOf("h_") > 0) {
        let tempUid = item.id.slice(item.id.lastIndexOf("_") + 1);
        tempUidList.push(tempUid);
        that.userIdList.push(tag + tempUid); // 云信id转换
      }
    });
    console.log("====== 会话云信id列表 ======", that.userIdList);

    that.nim.getUsers({
      accounts: that.userIdList,
      sync: false,
      done: getUsersDone,
    });

    async function getUsersDone(error, data) {
      data.reverse();
      console.log("====== 获取云信id列表的用户信息 ======", data);
      // 添加相关的用户信息
      for (var i = chatList.length - 1; i >= 0; i--) {
        for (var j = chatList.length - 1; j >= 0; j--) {
          if (chatList[i].id == "p2p-" + data[j].account) {
            chatList[i].targetUserInfo = data[j];
          }
        }
      }

      // 添加在线信息
      var res = await onlineInfo({
        userIDList: tempUidList.join(","),
      });
      if (!res.result) return that.$message.error("获取在线信息失败");
      console.log("获取到了云信id列表的在线信息", res);

      // 整合用户信息
      for (var i = 0; i < chatList.length; i++) {
        for (var j = 0; j < res.data.onlineStatusList.length; j++) {
          if (
            chatList[i].id.slice(chatList[i].id.lastIndexOf("_") + 1) ==
            res.data.onlineStatusList[j].userID
          ) {
            chatList[i].targetUserInfo.onlineInfo =
              res.data.onlineStatusList[j];
          }
        }
      }
      that.chatList = chatList;
      that.chatListGetDone = true;
      console.log("整合完毕左侧列表信息", that.chatList);
    }
  }

  // 收到会话更新
  function onUpdateSession(session) {
    // console.log("====== 会话更新了 ======", session);

    if (session.lastMsg.status == "success") {
      console.log("====== 会话更新了 ======", session);

      console.log("当前左侧列表信息", that.chatList);

      // 更新当前会话

      that.GetHistory(session.id);
      that.ResetLastMsg(session);
    }
  }
  // im收到消息
  function onMsg(msg) {
    console.log("====== im收到消息 ======", msg);

    // 添加未读
    that.AddUnread(msg.sessionId);

    // 自动设置该消息
    that.SetCurrentSession(msg, msg.sessionId);

    // 滚动到底部
    that.$refs.chatView.ResetScroll();

    // // 将当前会话与第一个会话进行交换
    // var targetIndex = that.chatList.findIndex((x) => x.id == msg.sessionId);

    // console.log("索引是" + targetIndex);

    // var temp = that.chatList[0];
    // that.chatList[0] = that.chatList[targetIndex];
    // that.chatList[targetIndex] = temp;

    // that.GetHistory(session.id); // 更新当前会话
  }
  // 收到自定义消息
  function onCustomSysMsg(sysMsg) {
    const content = JSON.parse(sysMsg.content);
    console.log("====== 收到自定义系统通知 ======", content);
  }
  //#endregion

  //#region 暂时不处理
  function onRoamingMsgs(obj) {
    console.log("====== im收到漫游消息 ======", obj);
  }
  function onOfflineMsgs(obj) {
    console.log("====== im收到离线消息 ======", obj);
  }
  function onConnect() {
    console.log("====== 云信sdk 进入IM ======");
  }
  function onWillReconnect(obj) {
    // 此时说明 SDK 已经断开连接, 请开发者在界面上提示用户连接已断开, 而且正在重新建立连接
    console.log("====== 即将重连 ======");
    console.log(obj.retryCount);
    console.log(obj.duration);
  }
  function onDisconnect(error) {
    // 此时说明 SDK 处于断开状态, 开发者此时应该根据错误码提示相应的错误信息, 并且跳转到登录页面
    console.log("====== 丢失连接 ======");
    console.log(error);
    if (error) {
      switch (error.code) {
        // 账号或者密码错误, 请跳转到登录页面并提示错误
        case 302:
          break;
        // 重复登录, 已经在其它端登录了, 请跳转到登录页面并提示错误
        case 417:
          break;
        // 被踢, 请提示错误后跳转到登录页面
        case "kicked":
          break;
        default:
          break;
      }
    }
  }
  function onError(error) {
    console.log("====== 云信报错 ======", error);
  }
  //#endregion
};

//#region 日期格式化

function change(t) {
  if (t < 10) {
    return "0" + t;
  } else {
    return t;
  }
}

export const formatDate = (date, formatStr = "YYYY-MM-DD") => {
  let d = new Date(date);
  formatStr = formatStr.replace(/YYYY/g, d.getFullYear());
  formatStr = formatStr.replace(/MM/g, change(d.getMonth() + 1));
  formatStr = formatStr.replace(/DD/g, change(d.getDate()));

  formatStr = formatStr.replace(/hh/g, change(d.getHours()));
  formatStr = formatStr.replace(/mm/g, change(d.getMinutes()));
  formatStr = formatStr.replace(/ss/g, change(d.getSeconds()));
  return formatStr;
};

//#endregion
