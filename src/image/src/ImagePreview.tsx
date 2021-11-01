import {
  h,
  defineComponent,
  Fragment,
  ref,
  withDirectives,
  Transition,
  vShow,
  renderSlot,
  watch,
  computed,
  CSSProperties,
  PropType,
  toRef
} from 'vue'
import { zindexable } from 'vdirs'
import { useIsMounted } from 'vooks'
import { LazyTeleport } from 'vueuc'
import { on, off } from 'evtd'
import { beforeNextFrameOnce } from 'seemly'
import {
  RotateClockwiseIcon,
  RotateCounterclockwiseIcon,
  ZoomInIcon,
  ZoomOutIcon
} from '../../_internal/icons'
import { useTheme } from '../../_mixins'
import { NBaseIcon } from '../../_internal'
import { imageLight } from '../styles'
import { prevIcon, nextIcon, closeIcon } from './icons'
import style from './styles/index.cssr'

export interface ImagePreviewInst {
  setThumbnailEl: (e: HTMLImageElement | null) => void
  setPreviewSrc: (src?: string) => void
  toggleShow: () => void
}

export default defineComponent({
  name: 'ImagePreview',
  props: {
    showToolbar: Boolean,
    onNext: Function as PropType<() => void>,
    onPrev: Function as PropType<() => void>,
    clsPrefix: {
      type: String,
      required: true
    }
  },
  setup (props) {
    const themeRef = useTheme(
      'Image',
      'Image',
      style,
      imageLight,
      {},
      toRef(props, 'clsPrefix')
    )
    let thumbnailEl: HTMLImageElement | null = null
    const previewRef = ref<HTMLImageElement | null>(null)
    const previewWrapperRef = ref<HTMLDivElement | null>(null)
    const previewSrcRef = ref<string | undefined>(undefined)
    const showRef = ref(false)
    const displayedRef = ref(false)

    function syncTransformOrigin (): void {
      const { value: previewWrapper } = previewWrapperRef
      if (!thumbnailEl || !previewWrapper) return
      const { style } = previewWrapper
      const tbox = thumbnailEl.getBoundingClientRect()
      const tx = tbox.left + tbox.width / 2
      const ty = tbox.top + tbox.height / 2
      style.transformOrigin = `${tx}px ${ty}px`
    }

    function handleKeyup (e: KeyboardEvent): void {
      switch (e.code) {
        case 'ArrowLeft':
          props.onPrev?.()
          break
        case 'ArrowRight':
          props.onNext?.()
          break
        case 'Escape':
          toggleShow()
          break
      }
    }

    if (props.onPrev) {
      watch(showRef, (value) => {
        if (value) on('keyup', document, handleKeyup)
        else off('keyup', document, handleKeyup)
      })
    }

    let startX = 0
    let startY = 0
    let offsetX = 0
    let offsetY = 0
    let dragging = false
    function handleMouseMove (e: MouseEvent): void {
      const { clientX, clientY } = e
      offsetX = clientX - startX
      offsetY = clientY - startY
      beforeNextFrameOnce(derivePreviewStyle)
    }
    // avoid image move outside viewport
    function getDerivedOffset (): {
      offsetX: number
      offsetY: number
    } {
      const { value: preview } = previewRef
      if (!preview) return { offsetX: 0, offsetY: 0 }
      const pbox = preview.getBoundingClientRect()
      let nextOffsetX = 0
      let nextOffsetY = 0
      if (pbox.width <= window.innerWidth) {
        nextOffsetX = 0
      } else if (pbox.left > 0) {
        nextOffsetX = (pbox.width - window.innerWidth) / 2
      } else if (pbox.right < window.innerWidth) {
        nextOffsetX = -(pbox.width - window.innerWidth) / 2
      }
      if (pbox.height <= window.innerHeight) {
        nextOffsetY = 0
      } else if (pbox.top > 0) {
        nextOffsetY = (pbox.height - window.innerHeight) / 2
      } else if (pbox.bottom < window.innerHeight) {
        nextOffsetY = -(pbox.height - window.innerHeight) / 2
      }
      return {
        offsetX: nextOffsetX,
        offsetY: nextOffsetY
      }
    }
    function handleMouseUp (): void {
      off('mousemove', document, handleMouseMove)
      off('mouseup', document, handleMouseUp)
      dragging = false
      const offset = getDerivedOffset()
      offsetX = offset.offsetX
      offsetY = offset.offsetY
      derivePreviewStyle()
    }
    function handlePreviewMousedown (e: MouseEvent): void {
      const { clientX, clientY } = e
      dragging = true
      startX = clientX - offsetX
      startY = clientY - offsetY
      derivePreviewStyle()
      on('mousemove', document, handleMouseMove)
      on('mouseup', document, handleMouseUp)
    }
    function handlePreviewDblclick (): void {
      scale = scale === 1 ? 2 : 1
      derivePreviewStyle()
    }

    let scale = 1
    let rotate = 0
    function handleSwitchPrev (): void {
      scale = 1
      rotate = 0
      props.onPrev?.()
    }
    function handleSwitchNext (): void {
      scale = 1
      rotate = 0
      props.onNext?.()
    }
    function rotateCounterclockwise (): void {
      rotate -= 90
      derivePreviewStyle()
    }
    function rotateClockwise (): void {
      rotate += 90
      derivePreviewStyle()
    }
    function zoomIn (): void {
      if (scale < 3) {
        scale += 0.5
        derivePreviewStyle()
      }
    }
    function zoomOut (): void {
      if (scale > 0.5) {
        scale -= 0.5
        derivePreviewStyle(false)
        const offset = getDerivedOffset()
        scale += 0.5
        derivePreviewStyle(false)
        scale -= 0.5
        offsetX = offset.offsetX
        offsetY = offset.offsetY
        derivePreviewStyle()
      }
    }

    function derivePreviewStyle (transition: boolean = true): void {
      const { value: preview } = previewRef
      if (!preview) return
      const { style } = preview
      const transformStyle = `transform-origin: center; transform: translateX(${offsetX}px) translateY(${offsetY}px) rotate(${rotate}deg) scale(${scale});`
      if (dragging) {
        style.cssText = 'cursor: grabbing; transition: none;' + transformStyle
      } else {
        style.cssText =
          'cursor: grab;' +
          transformStyle +
          (transition ? '' : 'transition: none;')
      }
      if (!transition) {
        void preview.offsetHeight
      }
    }

    function toggleShow (): void {
      showRef.value = !showRef.value
      displayedRef.value = true
    }
    const exposedMethods: ImagePreviewInst = {
      setPreviewSrc: (src) => {
        previewSrcRef.value = src
      },
      setThumbnailEl: (el) => {
        thumbnailEl = el
      },
      toggleShow
    }

    return {
      previewRef,
      previewWrapperRef,
      previewSrc: previewSrcRef,
      show: showRef,
      appear: useIsMounted(),
      displayed: displayedRef,
      handlePreviewMousedown,
      handlePreviewDblclick,
      syncTransformOrigin,
      handleAfterLeave: () => {
        rotate = 0
        scale = 1
        displayedRef.value = false
      },
      zoomIn,
      zoomOut,
      rotateCounterclockwise,
      rotateClockwise,
      handleSwitchPrev,
      handleSwitchNext,
      ...exposedMethods,
      cssVars: computed(() => {
        const {
          common: { cubicBezierEaseInOut },
          self: { iconColor }
        } = themeRef.value
        return {
          '--bezier': cubicBezierEaseInOut,
          '--icon-color': iconColor
        }
      })
    }
  },
  render () {
    const { clsPrefix } = this
    return (
      <>
        {renderSlot(this.$slots, 'default')}
        <LazyTeleport show={this.show}>
          {{
            default: () =>
              this.show || this.displayed
                ? withDirectives(
                    <div
                      class={`${clsPrefix}-image-preview-container`}
                      style={this.cssVars as CSSProperties}
                    >
                      <Transition
                        name="fade-in-transition"
                        appear={this.appear}
                      >
                        {{
                          default: () =>
                            this.show ? (
                              <div
                                class={`${clsPrefix}-image-preview-overlay`}
                                onClick={this.toggleShow}
                              />
                            ) : null
                        }}
                      </Transition>
                      {this.showToolbar ? (
                        <Transition
                          name="fade-in-transition"
                          appear={this.appear}
                        >
                          {{
                            default: () =>
                              this.show ? (
                                <div
                                  class={`${clsPrefix}-image-preview-toolbar`}
                                >
                                  {this.onPrev ? (
                                    <>
                                      <NBaseIcon
                                        clsPrefix={clsPrefix}
                                        onClick={this.handleSwitchPrev}
                                      >
                                        {{ default: () => prevIcon }}
                                      </NBaseIcon>
                                      <NBaseIcon
                                        clsPrefix={clsPrefix}
                                        onClick={this.handleSwitchNext}
                                      >
                                        {{ default: () => nextIcon }}
                                      </NBaseIcon>
                                    </>
                                  ) : null}
                                  <NBaseIcon
                                    clsPrefix={clsPrefix}
                                    onClick={this.rotateCounterclockwise}
                                  >
                                    {{
                                      default: () => (
                                        <RotateCounterclockwiseIcon />
                                      )
                                    }}
                                  </NBaseIcon>
                                  <NBaseIcon
                                    clsPrefix={clsPrefix}
                                    onClick={this.rotateClockwise}
                                  >
                                    {{ default: () => <RotateClockwiseIcon /> }}
                                  </NBaseIcon>
                                  <NBaseIcon
                                    clsPrefix={clsPrefix}
                                    onClick={this.zoomOut}
                                  >
                                    {{ default: () => <ZoomOutIcon /> }}
                                  </NBaseIcon>
                                  <NBaseIcon
                                    clsPrefix={clsPrefix}
                                    onClick={this.zoomIn}
                                  >
                                    {{ default: () => <ZoomInIcon /> }}
                                  </NBaseIcon>
                                  <NBaseIcon
                                    clsPrefix={clsPrefix}
                                    onClick={this.toggleShow}
                                  >
                                    {{ default: () => closeIcon }}
                                  </NBaseIcon>
                                </div>
                              ) : null
                          }}
                        </Transition>
                      ) : null}
                      <Transition
                        name="fade-in-scale-up-transition"
                        onAfterLeave={this.handleAfterLeave}
                        appear={this.appear}
                        // BUG:
                        // onEnter will be called twice, I don't know why
                        // Maybe it is a bug of vue
                        onEnter={this.syncTransformOrigin}
                        onBeforeLeave={this.syncTransformOrigin}
                      >
                        {{
                          default: () =>
                            withDirectives(
                              <div
                                class={`${clsPrefix}-image-preview-wrapper`}
                                ref="previewWrapperRef"
                              >
                                <img
                                  draggable={false}
                                  onMousedown={this.handlePreviewMousedown}
                                  onDblclick={this.handlePreviewDblclick}
                                  class={`${clsPrefix}-image-preview`}
                                  key={this.previewSrc}
                                  src={this.previewSrc}
                                  ref="previewRef"
                                />
                              </div>,
                              [[vShow, this.show]]
                            )
                        }}
                      </Transition>
                    </div>,
                    [[zindexable, { enabled: this.show }]]
                )
                : null
          }}
        </LazyTeleport>
      </>
    )
  }
})
