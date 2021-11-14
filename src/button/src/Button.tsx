import {
  h,
  ref,
  computed,
  inject,
  nextTick,
  defineComponent,
  PropType,
  renderSlot,
  CSSProperties,
  ButtonHTMLAttributes
} from 'vue'
import { useMemo } from 'vooks'
import { createHoverColor, createPressedColor } from '../../_utils/color/index'
import { useConfig, useFormItem, useTheme } from '../../_mixins'
import type { ThemeProps } from '../../_mixins'
import {
  NFadeInExpandTransition,
  NIconSwitchTransition,
  NBaseLoading,
  NBaseWave
} from '../../_internal'
import type { BaseWaveRef } from '../../_internal'
import { call, createKey } from '../../_utils'
import type { ExtractPublicPropTypes, MaybeArray } from '../../_utils'
import { buttonLight } from '../styles'
import type { ButtonTheme } from '../styles'
import { buttonGroupInjectionKey } from './ButtonGroup'
import type { Type, Size } from './interface'
import style from './styles/button.cssr'
import useRtl from '../../_mixins/use-rtl'

const buttonProps = {
  ...(useTheme.props as ThemeProps<ButtonTheme>),
  color: String,
  textColor: String,
  text: Boolean,
  block: Boolean,
  loading: Boolean,
  disabled: Boolean,
  circle: Boolean,
  size: String as PropType<Size>,
  ghost: Boolean,
  round: Boolean,
  depth: [Number, String] as PropType<1 | 2 | 3 | '1' | '2' | '3'>,
  focusable: {
    type: Boolean,
    default: true
  },
  keyboard: {
    type: Boolean,
    default: true
  },
  tag: {
    type: String as PropType<keyof HTMLElementTagNameMap>,
    default: 'button'
  },
  type: {
    type: String as PropType<Type>,
    default: 'default'
  },
  dashed: Boolean,
  iconPlacement: {
    type: String as PropType<'left' | 'right'>,
    default: 'left'
  },
  attrType: {
    type: String as PropType<'button' | 'submit' | 'reset'>,
    default: 'button'
  },
  onClick: [Function, Array] as PropType<MaybeArray<(e: MouseEvent) => void>>,
  bordered: {
    type: Boolean,
    default: true
  }
} as const

export type ButtonProps = ExtractPublicPropTypes<typeof buttonProps>

