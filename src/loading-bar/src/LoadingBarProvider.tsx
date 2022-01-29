import {
  Fragment,
  h,
  ref,
  Teleport,
  defineComponent,
  provide,
  nextTick,
  PropType,
  ExtractPropTypes,
  CSSProperties
} from 'vue'
import { useIsMounted } from 'vooks'
import { useConfig, useTheme } from '../../_mixins'
import type { ThemeProps } from '../../_mixins'
import { ExtractPublicPropTypes } from '../../_utils'
import type { LoadingBarTheme } from '../styles'
import NLoadingBar from './LoadingBar'
import {
  loadingBarApiInjectionKey,
  loadingBarProviderInjectionKey
} from './context'

export interface LoadingBarInst {
  start: () => void
  error: () => void
  finish: () => void
}

export type LoadingBarProviderInst = LoadingBarInst
export type LoadingBarApiInjection = LoadingBarInst

const loadingBarProps = {
  ...(useTheme.props as ThemeProps<LoadingBarTheme>),
  to: {
    type: [String, Object] as PropType<string | HTMLElement>,
    default: undefined
  },
  loadingBarStyle: {
    type: Object as PropType<{
      loading?: string | CSSProperties
      error?: string | CSSProperties
    }>
  }
}

export type LoadingBarProviderProps = ExtractPublicPropTypes<
  typeof loadingBarProps
>

export type LoadingBarProviderSetupProps = ExtractPropTypes<
  typeof loadingBarProps
>

export default defineComponent({
  name: 'LoadingBarProvider',
  props: loadingBarProps,
  setup (props) {
    const isMountedRef = useIsMounted()
    const loadingBarRef = ref<LoadingBarInst | null>(null)
    const methods: LoadingBarProviderInst = {
      start () {
        if (isMountedRef.value) {
          loadingBarRef.value?.start()
        } else {
          void nextTick(() => {
            loadingBarRef.value?.start()
          })
        }
      },
      error () {
        if (isMountedRef.value) {
          loadingBarRef.value?.error()
        } else {
          void nextTick(() => {
            loadingBarRef.value?.error()
          })
        }
      },
      finish () {
        if (isMountedRef.value) {
          loadingBarRef.value?.finish()
        } else {
          void nextTick(() => {
            loadingBarRef.value?.finish()
          })
        }
      }
    }
    const { mergedClsPrefixRef } = useConfig(props)
    provide(loadingBarApiInjectionKey, methods)
    provide(loadingBarProviderInjectionKey, {
      props,
      mergedClsPrefixRef
    })
    return Object.assign(methods, {
      loadingBarRef
    })
  },
  render () {
    return (
      <>
        <Teleport to={this.to ?? 'body'}>
          <NLoadingBar ref="loadingBarRef" />
        </Teleport>
        {this.$slots.default?.()}
      </>
    )
  }
})
