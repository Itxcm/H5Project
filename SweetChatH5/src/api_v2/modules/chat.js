import fetch from "../fetch";

// 用户在线信息
export const onlineInfo = (data) => {
  return fetch({
    url: "/api/user/online-status-list",
    method: "post",
    data,
  });
};

// 搜索博主
export const bloggerSearch = (data) => {
  return fetch({
    url: "/api/user/blogger-search",
    method: "post",
    data,
  });
};
