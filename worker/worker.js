//  不能操作dom；进行大量的运算
let total = 0
for (let i = 0; i < 10 ** 8; i++) {
    total += i
}
//  发消息给主线程
self.postMessage({total})
//  接收主綫程消息
self.addEventListener('message',(e)=>{
    console.log('message',e)
})