const Button = defineComponent({
  name: 'Button',
  props: buttonProps,
  setup (props) {
    const selfRef = ref<HTMLElement | null>(null)
    const waveRef = ref<BaseWaveRef | null>(null)
    const enterPressedRef = ref(false)
    const showBorderRef = useMemo(() => {
      return (
        !props.text &&
        (!props.color || props.ghost || props.dashed) &&
        props.bordered
      )
    })
    const NButtonGroup = inject(buttonGroupInjectionKey, {})
    const { mergedSizeRef } = useFormItem(
      {},
      {
        defaultSize: 'medium',
        mergedSize: (NFormItem) => {
          const { size } = props
          if (size) return size
          const { size: buttonGroupSize } = NButtonGroup
          if (buttonGroupSize) return buttonGroupSize
          const { mergedSize: formItemSize } = NFormItem || {}
          if (formItemSize) {
            return formItemSize.value
          }
          return 'medium'
        }
      }
    )
    const mergedFocusableRef = computed(() => {
      return props.focusable && !props.disabled
    })
    const handleMouseDown = (e: MouseEvent): void => {
      e.preventDefault()
      if (props.disabled) {
        return
      }
      if (mergedFocusableRef.value) {
        selfRef.value?.focus({ preventScroll: true })
      }
    }
    const handleClick = (e: MouseEvent): void => {
      if (!props.disabled) {
        const { onClick } = props
        if (onClick) call(onClick, e)
        if (!props.text) {
          const { value } = waveRef
          if (value) {
            value.play()
          }
        }
      }
    }
    const handleKeyUp = (e: KeyboardEvent): void => {
      switch (e.code) {
        case 'Enter':
        case 'NumpadEnter':
          if (!props.keyboard) {
            e.preventDefault()
            return
          }
          enterPressedRef.value = false
          void nextTick(() => {
            if (!props.disabled) {
              selfRef.value?.click()
            }
          })
      }
    }
    const handleKeyDown = (e: KeyboardEvent): void => {
      switch (e.code) {
        case 'Enter':
        case 'NumpadEnter':
          if (!props.keyboard) {
            e.preventDefault()
            return
          }
          enterPressedRef.value = true
      }
    }
    const handleBlur = (): void => {
      enterPressedRef.value = false
    }
    const { mergedClsPrefixRef, NConfigProvider } = useConfig(props)
    const themeRef = useTheme(
      'Button',
      'Button',
      style,
      buttonLight,
      props,
      mergedClsPrefixRef
    )
    const rtlEnabledRef = useRtl(
      'Button',
      NConfigProvider?.mergedRtlRef,
      mergedClsPrefixRef
    )
    return {
      selfRef,
      waveRef,
      mergedClsPrefix: mergedClsPrefixRef,
      mergedFocusable: mergedFocusableRef,
      mergedSize: mergedSizeRef,
      showBorder: showBorderRef,
      enterPressed: enterPressedRef,
      rtlEnabled: rtlEnabledRef,
      handleMouseDown,
      handleKeyDown,
      handleBlur,
      handleKeyUp,
      handleClick,
      customColorCssVars: computed(() => {
        const { color } = props
        if (!color) return null
        const hoverColor = createHoverColor(color)
        return {
          '--border-color': color,
          '--border-color-hover': hoverColor,
          '--border-color-pressed': createPressedColor(color),
          '--border-color-focus': hoverColor,
          '--border-color-disabled': color
        }
      }),
      cssVars: computed(() => {
        const theme = themeRef.value
        const {
          common: { cubicBezierEaseInOut, cubicBezierEaseOut },
          self
        } = theme
        const {
          rippleDuration,
          opacityDisabled,
          fontWeightText,
          fontWeighGhost,
          fontWeight
        } = self
        const size = mergedSizeRef.value
        const { dashed, type, ghost, text, color, round, circle, textColor } =
          props
        // font
        const fontProps = {
          fontWeight: text
            ? fontWeightText
            : ghost
              ? fontWeighGhost
              : fontWeight
        }
        // color
        let colorProps = {
          '--color': 'initial',
          '--color-hover': 'initial',
          '--color-pressed': 'initial',
          '--color-focus': 'initial',
          '--color-disabled': 'initial',
          '--ripple-color': 'initial',
          '--text-color': 'initial',
          '--text-color-hover': 'initial',
          '--text-color-pressed': 'initial',
          '--text-color-focus': 'initial',
          '--text-color-disabled': 'initial'
        }
        if (text) {
          const { depth } = props
          const propTextColor = textColor || color
          const mergedTextColor =
            propTextColor ||
            (type === 'default' && depth !== undefined
              ? self[
                createKey(
                  'textColorTextDepth',
                  String(depth) as '1' | '2' | '3'
                )
              ]
              : self[createKey('textColorText', type)])
          colorProps = {
            '--color': '#0000',
            '--color-hover': '#0000',
            '--color-pressed': '#0000',
            '--color-focus': '#0000',
            '--color-disabled': '#0000',
            '--ripple-color': '#0000',
            '--text-color': mergedTextColor,
            '--text-color-hover': propTextColor
              ? createHoverColor(propTextColor)
              : self[createKey('textColorTextHover', type)],
            '--text-color-pressed': propTextColor
              ? createPressedColor(propTextColor)
              : self[createKey('textColorTextPressed', type)],
            '--text-color-focus': propTextColor
              ? createHoverColor(propTextColor)
              : self[createKey('textColorTextHover', type)],
            '--text-color-disabled':
              propTextColor || self[createKey('textColorTextDisabled', type)]
          }
        } else if (ghost || dashed) {
          const mergedTextColor = textColor || color
          colorProps = {
            '--color': '#0000',
            '--color-hover': '#0000',
            '--color-pressed': '#0000',
            '--color-focus': '#0000',
            '--color-disabled': '#0000',
            '--ripple-color': color || self[createKey('rippleColor', type)],
            '--text-color':
              mergedTextColor || self[createKey('textColorGhost', type)],
            '--text-color-hover': mergedTextColor
              ? createHoverColor(mergedTextColor)
              : self[createKey('textColorGhostHover', type)],
            '--text-color-pressed': mergedTextColor
              ? createPressedColor(mergedTextColor)
              : self[createKey('textColorGhostPressed', type)],
            '--text-color-focus': mergedTextColor
              ? createHoverColor(mergedTextColor)
              : self[createKey('textColorGhostHover', type)],
            '--text-color-disabled':
              mergedTextColor || self[createKey('textColorGhostDisabled', type)]
          }
        } else {
          colorProps = {
            '--color': color || self[createKey('color', type)],
            '--color-hover': color
              ? createHoverColor(color)
              : self[createKey('colorHover', type)],
            '--color-pressed': color
              ? createPressedColor(color)
              : self[createKey('colorPressed', type)],
            '--color-focus': color
              ? createHoverColor(color)
              : self[createKey('colorFocus', type)],
            '--color-disabled': color || self[createKey('colorDisabled', type)],
            '--ripple-color': color || self[createKey('rippleColor', type)],
            '--text-color':
              textColor ||
              (color
                ? self.textColorPrimary
                : self[createKey('textColor', type)]),
            '--text-color-hover':
              textColor ||
              (color
                ? self.textColorHoverPrimary
                : self[createKey('textColorHover', type)]),
            '--text-color-pressed':
              textColor ||
              (color
                ? self.textColorPressedPrimary
                : self[createKey('textColorPressed', type)]),
            '--text-color-focus':
              textColor ||
              (color
                ? self.textColorFocusPrimary
                : self[createKey('textColorFocus', type)]),
            '--text-color-disabled':
              textColor ||
              (color
                ? self.textColorDisabledPrimary
                : self[createKey('textColorDisabled', type)])
          }
        }
        // border
        let borderProps = {
          '--border': 'initial',
          '--border-hover': 'initial',
          '--border-pressed': 'initial',
          '--border-focus': 'initial',
          '--border-disabled': 'initial'
        }
        if (text) {
          borderProps = {
            '--border': 'none',
            '--border-hover': 'none',
            '--border-pressed': 'none',
            '--border-focus': 'none',
            '--border-disabled': 'none'
          }
        } else {
          borderProps = {
            '--border': self[createKey('border', type)],
            '--border-hover': self[createKey('borderHover', type)],
            '--border-pressed': self[createKey('borderPressed', type)],
            '--border-focus': self[createKey('borderFocus', type)],
            '--border-disabled': self[createKey('borderDisabled', type)]
          }
        }
        // size
        const {
          [createKey('height', size)]: height,
          [createKey('fontSize', size)]: fontSize,
          [createKey('padding', size)]: padding,
          [createKey('paddingRound', size)]: paddingRound,
          [createKey('iconSize', size)]: iconSize,
          [createKey('borderRadius', size)]: borderRadius,
          [createKey('iconMargin', size)]: iconMargin,
          waveOpacity
        } = self
        const sizeProps = {
          '--width': circle && !text ? height : 'initial',
          '--height': text ? 'initial' : height,
          '--font-size': fontSize,
          '--padding': circle
            ? 'initial'
            : text
              ? 'initial'
              : round
                ? paddingRound
                : padding,
          '--icon-size': iconSize,
          '--icon-margin': iconMargin,
          '--border-radius': text
            ? 'initial'
            : circle || round
              ? height
              : borderRadius
        }
        return {
          '--bezier': cubicBezierEaseInOut,
          '--bezier-ease-out': cubicBezierEaseOut,
          '--ripple-duration': rippleDuration,
          '--opacity-disabled': opacityDisabled,
          '--wave-opacity': waveOpacity,
          ...fontProps,
          ...colorProps,
          ...borderProps,
          ...sizeProps
        }
      })
    }
  },
  render () {
    const { $slots, mergedClsPrefix, tag: Component } = this
    return (
      <Component
        ref="selfRef"
        class={[
          `${mergedClsPrefix}-button`,
          `${mergedClsPrefix}-button--${this.type}-type`,
          `${mergedClsPrefix}-button--${this.mergedSize}-type`,
          this.rtlEnabled && `${mergedClsPrefix}-button--rtl`,
          this.disabled && `${mergedClsPrefix}-button--disabled`,
          this.block && `${mergedClsPrefix}-button--block`,
          this.enterPressed && `${mergedClsPrefix}-button--pressed`,
          !this.text && this.dashed && `${mergedClsPrefix}-button--dashed`,
          this.color && `${mergedClsPrefix}-button--color`,
          this.ghost && `${mergedClsPrefix}-button--ghost` // required for button group border collapse
        ]}
        tabindex={this.mergedFocusable ? 0 : -1}
        type={this.attrType}
        style={this.cssVars as CSSProperties}
        disabled={this.disabled}
        onClick={this.handleClick}
        onBlur={this.handleBlur}
        onMousedown={this.handleMouseDown}
        onKeyup={this.handleKeyUp}
        onKeydown={this.handleKeyDown}
      >
        {$slots.default && this.iconPlacement === 'right' ? (
          <div class={`${mergedClsPrefix}-button__content`}>{$slots}</div>
        ) : null}
        <NFadeInExpandTransition width>
          {{
            default: () =>
              $slots.icon || this.loading ? (
                <span
                  class={`${mergedClsPrefix}-button__icon`}
                  style={{
                    margin: !$slots.default ? 0 : ''
                  }}
                >
                  <NIconSwitchTransition>
                    {{
                      default: () =>
                        this.loading ? (
                          <NBaseLoading
                            clsPrefix={mergedClsPrefix}
                            key="loading"
                            class={`${mergedClsPrefix}-icon-slot`}
                            strokeWidth={20}
                          />
                        ) : (
                          <div
                            key="icon"
                            class={`${mergedClsPrefix}-icon-slot`}
                            role="none"
                          >
                            {renderSlot($slots, 'icon')}
                          </div>
                        )
                    }}
                  </NIconSwitchTransition>
                </span>
              ) : null
          }}
        </NFadeInExpandTransition>
        {$slots.default && this.iconPlacement === 'left' ? (
          <span class={`${mergedClsPrefix}-button__content`}>{$slots}</span>
        ) : null}
        {!this.text ? (
          <NBaseWave ref="waveRef" clsPrefix={mergedClsPrefix} />
        ) : null}
        {this.showBorder ? (
          <div
            aria-hidden
            class={`${mergedClsPrefix}-button__border`}
            style={this.customColorCssVars as CSSProperties}
          />
        ) : null}
        {this.showBorder ? (
          <div
            aria-hidden
            class={`${mergedClsPrefix}-button__state-border`}
            style={this.customColorCssVars as CSSProperties}
          />
        ) : null}
      </Component>
    )
  }
})

type NativeButtonProps = Omit<ButtonHTMLAttributes, keyof ButtonProps>
type MergedProps = Partial<ButtonProps & NativeButtonProps>

export default Button

// XButton is for tsx type checking
// It's not compitable with render function `h`
// Currently we don't expose it as public
// If there's any issue about this, we may expose it
// Since most people use template, the type checking phase doesn't work as tsx
export const XButton: new () => { $props: MergedProps } = Button as any

// Also, we may make XButton a generic type which support `tag` prop
// but currently vue doesn't export IntrinsicElementAttributes from runtime-dom
// so we can't easily make an attr map by hand
// just leave it for later
