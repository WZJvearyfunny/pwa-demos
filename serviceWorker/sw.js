//  service worker 主要工作是操作缓存

/**
 *  如果已经install后，并未unregister的情况下，再次刷新页面，并不会进入到install、activate中
 *  但是如果sw.js内容改变的话，重新刷依然会触发install，但activate不会主动激活
 *  需要进行调用skipWaiting方法跳过等待，直接进入到activate状态
 *  因为skipWaiting是一个方法，所以会出现提前到下一个步骤的情况，保险起见还需要使用waitUntil方法
 */

// self.addEventListener('install',e=>{
//     console.log('install',e)
//     // self.skipWaiting()
//     // e.waitUntil(self.skipWaiting())
// })

// self.addEventListener('activate',e=>{
//     console.log('activate',e)
//     //  立即激活控制权
//     e.waitUntil(self.clients.claim())
// })

// //  在请求发送的时候触发
// //  service worker 中要发起请求，必须使用fetch api，Ajax和axios无法使用
// self.addEventListener('fetch',e=>{
//     //  可以抓到所有的网络请求
//     console.log('fetch',e)
// })


/**结合cachestorage*/
const CACHE_NAME = 'cache_v1'
// const CACHE_NAME = 'cache_v2'
self.addEventListener('install', async e=>{
    //  开启一个cache，得到一个cache对象
    const cache = await caches.open(CACHE_NAME)
    //  储存静态资源
    //  addAll是一个promise所以 await
    await cache.addAll([
        '/serviceWorker/',
        '/serviceWorker/data.json',
        '/serviceWorker/idnex.css'
    ])
    await self.skipWaiting()
})

//  清除缓存
self.addEventListener('activate',async e=>{
    //  清除旧资源
    const keys = await caches.keys()
    keys.forEach(key => {
        if(key !== CACHE_NAME){
            caches.delete(key)
        }
    });
    await self.clients.claim()
})

//  无网络情况下读缓存
self.addEventListener('fetch',e=>{
    console.log('request.url',e.request.url)
    const req = e.request
    e.respondWith(networkFirst(req))
})

//  网络优先
async function networkFirst(req){
    try{
        //  先从网络读取
        const fresh = await fetch(req)
        return fresh
    } catch (e) {
        //  去缓存中读取
        console.log('req',req)
        const cache = await caches.open(CACHE_NAME)
        const cached = await cache.match(req)
        return cached
    }
}


//  缓存优先
const  cacheFirst = async ()=>{
    try{
        //  去缓存中读取
        console.log('req',req)
        const cache = await caches.open(CACHE_NAME)
        const cached = await cache.match(req)
        return cached
    } catch (e) {
        //  先从网络读取
        const fresh = await fetch(req)
        return fresh
    }
}