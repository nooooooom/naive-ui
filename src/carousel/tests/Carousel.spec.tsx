import { h, nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import { NCarousel, NCarouselItem } from '../index'
import { sleep } from 'seemly'

describe('n-carousel', () => {
  it('should work with import on demand', () => {
    mount(NCarousel)
  })

  it('should work with `autoplay` and `interval` prop', async () => {
    const wrapper = mount(NCarousel, {
      slots: {
        default: () => {
          return [...Array(3).keys()].map(i => {
            return h('div', {}, i.toString())
          })
        }
      }
    })

    await wrapper.setProps({ autoplay: true, interval: 50 })

    await sleep(25)
    ;([0, 1, 2, 3, 4] as const).forEach(i => {
      if (i === 1) {
        expect(
          wrapper.find(`[data-index="${i}"]`).attributes('aria-hidden')
        ).toBe('false')
      } else {
        expect(
          wrapper.find(`[data-index="${i}"]`).attributes('aria-hidden')
        ).toBe('true')
      }
    })

    await sleep(25)
    ;([0, 1, 2, 3, 4] as const).forEach(i => {
      if (i === 2) {
        expect(
          wrapper.find(`[data-index="${i}"]`).attributes('aria-hidden')
        ).toBe('false')
      } else {
        expect(
          wrapper.find(`[data-index="${i}"]`).attributes('aria-hidden')
        ).toBe('true')
      }
    })
  })

  it('should work with `dotPlacement` prop', async () => {
    const wrapper = mount(NCarousel)

    for (const placement of ['top', 'bottom', 'left', 'right'] as const) {
      await wrapper.setProps({ dotPlacement: placement })
      expect(wrapper.find('.n-carousel').classes()).toContain(
        `n-carousel--${placement}`
      )
    }
  })

  it('should work with `interval` prop', async () => {
    const wrapper = mount(NCarousel, {
      props: {
        interval: 100,
        autoplay: true
      },
      slots: {
        default: () => {
          return [...Array(3).keys()].map(i => {
            return h('div', {}, i.toString())
          })
        }
      }
    })

    await sleep(100)
    expect(
      wrapper
        .find('.n-carousel__slides')
        .find('[data-index="2"]')
        .attributes('aria-hidden')
    ).toBe('false')
    expect(
      wrapper
        .find('.n-carousel__dots')
        .findAll('.n-carousel__dot')[1]
        .attributes('aria-selected')
    ).toBe('true')
  })

  it('should work with `showArrow` prop', async () => {
    const wrapper = mount(NCarousel)

    await wrapper.setProps({
      showArrow: true
    })

    expect(wrapper.find('.n-carousel__arrow--right').exists()).toBe(true)
    expect(wrapper.find('.n-carousel__arrow--left').exists()).toBe(true)
  })

  it('arrow button should work', async () => {
    const wrapper = mount(NCarousel, {
      props: {
        loop: false
      },
      slots: {
        default: () => {
          return [
            h('img', {
              style: 'width: 100%; height: 240px; object-fit: cover;',
              src:
                'https://naive-ui.oss-cn-beijing.aliyuncs.com/carousel-img/carousel4.jpeg'
            }),
            h('img', {
              style: 'width: 100%; height: 240px; object-fit: cover;',
              src:
                'https://naive-ui.oss-cn-beijing.aliyuncs.com/carousel-img/carousel4.jpeg'
            })
          ]
        }
      }
    })

    await wrapper.setProps({
      showArrow: true
    })

    const slidesDOMArray = wrapper.findAll('.n-carousel__slide')

    expect(slidesDOMArray[0].attributes('aria-hidden')).toBe('false')

    await wrapper.find('.n-carousel__arrow--right').trigger('click')
    expect(slidesDOMArray[1].attributes('aria-hidden')).toBe('false')

    await wrapper.find('.n-carousel__arrow--left').trigger('click')
    expect(slidesDOMArray[0].attributes('aria-hidden')).toBe('false')
  })

  it('should work with `centeredSlides` prop', async () => {
    const wrapper = mount(NCarousel, {
      props: {
        slidesPerView: 'auto',
        loop: false
      },
      attrs: {
        style: 'width: 240px;height: 300px;'
      },
      slots: {
        default: () => {
          return [...Array(5).keys()].map(i => {
            return h(NCarouselItem, {
              style: `width: ${(i + 1) * 10}%;`,
              slots: {
                default: () => h('div', {}, i.toString())
              }
            })
          })
        }
      }
    })

    const wrapperRect = wrapper.element.getBoundingClientRect()

    const slidesDOMArray = wrapper.findAll('.n-carousel__slide')
    for (let i = 0; i < slidesDOMArray.length; i++) {
      const slideDOM = slidesDOMArray[i]
      const rect = slideDOM.element.getBoundingClientRect()
      expect(rect.left - wrapperRect.left).toBe(
        (wrapperRect.width - rect.width) / 2
      )

      wrapper.vm.next()
      await nextTick()
    }
  })

  it('should work with `trigger` prop', async () => {
    const wrapper = mount(NCarousel, {
      props: {
        loop: false
      },
      slots: {
        default: () => {
          return [...Array(3).keys()].map(i => {
            return h('div', {}, i.toString())
          })
        }
      }
    })

    const dotsDOMArray = wrapper.findAll('.n-carousel__dot')
    const slidesDOMArray = wrapper.findAll('.n-carousel__slide')

    const triggerEvent = {
      click: 'click',
      hover: 'mouseenter'
    }
    const triggers = Object.keys(triggerEvent) as Array<
    keyof typeof triggerEvent
    >
    for (let i = 0; i < triggers.length; i++) {
      const trigger = triggers[i]
      const event = triggerEvent[triggers[i]]
      await wrapper.setProps({
        trigger
      })

      for (let j = 0; j < dotsDOMArray.length; j++) {
        const dotsDOM = dotsDOMArray[j]
        await dotsDOM.trigger(event)
        expect(slidesDOMArray[j].attributes('aria-hidden')).toBe('false')
      }
    }
  })
})
