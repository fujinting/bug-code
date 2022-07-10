import { Controller } from 'egg'
import Response from '../utils/Response'


export default class MergeRequestEventsController extends Controller {
  // 获取登录用户信息
  public async pushNews() {
    const app: any = this.ctx.app
    const request: any = this.ctx.request
    const nsp = app.io.of('/')
    const response = new Response()
    response.setData({
      message: '推送成功！',
      code: '0'
    })
    if (request.body.object_kind === 'merge_request') {
      // 群发存在问题
      // nsp.server.sockets.emit('notify', this.ctx.request.body)

      // 单发
      // 如果是创建mr
      if(request.body.object_attributes.merge_status === 'unchecked') {
        console.log('创建mr')
        console.log(`请求被mr的用户ID: ${request.body.object_attributes.assignee_id}`)
        const assigneeId =`vscode-preview-${request.body.object_attributes.assignee_id.toString()}`
        app.codis.smembers(assigneeId,(err:any,userSockets:any)=>{
          console.log(err,userSockets)
          if(userSockets) {
            userSockets.map((socketId)=>{
              if(nsp.sockets[socketId]) {
                nsp.sockets[socketId].emit('notify', request.body)
              }
            })
          }
        })
        this.ctx.body = response
      } else if(request.body.object_attributes.merge_status === 'can_be_merged') {
        console.log('合并mr')
        console.log(`mr提出者的用户ID: ${request.body.object_attributes.author_id}`)
        const authorId =`vscode-preview-${request.body.object_attributes.author_id.toString()}`
        app.codis.smembers(authorId, (err:any,userSockets:any)=>{
          console.log(err,userSockets)
          if(userSockets) {
            userSockets.map((socketId)=>{
              if(nsp.sockets[socketId]) {
                nsp.sockets[socketId].emit('notify', request.body)
              }
            })
          }
        })
        this.ctx.body = response  
      }
    }
  }
}
