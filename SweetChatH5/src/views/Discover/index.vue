// 发现页
<template>
  <div class="containner-discover">
    <div class="content">
        <div v-for="(item,index) in recommendList" :key="index" class="con-card" @click="OnClickBlogger(item)">
            <img class="bg" :src="item.avatar" alt="">
            <div class="con-bottom">
                <img class="shade" src="@/assets/images/discover/shade.png" alt="">
                <div class="btm-info">
                    <div class="name">{{item.nickname}}</div>  
                    <div class="mark" v-if="item.identity">
                        <div v-for="(markItem,markI) in item.identity" :key="markI" :class="markItem.fansCount?'fans':'id-mark'">
                            <img :src="markItem.icon" alt="">
                            <span>{{markItem.desc}}</span>
                        </div>
                    </div>
                </div>
            </div>
            <div class="con-top" v-show="item.isFriend">Chatted</div>
        </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
        pageNum:1,
        recommendList:[]
    }
  },
  components: {

  },
  mounted(){
    this.getInitData()
  },
  methods:{
    getInitData(){
       this.$api.recommendList({pageNum:this.pageNum}).then((res)=>{
        if(res.result){
            this.recommendList = res.data.recommendList
        } else{
            this.$message.error(res.errorMsg)
        }
       })
    },
    // 跳转个人主页
    OnClickBlogger(info) {
        info.userID = info.id
        this.$router.push({ path: '/bloggerInfo', query: { info } });
    }
  }
}
</script>

<style scoped lang="scss">
.containner-discover{  
    font-family: PingFangSC-Medium, PingFang SC;
    height: 100%;
    padding: 0 .8533rem;
    img{
        object-fit: cover;  
    }
}
.content{ 
    margin-top: .64rem;   
    .con-card{
       display: inline-block;
       width: 8.7467rem;
       height: 15.4133rem; 
       border-radius: .96rem; 
       vertical-align: middle;       
       margin-top: .8533rem;
       position: relative;
       .bg{
        width: 100%;
        height: 100%;
        border-radius: .96rem;     
       }
       &:nth-of-type(even){
            margin-left: .8rem;
        }  
       &:first-of-type,&:nth-of-type(2){
            margin-top: 0;
        }  
        .con-bottom{
            // background-image: url('../../assets/images/discover/shade.png');
            border-radius: .96rem;  
            width: 100%;
            height: 5.9733rem;
            position: absolute;
            bottom: 0;
            color: #FFFFFF;
            .shade{
                width: 100%;
                height: 100%;
                position: absolute;
            }
            .btm-info{
                position: absolute;
                bottom: 8px;
                // z-index: 2;
                font-size: .5867rem;
                .name{
                    font-size: .8533rem;
                    margin-left: .48rem;
                    height: 1.1733rem;
                    line-height: 1.1733rem;
                }
                .mark {
                    >div{
                        font-family: PingFangSC-Regular, PingFang SC;
                        display: flex;
                        align-items: center;
                        height: .8533rem;
                        line-height: .8533rem;
                        &:first-of-type{
                            margin: .2133rem 0  .1067rem .48rem;
                        }
                    }
                    .id-mark{                        
                        img{
                            width: .64rem;
                            height: .64rem;
                            margin-right: .1067rem;
                        }
                    }
                    .fans{
                        margin-left: .4267rem;
                        img{
                            width: .7467rem;
                            height: .7467rem;
                            margin-right: .0533rem;
                        }
                    }

                }
            }            
        }
        .con-top{
            position:absolute;
            right: .5333rem;
            top: .5333rem;
            width: 3.0933rem;
            height: 1.0667rem;
            background: #8032FF;
            border-radius: .2667rem;
            font-size: .5867rem;
            color: #FFFFFF;
            text-align: center;
            line-height: 1.0667rem;
        }
       
    }
}

</style>
