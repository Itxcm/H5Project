// 动态
<template>
  <div class="containner-posts">
    <div class="sel">
      <div
        class="btn all"
        :class="showType ? '' : 'active'"
        @click="changeType(0)"
      >
        All
      </div>
      <div
        class="btn interested"
        :class="showType ? 'active' : ''"
        @click="changeType(1)"
      >
        Interested
      </div>
    </div>
    <van-pull-refresh
      v-model="isLoading"
      :head-height="80"
      @refresh="onRefresh"
    >
      <!-- 下拉提示，通过 scale 实现一个缩放效果 -->
      <template #pulling="props">
        <img
          class="doge"
          src="https://fastly.jsdelivr.net/npm/@vant/assets/doge.png"
          :style="{ transform: `scale(${props.distance / 80})` }"
        />
      </template>

      <!-- 释放提示 -->
      <template #loosing>
        <img
          class="doge"
          src="https://fastly.jsdelivr.net/npm/@vant/assets/doge.png"
        />
      </template>
      <!-- 加载提示 -->
      <template #loading>
        <img
          class="doge"
          src="https://fastly.jsdelivr.net/npm/@vant/assets/doge-fire.jpeg"
        />
      </template>
      <div
        class="content"
        v-if="postList.length"
        v-infinite-scroll="load"
        :infinite-scroll-disabled="disabled"
      >
        <div v-for="item in postList" :key="item.id" @click="toDetail(item)">
          <div class="con-info">
            <img :src="item.authorInfo.avatar" alt="" />
            <div class="info">
              <div :class="item.authorInfo.identity ? 'name1' : 'name'">
                {{ item.authorInfo.nickname }}
              </div>
              <div v-if="item.authorInfo.identity" class="mark">
                <div
                  v-for="(markItem, markI) in item.authorInfo.identity"
                  :key="markI"
                >
                  <img :src="markItem.icon" alt="" />
                  <span>{{ markItem.desc }}</span>
                </div>
              </div>
            </div>
          </div>
          <div class="con-center">
            {{ item.content }}
          </div>
          <div
            class="con-img"
            v-if="item.imageList"
            :class="{
              img2: item.imageList.length == 2,
              'img-more': item.imageList.length >= 2,
              img3: item.imageList.length >= 3,
              img4: item.imageList.length == 4,
            }"
          >
            <img
              @click.stop="checkBigImg(item.imageList)"
              v-for="(imgItem, imgI) in item.imageList"
              :key="imgI"
              :src="imgItem"
              :preview-src-list="item.imageList"
              alt=""
            />
          </div>
          <div class="con-btm">
            <div class="time">
              {{ item.postTime | timeFilter }}｜{{ item.postAddress }}
            </div>
            <div class="bottom">
              <div>
                <img
                  v-if="item.isLike"
                  src="@/assets/images/posts/like.png"
                  @click.stop="cancelLike(item)"
                  alt=""
                />
                <img
                  v-else
                  src="@/assets/images/posts/nolike.png"
                  @click.stop="getLike(item)"
                  alt=""
                />
                <span>{{ item.likeCount }}</span>
                <img src="@/assets/images/posts/comment.png" alt="" />
                <span>{{ item.commentCount }}</span>
              </div>
              <img src="@/assets/images/posts/more.png" alt="" />
            </div>
          </div>
        </div>
        <div class="no-more" v-show="noMore">Already at bottom</div>
      </div>
    </van-pull-refresh>
    <div class="addpost" @click="addPost">
      <img src="@/assets/images/posts/addpost.png" alt="" />
      <span>New Post</span>
    </div>
    <!-- 动态详情 -->
    <van-popup
      v-model="showDetail"
      position="right"
      :style="{ width: '100%', height: '100%' }"
    >
      <detail
        v-if="showDetail"
        @exitDetails="exitDetails"
        @cancelLike="cancelLike"
        @getLike="getLike"
        :detailData="detailData"
      />
    </van-popup>
    <!-- 添加动态 -->
    <van-popup
      v-model="newPost"
      position="right"
      :style="{ width: '100%', height: '100%' }"
    >
      <post-add @exitAddPost="exitAddPost" />
    </van-popup>
    <!-- 查看大图 -->
    <van-image-preview v-model="showBigImg" :images="bigImageList">
    </van-image-preview>
  </div>
</template>

<script>
import { relativeTime } from "@/utils/date.js";
import Detail from "@/components/Posts/detail";
import PostAdd from "@/components/Posts/postadd";
export default {
  data() {
    return {
      showType: 0,
      postList: [],
      noMore: false,
      pageNum: 1,
      isLoading: false,
      showDetail: false, // 动态详情
      newPost: false, // 新动态
      detailData: null, // 动态详情内容
      previewUrl: "",
      showBigImg: false,
      bigImageList: [],
    };
  },
  components: {
    Detail,
    PostAdd,
  },
  filters: {
    timeFilter(val) {
      return relativeTime(val);
    },
  },
  computed: {
    disabled() {
      return this.noMore;
    },
  },
  mounted() {
    this.getInitData();
  },
  methods: {
    getInitData() {
      this.$api.postsList({ pageNum: this.pageNum }).then((res) => {
        console.log(res);
        if (res.result) {
          this.postList.push(...res.data.list);
          this.noMore = res.data.isEnd;
          this.pageNum = res.data.pageNum;
        } else {
          this.$messages.error(res.errorMsg);
        }
      });
    },
    // 点赞
    getLike(item) {
      this.$api.giveLike({ dynamicID: item.id }).then((res) => {
        if (res.result) {
          item.likeCount++;
          this.$set(item, "isLike", true);
          this.$root.$emit("parGetNewNotice");
        } else {
          this.$message.error(res.errorMsg);
        }
      });
    },
    // 取消点赞
    cancelLike(item) {
      this.$api.cancelLike({ dynamicID: item.id }).then((res) => {
        if (res.result) {
          item.likeCount--;
          this.$set(item, "isLike", false);
        } else {
          this.$message.error(res.errorMsg);
        }
      });
    },
    // 跳转至 动态详情页面
    toDetail(val) {
      this.showDetail = true;
      this.detailData = val;
    },
    // 跳转至 发布动态页面
    addPost() {
      this.newPost = true;
    },
    exitAddPost() {
      this.newPost = false;
    },
    exitDetails() {
      this.showDetail = false;
    },
    changeType(type) {
      this.showType = type;
    },
    load() {
      console.log("正在加载中。。。。。");
      this.getInitData();
    },
    onRefresh() {
      console.log("下拉刷新");
      this.isLoading = true;
    },
    checkBigImg(url) {
      this.showBigImg = true;
      this.bigImageList = url;
      console.log(this.bigImageList, url);
    },
  },
};
</script>

