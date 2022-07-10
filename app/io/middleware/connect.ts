
export default () => {
  return async (ctx,next) => {

    const { app, socket } = ctx
    const userId =`vscode-preview-${socket.handshake.query.userId.toString()}`
    const socketId = socket.id.toString()
    console.log(`用户ID: ${userId}`)
    console.log(`用户SOCKETID: ${socketId}`)
    // delete the specified user codis 
    // app.codis.del(userId)

    console.log('建立连接~')
    // 建立连接时保存此用户的socket
    app.codis.sadd(userId,socketId,()=>{
      // search the specified user codis 
      app.codis.smembers(userId,(err:any,userSockets:any)=>{
        console.log(err,userSockets)
      })
    })
    await next()
    console.log('断开连接~')
    //断开连接时清除这个用户的socket
    app.codis.srem(userId,socketId,()=>{
      // search the specified user codis
      app.codis.smembers(userId,(err:any,userSockets:any)=>{
        console.log(err,userSockets)
      })
    })
  }
}