<template>
  <div class="box">
    <div class="container">
      <div class="left">
        <div class="count">
          当前聊天室人数:&nbsp;&nbsp;<span id="count">{{ count }}</span>
        </div>
        <ul class="friend-list">
          <li v-for="(item, index) of nicknameList" :key="index">{{ item }}</li>
        </ul>
      </div>
      <div class="right">
        <div class="header">
          <h3>Hello Wechat</h3>
          <input
            type="text"
            placeholder="请输入昵称,默认为好友"
            v-model="nickname"
          />
        </div>
        <div class="content" ref="content">
          <ul class="content-list">
            <li
              v-for="(item, index) of messageList"
              :key="index"
              :class="[
                'content-list-item',
                { me: item.type === 'msg' && item.isMe },
                { other: item.type === 'msg' && !item.isMe },
              ]"
            >
              <div v-if="item.type === 'online'">
                <p>{{ item.nickname }}加入了群聊</p>
              </div>
              <div v-else-if="item.type === 'offline'">
                <p>{{ item.nickname }}离开了群聊</p>
              </div>
              <div v-else-if="item.type === 'msg'">
                <span>{{ item.nickname }}</span
                ><button class="msgBtn">{{ item.msg }}</button>
              </div>
            </li>
          </ul>
        </div>
        <div class="footer">
          <input
            type="text"
            placeholder="请输入发送内容..."
            v-model="inputContent"
            @keyup.enter="sendMessage"
          />
          <button class="sendBtn" @click="sendMessage">发送</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "ChatRoom",
  data() {
    return {
      count: 0,
      nicknameList: [],
      messageList: [],
      nickname: "",
      wsc: null,
      canUse: true,
      inputContent: "",
    };
  },
  created() {
    this.wsc = new WebSocket("ws://192.168.50.139:2001");
    this.wsc.onopen = function (e) {
      //当客户端连接上的时候就会触发
      console.log("我已经连接上服务端了");
    };
    this.wsc.onmessage = (e) => {
      let message = JSON.parse(e.data);
      switch (message.type) {
        case "updateNickname":
          this.nicknameList = message.nicknameList;
          break;
        case "online":
          this.handleUserOnlineAndOffline(message);
          break;
        case "offline":
          this.handleUserOnlineAndOffline(message);
          break;
        case "msg":
          this.messageList.push(message);
      }
    };
    this.wsc.onclose = function (e) {
      //当服务端关闭的时候触发
      // alert('聊天服务已经关闭了')
      this.canUse = false;
    };
    this.wsc.onerror = function (e) {
      //错误情况触发
      console.log(e);
    };
  },
  beforeDestroy() {
    this.wsc.close();
  },
  mounted() {
    this.scrollToBottom();
  },
  updated() {
    this.scrollToBottom();
  },
  methods: {
    sendMessage() {
      if (this.inputContent) {
        this.wsc.send(
          JSON.stringify({ nickname: this.nickname || '好友', msg: this.inputContent })
        );
        this.inputContent = "";
      } else {
        alert("发送内容为空，请重新输入");
      }
    },
    handleUserOnlineAndOffline(message) {
      this.count = message.count;
      this.nicknameList = message.nicknameList;
      this.messageList.push(message);
    },
    scrollToBottom() {
      this.$nextTick(() => {
        let element = this.$refs.content;
        element.scrollTop = element.scrollHeight;
      });
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
* {
  margin: 0;
  padding: 0;
}

ul {
  list-style: none;
}

input,
input:focus {
  border: 1px solid lightgray;
  outline: none;
  padding: 10px;
  border-radius: 3px;
}

input:hover {
  border: 1px solid rgb(82, 193, 230);
}

input::-webkit-input-placeholder {
  color: lightgray;
}

button {
  padding: 5px 10px;
  background-color: rgba(50, 205, 50, 0.8);
  border: none;
  border-radius: 3px;
  cursor: pointer;
  color: white;
}

.box {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100vw;
  height: 100vh;
  /* background-color: gray; */
}

.container {
  display: flex;
  justify-content: center;
  background-color: pink;
}

.left {
  width: 180px;
  height: 500px;
  margin: 5px;
  background-color: rgba(180, 220, 230, 0.4);
}

.right {
  position: relative;
  width: 500px;
  height: 500px;
  margin: 5px;
  background-color: white;
  border: 1px solid rgb(82, 193, 230);
  border-radius: 5px;
}

div.count {
  padding: 8px;
  margin-bottom: 10px;
  background-color: rgb(82, 193, 230);
  border-radius: 5px;
  color: white;
}

.friend-list {
  padding: 5px;
  background-color: rgb(174, 214, 228);
  border-radius: 5px;
  color: rgba(51, 122, 183);
  text-align: center;
}

.friend-list > li {
  margin-top: 10px;
}

.right .header {
  display: flex;
  justify-content: space-between;
  padding: 10px;
  background-color: rgba(51, 122, 183);
  border-radius: 5px;
}

.right .header h3 {
  color: white;
}

.right .footer {
  position: absolute;
  display: flex;
  justify-content: space-between;
  width: 100%;
  height: 60px;
  bottom: 10px;
  padding: 10px;
  box-sizing: border-box;
  background-color: white;
}

.right .footer input {
  width: 70%;
}
.right .footer .sendBtn {
  width: 80px;
}

.right .footer .sendBtn:hover {
  background-color: limegreen;
}
/* 内容区域： */
.right .content {
  overflow: auto;
  overflow-x: hidden;
  height: 75%;
  /* margin-bottom: 100px; */
}
.content-list li p {
  padding: 5px;
  text-align: center;
  color: gray;
  font-size: 12px;
}
.content-list-item {
  margin: 8px;
  font-size: 14px;
}
.content-list-item div .msgBtn{
  position: relative;
}

.content-list-item div .msgBtn:hover {
  opacity: 0.8;
}

.content-list-item.other div span:after {
  content: ":";
  display: inline-block;
  margin: 0px 8px;
}
/* 他人对话框的小三角形 */
.content-list-item.other .msgBtn:before {
  content: "";
  width: 0;
  height: 0;
  position:absolute;
  top: 50%;
  left: -5px;
  transform: translate(0,-50%);
  border-top: 5px solid transparent;
  border-right: 5px solid rgba(50, 205, 50, 0.8);
  border-bottom: 5px solid transparent;
}

.content-list-item.me div span:before {
  content: ":";
  display: inline-block;
  margin: 0px 8px;
}

/* 自己对话框的小三角形 */
.content-list-item.me .msgBtn:after {
  content: "";
  width: 0;
  height: 0;
  position:absolute;
  top: 50%;
  right: -5px;
  transform: translate(0,-50%);
  border-top: 5px solid transparent;
  border-left: 5px solid rgba(50, 205, 50, 0.8);
  border-bottom: 5px solid transparent;
}

.content-list-item.me div {
  display: flex;
  flex-direction: row-reverse;
  align-items: center;
}
</style>
