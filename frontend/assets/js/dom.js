import { searchFriend, getUserInfo } from "./communicate/request";

window.reload = async function (api){
    /** API
     * reload-avatar: được gọi đến khi người dùng cập nhật ảnh đại diện
     * reload-chat: khi hai bên có bất kỳ tương tác nào đó reload lại khung chat
     * reload-notifications: khi có bất kì thông báo nào đó như
        lời mời kết bạn
        lời mời kết bạn đã được chấp nhận
        thao tác từ chối lời mời kết bạn
        thông báo tin nhắn không nằm trong khung chat (reload in đậm)
     * reload-search: khi người dùng tìm kiếm bạn bè
     * reload-taskbar: khi người dùng có bất kì tương tác nào đó với taskbar

    */

}

window.searchBar = async function (){
    const email = document.getElementById("search-input").value;
    const user = await searchFriend(email);
    // displayName: displayName,
    // email: email,
    // avatar: url
    // status: friend / sender-request / none

    if (user.email === 'no-email') {

    }
}

window.getInformation = async function (){
    const data = await getUserInfo();
    /* {
      displayName:
      email:
      avatar:
      friendList: [
        {
          displayName:
          email:
          avatar:
          lastMessage:
        }
        {}, {}, ...
      ]
    } */
}