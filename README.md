# Frontend: HTML + CSS + JS  
- Giao diện đơn giản có thể làm tương tự messenger
          Area 1                 Area 2
    ┌─────────────────┐┌──────────────────────────┐
    │       User      ││ Account 1                │ -> Ấn vào account để vào setting
    │─────────────────││ ─────────────────────────│ -> setting thay thế toàn bộ area 2
    │  Account 1      ││ ...                      │
    │  Account 2      ││ .........                │
    │  Account ...    ││                  ........│
    │                 ││ .....                    │
    │─────────────────││──────────────────────────│
    │Add friend:... > ││  Nhập tin nhắn: [______] │ -> ghi username của người muốn kết bạn và ấn '>' đẻ ửi yêu cầu
    └─────────────────┘└──────────────────────────┘
        Area 1                 Area 2
  ┌─────────────────┐┌──────────────────────────┐
  │       User      ││ Account 1                │ 
  │─────────────────││ ─────────────────────────│ 
  │  Account 1      ││ Đã gửi 1 lời mời kết bạn │
  │  Account 2      ││         ┌──────┐         │
  │  Account ...    ││         │Accept│         │
  │                 ││         └──────┘         │
  │─────────────────││──────────────────────────│
  │Add friend:... > ││  Nhập tin nhắn: [______] │ -> Nếu reply là chấp nhận yêu cầu
  └─────────────────┘└──────────────────────────┘
        Area 1                 Area 2
  ┌─────────────────┐┌──────────────────────────┐
  │       User      ││ x       Account 1        │ -> ấn x để back
  │─────────────────││         Setting          │ 
  │  Account 1      ││ Hủy kết bạn              │
  │  Account 2      ││ ...                      │ -> other option
  └─────────────────┘└──────────────────────────┘
        Area 1                 Area 2
  ┌─────────────────┐┌──────────────────────────┐
  │ x     User      ││ x       Account 1        │ -> ấn x để back
  │     Setting     ││         Setting          │
  │ Log out         ││ Hủy kết bạn              │
  │ Rename          ││ Hủy kết bạn              │
  │ ...             ││ ...                      │ -> other option
  └─────────────────┘└──────────────────────────┘

  - Nếu người dùng chưa đăng kí hay log out hiện màn hình đăng nhập
                 ┌──────────────────────────┐
                 │          WELLCOME        │ 
                 │ ─────────────────────────│ 
                 │ Username:..............  │
                 │ Password:..............  │
                 │          log in          │
                 │          sign in         │
                 │ forgot password          │
                 └──────────────────────────┘
                 ┌──────────────────────────┐
                 │          Sign In         │
                 │ ─────────────────────────│    ┌──────────────────────────┐
                 │ Username:..............  │    │          Sign In         │
                 │ Password:..............  │ -> │ ─────────────────────────│
                 │ Confirm:...............  │    │ Code: _ _ _ _ (4 code)   │
                 │ SĐT or email:..........  │    │         confirm          │
                 │          sign in         │    └──────────────────────────┘
                 └──────────────────────────┘
   ┌──────────────────────────┐    ┌──────────────────────────┐    ┌──────────────────────────┐
   │          Log in          │    │          Log in          │    │          Resrt           │
   │ ─────────────────────────│    │ ─────────────────────────│    │ ─────────────────────────│
   │ Username:..............  │ -> │ Code: _ _ _ _ (4 code)   │ -> │ Reset Password:........  │
   │ SĐT or email:..........  │    │         confirm          │    │                          │
   │         send mess        │    │         resend           │    │          confirm         │
   └──────────────────────────┘    └──────────────────────────┘    └──────────────────────────┘

# Backend : Express (Node.js)
## Gửi nhận
- Có thể gửi đc tin nhắn dạng văn bản (text)
- phân biệt đc đg link và tự động gạch dưới có thể truy cập link
- có thể gửi được hình ảnh (có thể set kích thước tối đa và 1 số định dạng đặc biệt mã hóa khó quá thì bỏ qua như .HEIC)
- có thể gửi nhận file (1 số loại như .pcap, .pkt,... có định dạng đặt biệt quá thì pass luôn cũng đc)
- có thể gửi nhận file âm thanh
- gửi nhận video (kích thước tối da giới hạn)
- tin nhắn gửi đi có thể bị mã hóa, nếu mã hóa thì cần giải mã
- có thể thiết kế việc thông báo có tin nhắn hay lời mời kb
