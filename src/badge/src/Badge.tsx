import {
  h,
  computed,
  onMounted,
  ref,
  PropType,
  defineComponent,
  Transition,
  CSSProperties
} from 'vue'
import { useConfig, useTheme } from '../../_mixins'
import type { ThemeProps } from '../../_mixins'
import { NBaseSlotMachine, NBaseWave } from '../../_internal'
import { createKey, getTitleAttribute } from '../../_utils'
import type { ExtractPublicPropTypes } from '../../_utils'
import { badgeLight } from '../styles'
import type { BadgeTheme } from '../styles'
import style from './styles/index.cssr'

const badgeProps = {
  ...(useTheme.props as ThemeProps<BadgeTheme>),
  value: [String, Number] as PropType<string | number>,
  max: Number,
  dot: {
    type: Boolean,
    default: false
  },
  type: {
    type: String as PropType<
    'success' | 'error' | 'warning' | 'info' | 'default'
    >,
    default: 'default'
  },
  show: {
    type: Boolean,
    default: true
  },
  showZero: {
    type: Boolean,
    default: false
  },
  processing: {
    type: Boolean,
    default: false
  },
  color: String
} as const

export type BadgeProps = ExtractPublicPropTypes<typeof badgeProps>

export default defineComponent({
  name: 'Badge',
  props: badgeProps,
  setup (props) {
    const { mergedClsPrefixRef } = useConfig(props)
    const themeRef = useTheme(
      'Badge',
      'Badge',
      style,
      badgeLight,
      props,
      mergedClsPrefixRef
    )
    const appearedRef = ref(false)
    const handleAfterEnter = (): void => {
      appearedRef.value = true
    }
    const handleAfterLeave = (): void => {
      appearedRef.value = false
    }
    const showBadgeRef = computed(() => {
      return (
        props.show &&
        (props.dot ||
          (props.value !== undefined && !(!props.showZero && props.value <= 0)))
      )
    })
    onMounted(() => {
      if (showBadgeRef.value) appearedRef.value = true
    })
    return {
      mergedClsPrefix: mergedClsPrefixRef,
      appeared: ref(false),
      showBadge: showBadgeRef,
      handleAfterEnter,
      handleAfterLeave,
      cssVars: computed(() => {
        const { type, color: propColor } = props
        const {
          common: { cubicBezierEaseInOut, cubicBezierEaseOut },
          self: { [createKey('color', type)]: color, fontFamily, fontSize }
        } = themeRef.value
        return {
          '--n-font-size': fontSize,
          '--n-font-family': fontFamily,
          '--n-color': propColor || color,
          '--n-ripple-color': propColor || color,
          '--n-bezier': cubicBezierEaseInOut,
          '--n-ripple-bezier': cubicBezierEaseOut
        }
      })
    }
  },
  render () {
    const { mergedClsPrefix, $slots } = this
    return (
      <div
        class={[
          `${mergedClsPrefix}-badge`,
          {
            [`${mergedClsPrefix}-badge--dot`]: this.dot,
            [`${mergedClsPrefix}-badge--as-is`]: !$slots.default
          }
        ]}
        style={this.cssVars as CSSProperties}
      >
        {$slots.default?.()}
        <Transition
          name="fade-in-scale-up-transition"
          onAfterEnter={this.handleAfterEnter}
          onAfterLeave={this.handleAfterLeave}
        >
          {{
            default: () =>
              this.showBadge ? (
                <sup
                  class={`${mergedClsPrefix}-badge-sup`}
                  title={getTitleAttribute(this.value)}
                >
                  {!this.dot ? (
                    <NBaseSlotMachine
                      clsPrefix={mergedClsPrefix}
                      appeared={this.appeared}
                      max={this.max}
                      value={this.value}
                    />
                  ) : null}
                  {this.processing ? (
                    <NBaseWave clsPrefix={mergedClsPrefix} />
                  ) : null}
                </sup>
              ) : null
          }}
        </Transition>
      </div>
    )
  }
})
