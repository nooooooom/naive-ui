# Add tooltip to option

Use the `render-option` property to control rendering of the entire option.

```html
<n-select :options="options" :render-option="renderOption" />
```

```ts
import { defineComponent, h, VNode, ref } from 'vue'
import { NTooltip, SelectOption } from 'naive-ui'

export default defineComponent({
  setup () {
    return {
      renderOption: ({ node, option }: { node: VNode, option: SelectOption }) =>
        h(NTooltip, null, {
          trigger: () => node,
          default: () => 'Rubber Soul -' + option.label
        }),
      options: ref<SelectOption[]>([
        {
          label: "Everybody's Got Something to Hide Except Me and My Monkey",
          value: 'song0',
          disabled: true
        },
        {
          label: 'Drive My Car',
          value: 'song1'
        },
        {
          label: 'Norwegian Wood',
          value: 'song2'
        },
        {
          label: "You Won't See",
          value: 'song3',
          disabled: true
        },
        {
          label: 'Nowhere Man',
          value: 'song4'
        },
        {
          label: 'Think For Yourself',
          value: 'song5'
        },
        {
          label: 'The Word',
          value: 'song6'
        },
        {
          label: 'Michelle',
          value: 'song7',
          disabled: true
        },
        {
          label: 'What goes on',
          value: 'song8'
        },
        {
          label: 'Girl',
          value: 'song9'
        },
        {
          label: "I'm looking through you",
          value: 'song10'
        },
        {
          label: 'In My Life',
          value: 'song11'
        },
        {
          label: 'Wait',
          value: 'song12'
        }
      ])
    }
  }
})
```