<style scoped lang="scss">
.containner-posts {
  box-sizing: border-box;
  height: 100%;
  padding: 0 15.9994px;
  img {
    object-fit: cover;
  }
}
.top {
  display: flex;
  height: 2.7733rem;
  justify-content: space-between;
  align-items: center;
  span {
    font-size: 1.44rem;
    font-weight: bold;
    color: #161616;
  }
  img {
    width: 1.92rem;
    height: 1.92rem;
    border-radius: 50%;
  }
}
.sel {
  margin: 0.4267rem 0;
  .btn {
    height: 1.5467rem;
    line-height: 1.5467rem;
    background: rgba(104, 103, 115, 0.1);
    color: #686773;
    font-size: 0.64rem;
    text-align: center;
    border-radius: 0.7467rem;
    display: inline-block;
    line-height: 1.5467rem;
  }
  .all {
    width: 2.9867rem;
  }
  .interested {
    width: 3.9467rem;
  }
  .active {
    color: #822afd;
    background-color: rgba(130, 42, 253, 0.1);
  }
}
.content {
  > div {
    padding: 0.64rem 0;
    &:first-of-type {
      margin-top: 0;
    }
  }
  .con-info {
    display: flex;
    img {
      width: 2.1333rem;
      height: 2.1333rem;
      border-radius: 50%;
    }
    .info {
      margin-left: 0.4267rem;
      color: #383838;
      font-size: 0.8533rem;
      .name {
        // height: 1.1733rem;
        // line-height: 1.1733rem;
        position: relative;
        transform: translateY(50%);
      }
      .name1 {
        position: static;
        transform: none;
        height: 1.1733rem;
        line-height: 1.1733rem;
      }
      .mark {
        display: flex;
        align-items: center;
        font-size: 0.64rem;
        color: #808080;
        > div {
          height: 0.9067rem;
          line-height: 0.9067rem;
          display: flex;
          align-items: center;
          img {
            width: 0.8rem;
            height: 0.8rem;
            &:last-of-type {
              margin-left: 0.32rem;
            }
          }
          &:first-of-type {
            img {
              margin-left: 0;
            }
          }
        }
      }
    }
  }
  .con-center {
    margin: 0.4267rem 0;
    color: #383838;
    font-size: 0.8533rem;
    line-height: 1.1733rem;
  }
  .con-img {
    margin-bottom: 0.4267rem;
    img {
      width: 9.0667rem;
      height: 9.0667rem;
      border-radius: 0.2667rem;
    }
  }
  .img-more {
    // display: flex;
    img {
      margin-left: 0.4267rem;
      &:first-of-type,
      &:nth-of-type(4) {
        margin-left: 0;
      }
    }
  }
  .img2 {
    img {
      width: 8.9067rem;
      height: 8.9067rem;
    }
  }
  .img3 {
    img {
      width: 5.8133rem;
      height: 5.8133rem;
    }
  }
  .img4 {
    img {
      vertical-align: bottom;
      width: 5.8133rem;
      height: 5.8133rem;
      margin-top: 0.4267rem;
      &:nth-of-type(3) {
        margin-left: 0;
      }
      &:nth-of-type(4) {
        margin-left: 0.4267rem;
      }
      &:nth-of-type(even) {
        margin-right: 6.1333rem;
      }
    }
  }
  .con-btm {
    .time {
      color: #808080;
      font-size: 0.5867rem;
      height: 0.8533rem;
      line-height: 0.8533rem;
    }
    .bottom {
      margin-top: 0.64rem;
      display: flex;
      align-items: center;
      height: 0.9067rem;
      line-height: 0.9067rem;
      font-size: 0.64rem;
      img {
        width: 0.9067rem;
        height: 0.9067rem;
      }
      div {
        flex: 1;
        display: flex;
        align-items: center;
        span {
          margin-left: 0.32rem;
        }
        img:last-of-type {
          margin-left: 1.0667rem;
        }
      }
    }
  }
  .no-more {
    font-size: 0.7467rem;
    text-align: center;
    color: #808080;
  }
}
.addpost {
  position: fixed;
  right: 0.8533rem;
  bottom: 4.16rem;
  width: 5.9733rem;
  height: 1.92rem;
  background: #8032ff;
  border-radius: 0.96rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 0.7467rem;
  font-family: PingFangSC-Semibold, PingFang SC;
  img {
    width: 0.96rem;
    height: 0.96rem;
    margin-right: 0.32rem;
  }
}
.mark,
.con-center,
.con-btm {
  font-family: PingFangSC-Regular, PingFang SC;
}
.van-pull-refresh__head {
  img {
    width: 100px;
    height: 100px;
  }
}
</style>
