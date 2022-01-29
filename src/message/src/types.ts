import { VNodeChild } from 'vue'
import type { MessageSetupProps } from './message-props'

export type MessageType = 'info' | 'success' | 'warning' | 'error' | 'loading'

// We should export keepAliveOnHover since it's not managed by users
export type RenderMessageProps = Pick<
MessageSetupProps,
'closable' | 'content' | 'icon' | 'onClose' | 'type'
>

export type MessageRenderMessage = (props: RenderMessageProps) => VNodeChild

export interface MessageOptions {
  render?: MessageRenderMessage
  duration?: number
  closable?: boolean
  keepAliveOnHover?: boolean
  icon?: () => VNodeChild
  onClose?: () => void
  onLeave?: () => void
  onAfterLeave?: () => void
}
